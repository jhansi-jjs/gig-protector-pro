import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Bot, ShieldCheck, Banknote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { processClaim } from "@/lib/insurance-engine";

type Step = "idle" | "detecting" | "analyzing" | "fraud" | "payout";

export default function SimulationFlow() {
  const { user, policy, addClaim, markClaimPaid, setPayoutAnimating } = useAppStore();
  const [step, setStep] = useState<Step>("idle");
  const [claimResult, setClaimResult] = useState<{
    expected: number;
    actual: number;
    loss: number;
    payout: number;
  } | null>(null);

  if (!user || !policy) return null;

  const runSimulation = async () => {
    setStep("detecting");
    await new Promise((r) => setTimeout(r, 1200));

    setStep("analyzing");
    await new Promise((r) => setTimeout(r, 1200));

    setStep("fraud");
    await new Promise((r) => setTimeout(r, 1000));

    const claim = processClaim(user, policy, "Heavy Rain");
    addClaim(claim);

    const result = {
      expected: claim.expectedEarnings,
      actual: claim.actualEarnings,
      loss: Math.max(0, claim.expectedEarnings - claim.actualEarnings),
      payout: claim.finalPayout,
    };
    setClaimResult(result);
    setStep("payout");

    if (claim.finalPayout > 0 && (claim.status === "approved" || claim.status === "partial")) {
      setTimeout(() => {
        markClaimPaid(claim.id);
        setPayoutAnimating(true, claim.finalPayout);
        setTimeout(() => setPayoutAnimating(false), 3000);
      }, 600);
    }
  };

  const reset = () => {
    setStep("idle");
    setClaimResult(null);
  };

  const STEPS_CONFIG: Record<Exclude<Step, "idle">, { icon: React.ReactNode; text: string }> = {
    detecting: { icon: <CloudRain className="h-6 w-6" />, text: "🌧 Heavy Rain detected in your zone" },
    analyzing: { icon: <Bot className="h-6 w-6" />, text: "🤖 AI analyzing risk..." },
    fraud: { icon: <ShieldCheck className="h-6 w-6" />, text: "✅ Fraud check passed" },
    payout: { icon: <Banknote className="h-6 w-6" />, text: "💸 Payout processed!" },
  };

  const stepOrder: Exclude<Step, "idle">[] = ["detecting", "analyzing", "fraud", "payout"];
  const currentIdx = step === "idle" ? -1 : stepOrder.indexOf(step as Exclude<Step, "idle">);

  return (
    <div className="px-4 mb-6">
      <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
        <CloudRain className="h-5 w-5 text-primary" />
        Simulate Disruption
      </h3>

      {step === "idle" ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            onClick={runSimulation}
            className="w-full h-16 text-lg font-bold rounded-xl gradient-hero text-primary-foreground shadow-elevated hover:opacity-90 transition-opacity"
          >
            <CloudRain className="h-6 w-6 mr-2" />
            🌧 Heavy Rain (Simulate)
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {/* Step-by-step progress */}
          {stepOrder.map((s, i) => {
            if (i > currentIdx) return null;
            const cfg = STEPS_CONFIG[s];
            const isActive = i === currentIdx && step !== "payout";
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isActive
                    ? "border-primary/40 bg-primary/5 animate-pulse"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    s === "payout"
                      ? "bg-accent/20 text-accent"
                      : i < currentIdx
                      ? "bg-accent/20 text-accent"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {cfg.icon}
                </div>
                <span className="font-medium text-sm text-foreground">{cfg.text}</span>
              </motion.div>
            );
          })}

          {/* Payout card */}
          <AnimatePresence>
            {step === "payout" && claimResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 14, delay: 0.2 }}
                className="mt-4 rounded-2xl gradient-success p-6 text-accent-foreground shadow-elevated"
              >
                <p className="text-sm font-medium opacity-90 mb-1">💸 Credited to your UPI</p>
                <p className="font-display text-5xl font-extrabold tracking-tight">
                  ₹{claimResult.payout}
                </p>

                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex justify-between opacity-90">
                    <span>Expected Earnings</span>
                    <span className="font-semibold">₹{claimResult.expected}</span>
                  </div>
                  <div className="flex justify-between opacity-90">
                    <span>Actual Earnings</span>
                    <span className="font-semibold">₹{claimResult.actual}</span>
                  </div>
                  <div className="flex justify-between border-t border-accent-foreground/20 pt-2 font-bold">
                    <span>Loss Covered</span>
                    <span>₹{claimResult.loss}</span>
                  </div>
                </div>

                <Button
                  onClick={reset}
                  variant="secondary"
                  className="w-full mt-5 bg-accent-foreground/10 hover:bg-accent-foreground/20 text-accent-foreground border-0"
                >
                  Simulate Again <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
