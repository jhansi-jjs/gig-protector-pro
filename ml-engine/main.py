from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import hashlib
import pandas as pd
from pathlib import Path
from hgrs_model import generate_zone_embedding

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

app = FastAPI()

# ======================
# CORS
# ======================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# LOAD MODELS
# ======================
lgbm_reg = joblib.load(MODELS_DIR / "lgbm_reg.pkl")
lgbm_clf = joblib.load(MODELS_DIR / "lgbm_clf.pkl")
fraud_model_iso = joblib.load(MODELS_DIR / "fraud_model_iso.pkl")
fraud_model_xgb = joblib.load(MODELS_DIR / "fraud_model_xgb.pkl")
xgb_premium = joblib.load(MODELS_DIR / "xgb.pkl")
rf_model = joblib.load(MODELS_DIR / "rf.pkl")
mlp_model = joblib.load(MODELS_DIR / "mlp.pkl")
scaler = joblib.load(MODELS_DIR / "scaler.pkl")
feature_cols = joblib.load(MODELS_DIR / "feature_cols.pkl")

# ======================

# REQUEST MODEL
# ======================
class FinalRequest(BaseModel):
    zone: str
    temperature: float
    rainfall: float
    aqi: float
    delivery_person_age: int
    delivery_person_ratings: float
    distance: float
    type_of_order: int
    type_of_vehicle: int
    hour: int
    month: int

    claim_count_30d: int = 0
    same_trigger_count_7d: int = 0
    zone_claims_today: int = 1
    worker_rating: float = 4.0
    delivery_age_months: int = 6

    # New fraud features
    session_active_duration: float = 30.0
    platform_login_activity: int = 2
    zone_match: int = 1
    time_between_claims: float = 100.0
    delivery_completion_rate: float = 0.8

# ======================
# HELPERS
# ======================
def get_weather(temp, rain):
    if rain > 10:
        return 2
    elif temp > 310:
        return 1
    return 0

def get_risk_level(score):
    if score > 0.7:
        return "HIGH"
    elif score > 0.4:
        return "MEDIUM"
    return "LOW"

# ======================
# FRAUD COMPONENTS
# ======================
def rule_based_fraud_score(row):
    score = 0
    # High claim count in 30 days
    if row.get('claim_count_30d', 0) > 2:
        score += 30
    # Low zone match
    if row.get('zone_match', 1) == 0:
        score += 40
    # Short time between claims
    if row.get('time_between_claims', 100) < 24:
        score += 20
    # Low completion rate
    if row.get('delivery_completion_rate', 1.0) < 0.5:
        score += 25
    # High session duration (suspicious activity)
    if row.get('session_active_duration', 0) > 60:
        score += 15
    return min(score, 100)

# ======================
# MAIN API
# ======================
@app.post("/final-decision")
def final_decision(req: FinalRequest):

    # Step 1: Weather encoding
    weather_enc = get_weather(req.temperature, req.rainfall)

    # Step 2: Embedding
    embedding = generate_zone_embedding(req.zone, weather_enc)
    input_dict = {
    "Delivery_person_Age": req.delivery_person_age,
    "Delivery_person_Ratings": req.delivery_person_ratings,
    "weather_enc": weather_enc,
    "traffic_enc": 2,  # default for now
    "city_enc": 0,     # default
    "vehicle_enc": req.type_of_vehicle,
    "festival_enc": 0,
    "Vehicle_condition": 2,
    "multiple_deliveries": 1,
    "claim_count_30d": req.claim_count_30d,
    "session_active_duration": req.session_active_duration,
    "platform_login_activity": req.platform_login_activity,
    "zone_match": req.zone_match,
    "time_between_claims": req.time_between_claims,
    "delivery_completion_rate": req.delivery_completion_rate
}

    
    

    # Add embeddings
    for i in range(8):
        input_dict[f"emb_{i}"] = embedding[i]

    df_input = pd.DataFrame([input_dict])

    print("==== DEBUG START ====")
    print("df_input columns:", list(df_input.columns))
    print("feature_cols:", feature_cols)
    print("missing:", [col for col in feature_cols if col not in df_input.columns])
    print("==== DEBUG END ====")

    
        # CRITICAL: align features
    # ensure all columns exist
    for col in feature_cols:
        if col not in df_input.columns:
            df_input[col] = 0

    # ensure correct order
    X = df_input[feature_cols]

    # DEBUG (optional)
    print("INPUT COLUMNS:", df_input.columns.tolist())
    print("EXPECTED COLUMNS:", feature_cols)

    # Step 5: Predictions
    predicted_time = float(lgbm_reg.predict(X)[0])
    risk_prob = float(lgbm_clf.predict_proba(X)[0][1])

    # Premium estimate from all available models
    premium_xgb = float(xgb_premium.predict(X)[0])
    premium_rf = float(rf_model.predict(X)[0])
    premium_mlp = float(mlp_model.predict(scaler.transform(X))[0])
    premium_ensemble = float(np.mean([premium_xgb, premium_rf, premium_mlp]))

    # ======================
    # FRAUD DETECTION - THREE COMPONENTS
    # ======================
    
    # Component 1: Isolation Forest
    fraud_score_iso_raw = fraud_model_iso.decision_function(X)[0]
    fraud_score_iso = (( -fraud_score_iso_raw + 1 ) / 2) * 100
    fraud_score_iso = min(fraud_score_iso, 100)
    
    # Component 2: Rule-based
    fraud_score_rule = rule_based_fraud_score(input_dict)
    
    # Component 3: XGBoost
    fraud_prob_xgb = fraud_model_xgb.predict_proba(X)[0][1]
    fraud_score_xgb = fraud_prob_xgb * 100
    
    # Ensemble: Weighted average (can be tuned)
    fraud_score = (0.4 * fraud_score_iso + 0.3 * fraud_score_rule + 0.3 * fraud_score_xgb)
    fraud_score = min(fraud_score, 100)

    premium_breakdown = {
        "xgb": premium_xgb,
        "rf": premium_rf,
        "mlp": premium_mlp,
        "ensemble": premium_ensemble
    }

    # ======================
    # FINAL DECISION
    # ======================
    if fraud_score >= 70:
        decision = "REJECTED"
    elif risk_prob > 0.7 and fraud_score > 40:
        decision = "REJECTED"
    elif risk_prob > 0.5 or fraud_score > 40:
        decision = "FLAGGED"
    else:
        decision = "APPROVED"

    return {
        "prediction": {
            "delivery_time": round(predicted_time, 2),
            "delay_probability": round(risk_prob, 3),
            "risk_level": get_risk_level(risk_prob)
        },
        "premium": {
            "xgb": premium_xgb,
            "rf": premium_rf,
            "mlp": premium_mlp,
            "ensemble": premium_ensemble
        },
        "fraud": {
            "fraud_score": fraud_score
        },
        "final_decision": decision
    }

# ======================
# FRAUD CHECK API
# ======================
@app.post("/fraud-check")
def fraud_check(req: FinalRequest):
    try:
        # Step 1: Weather encoding
        weather_enc = get_weather(req.temperature, req.rainfall)

        # Step 2: Embedding
        embedding = generate_zone_embedding(req.zone, weather_enc)
        input_dict = {
            "Delivery_person_Age": req.delivery_person_age,
            "Delivery_person_Ratings": req.delivery_person_ratings,
            "weather_enc": weather_enc,
            "traffic_enc": 2,  # default for now
            "city_enc": 0,     # default
            "vehicle_enc": req.type_of_vehicle,
            "festival_enc": 0,
            "Vehicle_condition": 2,
            "multiple_deliveries": 1,
            "claim_count_30d": req.claim_count_30d,
            "session_active_duration": req.session_active_duration,
            "platform_login_activity": req.platform_login_activity,
            "zone_match": req.zone_match,
            "time_between_claims": req.time_between_claims,
            "delivery_completion_rate": req.delivery_completion_rate
        }

        # Add embeddings
        for i in range(8):
            input_dict[f"emb_{i}"] = embedding[i]

        df_input = pd.DataFrame([input_dict])

        # Ensure all columns exist
        for col in feature_cols:
            if col not in df_input.columns:
                df_input[col] = 0

        # Ensure correct order
        X = df_input[feature_cols]

        # Fraud detection - Three Components
        fraud_score_iso_raw = fraud_model_iso.decision_function(X)[0]
        fraud_score_iso = (( -fraud_score_iso_raw + 1 ) / 2) * 100
        fraud_score_iso = min(fraud_score_iso, 100)
        
        fraud_score_rule = rule_based_fraud_score(input_dict)
        
        fraud_prob_xgb = fraud_model_xgb.predict_proba(X)[0][1]
        fraud_score_xgb = fraud_prob_xgb * 100
        
        fraud_score = (0.4 * fraud_score_iso + 0.3 * fraud_score_rule + 0.3 * fraud_score_xgb)
        fraud_score = min(fraud_score, 100)

        return {
            "fraud_score": fraud_score,
            "is_fraud": fraud_score >= 70,
            "components": {
                "isolation_forest": fraud_score_iso,
                "rule_based": fraud_score_rule,
                "xgboost": fraud_score_xgb
            }
        }
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}

# ======================
# HEALTH
# ======================
@app.get("/health")
def health():
    return {
        "status": "Production Ready",
        "models": "LightGBM + HGRS embeddings + 3-Component Fraud Detection",
        "fraud_components": ["Isolation Forest", "Rule-based Engine", "XGBoost Classifier"]
    }

@app.get("/")
def root():
    return {"status": "ok"}