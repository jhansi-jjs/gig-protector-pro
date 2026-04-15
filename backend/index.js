const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Health / test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// 🔥 PREMIUM API (dynamic - from frontend)
app.post("/get-premium", async (req, res) => {
  try {
    const userData = req.body;

    const response = await axios.post(
      "http://127.0.0.1:8000/calculate-premium",
      userData
    );

    res.json(response.data);

  } catch (err) {
    console.log("ML ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || "ML error"
    });
  }
});

// 🔥 FRAUD API
app.post("/fraud-check", async (req, res) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/fraud-check",
      req.body
    );

    res.json(response.data);

  } catch (err) {
    console.log("FRAUD ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || "Fraud error"
    });
  }
});

// 🧪 TEST ROUTE (for browser testing only)
app.get("/test-premium", async (req, res) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/calculate-premium",
      {
        zone: "urban",
        plan: "basic",
        month: 6,
        loyalty_months: 12,
        weather: "Sunny",
        traffic: "Medium",
        city_type: "Metropolitan"
      }
    );

    res.json(response.data);

  } catch (err) {
    console.log("TEST ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || "Test error"
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});