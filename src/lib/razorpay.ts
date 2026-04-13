import type { PlanTier } from "./types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export async function startRazorpayCheckout(tier: PlanTier, amountInRupees: number): Promise<void> {
  if (!window.Razorpay) {
    throw new Error("Razorpay SDK failed to load.");
  }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("Missing VITE_RAZORPAY_KEY_ID in .env.local");
  }

  const razorpay = new window.Razorpay({
    key: keyId,
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    name: "ShieldRun",
    description: `${tier} Weekly Plan`,
    notes: { plan: tier },
    theme: { color: "#0f766e" },
  });

  razorpay.open();
}
