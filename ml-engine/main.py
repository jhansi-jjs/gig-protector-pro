from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pickle
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained models
models_path = 'models/'
with open(f'{models_path}premium_model.pkl', 'rb') as f:
    premium_model = pickle.load(f)
with open(f'{models_path}fraud_model.pkl', 'rb') as f:
    fraud_model = pickle.load(f)

ZONE_RISK = {
    "Andheri East": 1.15, "Dharavi": 1.25, "Bandra": 0.95,
    "Kurla": 1.20, "Powai": 1.00, "Dadar": 1.10, "Borivali": 1.05,
    "Connaught Place": 1.10, "Lajpat Nagar": 1.08, "Dwarka": 1.05,
    "Koramangala": 1.05, "Indiranagar": 1.00, "Whitefield": 1.08,
    "HSR Layout": 1.03, "T Nagar": 1.07, "Banjara Hills": 1.06,
    "Hitech City": 1.09, "Default": 1.10
}

SEASON_RISK = {
    6: 1.15, 7: 1.20, 8: 1.18,
    5: 1.10, 9: 1.08,
    12: 1.05, 1: 1.05,
}

PLAN_BASE = {"Basic Shield": 29, "Pro Shield": 59, "Max Shield": 99}
PLAN_COVERAGE = {"Basic Shield": 500, "Pro Shield": 800, "Max Shield": 1200}

# Weather encoding map (matches training data)
WEATHER_ENC = {"Sunny": 4, "Cloudy": 1, "Rainy": 3, "Stormy": 5, "Fog": 2, "Sandstorms": 0}
TRAFFIC_ENC = {"Low": 1, "Medium": 2, "High": 0, "Jam": 3}
CITY_ENC = {"Metropolitian": 0, "Urban": 2, "Semi-Urban": 1}

class PremiumRequest(BaseModel):
    zone: str
    plan: str
    month: int
    loyalty_months: int = 0
    weather: str = "Sunny"
    traffic: str = "Medium"
    city_type: str = "Metropolitian"

class PremiumResponse(BaseModel):
    base_rate: float
    zone_multiplier: float
    season_factor: float
    loyalty_discount: float
    ml_multiplier: float
    final_premium: float
    coverage_amount: float
    zone_risk_label: str

class FraudRequest(BaseModel):
    claim_count_30d: int = 0
    same_trigger_count_7d: int = 0
    hour_of_claim: int = 12
    zone_claims_today: int = 1
    worker_rating: float = 4.0
    delivery_age_months: int = 6

class FraudResponse(BaseModel):
    fraud_score: float
    is_fraud: bool
    risk_level: str

@app.post("/calculate-premium", response_model=PremiumResponse)
def calculate_premium(req: PremiumRequest):
    base = PLAN_BASE.get(req.plan, 59)
    coverage = PLAN_COVERAGE.get(req.plan, 800)
    zone_mult = ZONE_RISK.get(req.zone, ZONE_RISK["Default"])
    season = SEASON_RISK.get(req.month, 1.0)
    loyalty = min(req.loyalty_months * 0.01, 0.10)

    # Use trained XGBoost model for multiplier
    weather_enc = WEATHER_ENC.get(req.weather, 4)
    traffic_enc = TRAFFIC_ENC.get(req.traffic, 2)
    city_enc = CITY_ENC.get(req.city_type, 0)

    features = np.array([[
        30, 4.2, weather_enc, traffic_enc, city_enc, 1, 0, 2, 1
    ]])
    ml_mult = float(premium_model.predict(features)[0])
    ml_mult = max(0.9, min(ml_mult, 1.4))

    final = round(base * zone_mult * season * ml_mult * (1 - loyalty), 2)

    if zone_mult >= 1.20:
        risk_label = "High Risk"
    elif zone_mult >= 1.10:
        risk_label = "Medium Risk"
    else:
        risk_label = "Low Risk"

    return PremiumResponse(
        base_rate=base,
        zone_multiplier=zone_mult,
        season_factor=season,
        loyalty_discount=loyalty,
        ml_multiplier=round(ml_mult, 3),
        final_premium=final,
        coverage_amount=coverage,
        zone_risk_label=risk_label
    )

@app.post("/fraud-check", response_model=FraudResponse)
def fraud_check(req: FraudRequest):
    # Rule-based score
    score = 0
    if req.claim_count_30d > 5: score += 40
    elif req.claim_count_30d > 3: score += 20
    if req.same_trigger_count_7d > 2: score += 35
    elif req.same_trigger_count_7d > 1: score += 15
    if req.hour_of_claim >= 0 and req.hour_of_claim < 5: score += 25
    if req.zone_claims_today > 10: score += 20
    if req.worker_rating < 3.5: score += 15
    if req.delivery_age_months < 1: score += 20

    # ML isolation forest check
    features = np.array([[
        30, req.worker_rating,
        2, 1, 0, 1, 0, 2, 1
    ]])
    ml_pred = fraud_model.predict(features)[0]
    if ml_pred == -1:
        score += 20

    score = min(score, 100)

    if score >= 70:
        risk_level = "HIGH"
    elif score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return FraudResponse(
        fraud_score=float(score),
        is_fraud=score >= 70,
        risk_level=risk_level
    )

@app.get("/health")
def health():
    return {"status": "ML engine running", "models": "XGBoost + IsolationForest loaded"}
