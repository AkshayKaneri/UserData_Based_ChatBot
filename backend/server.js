require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ API Routes
app.use("/api", apiRoutes);

// ✅ Root Endpoint
app.get("/", (req, res) => {
    res.send("🚀 Healthcare Chatbot API is Running...");
});

// ✅ Global Error Handling
app.use((err, req, res, next) => {
    console.error("❌ Global Error:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});