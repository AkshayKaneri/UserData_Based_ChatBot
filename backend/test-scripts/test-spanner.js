const database = require("../config/spanner");

async function testConnection() {
    try {
        console.log("🔄 Connecting to Spanner...");

        const query = {
            sql: "SELECT 1 AS test_connection",
        };

        const [rows] = await database.run(query);
        console.log("✅ Spanner Connection Successful:", rows);
    } catch (error) {
        console.error("❌ Spanner Connection Failed:", error);
    }
}

testConnection();