export type Platform = "Zomato" | "Swiggy" | "Zepto" | "Amazon Flex" | "Dunzo";
export type City = "Mumbai" | "Delhi" | "Bengaluru" | "Chennai" | "Hyderabad" | "Kolkata" | "Pune";
export type PlanTier = "Basic Shield" | "Pro Shield" | "Max Shield";
export type DisruptionType = "Heavy Rain" | "Extreme Heat" | "High AQI" | "Civic Strike" | "Platform Outage";
export type ClaimStatus = "processing" | "approved" | "partial" | "rejected" | "paid";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  city: City;
  platform: Platform;
  workingHoursPerDay: number;
  daysPerWeek: number;
  avgDailyEarnings: number;
  registeredAt: Date;
  isActive: boolean;
  riskScore: number; // 0-100
  loyaltyDiscount: number; // 0-0.1
  claimHistory: Claim[];
}

export interface Policy {
  tier: PlanTier;
  weeklyPremium: number;
  maxPayoutPerDay: number;
  basePremium: number;
  zoneMultiplier: number;
  seasonFactor: number;
  loyaltyDiscount: number;
  coverageStart: Date;
  coverageEnd: Date;
  isActive: boolean;
}

export interface Claim {
  id: string;
  disruptionType: DisruptionType;
  triggeredAt: Date;
  expectedEarnings: number;
  actualEarnings: number;
  effortScore: number;
  confidenceScore: number;
  fraudScore: number;
  calculatedPayout: number;
  finalPayout: number;
  status: ClaimStatus;
  fraudFlags: string[];
}

export interface TriggerEvent {
  type: DisruptionType;
  severity: number; // 0-1
  description: string;
  threshold: string;
  icon: string;
}
