import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Bot, ShieldCheck, Banknote, ArrowRight, Radio, FileX, FileCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { processClaim } from "@/lib/insurance-engine";

type Step = "idle" | "detecting" | "analyzing" | "fraud" | "payout";

function LiveTimer() {
  const [seconds, setSeconds] = useState(2);
  useEffect(() => {
    const iv = setInterval(() => setSeconds((s) => (s >= 10 ? 2 : s + 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  return <span>{seconds} sec ago</span>;
}

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

  const isTriggered = step !== "idle";

  const runSimulation = async () => {
    setStep("detecting");
    await new Promise((r) => setTimeout(r, 1200));
    setStep("analyzing");
    await new Promise((r) => setTimeout(r, 1200));
    setStep("fraud");
    await new Promise((r) => setTimeout(r, 1000));

    const claim = processClaim(user, policy, "Heavy Rain");
    addClaim(claim);

    setClaimResult({
      expected: claim.expectedEarnings,
      actual: claim.actualEarnings,
      loss: Math.max(0, claim.expectedEarnings - claim.actualEarnings),
      payout: claim.finalPayout,
    });
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

  const stepOrder: Exclude<Step, "idle">[] = ["detecting", "analyzing", "fraud", "payout"];
  const currentIdx = step === "idle" ? -1 : stepOrder.indexOf(step as Exclude<Step, "idle">);

  const STEPS_CONFIG: Record<Exclude<Step, "idle">, { icon: React.ReactNode; text: string }> = {
    detecting: { icon: <CloudRain className="h-5 w-5" />, text: "🌧 Heavy Rain detected in your zone" },
    analyzing: { icon: <Bot className="h-5 w-5" />, text: "🤖 AI analyzing risk..." },
    fraud: { icon: <ShieldCheck className="h-5 w-5" />, text: "✅ Fraud check passed" },
    payout: { icon: <Banknote className="h-5 w-5" />, text: "💸 Payout processed!" },
  };

  return (
    <div className="px-4 mb-6 space-y-4">
      {/* Status Banner */}
      <motion.div
        layout
        className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
          isTriggered
            ? "bg-destructive/10 border-destructive/30"
            : "bg-shield-amber/10 border-shield-amber/30"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isTriggered ? "bg-destructive" : "bg-shield-amber"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isTriggered ? "bg-destructive" : "bg-shield-amber"
              }`}
            />
          </span>
          <span className="text-sm font-semibold text-foreground">
            {isTriggered
              ? "🔴 Disruption detected: Heavy Rain"
              : `🟡 Monitoring your zone (${user.city})`}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
          Last checked: <LiveTimer />
        </span>
      </motion.div>

      {/* Simulate Disruption */}
      <h3 className="font-display font-bold text-base flex items-center gap-2">
        <Radio className="h-5 w-5 text-primary" />
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
        <div className="space-y-2.5">
          {/* Step-by-step progress */}
          {stepOrder.map((s, i) => {
            if (i > currentIdx) return null;
            const cfg = STEPS_CONFIG[s];
            const isActive = i === currentIdx && step !== "payout";
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isActive
                    ? "border-primary/40 bg-primary/5 animate-pulse"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    i <= currentIdx && step === "payout"
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
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 16, delay: 0.15 }}
                className="mt-2 rounded-2xl gradient-success p-6 text-accent-foreground shadow-elevated"
              >
                {/* Large payout */}
                <div className="text-center mb-5">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm font-medium opacity-80"
                  >
                    💸
                  </motion.p>
                  <motion.p
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.35, type: "spring", damping: 10 }}
                    className="font-display text-6xl font-extrabold tracking-tight my-1"
                  >
                    ₹{claimResult.payout}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-base font-semibold opacity-90"
                  >
                    Credited Instantly
                  </motion.p>
                </div>

                {/* Earnings breakdown */}
                <div className="space-y-2 text-sm bg-accent-foreground/5 rounded-xl p-4">
                  <div className="flex justify-between opacity-90">
                    <span>Expected Earnings</span>
                    <span className="font-semibold">₹{claimResult.expected}</span>
                  </div>
                  <div className="flex justify-between opacity-90">
                    <span>Actual Earnings</span>
                    <span className="font-semibold">₹{claimResult.actual}</span>
                  </div>
                  <div className="flex justify-between border-t border-accent-foreground/15 pt-2 font-bold text-base">
                    <span>Loss Covered</span>
                    <span>₹{claimResult.loss}</span>
                  </div>
                </div>

                {/* AI Explanation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 bg-accent-foreground/5 rounded-xl p-4 text-sm leading-relaxed space-y-1"
                >
                  <p className="font-semibold flex items-center gap-1.5 mb-2">
                    <Bot className="h-4 w-4" /> AI Explanation
                  </p>
                  <p className="opacity-85">Rainfall exceeded threshold (15mm/hr)</p>
                  <p className="opacity-85">Your earnings dropped significantly</p>
                  <p className="opacity-85">→ Compensation triggered automatically</p>
                </motion.div>

                {/* Trust signals */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.75 }}
                  className="mt-4 flex gap-2 flex-wrap"
                >
                  {[
                    { icon: <FileX className="h-3.5 w-3.5" />, text: "No claim filed" },
                    { icon: <FileCheck className="h-3.5 w-3.5" />, text: "No documents needed" },
                    { icon: <Zap className="h-3.5 w-3.5" />, text: "Fully automated" },
                  ].map((t) => (
                    <span
                      key={t.text}
                      className="flex items-center gap-1.5 bg-accent-foreground/10 text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      {t.icon} {t.text}
                    </span>
                  ))}
                </motion.div>

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
