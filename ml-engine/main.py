from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import hashlib
import pandas as pd

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
lgbm_reg = joblib.load("models/lgbm_reg.pkl")
lgbm_clf = joblib.load("models/lgbm_clf.pkl")
feature_cols = joblib.load("models/feature_cols.pkl")

# ======================
# EMBEDDING
# ======================
EMBEDDING_DIM = 8

def generate_zone_embedding(zone: str, weather_enc: int):
    signature = f"{zone}_{weather_enc}".encode("utf-8")
    seed = int(hashlib.md5(signature).hexdigest()[:8], 16)
    rng = np.random.RandomState(seed)

    embedding = rng.uniform(-1.0, 1.0, size=EMBEDDING_DIM)

    if weather_enc in [2]:
        embedding -= 0.2

    return embedding.tolist()

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
    "multiple_deliveries": 1
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

    # ======================
    # FRAUD LOGIC
    # ======================
    fraud_score = 0

    if req.claim_count_30d > 5:
        fraud_score += 40
    elif req.claim_count_30d > 3:
        fraud_score += 20

    if req.same_trigger_count_7d > 2:
        fraud_score += 35
    elif req.same_trigger_count_7d > 1:
        fraud_score += 15

    if req.zone_claims_today > 10:
        fraud_score += 20

    if req.worker_rating < 3.5:
        fraud_score += 15

    if req.delivery_age_months < 1:
        fraud_score += 20

    fraud_score = min(fraud_score, 100)

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
        "fraud": {
            "fraud_score": fraud_score
        },
        "final_decision": decision
    }

# ======================
# HEALTH
# ======================
@app.get("/health")
def health():
    return {
        "status": "Production Ready",
        "models": "LightGBM + HGRS embeddings"
    }