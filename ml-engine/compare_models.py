import pickle
import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error

# LOAD DATA
df = pd.read_csv("zomato-delivery-operations-analytics-dataset/Zomato Dataset.csv")

df.columns = df.columns.str.strip()

df['Delivery_person_Age'] = pd.to_numeric(df['Delivery_person_Age'], errors='coerce')
df['Delivery_person_Ratings'] = pd.to_numeric(df['Delivery_person_Ratings'], errors='coerce')
df['Vehicle_condition'] = pd.to_numeric(df['Vehicle_condition'], errors='coerce')
df['multiple_deliveries'] = pd.to_numeric(df['multiple_deliveries'], errors='coerce')

df = df.dropna()

from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()

df['weather_enc'] = le.fit_transform(df['Weather_conditions'].astype(str))
df['traffic_enc'] = le.fit_transform(df['Road_traffic_density'].astype(str))
df['city_enc'] = le.fit_transform(df['City'].astype(str))
df['vehicle_enc'] = le.fit_transform(df['Type_of_vehicle'].astype(str))
df['festival_enc'] = le.fit_transform(df['Festival'].astype(str))

feature_cols = [
    'Delivery_person_Age',
    'Delivery_person_Ratings',
    'weather_enc',
    'traffic_enc',
    'city_enc',
    'vehicle_enc',
    'festival_enc',
    'Vehicle_condition',
    'multiple_deliveries'
]

X = df[feature_cols].fillna(0)

# SAME TARGET
weather_risk = df['weather_enc'] * 0.04
traffic_risk = df['traffic_enc'] * 0.03
festival_risk = df['festival_enc'] * 0.05

y = (1.0 + weather_risk + traffic_risk + festival_risk).clip(0.8, 1.5)

# LOAD MODELS
models = {
    "xgb": pickle.load(open("models/xgb.pkl", "rb")),
    "lgb": pickle.load(open("models/lgb.pkl", "rb")),
    "rf": pickle.load(open("models/rf.pkl", "rb")),
    "mlp": pickle.load(open("models/mlp.pkl", "rb"))
}

# LOAD SCALER (for MLP)
scaler = pickle.load(open("models/scaler.pkl", "rb"))

results = {}

for name, model in models.items():

    if name == "mlp":
        X_input = scaler.transform(X)
    else:
        X_input = X

    preds = model.predict(X_input)

    rmse = np.sqrt(mean_squared_error(y, preds))
    results[name] = rmse

    print(f"{name} RMSE: {rmse:.4f}")

# BEST MODEL
best = min(results, key=results.get)

print("\n🔥 BEST MODEL:", best)