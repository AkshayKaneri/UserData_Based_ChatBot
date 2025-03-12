require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Spanner } = require("@google-cloud/spanner");

// ✅ Validate Environment Variables
const projectId = process.env.SPANNER_PROJECT_ID;
const instanceId = process.env.SPANNER_INSTANCE_ID;
const databaseId = process.env.SPANNER_DATABASE_ID;

if (!projectId || !instanceId || !databaseId) {
    console.error("❌ ERROR: Missing required environment variables. Check your .env file.");
    process.exit(1);
}

// ✅ Initialize Spanner Database Connection
console.log("🚀 Connecting to Google Cloud Spanner...");
const spanner = new Spanner({ projectId });
const instance = spanner.instance(instanceId);
const database = instance.database(databaseId);
console.log("✅ Connected to Spanner Database!");

// ✅ Define Schema File Path
const schemaFilePath = path.join(__dirname, "db_schema.json");

/**
 * 📌 Ensure Schema File Exists
 */
function ensureSchemaFileExists() {
    if (!fs.existsSync(schemaFilePath)) {
        console.warn("⚠️ Schema file not found, creating a new one...");
        fs.writeFileSync(schemaFilePath, JSON.stringify({}, null, 2));
    }
}

/**
 * 📌 Fetch Spanner Schema and Save to `db_schema.json`
 */
async function fetchAndSaveSchema() {
    try {
        console.log("🔍 Fetching database schema...");

        // ✅ Ensure schema file exists
        ensureSchemaFileExists();

        const schema = {};
        const query = {
            sql: "SELECT table_name, column_name FROM information_schema.columns WHERE table_catalog = '' AND table_schema = ''"
        };

        // ✅ Fetch schema from Spanner
        const [rows] = await database.run(query);
        console.log(rows, 'rows')
        console.log("\n📝 Raw Schema Data from Spanner:", JSON.stringify(rows, null, 2));

        if (!rows || rows.length === 0) {
            console.error("❌ ERROR: No schema data retrieved. Check your Spanner setup.");
            return;
        }

        // ✅ Process and build the schema object correctly
        rows.forEach((row, index) => {
            // ✅ Extract `table_name` and `column_name` from the array
            const tableNameObj = row.find(item => item.name === "table_name");
            const columnNameObj = row.find(item => item.name === "column_name");

            // ✅ Get actual values
            let tableName = tableNameObj?.value;
            let columnName = columnNameObj?.value;

            // ✅ Validate extracted values
            if (typeof tableName !== "string" || typeof columnName !== "string") {
                console.warn(`⚠️ Skipping row ${index + 1}: Invalid table/column format`, row);
                return;
            }

            // ✅ Initialize table if not present
            if (!schema[tableName]) {
                schema[tableName] = [];
            }
            schema[tableName].push(columnName);
        });

        // ✅ If schema is empty, log and stop
        if (Object.keys(schema).length === 0) {
            console.error("❌ ERROR: Schema is empty after processing. No valid tables found.");
            return;
        }

        // ✅ Save schema to file safely
        try {
            fs.writeFileSync(schemaFilePath, JSON.stringify(schema, null, 2));
            console.log(`✅ Schema successfully saved to ${schemaFilePath}!`);
        } catch (writeError) {
            console.error("❌ ERROR: Failed to save schema to file:", writeError);
        }

    } catch (error) {
        console.error("❌ Error fetching schema:", error);
    }
}

// ✅ Run schema fetch and save
fetchAndSaveSchema();