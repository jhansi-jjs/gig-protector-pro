# ShieldRun — Live Interactive Prototype

> **Guidewire DEVTrails 2026 — Phase 1 Demo | Team CRACKED**
> A single-file interactive prototype demonstrating the full ShieldRun user journey — from onboarding to automated payout.

---

## Live Demo

> [https://Tenisha5132.github.io/DEVtrails_Cracked/Demo/](https://Tenisha5132.github.io/DEVtrails_Cracked/Demo/)

---

## File Structure

```
DEVtrails_Cracked/
├── README.md               ← Main Phase 1 idea document
└── Demo/
    ├── index.html          ← Live interactive prototype (this file)
    └── README.md           ← This file
```

---

## What This Demo Shows

This is a **fully interactive frontend prototype** built as a single `index.html` file. It walks through the complete ShieldRun product journey across 6 screens:

| Screen | What It Demonstrates |
|---|---|
| **Landing** | Product pitch, key stats, entry points for worker and insurer |
| **Onboarding** | Partner registration form with live AI risk profile generation |
| **Policy Selection** | 3-tier plan cards with dynamic AI-calculated weekly premium formula |
| **Disruption Simulation** | Live rainfall counter — trigger a rainstorm and watch the system respond |
| **Claim & Payout** | Automated claim timeline, dual-key verification checklist, animated payout |
| **Insurer Dashboard** | Fraud ring alerts, claim tier distribution, 7-day HGRS risk forecast |

---

## ⚡ How to Run Locally

No build tools. No dependencies. No Node.js required.

```bash
# Clone the repo
git clone https://github.com/Tenisha5132/DEVtrails_Cracked.git

# Open directly in browser
open Demo/index.html

# OR serve locally
cd DEVtrails_Cracked
python -m http.server 8080
# then visit http://localhost:8080/Demo/
```

---

## GitHub Pages Setup

This demo is deployed via GitHub Pages. To enable:

1. Go to repo → **Settings** → **Pages**
2. Source → **Deploy from branch**
3. Branch: **main** → Folder: **/ (root)**
4. Click **Save**
5. Wait 2–3 minutes → live at `https://Tenisha5132.github.io/DEVtrails_Cracked/Demo/`

---

## Demo Walkthrough — Recommended Flow

Follow this path to show the full product story in your 2-minute video:

```
Landing Page
    ↓ Click "Start as Delivery Partner"
Onboarding
    → Change zone to "Dharavi, Mumbai" — watch risk score jump to 82/100
    → Change zone to "Bandra" — watch it drop to 35/100
    ↓ Click "Generate My Policy"
Policy Selection
    → Show the premium formula calculating in real time
    → Point out the 5 disruption triggers and payout percentages
    ↓ Click "Activate Policy"
Disruption Simulation
    → Show the live rainfall reading at 3.2mm/hr (normal)
    ↓ Click "Trigger Heavy Rainstorm"
    → Watch the rain animation fire
    → Watch the counter climb past 15mm/hr threshold
    → System auto-detects disruption — claim initiated automatically
Claim & Payout Screen
    → Show the dual-key verification checklist (all 5 checks passed)
    → Show the claim processing timeline animating through steps
    → Watch the payout counter animate to ₹512
    ↓ Click "View Insurer Dashboard"
Insurer Dashboard
    → Show 2 active fraud ring alerts with scores 91 and 78
    → Show tier distribution (412 auto-approved, 34 soft-flag, 7 hard-flag)
    → Show 7-day HGRS risk forecast with Wednesday/Thursday flagged HIGH
```

---

## Key Features Demonstrated

### Live Risk Profile
Changing the delivery zone on the onboarding screen updates the AI risk score instantly:

| Zone | Risk Score | Zone Factor |
|---|---|---|
| Dharavi, Mumbai | 82 / 100 — Extreme | 1.22× |
| Andheri East | 68 / 100 — High | 1.15× |
| Bandra, Mumbai | 35 / 100 — Low | 0.95× |
| Connaught Place, Delhi | 74 / 100 — High | 1.18× |
| Koramangala, Bengaluru | 42 / 100 — Moderate | 1.05× |

### Dynamic Premium Formula
```
Weekly Premium = Base Rate × Zone Multiplier × Season Factor × (1 - Loyalty Discount)
₹59 × 1.15 × 1.12 × 1.00 = ₹76.02/week
```

### Automated Disruption → Payout Pipeline
```
Rain crosses 15mm/hr threshold
        ↓
Parametric trigger fires automatically
        ↓
Dual-key OTP verification checked (5 signals)
        ↓
Fraud engine clears claim (score: 12/100)
        ↓
₹512 sent to arjun@upi via Razorpay
        ↓
Total time: < 4 seconds
```

### Fraud Detection Dashboard
- **CLUSTER-047:** 14 accounts, temporal clustering + device fingerprint match → Score 91
- **CLUSTER-048:** 6 accounts, cross-event repeat offenders + zero accelerometer → Score 78
- Tier breakdown: 94.2% auto-approved, 5.8% flagged

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vanilla HTML + CSS + JavaScript (zero dependencies) |
| Fonts | Syne (headings) + DM Sans (body) + DM Mono (data) via Google Fonts |
| Animations | Pure CSS keyframes — rain drops, pulse effects, fade transitions |
| State | Vanilla JS screen router + DOM manipulation |
| Deployment | GitHub Pages |

---

## Note on Scope

This is a **frontend-only prototype** for Phase 1 demonstration purposes. It uses:
- Simulated data (no real API calls)
- Hardcoded disruption values for the demo flow
- Mock payout animation (no real Razorpay integration yet)

Full backend, AI/ML pipeline, real API integrations, and payment processing are being built in **Phase 2 (March 21 – April 4)**.

---

*Built for Guidewire DEVTrails 2026 — Team CRACKED — Seed. Scale. Soar.*
