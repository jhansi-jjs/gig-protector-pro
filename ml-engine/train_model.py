import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import pickle
import os

print("Loading datasets...")

df = pd.read_csv("zomato-delivery-operations-analytics-dataset/Zomato Dataset.csv")
print(f"Loaded {len(df)} rows")

# Clean columns
df.columns = df.columns.str.strip()
df['Delivery_person_Age'] = pd.to_numeric(df['Delivery_person_Age'], errors='coerce')
df['Delivery_person_Ratings'] = pd.to_numeric(df['Delivery_person_Ratings'], errors='coerce')
df['Time_taken'] = pd.to_numeric(df['Time_taken (min)'].astype(str).str.extract(r'(\d+)')[0], errors='coerce')
df['Vehicle_condition'] = pd.to_numeric(df['Vehicle_condition'], errors='coerce')
df['multiple_deliveries'] = pd.to_numeric(df['multiple_deliveries'], errors='coerce')
df = df.dropna(subset=['Delivery_person_Age', 'Delivery_person_Ratings'])

# Encode categoricals
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
X = df[feature_cols].fillna(0)

# Premium multiplier target based on real risk factors
weather_risk = df['weather_enc'] * 0.04
traffic_risk = df['traffic_enc'] * 0.03
festival_risk = df['festival_enc'] * 0.05
y = (1.0 + weather_risk + traffic_risk + festival_risk).clip(0.8, 1.5)

print(f"Training XGBoost on {len(X)} samples...")
model = xgb.XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
model.fit(X, y)
print(f"XGBoost R² score: {model.score(X, y):.4f}")

print("Training Isolation Forest fraud detector...")
iso = IsolationForest(contamination=0.1, random_state=42)
iso.fit(X)

os.makedirs('models', exist_ok=True)
with open('models/premium_model.pkl', 'wb') as f:
    pickle.dump(model, f)
with open('models/fraud_model.pkl', 'wb') as f:
    pickle.dump(iso, f)
with open('models/feature_cols.pkl', 'wb') as f:
    pickle.dump(feature_cols, f)

print("Models saved to models/")
print("Done!")
