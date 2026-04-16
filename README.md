# ShieldRun — AI-Powered Secure Parametric Income Insurance for Food Delivery Partners

```
╔══════════════════════════════════════════════════════════════════╗
║           GUIDEWIRE DEVTRAILS 2026 — SEED. SCALE. SOAR.         ║
║                                                                  ║
║   Team: CRACKED         |         Amrita Vishwa Vidyapeetham     ║
║   Persona: Food Delivery (Zomato / Swiggy / Amazon Flex)         ║
║   Phase: Seed → Scale → Soar                                     ║
╚══════════════════════════════════════════════════════════════════╝
```

---

Why We Built This — Aligned with the DEVTrails Mission

"Instead of recruitment drives or branded giveaways, students take on messy, industry-grade challenges that go beyond writing code. The goal is to give them a reason to care about insurance technology." — Guidewire DEVTrails Team

We heard that challenge. And we answered it with ShieldRun.

Guidewire's core mission is to power the P&C insurance industry — Property & Casualty — the layer of the economy that catches people when life goes wrong. For decades, that system has worked well for car owners, homeowners, and businesses.
But 12 million gig workers in India? The system doesn't see them at all.

## The Problem

India's food delivery partners are the last mile of the digital economy — yet they are the most financially exposed. A single bad weather day in Mumbai, a civic strike in Bengaluru, or a heavy-rain evening in Chennai can wipe out an entire day's earnings with zero recourse. No safety net. No fallback. No claim to file.

**This isn't hypothetical. It's already happening — repeatedly, at scale:**

 **The 2024 Delhi Heatwave** — Delhi recorded its highest-ever temperature in 2024, touching 52.9°C. Delivery workers had no choice but to keep riding through dangerous conditions because missing assignments meant losing earnings or facing penalties. Not a single rupee of income protection existed for hours lost to the heat.

 **All-India Gig Worker Strike, Dec 31 2025** — Workers across Zomato, Swiggy, Blinkit, Zepto, Amazon and Flipkart walked off on New Year's Eve — one of the highest-demand nights of the year — over falling wages, safety risks, and zero income protection. 50–60% of deliveries were delayed across major cities. The workers who didn't strike lost a full peak-earnings day with zero recourse.

 **The Scale of the Gap** — India's gig workforce has grown to an estimated 12 million workers as of FY 2024–25 and is projected to reach 23.5 million by 2030. Yet the Fairwork India Report 2024 found that none of the 11 major platforms reviewed could ensure a living wage for their workers — and on-ground social security protections remain largely absent despite new regulations requiring platforms to contribute to a social security fund.

**ShieldRun fills exactly this gap** — not with policy promises, but with automated, parametric payouts triggered the moment a disruption is detected. No form. No wait. No argument.

---

## Persona & Scenarios

**Primary Persona:** Arjun, a Zomato delivery partner in Mumbai

- Works 8–10 hrs/day, 6 days/week
- Earns ₹600–₹1,000/day depending on orders completed
- Has no employer. No ESI. No income protection.
- Is deeply aware of weather patterns but has no financial hedge against them
- Also representative of partners on **Amazon Flex** — Amazon's dedicated delivery partner app, live across 65+ cities in India, which gives partners flexible scheduling and block-based delivery assignments but zero income protection against external disruptions like weather or strikes.

### Real-World Disruption Scenarios We Cover

| # | Disruption Event | Trigger Condition | Income Impact |
|---|---|---|---|
| 1 | **Heavy Rainfall** | Rainfall > 15mm/hr in the partner's zone | Deliveries halted; earnings drop 70–90% |
| 2 | **Extreme Heat** | Temperature > 42°C for 3+ hours | Order volume drops; outdoor safety risk |
| 3 | **Severe Air Pollution** | AQI > 300 (Hazardous) | Outdoor delivery unsafe; platforms reduce surge |
| 4 | **Civic Strike / Bandh** | Verified local authority-issued restriction | Pickup/drop zones inaccessible |
| 5 | **Platform Outage** | Zomato/Swiggy app downtime > 2 hours (verified) | Zero orders possible; full earnings loss |

> **Coverage Scope:** LOSS OF INCOME ONLY. No vehicle repair, no health, no accident bills.

---

## Core Evaluation Pillars
| DEVTrails Evaluation Pillar | How ShieldRun Addresses It |
|---|---|
| **Real-world industry relevance** | Solves the income protection gap for 12M+ gig workers — a documented, data-backed crisis |
| **Understanding of insurance mechanics** | Full parametric trigger model, loss ratio formula, dynamic premium logic, IRDAI compliance awareness |
| **Claims lifecycle knowledge** | Automated FNOL → eligibility check → fraud validation → payout → audit — zero manual steps |
| **Fraud detection under pressure** | Built a 4-layer anti-spoofing system *before* the market crash challenge — not after |
| **AI/ML integration** | Custom HGRS algorithm, XGBoost premium model, Isolation Forest fraud engine, LSTM forecasting |
| **Startup thinking under constraints** | Weekly premium model mirrors gig worker pay cycles; loss ratio auto-adjusts to stay solvent |
| **Scalability** | Pincode-level hyperlocal risk scoring, designed for 23.5M workers by 2030 |
| **Security & trust** | AES-256 encryption, blockchain audit ledger, HMAC-signed OTPs, GPS privacy by design |

---

## Application Workflow

```
[Worker Onboards on ShieldRun App]
        ↓
[AI Risk Profile Built: Zone, Hours, Platform, History]
        ↓
[Weekly Policy Issued with Dynamic Premium]
        ↓
[Real-Time Trigger Monitoring: Weather + AQI + Traffic + Platform APIs]
        ↓
[Disruption Detected → Parametric Trigger Fired Automatically]
        ↓
[AI Fraud Engine Validates: GPS, Activity, Claim Pattern]
        ↓
[Instant Payout to UPI / Wallet — Zero Manual Claim Needed]
        ↓
[Dashboard Updated: Worker Sees Earnings Protected]
```
To better illustrate how the system operates in real-world conditions, the following flow outlines the complete execution pipeline:
## ⚡ End-to-End Execution Flow (Simplified)

This flow illustrates how ShieldRun detects disruptions, validates claims, and processes payouts in real time.

---

### 1️⃣ Worker Activity Initialization
- Delivery worker logs into the platform and starts active delivery session  
- System begins tracking:
  - Location (pincode-level)
  - Activity status
  - Device integrity signals  

---

### 2️⃣ Real-Time Disruption Detection
- External APIs continuously monitor:
  - Weather (rainfall, temperature)
  - AQI levels
  - Platform outages  

- If threshold is exceeded → **Trigger event generated**

---

### 3️⃣ Eligibility & Context Verification
System verifies whether the worker qualifies for protection:

- Worker is **active during disruption**
- Worker is in **affected geographic zone**
- Worker session is **valid (not idle/inactive)**  

---

### 4️⃣ Fraud Detection & Validation Layer
Multi-layer checks ensure claim authenticity:

- **GPS consistency check** → prevents location spoofing  
- **Device integrity validation** → detects emulator/tampering  
- **Session continuity check** → ensures real activity  
- **Duplicate claim detection** → avoids repeated payouts  

---

### 5️⃣ AI-Based Risk Evaluation (HGRS)
- Hyperlocal Gig Risk Scorer evaluates:
  - Disruption severity  
  - Zone-level risk  
  - Historical patterns  

- Outputs:
  - Risk score  
  - Confidence level  

---

### 6️⃣ Automated Decision Engine
Based on validation + AI output:

- **High confidence** → Auto-approve  
- **Medium confidence** → Soft flag (monitor)  
- **Low confidence / anomaly** → Reject or hold  

---

### 7️⃣ Instant Payout Execution
- Approved claims trigger immediate payout via:
  - UPI / Wallet integration  

- No manual claim filing required  

---

### 8️⃣ Dashboard & Audit Update
- Worker dashboard updated:
  - Earnings protected  
  - Claim history  

- System logs stored in:
  - Secure database  
  - Blockchain audit layer (immutable records)  

---

> This pipeline ensures a **fully automated, fraud-resistant, and real-time insurance system**, eliminating delays and manual intervention.

---

## Weekly Premium Model

Our financial model is structured **100% on a weekly basis** to match the gig worker's earnings cycle.

### Tier Structure (Weekly Premium)

| Plan | Weekly Premium | Weekly Max Payout | Best For |
|---|---|---|---|
| **Basic Shield** | ₹29/week | ₹500/disruption day | Occasional delivery workers |
| **Pro Shield** | ₹59/week | ₹800/disruption day | Full-time delivery partners |
| **Max Shield** | ₹99/week | ₹1,200/disruption day | High-earning / multi-platform workers |

### Dynamic Pricing Logic (AI-Driven)

The weekly premium is **not static** — it adjusts every Monday based on:

- **Zone Risk Score:** Historical flood/rain/strike frequency in the partner's delivery zone (e.g., Dharavi gets a higher rain-risk multiplier than Bandra)
- **Seasonal Risk Calendar:** Pre-monsoon weeks (June–July) trigger a 10–15% premium increase
- **Partner History Score:** Workers with 0 fraudulent claims over 3 months get a 5% loyalty discount
- **Platform Activity Level:** Inactive partners (< 3 delivery days in past week) get a paused premium — no charge for dormant weeks

**Formula:**
```
Weekly Premium = Base Rate × Zone Multiplier × Season Factor × (1 - Loyalty Discount)
```

**Example:** Arjun, Pro Shield, Zone: Andheri East (high flood risk), July
```
₹59 × 1.15 (flood zone) × 1.12 (monsoon season) × 0.95 (loyal customer) = ₹72.5/week
```

---
## 📊 Financial Viability & Loss Ratio

ShieldRun ensures long-term sustainability by maintaining a balanced relationship between premiums collected and payouts made.

---

### 📐 Loss Ratio Formula

**Loss Ratio = Total Payout / Total Premium Collected**

---

### 📈 Example Scenario

- **Total premium collected (1000 users):** ₹50,000/week  
- **Total payout during disruptions:** ₹35,000  

**Loss Ratio = 35,000 / 50,000 = 0.7**

---

### 📊 Interpretation

- **Loss Ratio < 1** → Sustainable system  
- **Loss Ratio > 1** → High risk, requires premium adjustment  

---

### ⚙️ System Behavior

- If **loss ratio increases** → Premium auto-adjusts in the next cycle  
- If **loss ratio is stable** → Users may receive reduced pricing  

---

> This dynamic adjustment ensures both **financial sustainability** and **fair pricing** for users.

---

## 🛡️ Coverage & Exclusions

ShieldRun follows a strict **parametric insurance model**, where payouts are triggered only by externally verifiable disruptions affecting delivery activity.

---

### ✅ Covered Events (Income Loss Only)

- Heavy rainfall disrupting delivery operations  
- Extreme heat reducing delivery activity  
- Hazardous AQI levels affecting outdoor work  
- Civic restrictions (bandh, curfew, closures)  
- Platform outages preventing order allocation  

---

### ❌ Not Covered

- Health or medical issues  
- Accidents or injuries  
- Vehicle damage or repair costs  
- Personal unavailability (non-working hours)  

---

> Only measurable, external events are considered valid triggers for automated payouts.

## Parametric Triggers (Automated — Zero Touch)

Parametric insurance pays out based on **objective data conditions**, not manual claims. ShieldRun monitors 5 real-time data streams:

| Trigger | API Source | Threshold | Payout |
|---|---|---|---|
| Heavy Rain | OpenWeatherMap / IMD API | > 15mm/hr in partner's pincode | Triggers Evaluation |
| Extreme Heat | OpenWeatherMap | Temp > 42°C for 3+ hrs | Triggers Evaluation |
| Hazardous AQI | CPCB AQI API (mock) | AQI > 300 | Triggers Evaluation |
| Civic Strike/Bandh | Government alert feed (mock) | Verified zone lockdown | Triggers Evaluation |
| Platform Outage | Zomato/Swiggy status mock API | Downtime > 2 hrs | Triggers Evaluation |

---

### 💡 Outcome-Based Payout Model (Replaces Fixed Parametric Payouts)

ShieldRun does not assign fixed payouts per event. Instead, it computes **actual income loss dynamically** using a hybrid AI-based evaluation.

**Core Function:**

```text
Payout = max(0, Expected Earnings (E) − Actual Earnings (A)) × Effort Score (S) × Confidence Score (C)
```

---

### 📊 Variable Definitions

* **Expected Earnings (E):**
  Estimated income under normal conditions using:

  * historical earnings pattern
  * working hours
  * zone demand
  * real-time event impact

* **Actual Earnings (A):**
  Verified earnings from platform activity (deliveries, timestamps, GPS validation)

* **Effort Score (S ∈ [0,1]):**
  Measures worker engagement:

  * login duration
  * order acceptance rate
  * movement consistency

* **Confidence Score (C ∈ [0,1]):**
  Measures reliability of the detected disruption:

  * trigger data accuracy
  * location certainty
  * fraud validation signals

---

### ⚠️ Important Behavior

* If **Actual ≥ Expected → No payout**
* Events do NOT automatically guarantee payout
* This prevents overcompensation during high-demand disruptions

---

### 🧠 Decision Layer (Post-Payout Calculation)

The computed payout is not immediately released — it is passed through a decision layer aligned with the fraud detection system:

* **High Confidence (≥ 0.85)**
  → Full payout released instantly

* **Medium Confidence (0.50 – 0.84)**
  → 60% payout released immediately
  → Remaining 40% released after background verification

* **Low Confidence (< 0.50 or high fraud score)**
  → Payout held for review

---

### 🔗 System Alignment

This payout logic integrates directly with:

* **HGRS (Risk Scoring Model)** → evaluates disruption severity
* **Fraud Detection Engine** → outputs Fraud Risk Score
* **Effort Score (S)** → already defined in system
* **Confidence Score (C)** → already defined in system

---

### ⚡ Final Execution Flow

```text
Trigger → Evaluation → Expected vs Actual → Payout Function → Decision Layer → Payout Execution
```

---

**Claim Initiation:** Fully automatic. Partner receives a push notification: *"Heavy rain detected in your zone. Your claim is being processed."*

**No form filling. No document upload. No waiting.**

---

## AI/ML Integration Plan

### 1. Dynamic Premium Calculation
- **Model:** Gradient Boosted Regression (XGBoost)
- **Features:** Zone historical weather data, seasonal patterns, partner activity, past claim frequency
- **Output:** Personalized weekly premium per partner

### 2. Risk Profile Scoring
- **Model:** Clustering (K-Means) to segment partners into risk tiers on onboarding
- **Inputs:** Delivery zone, avg daily hours, platform (Zomato/Swiggy), historical city disruption data
- **Output:** Risk Score (Low / Medium / High) used to assign base plan

### 3. Hyperlocal Gig Risk Scorer (HGRS) — Our Custom Algorithm

This is ShieldRun's core ML innovation — a novel risk scoring algorithm built on top of pretrained foundation models using **transfer learning**, purpose-designed for India's gig economy.

ShieldRun's model selection runs at **two distinct levels**. Most teams pick one model and ship it. We run a structured comparison at every layer and always deploy the proven best.

```
┌─────────────────────────────────────────────────────────────┐
│         LEVEL 1 — Pretrained Base Model Selection           │
│   Which foundation model do we transfer learn from?         │
│   3 candidates evaluated → 1 winner selected                │
└───────────────────────┬─────────────────────────────────────┘
                        ↓
              Winner becomes the base of HGRS
                        ↓
┌─────────────────────────────────────────────────────────────┐
│         LEVEL 2 — Final Production Model Selection          │
│   HGRS vs 4 classical ML models — which is best overall?    │
│   5 candidates evaluated → 1 deployed to production         │
└─────────────────────────────────────────────────────────────┘
```

---

#### Level 1 — Pretrained Base Model Comparison (3 Candidates)

Training a risk model from scratch requires years of labelled insurance claim data that doesn't exist yet for India's gig sector. Instead, we start with a **pretrained weather/climate foundation model** and extract its internal embeddings as rich input features — rather than raw weather numbers — giving our model a massive head start.

We compare three real, publicly available pretrained foundation models:

| Model | By | What It Is | Why Relevant | Key Strength |
|---|---|---|---|---|
| **Prithvi WxC** | NASA + IBM | 2.3B parameter model pretrained on 40 years of NASA MERRA-2 Earth observation data; open-source on Hugging Face | Global-to-local scale fine-tuning; directly applicable to hyperlocal Indian pincode forecasting | Best for geographic downscaling to pincode level |
| **MetNet-3** | Google DeepMind | Deep learning model for weather forecasting at 1km spatial / 2-min temporal resolution; outperforms physics-based NWP models up to 24hrs | Best-in-class precipitation forecasting — directly powers our rain trigger scoring | Best for short-term rain trigger precision |
| **Pangu-Weather** | Huawei Research | Transformer-based model pretrained on 39 years of ERA5 reanalysis data; 3D Earth system representation; published in Nature | Multi-variable forecasting (temperature + wind + humidity simultaneously) | Best for heatwave + AQI multi-trigger scoring |

**Level 1 Evaluation Parameters:**

| Parameter | What We Measure |
|---|---|
| **Precipitation RMSE** | Accuracy of rain threshold predictions at pincode level |
| **Temperature MAE** | Accuracy of heatwave trigger forecasts |
| **Downscaling Performance** | How well model adapts from global → India pincode scale |
| **Fine-tuning Speed** | Time to adapt pretrained model on our India-specific data |
| **Open Source / API Access** | Can we actually integrate it in 6 weeks? |

The **Level 1 winner** becomes the pretrained base that powers HGRS.

---

#### The HGRS Pipeline (Built on Level 1 Winner)

```
Level 1 Winner Embeddings (transfer learned)
              +
Historical Disruption Data (per pincode, 3 years IMD)
              +
Platform Activity Signals (orders/hr drop patterns)
              +
Partner Behavioral Profile (working hours, zone, platform)
              ↓
  ShieldRun HGRS — Fine-tuned on India Gig Data
              ↓
  Hyperlocal Risk Score (0–100) per zone per week
```

#### What Makes It Novel — Pincode-Level Granularity

Most insurance risk models score at a city level. HGRS scores at **pincode + time-of-day + platform + season** level:

| Zone | Time | Month | Platform | Risk Score |
|---|---|---|---|---|
| Dharavi, Mumbai | 6 PM | July | Zomato | 87 — Extreme |
| Bandra, Mumbai | 10 AM | December | Swiggy | 12 — Low |
| Connaught Place, Delhi | 2 PM | May | Amazon Flex | 74 — High |
| Koramangala, Bengaluru | 8 PM | March | Swiggy | 31 — Moderate |

#### Self-Improving Feedback Loop

```
Claim Verified & Paid → Confirmed Disruption Event
              ↓
       Added to Training Dataset
              ↓
    Model Retrained Every Monday
              ↓
  Next Week's Risk Scores More Accurate
```

---

### 4. Level 2 — Final Production Model Comparison (5 Candidates)

Once HGRS is built, it competes against 4 classical ML baselines on the **same India gig dataset**. We do not assume HGRS wins — we prove it.

| # | Model | Type | Why Included |
|---|---|---|---|
| 1 | **XGBoost** | Classical ML | Strong tabular baseline; handles missing values well |
| 2 | **Random Forest** | Classical ML | Robust to outliers; excellent zone-level feature importance |
| 3 | **LightGBM** | Classical ML | Fastest retraining — ideal for Monday midnight retraining window |
| 4 | **Neural Network (MLP)** | Deep Learning | Captures non-linear interactions between weather + behavioral signals |
| 5 | **HGRS** | Transfer Learning | Our custom model; pretrained embeddings + fine-tuned on India gig data |

#### Level 2 Evaluation Parameters

| Parameter | Why It Matters for Insurance |
|---|---|
| **RMSE** | Premium prediction accuracy — lower = fairer pricing for workers |
| **AUC-ROC** | Trigger classification quality (disruption vs no disruption) |
| **F1 Score** | Fraud detection balance between precision and recall |
| **Inference Latency (ms)** | Must be fast enough for real-time trigger evaluation |
| **Weekly Retraining Time** | Must complete within Sunday midnight burn window |
| **SHAP Explainability Score** | IRDAI requires auditable, justifiable AI-driven pricing decisions |

#### Selection Criteria & Proposed Best Model

The model with the best combined score across **RMSE + AUC-ROC + SHAP** is deployed to production each week. Our hypothesis — validated through the feedback loop — is that **HGRS will outperform all classical baselines** after 3–4 weeks of real claim data accumulation, because pretrained weather embeddings capture pattern complexity that tabular features alone cannot represent.

> **Why this matters for regulators:** IRDAI increasingly requires AI-driven pricing to be auditable. By running SHAP explainability alongside accuracy metrics at both levels, ShieldRun is built for regulatory compliance from day one — not retrofitted later.

### 3. Fraud Detection Engine — Dual-Key Location Verification System

This is ShieldRun's original fraud prevention mechanism, purpose-built for food delivery workflows.

####The Core Idea

Every pickup location (restaurant / dark kitchen / cloud hub) has a **static Location Key** permanently registered in ShieldRun's system. Every day, the delivery partner receives a **time-bound Daily OTP** pushed directly to their **Zomato / Swiggy / Amazon delivery account** — the same app they already use to accept orders.

When a disruption claim is being evaluated, the system performs a **two-point key match** — one at pickup (IN) and one at drop-off (OUT):

```
┌─────────────────────────────────────────────────────────┐
│                  DUAL-KEY VERIFICATION                   │
│                                                         │
│   Partner's Daily OTP (sent to delivery account)        │
│              +                                          │
│   Pickup Location's Static Key                          │
│              ↓                                          │
│         KEYS MATCH?                                     │
│         ↙        ↘                                      │
│       YES          NO                                   │
│   IN timestamp   Claim rejected                         │
│   recorded  →    immediately                            │
│   GPS tracking                                          │
│   begins                                                │
│              ↓                                          │
│   Partner completes delivery                            │
│              ↓                                          │
│   OUT timestamp recorded at drop-off                    │
│              ↓                                          │
│   Full verified delivery window = IN → OUT              │
│   Cross-checked against disruption event timestamp      │
└─────────────────────────────────────────────────────────┘
```

#### How It Works Step by Step

| Step | Event | What ShieldRun Records |
|---|---|---|
| **1. Morning** | Daily OTP pushed to partner's Zomato/Swiggy/Amazon account | OTP hash + valid date window |
| **2. Pickup (IN)** | Partner enters OTP at pickup location; system matches against location's static key | IN timestamp + location key match hash + GPS coordinates |
| **3. Active Delivery** | GPS tracked continuously while partner is on route | Location trail hash stored (zone-level, not exact) |
| **4. Drop-off (OUT)** | Delivery marked complete in platform app | OUT timestamp recorded, delivery window closed |
| **5. Claim Check** | Disruption event timestamp cross-checked against IN→OUT window | If disruption falls within verified window → claim is legitimate |

#### Fraud Scenarios This Catches

| Fraud Attempt | How Dual-Key Stops It |
|---|---|
| Partner claims disruption but was never at the pickup zone | Location key won't match → no IN timestamp → claim void |
| Partner uses yesterday's OTP | OTP is time-bound to current day only → key mismatch → rejected |
| Partner submits claim for a delivery that never happened | No IN/OUT timestamps on record → auto-rejected |
| Two partners sharing the same OTP | OTP is single-use, tied to one account → second use flagged immediately |
| GPS spoofing (fake location) | Location key at pickup is static and hardware-bound — spoofed GPS won't produce a valid key match |

#### AI Layer on Top — Isolation Forest Anomaly Detection

Beyond the dual-key check, an **Isolation Forest ML model** runs a second pass on every claim:

- **Velocity check:** More than 3 claims in 4 weeks → manual review flag
- **Pattern check:** Claims suspiciously clustered on Monday mornings or just before policy renewal → flagged
- **Cross-partner check:** Multiple partners claiming the same disruption event from the same pickup location in an unusually short window → collusion flag
- **Output:** Fraud Risk Score (0–100). Score > 70 → auto-reject + flag for insurer review

#### Key Security Properties

- Daily OTPs are generated using **HMAC-SHA256** — cryptographically signed, cannot be guessed or forged
- Location static keys are **stored encrypted (AES-256)** in the backend — never exposed client-side
- All IN/OUT timestamp events are **written to the blockchain ledger** — immutable, auditable, tamper-proof
- Raw GPS trail is **hashed to zone-level** and auto-deleted after 24 hours — privacy by design

### 4. Predictive Disruption Forecasting (Phase 3)
- **Model:** LSTM time-series model trained on 3 years of IMD weather data
- **Purpose:** Predict high-risk weeks in advance, enable proactive partner alerts

---

## Platform Choice: Mobile-First Web App (PWA)

**Rationale:**
- Food delivery partners primarily use smartphones (Android, budget tier)
- A Progressive Web App (PWA) avoids Play Store friction while providing native-app feel
- Works offline for areas with spotty connectivity
- Single codebase serves both worker (consumer) and insurer (admin) views

---

## Tech Stack

### Frontend
- **React.js** (Web/PWA) — Partner dashboard, policy view, payout history
- **Tailwind CSS** — Mobile-first responsive UI
- **React Native** (Phase 3) — Native app shell for push notifications

### Backend
- **Node.js + Express** — REST API layer
- **Python (FastAPI)** — AI/ML model serving (risk scoring, fraud detection)
- **PostgreSQL** — Partner profiles, policy records, claim history
- **Redis** — Real-time trigger state caching

### AI/ML
- **scikit-learn / XGBoost** — Premium calculation & fraud detection
- **TensorFlow/Keras** — LSTM forecasting model (Phase 3)
- **Pandas + NumPy** — Data preprocessing pipelines

### Integrations
- **OpenWeatherMap API** (free tier) — Rain, temperature triggers
- **CPCB AQI API** (mock/free) — Pollution trigger
- **Government alert feed** (mocked) — Strike/bandh trigger
- **Zomato/Swiggy API** (simulated) — Platform outage detection, earnings data
- **Razorpay Checkout / Payment Links (test mode)** — Premium collection portal
- **Ethereum Hoodi Testnet** — On-chain audit hash anchoring for payout events

### Infrastructure
- **AWS EC2 / Render.com** — Backend hosting
- **Vercel** — Frontend hosting
- **GitHub Actions** — CI/CD pipeline

---

## Development Plan

### Phase 1 (Weeks 1–2): Ideation & Foundation ✅
- [x] Finalize persona and disruption triggers
- [x] Define weekly premium model and parametric trigger logic
- [x] Set up GitHub repository and project structure
- [ ] Build basic React frontend shell (onboarding flow)
- [ ] Set up Node.js backend with partner registration API
- [ ] Connect OpenWeatherMap API (mock trigger test)
- [ ] Train initial risk scoring model on synthetic data

### Phase 2 (Weeks 3–4): Automation & Protection
- [ ] Complete registration + onboarding UX
- [ ] Policy creation with dynamic weekly premium calculation
- [ ] Build 5 automated parametric triggers
- [ ] Claims management UI (auto-trigger + partner notification)
- [ ] Fraud detection v1 (GPS + activity + duplicate checks)
- [ ] Simulated payout flow (Razorpay test mode)

### Phase 3 (Weeks 5–6): Scale & Optimise
- [ ] Advanced fraud detection (Isolation Forest model)
- [ ] Dual dashboard: Worker view + Admin/Insurer view
- [ ] LSTM forecasting model for disruption prediction
- [ ] Full payout simulation with UPI mock
- [ ] Final pitch deck + 5-minute demo video
- [ ] Performance optimization and edge case handling

---

## Key Metrics (Analytics Dashboard — Planned)

**For Workers:**
- Total earnings protected this week
- Active coverage status + renewal date
- Payout history timeline
- Disruption alerts for their zone

**For Insurers (Admin):**
- Live loss ratio by zone and disruption type
- Claims pending vs. auto-approved vs. flagged
- Weekly premium collected vs. payouts issued
- Predicted disruption risk for next 7 days (ML-powered)
- Fraud flag queue with risk scores

---

## What We Explicitly Do NOT Cover

Per hackathon constraints, ShieldRun strictly excludes:
- Health or medical insurance
- Life insurance
- Accident coverage
- Vehicle repair or maintenance payouts
- Any manual/subjective claim — all triggers are parametric and data-driven

---

## Adversarial Defense & Anti-Spoofing Strategy

> **Market Crash Response — Phase 1** | A coordinated syndicate of 500 delivery workers organized via Telegram is using GPS spoofing apps to fake locations inside red-alert weather zones, triggering mass false payouts and draining liquidity pools. Simple GPS verification is obsolete. Here is how ShieldRun fights back.

---

### The Attack We Are Defending Against

```
Syndicate member sits at home (safe zone)
              ↓
Installs GPS spoofing app → fakes location inside flood zone
              ↓
Parametric trigger fires (rain > 15mm/hr detected in zone)
              ↓
Platform assumes worker is stranded → pays out
              ↓
500 members × ₹800 payout = ₹4,00,000 drained in one event
```

A purely GPS-based or weather-based system cannot distinguish this from a real claim. ShieldRun's defense operates across **four layers** — each independently capable of catching fraud, together making it nearly impossible to defeat.

> **Core Philosophy shift:**
> Basic systems ask: *"Where is the person?"*
> ShieldRun asks: *"Did the person actually work?"*
> We validate **Behavior + Proof + Pattern = Truth** — not GPS coordinates alone.

---
## Security Architecture

Security is not an afterthought in ShieldRun — it is foundational. We are handling sensitive financial data, GPS location, payout credentials, and insurance policy records for millions of gig workers. Every layer of the stack is designed with security-first principles.

---

### Layer 1 — The Differentiation: Real Stranded Worker vs Faker

A real stranded worker behaves differently from someone faking it at home. Their device signals, movement patterns, and platform activity tell a story no spoofed GPS can replicate.

| Signal | Genuine Stranded Worker | GPS Spoofer at Home |
|---|---|---|
| **Sensor Fusion** | Accelerometer shows vibrations, barometer drops with weather, gyroscope active | Accelerometer near-zero, barometer static, magnetometer frozen — classic spoofing app signature |
| **Battery drain** | Higher drain — GPS active, network switching in bad weather | Normal idle drain |
| **Network signal** | Degraded — cell towers in flood zones overloaded | Full bars on home WiFi |
| **Platform activity** | Attempted order logins, declined orders due to disruption | No platform activity during claim window |
| **Dual-Key OTP match** | OTP matched against physical pickup location key — IN timestamp verified | Cannot produce valid IN timestamp — never at a pickup location |
| **Delivery quality signals** | Past completion rate, time-per-delivery, pickup location diversity consistent | Effort score inflated by fake logins but zero real deliveries |
| **Historical zone presence** | Regular GPS presence in this zone on prior working days | No prior zone history |

#### Hardened Dual-Key System — Addressing Reverse Engineering Risk

The original dual-key concept is strong but we go further. Keys are **not static** — they are:
- **Server-generated and time-limited** — new key every 60 seconds
- **Tied to device ID + session token + timestamp** — the same key cannot be reused on another device or at another time
- **Never stored client-side** — key lives only in server memory during the verification window
- Backed by **HMAC-SHA256 signing** — cryptographically impossible to forge without server secret

A reverse-engineered app gets a key that expired 60 seconds ago. Useless.

#### Sensor Fusion — Addressing GPS Replay Attacks

Modern spoofers can simulate realistic routes with speed variation and even replay real GPS traces. Our defense goes below the GPS layer:

- **Accelerometer + gyroscope + barometer** cross-validated against GPS coordinates
- A spoofing app can fake coordinates — it cannot simultaneously fake physical inertial sensor data
- Worker on a bike in rain: barometer registers pressure change, accelerometer shows road vibrations, gyroscope shows turns. A person sitting at home shows none of these.
- **Any mismatch between GPS claims and sensor reality → automatic Tier 3 flag**

---

### Layer 2 — The Data: What Catches a Coordinated Fraud Ring

Individual fraud is hard. A ring of 500 people leaves unmistakable patterns. ShieldRun monitors **six cross-partner signals**:

#### Signal 1 — Claim Velocity Spike
```
Genuine disruption:   ▁▂▃▄▅▆▆▅▄▃▂  (gradual bell curve over 30–60 min)
Fraud ring attack:    ▁▁▁▁▇▇▇▇▁▁▁  (sudden vertical spike in < 5 min)
```
Claims-per-minute rate anomaly triggers a ring investigation flag automatically.

#### Signal 2 — Temporal Clustering Analysis
Ring members file claims within minutes of each other. If N claims from unrelated accounts arrive in a tight window from overlapping zones — coordinated event flag raised.

#### Signal 3 — Device Fingerprint Clustering
GPS spoofing apps leave identifiable signatures — accelerometer reads zero, magnetometer frozen, barometer static. Multiple claims sharing the same sensor anomaly fingerprint = same spoofing tool = coordinated group.

#### Signal 4 — Social Graph & Account Creation Analysis
If 50 accounts were created in the same 48-hour window, share the same referral code, or were onboarded from the same device IP subnet — suspicious cluster flagged. A fraud ring recruits together; our system sees that.

#### Signal 5 — Zone Saturation Anomaly
Real disruptions never produce 100% claim participation — some workers complete deliveries, some weren't working. If claim rate exceeds **3 standard deviations above historical average** for a zone, the entire batch is held for review.

#### Signal 6 — Cross-Event Repeat Offender Network
```
Event 1 (Mumbai flood):   Partners A, B, C, D, E all claim
Event 2 (Delhi heat):     Partners A, B, C, F, G all claim
Event 3 (Bengaluru AQI):  Partners A, C, D, F, H all claim
                                    ↓
         Partner A, C appear in ALL 3 events → Persistent fraud network flagged
```

---

### Layer 3 — Device-Level Security (The Gap Most Systems Miss)

Most fraud starts **at the device level** before GPS is even spoofed. ShieldRun implements:

- **Rooted / jailbroken device detection** — rooted Android devices can run GPS mock apps at system level; detected on app launch and flagged
- **Emulator detection** — claims from Android emulators (common in coordinated attacks) are automatically rejected
- **Cloned app fingerprinting** — if the same app instance ID appears on two different devices, both accounts are flagged
- **App integrity check** — ShieldRun verifies its own APK signature at runtime; a tampered or repackaged app is detected immediately

---

### Layer 4 — Hybrid ML Model (Beyond Isolation Forest)

Isolation Forest alone is unsupervised — it detects statistical anomalies but does not understand intent and can miss sophisticated coordinated fraud. ShieldRun uses a **three-component hybrid model**:

```
Component 1: Isolation Forest
→ Detects statistical outliers in claim frequency and behavioral deviation
              +
Component 2: Rule-Based Engine
→ Hard thresholds: velocity spike > X, zone saturation > 3σ, sensor mismatch
              +
Component 3: Supervised Classifier (XGBoost)
→ Trained on confirmed past fraud labels — understands intent, not just anomaly
              ↓
Combined Fraud Risk Score (0–100)
```

**Weekly retraining** on new confirmed fraud labels ensures the model evolves as attackers adapt.

---

### Layer 5 — The UX Balance: Flagging Without Punishing Honest Workers

A system that punishes honest workers to catch fraudsters loses user trust faster than any fraud ring drains money. ShieldRun uses a **three-tier response** — never binary approve/reject:

#### Tier 1 — Auto-Approved (Confidence ≥ 0.85)
All signals align. OTP matched. Sensors consistent. Platform active. No ring signals. **Instant payout.** Worker never knows a check happened.

#### Tier 2 — Soft Flag (Confidence 0.50–0.84)
Slightly ambiguous but not conclusive — could be genuine network drop in bad weather:
- **60% payout released immediately** — worker not left without income
- **Silent 6-hour background check** — platform logs, cell tower data, zone history
- Pass → remaining 40% auto-released, no action needed
- Fail → 60% logged as recoverable advance, future premium adjusted slightly
- **Worker never fills a form or calls anyone**

#### Tier 3 — Hard Flag (Confidence < 0.50 OR Ring Signal)
Strong fraud signals. Payout held. Notification sent:
> *"We detected unusual signals with your claim. Our team is reviewing it within 4 hours. If this is an error, your payout will be released automatically — no action needed from you."*

- No accusatory language — never says "fraud suspected"
- **4-hour SLA** — not days
- **One-tap appeal** — one piece of corroborating evidence expedites review
- Cleared → full payout + Confidence Score trust bonus

#### Audit Scalability — Reviewer Gap Addressed
Manual audit at scale breaks for 10,000+ users. ShieldRun solves this:
- Only the **top 1% highest fraud-score cases** reach human reviewers
- Everything below auto-resolves via confidence score decay over 24 hours
- Audits are **prioritized by ring membership score** — syndicate members reviewed first

```
Tier 1 (85%+ of genuine claims):  Instant payout — zero friction
Tier 2 (mild ambiguity):          60% instant + silent 6hr background check
Tier 3 (strong fraud signals):    Hold + human review within 4 hours
                                  Only top 1% reach human auditors
```

---

### Defense Philosophy Summary

```
Basic parametric systems:
Event detected → GPS in zone → Payout 

ShieldRun:
Event detected → Sensor fusion validates physical presence
              → Dual-key proves pickup location attendance
              → Behavior proves actual work effort
              → Cross-partner signals rule out ring coordination
              → Hybrid ML scores intent, not just anomaly
              → Tier system protects honest workers
              → Verified loss → Payout
```

**GPS spoofing attacks the assumption that location = presence. ShieldRun never made that assumption.** A spoofer can fake coordinates. They cannot simultaneously fake inertial sensors, a time-limited hardware-bound OTP key match, platform delivery logs, and absence from a cross-event fraud network. Each layer is independently sufficient. Together they are insurmountable.

---

### 1. Password & Credential Hashing

All user credentials are **never stored in plaintext** — ever.

- **Algorithm:** `bcrypt` with a minimum cost factor of **12**
- **What it protects:** Partner login passwords, admin credentials, API secret keys
- **Implementation:**
```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// On registration
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// On login
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```
- **Why bcrypt over MD5/SHA:** bcrypt is deliberately slow and salted — brute-force attacks are computationally infeasible even if the database is compromised

---

### 2.Blockchain — Immutable Claim & Policy Ledger

Every policy issuance, parametric trigger event, and payout is recorded on a **private blockchain ledger**. This prevents tampering, ensures auditability, and makes fraud significantly harder.

**What goes on-chain:**

| Event | Data Recorded On-Chain |
|---|---|
| Policy Created | Partner ID hash, plan tier, week start/end, premium paid |
| Trigger Fired | Trigger type, timestamp, API source data hash, zone ID |
| Claim Approved | Claim ID, fraud score, payout amount, approval timestamp |
| Payout Processed | Transaction ID, UPI ref hash, amount, partner ID hash |

**Stack:**
- **Hyperledger Fabric** (permissioned blockchain) — enterprise-grade, no gas fees, suitable for insurance workflows
- Each block contains: `{ previousHash, timestamp, eventData, dataHash (SHA-256), digitalSignature }`
- All sensitive fields (partner name, phone, UPI ID) are **hashed before being written to chain** — the ledger stores proofs, not PII

```javascript
const crypto = require('crypto');

function createBlock(eventData, previousHash) {
  const dataHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(eventData))
    .digest('hex');

  return {
    timestamp: Date.now(),
    dataHash,
    previousHash,
    data: eventData  // PII fields already hashed before reaching here
  };
}
```

**Why this matters for insurance:** Regulators and auditors can verify every payout decision independently. No insurer can retroactively deny a valid claim — it's on-chain.

---

### 3.Data Encryption — At Rest & In Transit

**In Transit (HTTPS / TLS 1.3):**
- All API communication enforces **TLS 1.3** — older protocols (TLS 1.0, 1.1, SSL) are explicitly rejected
- HTTP requests are auto-redirected to HTTPS
- HSTS (HTTP Strict Transport Security) headers enforced

**At Rest (AES-256):**
- Sensitive database columns (UPI IDs, Aadhaar last-4, phone numbers) are encrypted using **AES-256-CBC** before storage
- Encryption keys are stored in **AWS KMS (Key Management Service)** — never hardcoded, never in `.env` files
- Backups are encrypted with a separate KMS key

```python
from cryptography.fernet import Fernet
import os

# Key loaded from AWS KMS, never from code
encryption_key = os.environ['KMS_ENCRYPTION_KEY']
cipher = Fernet(encryption_key)

# Encrypt before storing
encrypted_upi = cipher.encrypt(upi_id.encode()).decode()

# Decrypt only when needed for payout
decrypted_upi = cipher.decrypt(encrypted_upi.encode()).decode()
```

---

### 4.Application Security

**Authentication & Authorization:**
- **JWT (JSON Web Tokens)** with short expiry (15 min access token + 7-day refresh token)
- Role-based access control (RBAC): `PARTNER`, `ADMIN`, `AUDITOR` roles with strict permission scopes
- Refresh tokens stored as **httpOnly cookies** (not localStorage — prevents XSS theft)

**API Security:**
- **Rate limiting:** Max 100 requests/min per IP (express-rate-limit); stricter 10 req/min on auth endpoints
- **Input validation & sanitization:** All inputs validated with `Joi` (Node.js) / `Pydantic` (Python) before processing
- **SQL injection prevention:** All DB queries use parameterized statements via ORM (Prisma / SQLAlchemy)
- **CORS policy:** Whitelisted origins only — no wildcard `*` in production

**Infrastructure Security:**
- Secrets managed via **AWS Secrets Manager** — no `.env` files in production
- **WAF (Web Application Firewall):** AWS WAF rules block SQLi, XSS, and known malicious IPs
- **VPC isolation:** ML engine and database live in private subnets — not publicly accessible
- Regular **dependency vulnerability scans** via `npm audit` + `pip-audit` in CI/CD pipeline

---

### 5. GPS & Location Data Privacy

Partner GPS data is used only for fraud validation — not stored long-term.

- GPS coordinates are **hashed to a zone-level grid** (500m × 500m cell) before any storage — exact location is never persisted
- Raw GPS data is held in Redis with a **24-hour TTL** (auto-deleted after claim window closes)
- Partners are shown a clear consent screen on onboarding explaining exactly what location data is used for and when

---

### 6.Security Summary Table

| Layer | Technology | Protection |
|---|---|---|
| Passwords | bcrypt (cost=12) | Brute-force resistant credential storage |
| Sensitive DB fields | AES-256-CBC + AWS KMS | Encrypted at rest, key rotation supported |
| API transport | TLS 1.3 + HSTS | Encrypted in transit, no downgrade attacks |
| Auth tokens | JWT + httpOnly cookies | XSS-resistant session management |
| Claim/policy records | Hyperledger Fabric blockchain | Tamper-proof, auditable event ledger |
| API abuse | Rate limiting + WAF | DDoS and injection attack prevention |
| GPS data | Zone-hashing + 24hr TTL | Location privacy by design |
| Secrets | AWS Secrets Manager / KMS | No hardcoded credentials anywhere |

---

## Repository Structure (Planned)

```
shieldrun/
├── frontend/          # React PWA — partner & admin dashboards
├── backend/           # Node.js REST API + PostgreSQL models
├── ml-engine/         # Python FastAPI — risk scoring & fraud detection
├── triggers/          # Real-time parametric trigger monitoring service
├── blockchain/        # Hyperledger Fabric chaincode & ledger config
├── security/          # Auth middleware, encryption utils, rate limiters
├── mock-apis/         # Simulated Zomato, Swiggy, Govt alert feeds
├── docs/              # Architecture diagrams, pitch deck
└── README.md
```

# Alternative method (optimized)

## Optimized Architecture Overview

This approach focuses on a lean, low-latency system with minimal components and clear decision logic.

### Core Idea
One trigger → One decision → One payout

Starting with:
Heavy Rain → Automatic Fixed Payout

---

## MVP Use Case

### Trigger
- Rainfall exceeds threshold in a zone  
- Sustained for a time window  

### Conditions
- Worker is active on platform  
- Worker has recent activity  

### Output
- Fixed payout released automatically  

---

## Example Rule

- Rain > 15 mm/hr  
- Sustained for 30 minutes  
- Worker active during that time  

Fixed payout credited instantly  

---

## Anti-GPS Spoofing Strategy

GPS is not treated as a trusted source on its own.

Instead, validation is based on:
Real work + Real device + Real session

### Required Checks

#### 1. Device Integrity
Reject if:
- Rooted device  
- Emulator  
- Tampered app  

#### 2. Live Session Validation
- Worker must be logged in  
- Session must be active during event  

#### 3. Work Proof
- Recent delivery / order activity  
- Platform interaction exists  

#### 4. Zone-Based Validation
- Use zone instead of exact GPS  
- Server matches trigger with zone  

#### 5. Short-Lived Tokens
- Temporary session tokens  
- Prevent replay attacks  

Conclusion: GPS spoofing alone cannot trigger payouts.

---

## Decision Flow

Worker Active  
↓  
Device Integrity OK  
↓  
Session Valid  
↓  
Rain Trigger Detected  
↓  
Work Activity Verified  
↓  
Payout Released  

Else → Reject / Hold  

---

## Minimal Architecture

### Frontend
- Worker dashboard  
- Coverage + payout status  

### Backend
- Weather trigger service  
- Eligibility engine  
- Payout processor  

### Database
- Worker profiles  
- Zone mapping  
- Session logs  
- Payout logs  

---

## MVP Scope (Simplified)

- Single trigger system (Rain)  
- Fixed payout model  
- Rule-based decision engine  
- Basic audit logging  

---

## Core Rule Engine

IF  
- Weather threshold crossed  
- Worker active  
- Device integrity valid  
- Session valid  
- Work activity exists  

THEN  
Approve payout  

ELSE  
Reject / Hold  

---

## Note on Extensibility

The broader system design remains extensible.

Components from the original approach can be integrated when required, including:
- ML-based risk scoring  
- Advanced fraud detection  
- Multi-trigger expansion  
- Blockchain-based audit systems  

These should be added only after the core system is stable.

---

## Key Principle

Do not rely on GPS as the primary signal.

Instead, validate:
A real worker performing real work on a real device within a valid session.

---

## Final Outcome

- Low latency  
- Reduced system complexity  
- Easier implementation  
- Clear decision logic  
- Improved reliability  
- Resistant to basic spoofing  

This represents the optimized architecture for initial development.

---

## Team

| Name | Role |
|---|---|
| B. Tenisha Akhila |
| Suggu Jhansi Lakshmi |
| Saavan Rajeev |
| Kalidasaan B | 
| Nachiketh Gupta |

---

## Phase 1 Demo Video

> https://amritauniv-my.sharepoint.com/:v:/g/personal/am_sc_u4aid24005_am_students_amrita_edu/IQD50pNrXGHfTZLJPDZOGeQcARvHD5QjU5pEydkXNLtyq-w?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=paDMr5

The video covers our persona research, the ShieldRun concept, the weekly premium model, our parametric trigger design, and a walkthrough of our Phase 1 prototype scope.

---

*Built for Guidewire DEVTrails 2026 — Seed. Scale. Soar.*
