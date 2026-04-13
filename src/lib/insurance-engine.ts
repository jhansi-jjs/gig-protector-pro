import type { UserProfile, Policy, PlanTier, Claim, DisruptionType, ClaimStatus } from "./types";
import { fetchDynamicPricingContext, fetchPlanCatalog, fetchRiskScoreFromApi } from "./api";

export async function calculatePremium(user: UserProfile, tier: PlanTier): Promise<Policy> {
  const planConfig = await fetchPlanCatalog();
  const config = planConfig[tier];
  const { zoneMultiplier, seasonFactor } = await fetchDynamicPricingContext(user.city);
  const loyaltyDiscount = user.loyaltyDiscount;

  const weeklyPremium = Math.round(
    config.basePremium * zoneMultiplier * seasonFactor * (1 - loyaltyDiscount)
  );

  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 7);

  return {
    tier,
    weeklyPremium,
    maxPayoutPerDay: config.maxPayout,
    basePremium: config.basePremium,
    zoneMultiplier,
    seasonFactor,
    loyaltyDiscount,
    coverageStart: now,
    coverageEnd: end,
    isActive: true,
  };
}

export async function calculateRiskScore(user: UserProfile): Promise<number> {
  return fetchRiskScoreFromApi(user);
}

// Disruption impact on earnings
const DISRUPTION_IMPACT: Record<DisruptionType, { earningsDropPct: number; avgSeverity: number }> = {
  "Heavy Rain": { earningsDropPct: 0.8, avgSeverity: 0.75 },
  "Extreme Heat": { earningsDropPct: 0.6, avgSeverity: 0.6 },
  "High AQI": { earningsDropPct: 0.5, avgSeverity: 0.55 },
  "Civic Strike": { earningsDropPct: 0.9, avgSeverity: 0.85 },
  "Platform Outage": { earningsDropPct: 1.0, avgSeverity: 0.95 },
};

export function processClaim(
  user: UserProfile,
  policy: Policy,
  disruptionType: DisruptionType
): Claim {
  const impact = DISRUPTION_IMPACT[disruptionType];
  const severity = impact.avgSeverity + (Math.random() - 0.5) * 0.2;

  const expectedEarnings = user.avgDailyEarnings;
  const actualEarnings = Math.round(expectedEarnings * (1 - impact.earningsDropPct * severity));
  const effortScore = user.isActive ? 0.7 + Math.random() * 0.3 : 0.1 + Math.random() * 0.2;

  // Fraud detection
  const { fraudScore, fraudFlags } = detectFraud(user, disruptionType);
  const confidenceScore = Math.max(0, Math.min(1, (1 - fraudScore) * severity));

  // Payout = max(0, E - A) × S × C
  const rawPayout = Math.max(0, expectedEarnings - actualEarnings) * effortScore * confidenceScore;
  const cappedPayout = Math.min(rawPayout, policy.maxPayoutPerDay);
  const calculatedPayout = Math.round(cappedPayout);

  // Decision layer
  let finalPayout: number;
  let status: ClaimStatus;

  if (fraudScore > 0.7) {
    finalPayout = 0;
    status = "rejected";
  } else if (confidenceScore >= 0.85) {
    finalPayout = calculatedPayout;
    status = "approved";
  } else if (confidenceScore >= 0.5) {
    finalPayout = Math.round(calculatedPayout * 0.6);
    status = "partial";
  } else {
    finalPayout = 0;
    status = "rejected";
  }

  return {
    id: `CLM-${Date.now().toString(36).toUpperCase()}`,
    disruptionType,
    triggeredAt: new Date(),
    expectedEarnings,
    actualEarnings,
    effortScore: Math.round(effortScore * 100) / 100,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    fraudScore: Math.round(fraudScore * 100) / 100,
    calculatedPayout,
    finalPayout,
    status,
    fraudFlags,
  };
}

function detectFraud(user: UserProfile, _type: DisruptionType): { fraudScore: number; fraudFlags: string[] } {
  const flags: string[] = [];
  let score = 0;

  // Check if user is inactive
  if (!user.isActive) {
    score += 0.5;
    flags.push("User marked as inactive");
  }

  // Check rapid claims (more than 3 claims in history)
  const recentClaims = user.claimHistory.filter(c => {
    const diff = Date.now() - c.triggeredAt.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000; // last 7 days
  });
  if (recentClaims.length >= 3) {
    score += 0.3;
    flags.push("Multiple claims in past week");
  }

  // Check for duplicate disruption type in last 24h
  const last24h = user.claimHistory.filter(c => {
    const diff = Date.now() - c.triggeredAt.getTime();
    return diff < 24 * 60 * 60 * 1000 && c.disruptionType === _type;
  });
  if (last24h.length > 0) {
    score += 0.25;
    flags.push("Duplicate disruption claim in 24h");
  }

  // Random small noise
  score += Math.random() * 0.05;

  if (flags.length === 0) flags.push("No anomalies detected");

  return { fraudScore: Math.min(1, score), fraudFlags: flags };
}

export async function getAllPlanOptions(user: UserProfile): Promise<Policy[]> {
  return Promise.all((["Basic Shield", "Pro Shield", "Max Shield"] as PlanTier[]).map((tier) => calculatePremium(user, tier)));
}
