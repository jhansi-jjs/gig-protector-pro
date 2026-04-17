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

// 🔥 DUAL-KEY OTP VERIFICATION
app.post("/dual-key-verify", (req, res) => {
  const { worker_id, claim_location, activity_pattern, otp_provided } = req.body;

  // Simulate Dual-Key Verification
  // Key 1: Location-based OTP (GPS verification)
  const expected_location_otp = generateLocationOTP(worker_id, claim_location);

  // Key 2: Activity-based OTP (pattern verification)
  const expected_activity_otp = generateActivityOTP(worker_id, activity_pattern);

  const is_location_valid = otp_provided.location_otp === expected_location_otp;
  const is_activity_valid = otp_provided.activity_otp === expected_activity_otp;

  if (is_location_valid && is_activity_valid) {
    res.json({
      verified: true,
      message: "Dual-Key verification successful"
    });
  } else {
    res.json({
      verified: false,
      message: "Dual-Key verification failed",
      details: {
        location_valid: is_location_valid,
        activity_valid: is_activity_valid
      }
    });
  }
});

// Helper functions for OTP generation
function generateLocationOTP(worker_id, location) {
  // Simple hash-based OTP for demo
  const seed = `${worker_id}_${location.lat}_${location.lng}`;
  return (hashCode(seed) % 900000 + 100000).toString(); // 6-digit OTP
}

function generateActivityOTP(worker_id, pattern) {
  // Based on activity pattern
  const seed = `${worker_id}_${pattern.type}_${pattern.timestamp}`;
  return (hashCode(seed) % 900000 + 100000).toString();
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

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