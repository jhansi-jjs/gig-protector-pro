import random
import json
import psycopg2
from faker import Faker
from datetime import datetime, timedelta
import uuid

fake = Faker('en_IN')
random.seed(42)

# Real Indian delivery zones with city mapping
ZONES = {
    "Mumbai": ["Andheri East", "Dharavi", "Bandra", "Kurla", "Powai", "Dadar", "Borivali", "Thane"],
    "Delhi": ["Connaught Place", "Lajpat Nagar", "Dwarka", "Rohini", "Saket", "Karol Bagh"],
    "Bengaluru": ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Marathahalli", "BTM Layout"],
    "Chennai": ["T Nagar", "Anna Nagar", "Velachery", "Adyar", "Tambaram"],
    "Hyderabad": ["Banjara Hills", "Hitech City", "Madhapur", "Gachibowli", "Kukatpally"],
}

PLATFORMS = ["Zomato", "Swiggy", "Amazon Flex", "Blinkit", "Zepto"]

# Realistic earnings by city (₹/day) based on public reports
EARNINGS_RANGE = {
    "Mumbai":    (600, 1200),
    "Delhi":     (500, 1100),
    "Bengaluru": (550, 1050),
    "Chennai":   (400, 900),
    "Hyderabad": (450, 950),
}

conn = psycopg2.connect(
    dbname="shieldrun",
    user="postgres",
    password="postgres",
    host="localhost",
    port=5432
)
cur = conn.cursor()

print("Seeding 500 delivery partners...")

phones_used = set()
count = 0

while count < 500:
    city = random.choice(list(ZONES.keys()))
    zone = random.choice(ZONES[city])
    platform = random.choice(PLATFORMS)
    min_e, max_e = EARNINGS_RANGE[city]
    earnings = round(random.uniform(min_e, max_e), 2)
    risk_score = round(random.uniform(0, 40), 2)  # Most workers low risk

    # Generate unique Indian phone number
    phone = "9" + str(random.randint(100000000, 999999999))
    if phone in phones_used:
        continue
    phones_used.add(phone)

    name = fake.name()
    email = fake.email()
    worker_id = str(uuid.uuid4())
    created_at = datetime.now() - timedelta(days=random.randint(0, 180))

    try:
        cur.execute("""
            INSERT INTO "Worker" (id, name, phone, email, city, zone, platform, 
                                  "avgDailyEarnings", "riskScore", "createdAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (phone) DO NOTHING
        """, (worker_id, name, phone, email, city, zone, platform,
              earnings, risk_score, created_at))

        # Give 60% of workers an active policy
        if random.random() < 0.6:
            plan = random.choice(["Basic Shield", "Pro Shield", "Max Shield"])
            premium = round(random.uniform(29, 120), 2)
            coverage = {"Basic Shield": 500, "Pro Shield": 800, "Max Shield": 1200}[plan]
            start = datetime.now() - timedelta(days=random.randint(0, 6))
            end = start + timedelta(days=7)
            policy_id = str(uuid.uuid4())

            cur.execute("""
                INSERT INTO "Policy" (id, "workerId", "planTier", "weeklyPremium", 
                                      "coverageAmount", "startDate", "endDate", 
                                      "isActive", "createdAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (policy_id, worker_id, plan, premium, coverage,
                  start, end, True, created_at))

            # Give 30% of those workers some past claims
            if random.random() < 0.3:
                num_claims = random.randint(1, 3)
                triggers = ["HEAVY_RAIN", "EXTREME_HEAT", "HAZARDOUS_AQI"]
                statuses = ["PAID", "PAID", "PAID", "FLAGGED"]
                for _ in range(num_claims):
                    trigger = random.choice(triggers)
                    payout_rate = {"HEAVY_RAIN": 0.8, "EXTREME_HEAT": 0.5, "HAZARDOUS_AQI": 0.6}[trigger]
                    payout = round(earnings * payout_rate, 2)
                    fraud_score = round(random.uniform(0, 45), 2)
                    status = random.choice(statuses)
                    claim_date = start + timedelta(days=random.randint(0, 5))

                    cur.execute("""
                        INSERT INTO "Claim" (id, "workerId", "policyId", "triggerType",
                                            "triggerValue", "payoutAmount", "fraudScore",
                                            "status", "createdAt")
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (str(uuid.uuid4()), worker_id, policy_id, trigger,
                          round(random.uniform(15, 80), 2), payout,
                          fraud_score, status, claim_date))

        conn.commit()
        count += 1
        if count % 100 == 0:
            print(f"  {count}/500 workers seeded...")

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")

cur.close()
conn.close()
print("Done! 500 delivery partners seeded into PostgreSQL.")
