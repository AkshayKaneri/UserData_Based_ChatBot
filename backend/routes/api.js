const express = require("express");
const database = require("../config/spanner");
const { handleAIQuery } = require("../utils/spanner-query-handler");

const router = express.Router();

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