import { create } from "zustand";
import type { UserProfile, Policy, Claim } from "./types";

interface AppState {
  user: UserProfile | null;
  policy: Policy | null;
  claims: Claim[];
  payoutAnimating: boolean;
  lastPayout: number;
  lastPayoutDestination: string;
  setUser: (user: UserProfile) => void;
  setPolicy: (policy: Policy) => void;
  addClaim: (claim: Claim) => void;
  markClaimPaid: (id: string) => void;
  setPayoutAnimating: (v: boolean, amount?: number, destination?: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  policy: null,
  claims: [],
  payoutAnimating: false,
  lastPayout: 0,
  lastPayoutDestination: "",
  setUser: (user) => set({ user }),
  setPolicy: (policy) => set({ policy }),
  addClaim: (claim) =>
    set((s) => ({
      claims: [claim, ...s.claims],
      user: s.user
        ? { ...s.user, claimHistory: [claim, ...s.user.claimHistory] }
        : s.user,
    })),
  markClaimPaid: (id) =>
    set((s) => ({
      claims: s.claims.map((c) => (c.id === id ? { ...c, status: "paid" as const } : c)),
    })),
  setPayoutAnimating: (v, amount, destination) =>
    set({ payoutAnimating: v, lastPayout: amount ?? 0, lastPayoutDestination: destination ?? "" }),
  reset: () =>
    set({ user: null, policy: null, claims: [], payoutAnimating: false, lastPayout: 0, lastPayoutDestination: "" }),
}));
