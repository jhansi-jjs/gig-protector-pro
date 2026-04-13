import type { UserProfile } from "./types";

export type PayoutMethod = "UPI" | "Bank Transfer" | "Wallet";

export interface PayoutResult {
  referenceId: string;
  method: PayoutMethod;
  destination: string;
}

export async function depositPayoutToUser(params: {
  user: UserProfile;
  amount: number;
  claimId: string;
  method: PayoutMethod;
  destination: string;
}): Promise<PayoutResult> {
  const payoutApiUrl = import.meta.env.VITE_PAYOUT_API_URL;

  if (payoutApiUrl) {
    const response = await fetch(payoutApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Payout transfer failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      referenceId: data.referenceId ?? `PAYOUT-${Date.now()}`,
      method: data.method ?? params.method,
      destination: data.destination ?? params.destination,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 700));
  return {
    referenceId: `PAYOUT-${Date.now().toString(36).toUpperCase()}`,
    method: params.method,
    destination: params.destination,
  };
}
