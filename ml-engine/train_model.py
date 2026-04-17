import pandas as pd
import numpy as np
import os
from hgrs_model import generate_zone_embedding
import pickle

from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neural_network import MLPRegressor

import xgboost as xgb
import lightgbm as lgb

print("Loading datasets...")

df = pd.read_csv("zomato-delivery-operations-analytics-dataset/Zomato Dataset.csv")
print(f"Loaded {len(df)} rows")

# ======================
# CLEANING
# ======================
df.columns = df.columns.str.strip()

df['Delivery_person_Age'] = pd.to_numeric(df['Delivery_person_Age'], errors='coerce')
df['Delivery_person_Ratings'] = pd.to_numeric(df['Delivery_person_Ratings'], errors='coerce')
df['Time_taken'] = pd.to_numeric(df['Time_taken (min)'].astype(str).str.extract(r'(\d+)')[0], errors='coerce')
df['Vehicle_condition'] = pd.to_numeric(df['Vehicle_condition'], errors='coerce')
df['multiple_deliveries'] = pd.to_numeric(df['multiple_deliveries'], errors='coerce')

df = df.dropna(subset=['Delivery_person_Age', 'Delivery_person_Ratings'])

# ======================
# ENCODING
# ======================
le = LabelEncoder()

df['weather_enc'] = le.fit_transform(df['Weather_conditions'].astype(str))
df['traffic_enc'] = le.fit_transform(df['Road_traffic_density'].astype(str))
df['city_enc'] = le.fit_transform(df['City'].astype(str))
df['vehicle_enc'] = le.fit_transform(df['Type_of_vehicle'].astype(str))
df['festival_enc'] = le.fit_transform(df['Festival'].astype(str))

# ======================
# FRAUD-SPECIFIC FEATURES
# ======================
np.random.seed(42)  # For reproducibility

# Simulate fraud-related features
df['claim_count_30d'] = np.random.poisson(0.5, len(df))  # Claims in last 30 days
df['session_active_duration'] = np.random.exponential(30, len(df))  # Minutes active during disruption
df['platform_login_activity'] = np.random.randint(0, 10, len(df))  # Logins in last 24h
df['zone_match'] = np.random.choice([0, 1], len(df), p=[0.1, 0.9])  # 1 if registered zone matches claimed
df['time_between_claims'] = np.random.exponential(100, len(df))  # Hours since last claim
df['delivery_completion_rate'] = np.random.beta(8, 2, len(df))  # Completion rate during disruption window

feature_cols = [
    'Delivery_person_Age',
    'Delivery_person_Ratings',
    'weather_enc',
    'traffic_enc',
    'city_enc',
    'vehicle_enc',
    'festival_enc',
    'Vehicle_condition',
    'multiple_deliveries',
    'claim_count_30d',
    'session_active_duration',
    'platform_login_activity',
    'zone_match',
    'time_between_claims',
    'delivery_completion_rate'
]

df = df.dropna(subset=feature_cols)

print("Extracting Level 1 HGRS Embeddings...")
mock_zones = ["Andheri East", "Dharavi", "Bandra", "Connaught Place", "Lajpat Nagar", "Koramangala", "Indiranagar", "T Nagar", "Hitech City"]

def get_row_embedding(row):
    # Deterministically assign a zone based on the row index/name to link Tabular + Spatial
    mock_zone = mock_zones[hash(str(row.name)) % len(mock_zones)]
    return generate_zone_embedding(mock_zone, int(row['weather_enc']))

# Apply the Level 1 embedding function to the entire dataset
embeddings = df.apply(get_row_embedding, axis=1).tolist()

emb_cols = [f'emb_{i}' for i in range(8)]
emb_df = pd.DataFrame(embeddings, columns=emb_cols, index=df.index)

# Fuse tabular data with embeddings
df = pd.concat([df, emb_df], axis=1)
feature_cols.extend(emb_cols)

X = df[feature_cols].fillna(0)

# ======================
# TARGETS
# ======================
# Regression target: Delivery time
y_reg = df['Time_taken'].fillna(df['Time_taken'].median())

# Classification target: Delay risk (1 if > 30 min)
y_clf = (df['Time_taken'] > 30).astype(int)

# Premium multiplier (existing)
weather_risk = df['weather_enc'] * 0.04
traffic_risk = df['traffic_enc'] * 0.03
festival_risk = df['festival_enc'] * 0.05
y_premium = (1.0 + weather_risk + traffic_risk + festival_risk).clip(0.8, 1.5)

# ======================
# TRAIN MODELS
# ======================

print("\nTraining XGBoost for premium...")
xgb_model = xgb.XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
xgb_model.fit(X, y_premium)
print("XGB done")

print("\nTraining LightGBM Regressor for delivery time...")
lgbm_reg = lgb.LGBMRegressor(n_estimators=100, random_state=42)
lgbm_reg.fit(X, y_reg)
print("LGBM Regressor done")

print("\nTraining LightGBM Classifier for delay risk...")
lgbm_clf = lgb.LGBMClassifier(n_estimators=100, random_state=42)
lgbm_clf.fit(X, y_clf)
print("LGBM Classifier done")

print("\nTraining Random Forest...")
rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X, y_premium)
print("RF done")

# ======================
# MLP (FIXED VERSION)
# ======================
print("\nTraining MLP (fixed)...")

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

mlp_model = MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=500)
mlp_model.fit(X_scaled, y_premium)

print("MLP done")

# ======================
# FRAUD MODEL COMPONENTS
# ======================

# Component 1: Isolation Forest (existing)
print("\nTraining Fraud Model Component 1: Isolation Forest...")
fraud_model_iso = IsolationForest(contamination=0.1, random_state=42)
fraud_model_iso.fit(X)

# Component 2: Rule-based Engine
def rule_based_fraud_score(row):
    score = 0
    # High claim count in 30 days
    if row['claim_count_30d'] > 2:
        score += 30
    # Low zone match
    if row['zone_match'] == 0:
        score += 40
    # Short time between claims
    if row['time_between_claims'] < 24:
        score += 20
    # Low completion rate
    if row['delivery_completion_rate'] < 0.5:
        score += 25
    # High session duration (suspicious activity)
    if row['session_active_duration'] > 60:
        score += 15
    return min(score, 100)

df['rule_based_score'] = df.apply(rule_based_fraud_score, axis=1)

# Component 3: XGBoost with synthetic labels
# Generate synthetic fraud labels based on rules + noise
np.random.seed(42)
synthetic_fraud_labels = (df['rule_based_score'] > 50).astype(int)
# Add some noise to make it realistic
noise = np.random.choice([0, 1], len(df), p=[0.9, 0.1])
synthetic_fraud_labels = synthetic_fraud_labels | noise

print("\nTraining Fraud Model Component 3: XGBoost...")
fraud_model_xgb = xgb.XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
fraud_model_xgb.fit(X, synthetic_fraud_labels)

print("Fraud Components done")

# ======================
# SAVE MODELS
# ======================
os.makedirs('models', exist_ok=True)

pickle.dump(xgb_model, open('models/xgb.pkl', 'wb'))
pickle.dump(lgbm_reg, open('models/lgbm_reg.pkl', 'wb'))
pickle.dump(lgbm_clf, open('models/lgbm_clf.pkl', 'wb'))
pickle.dump(rf_model, open('models/rf.pkl', 'wb'))
pickle.dump(mlp_model, open('models/mlp.pkl', 'wb'))
pickle.dump(fraud_model_iso, open('models/fraud_model_iso.pkl', 'wb'))
pickle.dump(fraud_model_xgb, open('models/fraud_model_xgb.pkl', 'wb'))
pickle.dump(feature_cols, open('models/feature_cols.pkl', 'wb'))
pickle.dump(scaler, open('models/scaler.pkl', 'wb'))

# For backward compatibility, save Isolation Forest as fraud_model.pkl
pickle.dump(fraud_model_iso, open('models/fraud_model.pkl', 'wb'))

print("\nAll models saved successfully ✅")