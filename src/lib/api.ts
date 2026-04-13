import type { City, PlanTier, UserProfile } from "./types";

const CITY_COORDS: Record<City, { latitude: number; longitude: number }> = {
  Mumbai: { latitude: 19.076, longitude: 72.8777 },
  Delhi: { latitude: 28.6139, longitude: 77.209 },
  Bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  Chennai: { latitude: 13.0827, longitude: 80.2707 },
  Hyderabad: { latitude: 17.385, longitude: 78.4867 },
  Kolkata: { latitude: 22.5726, longitude: 88.3639 },
  Pune: { latitude: 18.5204, longitude: 73.8567 },
};

const DEFAULT_PLAN_CATALOG: Record<PlanTier, { basePremium: number; maxPayout: number }> = {
  "Basic Shield": { basePremium: 29, maxPayout: 500 },
  "Pro Shield": { basePremium: 59, maxPayout: 800 },
  "Max Shield": { basePremium: 99, maxPayout: 1200 },
};

export interface DynamicPricingContext {
  zoneMultiplier: number;
  seasonFactor: number;
  weatherRisk: number;
}

export interface WeeklyEarningsPoint {
  day: string;
  earned: number;
  protected: number;
}

export async function fetchPlanCatalog(): Promise<Record<PlanTier, { basePremium: number; maxPayout: number }>> {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL;
  if (backendBaseUrl) {
    try {
      const response = await fetch(`${backendBaseUrl}/pricing/plans`);
      if (!response.ok) throw new Error(`Failed backend plans: ${response.status}`);
      const data = await response.json();
      return data as Record<PlanTier, { basePremium: number; maxPayout: number }>;
    } catch {
      // Fall back to client-side/default sources when backend is unavailable.
    }
  }

  const apiUrl = import.meta.env.VITE_PRICING_API_URL;
  if (!apiUrl) return DEFAULT_PLAN_CATALOG;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Failed to fetch plan catalog: ${response.status}`);
    const data = await response.json();
    return data as Record<PlanTier, { basePremium: number; maxPayout: number }>;
  } catch {
    return DEFAULT_PLAN_CATALOG;
  }
}

export async function fetchDynamicPricingContext(city: City): Promise<DynamicPricingContext> {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL;
  if (backendBaseUrl) {
    try {
      const response = await fetch(`${backendBaseUrl}/pricing/context?city=${encodeURIComponent(city)}`);
      if (!response.ok) throw new Error(`Failed backend context: ${response.status}`);
      const data = await response.json();
      return {
        zoneMultiplier: Number(data.zoneMultiplier ?? 1.08),
        seasonFactor: Number(data.seasonFactor ?? getSeasonFactorFromMonth(new Date().getMonth())),
        weatherRisk: Number(data.weatherRisk ?? 0.35),
      };
    } catch {
      // Fall back to open weather source below.
    }
  }

  const location = CITY_COORDS[city];
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,precipitation,weather_code`;

  try {
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error(`Failed to fetch weather data: ${response.status}`);

    const data = await response.json();
    const temperature = Number(data?.current?.temperature_2m ?? 30);
    const precipitation = Number(data?.current?.precipitation ?? 0);

    const weatherRisk = Math.min(1, Math.max(0, precipitation / 30 + Math.max(0, temperature - 35) / 15));
    const zoneMultiplier = Number((1 + weatherRisk * 0.25).toFixed(2));
    const seasonFactor = getSeasonFactorFromMonth(new Date().getMonth());

    return { zoneMultiplier, seasonFactor, weatherRisk };
  } catch {
    return {
      zoneMultiplier: 1.08,
      seasonFactor: getSeasonFactorFromMonth(new Date().getMonth()),
      weatherRisk: 0.35,
    };
  }
}

export async function fetchRiskScoreFromApi(user: UserProfile): Promise<number> {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL;
  if (backendBaseUrl) {
    try {
      const response = await fetch(`${backendBaseUrl}/risk/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: user.city,
          workingHoursPerDay: user.workingHoursPerDay,
          loyaltyDiscount: user.loyaltyDiscount,
        }),
      });
      if (!response.ok) throw new Error(`Failed backend risk score: ${response.status}`);
      const data = await response.json();
      return Math.round(Math.max(0, Math.min(100, Number(data.riskScore ?? 0))));
    } catch {
      // Fall back to local derived score below.
    }
  }

  const { weatherRisk, zoneMultiplier, seasonFactor } = await fetchDynamicPricingContext(user.city);
  const workExposure = Math.min(1, user.workingHoursPerDay / 12);
  const loyaltyBuffer = user.loyaltyDiscount;

  const score =
    40 +
    weatherRisk * 25 +
    (zoneMultiplier - 1) * 80 +
    (seasonFactor - 1) * 55 +
    workExposure * 12 -
    loyaltyBuffer * 10;

  return Math.round(Math.max(0, Math.min(100, score)));
}

function getSeasonFactorFromMonth(month: number): number {
  if (month >= 5 && month <= 8) return 1.15;
  if (month >= 9 && month <= 10) return 1.08;
  if (month >= 3 && month <= 4) return 1.1;
  return 1;
}

export async function fetchWeeklyEarningsFromApi(userId: string): Promise<WeeklyEarningsPoint[] | null> {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL;
  if (!backendBaseUrl) return null;

  try {
    const response = await fetch(`${backendBaseUrl}/analytics/weekly-earnings?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) throw new Error(`Failed backend weekly earnings: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) return null;
    return data as WeeklyEarningsPoint[];
  } catch {
    return null;
  }
}
