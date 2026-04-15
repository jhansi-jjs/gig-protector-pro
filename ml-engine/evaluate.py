import pandas as pd
import numpy as np
import pickle
from sklearn.metrics import (
    r2_score, mean_absolute_error, mean_squared_error,
    classification_report, confusion_matrix
)
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder
from hgrs_model import generate_zone_embedding

print("=" * 55)
print("   SHIELDRUN ML MODEL EVALUATION REPORT")
print("=" * 55)

# Load models
with open('models/premium_model.pkl', 'rb') as f:
    premium_model = pickle.load(f)
with open('models/fraud_model.pkl', 'rb') as f:
    fraud_model = pickle.load(f)

# Load dataset
df = pd.read_csv("zomato-delivery-operations-analytics-dataset/Zomato Dataset.csv")
df.columns = df.columns.str.strip()
df['Delivery_person_Age'] = pd.to_numeric(df['Delivery_person_Age'], errors='coerce')
df['Delivery_person_Ratings'] = pd.to_numeric(df['Delivery_person_Ratings'], errors='coerce')
df['Time_taken'] = pd.to_numeric(df['Time_taken (min)'].astype(str).str.extract(r'(\d+)')[0], errors='coerce')
df['Vehicle_condition'] = pd.to_numeric(df['Vehicle_condition'], errors='coerce')
df['multiple_deliveries'] = pd.to_numeric(df['multiple_deliveries'], errors='coerce')

le = LabelEncoder()
df['weather_enc'] = le.fit_transform(df['Weather_conditions'].astype(str))
df['traffic_enc'] = le.fit_transform(df['Road_traffic_density'].astype(str))
df['city_enc'] = le.fit_transform(df['City'].astype(str))
df['vehicle_enc'] = le.fit_transform(df['Type_of_vehicle'].astype(str))
df['festival_enc'] = le.fit_transform(df['Festival'].astype(str))

feature_cols = [
    'Delivery_person_Age', 'Delivery_person_Ratings',
    'weather_enc', 'traffic_enc', 'city_enc',
    'vehicle_enc', 'festival_enc', 'Vehicle_condition',
    'multiple_deliveries'
]
df = df.dropna(subset=feature_cols)

print("Extracting Level 1 HGRS Embeddings for Evaluation...")
mock_zones = ["Andheri East", "Dharavi", "Bandra", "Connaught Place", "Lajpat Nagar", "Koramangala", "Indiranagar", "T Nagar", "Hitech City"]

def get_row_embedding(row):
    mock_zone = mock_zones[hash(str(row.name)) % len(mock_zones)]
    return generate_zone_embedding(mock_zone, int(row['weather_enc']))

embeddings = df.apply(get_row_embedding, axis=1).tolist()
emb_cols = [f'emb_{i}' for i in range(8)]
emb_df = pd.DataFrame(embeddings, columns=emb_cols, index=df.index)

df = pd.concat([df, emb_df], axis=1)
feature_cols.extend(emb_cols)

X = df[feature_cols].fillna(0)

weather_risk = df['weather_enc'] * 0.04
traffic_risk = df['traffic_enc'] * 0.03
festival_risk = df['festival_enc'] * 0.05
y = (1.0 + weather_risk + traffic_risk + festival_risk).clip(0.8, 1.5)

# ── PREMIUM MODEL (XGBoost) ──────────────────────────
print("\n[ 1 ] PREMIUM CALCULATOR — XGBoost Regressor")
print("-" * 45)

y_pred = premium_model.predict(X)

r2  = r2_score(y, y_pred)
mae = mean_absolute_error(y, y_pred)
mse = mean_squared_error(y, y_pred)
rmse = np.sqrt(mse)

print(f"  R² Score          : {r2:.6f}  (1.0 = perfect)")
print(f"  MAE               : {mae:.6f}  (lower = better)")
print(f"  RMSE              : {rmse:.6f}  (lower = better)")
print(f"  Samples evaluated : {len(X):,}")

# Cross validation
cv_scores = cross_val_score(premium_model, X, y, cv=5, scoring='r2')
print(f"  5-Fold CV R²      : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
print(f"  CV Scores         : {[round(s,4) for s in cv_scores]}")

# Feature importance
importance = premium_model.feature_importances_
print(f"\n  Top Feature Importances:")
for feat, imp in sorted(zip(feature_cols, importance), key=lambda x: -x[1]):
    bar = "#" * int(imp * 100)
    print(f"    {feat:<35} {imp:.4f}  {bar}")

# ── FRAUD MODEL (Isolation Forest) ──────────────────
print("\n[ 2 ] FRAUD DETECTOR — Isolation Forest")
print("-" * 45)

preds = fraud_model.predict(X)
n_fraud    = (preds == -1).sum()
n_legit    = (preds ==  1).sum()
fraud_rate = (n_fraud / len(preds)) * 100

print(f"  Total records     : {len(preds):,}")
print(f"  Flagged as fraud  : {n_fraud:,}  ({fraud_rate:.1f}%)")
print(f"  Flagged as legit  : {n_legit:,}  ({100-fraud_rate:.1f}%)")
print(f"  Contamination set : 10%  (industry standard for anomaly detection)")
print(f"  Target fraud rate : ~10% — Actual: {fraud_rate:.1f}%")

# Score distribution
scores = fraud_model.decision_function(X)
print(f"\n  Anomaly Score Distribution:")
print(f"    Mean   : {scores.mean():.4f}")
print(f"    Std    : {scores.std():.4f}")
print(f"    Min    : {scores.min():.4f}  (most anomalous)")
print(f"    Max    : {scores.max():.4f}  (most normal)")

# ── SUMMARY ─────────────────────────────────────────
print("\n" + "=" * 55)
print("   SUMMARY")
print("=" * 55)
print(f"  XGBoost Premium Model R²  : {r2*100:.2f}%")
print(f"  XGBoost CV Stability      : {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%")
print(f"  Fraud Detection Rate      : {fraud_rate:.1f}% flagged")
print(f"  Dataset Size              : {len(X):,} real Zomato records")
print("=" * 55)
