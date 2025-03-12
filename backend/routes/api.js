const express = require("express");
const database = require("../config/spanner");
const { handleAIQuery } = require("../utils/spanner-query-handler");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        console.log(`🔍 Checking user in Spanner: ${email}`);

        // ✅ Query Spanner DB for user authentication
        const query = {
            sql: `SELECT user_id, email, role FROM users WHERE email = @email AND password = @password`,
            params: { email, password }
        };

        const [rows] = await database.run(query);

        if (rows.length === 0) {
            console.warn("⚠️ Invalid login attempt:", email);
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const user = rows[0];

        console.log("✅ User Authenticated:", user);

        return res.json({ message: "Login successful", user });

    } catch (error) {
        console.error("❌ Error during login:", error);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
});

// ✅ Dashboard API for fetching analytics data
router.get("/dashboard-data", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "User ID is required" });

        // ✅ Fetch Dashboard Data (Fixed Queries)
        const queries = {
            totalPatients: {
                sql: "SELECT COUNT(*) AS totalPatients FROM patients",
                params: {}
            },
            ongoingTreatments: {
                sql: "SELECT COUNT(*) AS ongoingTreatments FROM treatments WHERE assigned_doctor = @userId AND status = 'inprogress'",
                params: { userId }
            },
            completedTreatments: {
                sql: "SELECT COUNT(*) AS completedTreatments FROM treatments WHERE assigned_doctor = @userId AND status = 'completed'",
                params: { userId }
            },
            upcomingAppointments: {
                sql: "SELECT COUNT(*) AS upcomingAppointments FROM appointments WHERE doctor_id = @userId AND status = 'scheduled'",
                params: { userId }
            }
        };

        // ✅ Run Queries
        const results = await Promise.all(Object.entries(queries).map(async ([key, query]) => {
            const [rows] = await database.run(query);
            return { key, count: rows[0]?.[key] || 0 };
        }));

        // ✅ Prepare Response
        const dashboardData = results.map(({ key, count }) => ({
            title: key.replace(/([A-Z])/g, " $1").trim(),
            count,
            route: key.toLowerCase().replace(/\s+/g, "-")
        }));

        res.json(dashboardData);
    } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
        res.status(500).json({ error: "Failed to load dashboard data. Please try again later." });
    }
});

// ✅ 1️⃣ Fetch All Patients
router.get("/patients", async (req, res) => {
    try {
        const query = {
            sql: "SELECT * FROM patients",
        };

        const [rows] = await database.run(query);
        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching patients:", error);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
});

// ✅ 2️⃣ Fetch Treatments for a Specific Patient
router.get("/treatments/:patientId", async (req, res) => {
    try {
        const { patientId } = req.params;
        const query = {
            sql: `SELECT * FROM treatments WHERE patient_id = @patientId`,
            params: { patientId: Number(patientId) },
        };

        const [rows] = await database.run(query);
        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching treatments:", error);
        res.status(500).json({ error: "Failed to fetch treatments" });
    }
});

// ✅ 3️⃣ Fetch Lab Reports for a Specific Patient
router.get("/lab-reports/:patientId", async (req, res) => {
    try {
        const { patientId } = req.params;
        const query = {
            sql: `SELECT * FROM lab_reports WHERE patient_id = @patientId`,
            params: { patientId: Number(patientId) },
        };

        const [rows] = await database.run(query);
        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching lab reports:", error);
        res.status(500).json({ error: "Failed to fetch lab reports" });
    }
});

// ✅ 4️⃣ Fetch Chat Messages for a Specific Patient
router.get("/chat-history/:patientId", async (req, res) => {
    try {
        const { patientId } = req.params;
        const query = {
            sql: `SELECT * FROM chat_messages WHERE patient_id = @patientId ORDER BY created_at DESC`,
            params: { patientId: Number(patientId) },
        };

        const [rows] = await database.run(query);
        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching chat history:", error);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

// ✅ 5️⃣ Fetch Appointments for a Specific Patient
router.get("/appointments/:patientId", async (req, res) => {
    try {
        const { patientId } = req.params;
        const query = {
            sql: `SELECT * FROM appointments WHERE patient_id = @patientId ORDER BY scheduled_date DESC`,
            params: { patientId: Number(patientId) },
        };

        const [rows] = await database.run(query);
        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching appointments:", error);
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
});

// ✅ 6️⃣ AI Chatbot Endpoint (Natural Language Query to Spanner)
router.post("/ai-chat", async (req, res) => {
    try {
        const { userQuery } = req.body;
        if (!userQuery) return res.status(400).json({ error: "Query is required" });

        const response = await handleAIQuery(userQuery);
        res.json(response);

    } catch (error) {
        console.error("❌ Error processing AI chatbot query:", error);
        res.status(500).json({ error: "Failed to process chatbot query" });
    }
});

router.post("/ai-query", async (req, res) => {
    try {
        const { userQuery } = req.body;
        if (!userQuery) return res.status(400).json({ error: "Missing user query" });

        const result = await handleAIQuery(userQuery);
        res.json({ result });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ error: "AI query processing failed" });
    }
});
module.exports = router;