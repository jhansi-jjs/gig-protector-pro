from main import calculate_premium, fraud_check, PremiumRequest, FraudRequest

print("\n" + "="*50)
print("   SHIELDRUN MULTI-SCENARIO TEST REPORT")
print("="*50)

# SCENARIO 1: The Safe Worker (Low Risk, Good Weather)
print("\n[ SCENARIO 1: The Safe Worker ]")
print("Location: Bandra | Weather: Sunny | Activity: Normal | Record: Clean")
req1 = PremiumRequest(zone='Bandra', plan='Basic Shield', month=1, weather='Sunny', traffic='Low', loyalty_months=6)
res1 = calculate_premium(req1)
print(f"Premium Price: Rs. {res1.final_premium} ({res1.zone_risk_label})")

freq1 = FraudRequest(zone='Bandra', weather='Sunny', claim_count_30d=0, same_trigger_count_7d=0, worker_rating=4.9, delivery_age_months=12)
fres1 = fraud_check(freq1)
print(f"Fraud Risk: {fres1.risk_level} (Score: {fres1.fraud_score}) | Approved? {not fres1.is_fraud}")


# SCENARIO 2: The Monsoon Crisis (High Risk, Bad Weather)
print("\n[ SCENARIO 2: The Monsoon Crisis ]")
print("Location: Dharavi | Weather: Stormy | Activity: Traffic Jam | Month: July (Monsoon)")
req2 = PremiumRequest(zone='Dharavi', plan='Pro Shield', month=7, weather='Stormy', traffic='Jam', loyalty_months=0)
res2 = calculate_premium(req2)
print(f"Premium Price: Rs. {res2.final_premium} ({res2.zone_risk_label})")


# SCENARIO 3: The Suspicious Claim (Fraud Trigger)
print("\n[ SCENARIO 3: The Coordinated Fraud Ring ]")
print("Location: Andheri East | Claims today: 15 | Late Night: 3 AM | Rating: 2.1")
freq3 = FraudRequest(zone='Andheri East', weather='Sunny', claim_count_30d=8, same_trigger_count_7d=4, hour_of_claim=3, zone_claims_today=15, worker_rating=2.1, delivery_age_months=0)
fres3 = fraud_check(freq3)
print(f"Fraud Risk: {fres3.risk_level} (Score: {fres3.fraud_score}) | Rejected? {fres3.is_fraud}")

print("\n" + "="*50 + "\n")
