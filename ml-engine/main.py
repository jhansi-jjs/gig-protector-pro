from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pickle
import os
from hgrs_model import generate_zone_embedding
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# LOAD MODELS
# ======================
models_path = 'models/'

with open(f'{models_path}premium_model.pkl', 'rb') as f:
    premium_model = pickle.load(f)

with open(f'{models_path}fraud_model.pkl', 'rb') as f:
    fraud_model = pickle.load(f)

# 🔥 BEST MODEL (XGB)
with open(f'{models_path}xgb.pkl', 'rb') as f:
    hgrs_model = pickle.load(f)

with open(f'{models_path}feature_cols.pkl', 'rb') as f:
    feature_cols = pickle.load(f)

# ======================
# CONSTANTS
# ======================
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

WEATHER_ENC = {"Sunny": 4, "Cloudy": 1, "Rainy": 3, "Stormy": 5, "Fog": 2, "Sandstorms": 0}
TRAFFIC_ENC = {"Low": 1, "Medium": 2, "High": 0, "Jam": 3}
CITY_ENC = {"Metropolitian": 0, "Urban": 2, "Semi-Urban": 1}

# ======================
# REQUEST MODELS
# ======================
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
    zone: str = "Andheri East"
    weather: str = "Sunny"
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

# 🔥 NEW HGRS REQUEST
class HGRSRequest(BaseModel):
    Delivery_person_Age: float = 30
    Delivery_person_Ratings: float = 4.2
    weather_enc: int = 2
    traffic_enc: int = 2
    city_enc: int = 0
    vehicle_enc: int = 1
    festival_enc: int = 0
    Vehicle_condition: int = 2
    multiple_deliveries: int = 1

# ======================
# PREMIUM API
# ======================
@app.post("/calculate-premium", response_model=PremiumResponse)
def calculate_premium(req: PremiumRequest):
    base = PLAN_BASE.get(req.plan, 59)
    coverage = PLAN_COVERAGE.get(req.plan, 800)
    zone_mult = ZONE_RISK.get(req.zone, ZONE_RISK["Default"])
    season = SEASON_RISK.get(req.month, 1.0)
    loyalty = min(req.loyalty_months * 0.01, 0.10)

    weather_enc = WEATHER_ENC.get(req.weather, 4)
    traffic_enc = TRAFFIC_ENC.get(req.traffic, 2)
    city_enc = CITY_ENC.get(req.city_type, 0)

    # Generate Level 1 Pretrained Embedding 
    embedding_features = generate_zone_embedding(req.zone, weather_enc)
    
    # Fuse Tabular and Geoclimatic features
    tabular_features = [30, 4.2, weather_enc, traffic_enc, city_enc, 1, 0, 2, 1]
    features = np.array([tabular_features + embedding_features])
    
    features = np.array([[30, 4.2, weather_enc, traffic_enc, city_enc, 1, 0, 2, 1]])

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

# ======================
# FRAUD API
# ======================
@app.post("/fraud-check", response_model=FraudResponse)
def fraud_check(req: FraudRequest):
    score = 0

    if req.claim_count_30d > 5: score += 40
    elif req.claim_count_30d > 3: score += 20

    if req.same_trigger_count_7d > 2: score += 35
    elif req.same_trigger_count_7d > 1: score += 15

    if req.hour_of_claim < 5: score += 25
    if req.zone_claims_today > 10: score += 20
    if req.worker_rating < 3.5: score += 15
    if req.delivery_age_months < 1: score += 20

    # ML isolation forest check
    weather_enc = WEATHER_ENC.get(req.weather, 4)
    embedding_features = generate_zone_embedding(req.zone, weather_enc)
    tabular_features = [30, req.worker_rating, 2, 1, 0, 1, 0, 2, 1]
    
    features = np.array([tabular_features + embedding_features])
    features = np.array([[30, req.worker_rating, 2, 1, 0, 1, 0, 2, 1]])
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

# ======================
# 🔥 HGRS FUNCTION
# ======================
def calculate_hgrs_internal(data):
    df = pd.DataFrame([data])
    X = df[feature_cols].fillna(0)

    pred = float(hgrs_model.predict(X)[0])

    # convert to 0–100 scale
    risk_score = float(np.clip((pred - 0.8) / (1.5 - 0.8) * 100, 0, 100))

    if risk_score > 75:
        level = "HIGH"
    elif risk_score > 50:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "risk_score": round(risk_score, 2),
        "risk_level": level,
        "raw_multiplier": round(pred, 3)
    }

def final_decision_engine(hgrs, fraud):

    risk = hgrs["risk_score"]
    fraud_score = fraud["fraud_score"]

    # 🔥 Decision logic
    if fraud_score >= 70:
        decision = "REJECTED"
    elif risk > 75 and fraud_score > 40:
        decision = "REJECTED"
    elif risk > 60 or fraud_score > 40:
        decision = "FLAGGED"
    else:
        decision = "APPROVED"

    return {
        "decision": decision,
        "risk_score": hgrs["risk_score"],
        "fraud_score": fraud_score,
        "risk_level": hgrs["risk_level"]
    }


# ======================
# 🔥 HGRS API
# ======================
@app.post("/hgrs-score")
def hgrs_score(req: HGRSRequest):
    return calculate_hgrs_internal(req.dict())

# ======================
# HEALTH
# ======================
@app.get("/health")
def health():
    return {
        "status": "ML engine running",
        "models": "XGBoost + LightGBM + RF + MLP + Fraud + HGRS"
    }

@app.get("/auto-trigger")
def auto_trigger():

    # 🔥 Simulated real-world input (replace later with API)
    weather = "Rainy"
    aqi = 180  # high pollution

    # Convert to encodings
    weather_enc = WEATHER_ENC.get(weather, 4)
    traffic_enc = 3 if weather == "Rainy" else 2
    city_enc = 0

    # HGRS input
    hgrs_input = {
        "Delivery_person_Age": 30,
        "Delivery_person_Ratings": 4.2,
        "weather_enc": weather_enc,
        "traffic_enc": traffic_enc,
        "city_enc": city_enc,
        "vehicle_enc": 1,
        "festival_enc": 0,
        "Vehicle_condition": 2,
        "multiple_deliveries": 1
    }

    hgrs_result = calculate_hgrs_internal(hgrs_input)

    # Fraud (default safe)
    fraud_input = FraudRequest()
    fraud_result = fraud_check(fraud_input)

    decision = final_decision_engine(hgrs_result, fraud_result.dict())

    return {
        "trigger": {
            "weather": weather,
            "aqi": aqi
        },
        "hgrs": hgrs_result,
        "fraud": fraud_result,
        "final_decision": decision,
        "payout": "TRIGGERED" if decision["decision"] == "APPROVED" else "BLOCKED"
    }

class FinalRequest(BaseModel):
    # HGRS input
    Delivery_person_Age: float = 30
    Delivery_person_Ratings: float = 4.2
    weather_enc: int = 2
    traffic_enc: int = 2
    city_enc: int = 0
    vehicle_enc: int = 1
    festival_enc: int = 0
    Vehicle_condition: int = 2
    multiple_deliveries: int = 1

    # Fraud input
    claim_count_30d: int = 0
    same_trigger_count_7d: int = 0
    hour_of_claim: int = 12
    zone_claims_today: int = 1
    worker_rating: float = 4.0
    delivery_age_months: int = 6


@app.post("/final-decision")
def final_decision(req: FinalRequest):

    # 🔥 HGRS
    hgrs_result = calculate_hgrs_internal(req.dict())

    # 🔥 Fraud
    fraud_req = FraudRequest(
        claim_count_30d=req.claim_count_30d,
        same_trigger_count_7d=req.same_trigger_count_7d,
        hour_of_claim=req.hour_of_claim,
        zone_claims_today=req.zone_claims_today,
        worker_rating=req.worker_rating,
        delivery_age_months=req.delivery_age_months
    )

    fraud_result = fraud_check(fraud_req)

    # 🔥 Final decision
    decision = final_decision_engine(hgrs_result, fraud_result.dict())

    return {
        "hgrs": hgrs_result,
        "fraud": fraud_result,
        "final_decision": decision
    }
