require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const { Spanner } = require("@google-cloud/spanner");

// ✅ Validate Environment Variables
const projectId = process.env.SPANNER_PROJECT_ID;
const instanceId = process.env.SPANNER_INSTANCE_ID;
const databaseId = process.env.SPANNER_DATABASE_ID;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!projectId || !instanceId || !databaseId || !openaiApiKey) {
    throw new Error("❌ ERROR: Missing required environment variables. Check your .env file.");
}

// ✅ Initialize Spanner Database Connection
console.log("🚀 Connecting to Google Cloud Spanner...");
const spanner = new Spanner({ projectId });
const instance = spanner.instance(instanceId);
const database = instance.database(databaseId);
console.log("✅ Connected to Spanner Database!");

// ✅ Load Database Schema from `db_schema.json`
const schemaFilePath = path.join(__dirname, "db_schema.json");
let dbSchema = {};

try {
    if (fs.existsSync(schemaFilePath)) {
        dbSchema = JSON.parse(fs.readFileSync(schemaFilePath, "utf8"));
        console.log("✅ Database schema loaded from file!");
    } else {
        console.error("❌ ERROR: Schema file not found. Ensure `db_schema.json` exists.");
    }
} catch (error) {
    console.error("❌ ERROR: Failed to load schema file:", error);
}

// ✅ Initialize OpenAI Client
const openai = new OpenAI({ apiKey: openaiApiKey });

/**
 * 🧠 AI Query Handler (OpenAI GPT)
 */
async function handleAIQuery(userQuery) {
    try {
        console.log(`🤖 Processing AI Query: "${userQuery}"`);

        if (!dbSchema || Object.keys(dbSchema).length === 0) {
            return { error: "The system is not set up with the latest database schema. Please try again later." };
        }

        // ✅ Generate AI Prompt with Pre-loaded Schema
        const sqlPrompt = `
You are an AI assistant that translates user questions into SQL queries for a Google Cloud Spanner database.

📌 **Database Schema**:
${JSON.stringify(dbSchema, null, 2)}

📌 **Expected JSON Output**:
{
  "query": "SELECT * FROM patients WHERE gender = @gender",
  "params": { "gender": "Male" }
}

👉 **STRICT REQUIREMENTS**:
- Always return a valid JSON object.
- NO extra formatting, NO code blocks, NO markdown.
- Ensure the SQL query is **Spanner-compatible**.
- Use **@parameter format** for query values.

---

**User Query:** "${userQuery}"
`;

        // ✅ Send Request to OpenAI (NL → SQL)
        const sqlResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "system", content: "You are a SQL conversion assistant." }, { role: "user", content: sqlPrompt }],
            temperature: 0.2,
        });

        console.log(`📝 Raw AI Response:`, JSON.stringify(sqlResponse, null, 2));

        // ✅ Extract AI-generated SQL query
        let aiResponse = sqlResponse.choices?.[0]?.message?.content?.trim();

        if (!aiResponse) {
            return { error: "I'm having trouble understanding your request. Could you try rephrasing it?" };
        }

        // ✅ Ensure AI response is valid JSON
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(aiResponse);
        } catch (err) {
            console.error("❌ Error parsing AI response:", err);
            return { error: "I had trouble understanding the request. Please try rephrasing it." };
        }

        console.log(`✅ Parsed AI Response:`, parsedResponse);

        if (!parsedResponse.query || typeof parsedResponse.query !== "string") {
            return { error: "I couldn't generate a valid SQL query. Try using different wording." };
        }

        const { query, params } = parsedResponse;

        console.log(`🔍 Query to Execute:`, query);
        console.log(`🛠 Query Params:`, params);

        // ✅ Convert all expected STRING fields before executing the query
        Object.keys(params).forEach(key => {
            if (typeof params[key] !== "string") {
                params[key] = String(params[key]); // Convert INT64 to STRING
            }
        });

        console.log(`🛠 Updated Query Params (Converted to STRING):`, params);

        // ✅ Run SQL Query on Spanner
        let rows;
        try {
            [rows] = await database.run({ sql: query, params });
            console.log(`✅ Query Execution Success! Rows Returned:`, rows.length);
        } catch (error) {
            console.error("❌ Error executing SQL query:", error);
            return { error: "There was an issue fetching the requested data. Please try again." };
        }

        if (rows.length === 0) {
            return { message: "No matching records found. It seems there's no data available for this request." };
        }

        // ✅ Detect if the user asked for a **comparison query**
        if (userQuery.toLowerCase().includes("compare")) {
            return await generateComparisonResponse(userQuery, rows);
        }

        // ✅ Convert Data to Natural Language using GPT
        return await convertDataToNaturalLanguage(userQuery, rows);

    } catch (error) {
        console.error("❌ Error in AI Query Processing:", error);
        return { error: "Oops! Something unexpected happened. Please try again later." };
    }
}

/**
 * 🎯 Convert SQL Data → Human Readable Summary using GPT
 */
/**
 * 🎯 Convert SQL Data → Human Readable Summary with Basic Formatting
 */
async function convertDataToNaturalLanguage(userQuery, rows) {
    try {
        console.log("🧠 Converting Data into Natural Language...");

        const gptPrompt = `
You are an AI assistant that converts database query results into human-readable responses with **better formatting**.

📌 **User Query:** "${userQuery}"

📌 **Data Retrieved:**
${JSON.stringify(rows, null, 2)}

🔹 **Task:** Format the response neatly with bullet points, bold labels, and line breaks for readability.
🔹 **Formatting Rules:**
   - Use **bold labels** (e.g., "**Patient ID:** 1").
   - Use **line breaks** to separate information clearly.
   - Use **bullet points (•)** for listing multiple records.
   - Ensure a **natural, conversational tone**.
   - Do **not** use Markdown or JSON formatting, only plain text.

🔹 **Example Output Format:**
"Here are the details:
• **Patient ID:** 1  
  **Name:** John Doe  
  **Date of Birth:** June 15, 1985  
  **Gender:** Male  
  **Admitted on:** February 10, 2024  

• **Patient ID:** 2  
  **Name:** Jane Smith  
  **Date of Birth:** September 22, 1990  
  **Gender:** Female  
  **Admitted on:** January 15, 2024"  

Ensure that the output **always follows this format** without extra symbols or JSON encoding.
`;

        const gptResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: gptPrompt }],
            max_tokens: 400,
            temperature: 0.7,
        });

        const naturalLanguageResponse = gptResponse.choices[0]?.message?.content?.trim();
        return { response: naturalLanguageResponse || "I couldn't generate a response." };

    } catch (error) {
        console.error("❌ Error in GPT Processing:", error);
        return { error: "I had trouble converting the data into a response. Please try again." };
    }
}

module.exports = { handleAIQuery };