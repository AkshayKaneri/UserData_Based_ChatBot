require("dotenv").config(); // ✅ Load environment variables
const { Spanner } = require("@google-cloud/spanner");

// ✅ Log Environment Variables
console.log("🔍 Checking Environment Variables...");
console.log("   🔹 GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS || "❌ MISSING");
console.log("   🔹 SPANNER_PROJECT_ID:", process.env.SPANNER_PROJECT_ID || "❌ MISSING");
console.log("   🔹 SPANNER_INSTANCE_ID:", process.env.SPANNER_INSTANCE_ID || "❌ MISSING");
console.log("   🔹 SPANNER_DATABASE_ID:", process.env.SPANNER_DATABASE_ID || "❌ MISSING");

// ✅ GCP Spanner Configuration
const projectId = process.env.SPANNER_PROJECT_ID;
const instanceId = process.env.SPANNER_INSTANCE_ID;
const databaseId = process.env.SPANNER_DATABASE_ID;

async function testSpannerConnection() {
    try {
        // 🔴 Check If Any Environment Variable is Missing
        if (!projectId || !instanceId || !databaseId) {
            throw new Error("❌ ERROR: Missing required environment variables. Check your .env file.");
        }

        // ✅ Initialize Spanner Client
        console.log("🚀 Connecting to Google Cloud Spanner...");
        const spanner = new Spanner({ projectId });
        const instance = spanner.instance(instanceId);
        const database = instance.database(databaseId);

        console.log("✅ Connected to Spanner Database!");

        // ✅ Define SQL Query
        const query = { sql: "SELECT * FROM patients" };

        console.log("🔍 Running Query:", query.sql);

        // ✅ Execute SQL Query
        const [rows] = await database.run(query);

        console.log(`✅ Query Success! Rows Retrieved: ${rows.length}`);

        if (rows.length === 0) {
            console.log("⚠️ No records found in the patients table.");
        } else {
            console.log("📝 Retrieved Patient Records:");
            rows.forEach(row => console.log(row.toJSON()));
        }

        // ✅ Close Database Connection
        await database.close();
        console.log("🔌 Connection Closed.");

    } catch (error) {
        console.error("❌ Error Executing Query:", error);
    }
}

// ✅ Run Test
testSpannerConnection();