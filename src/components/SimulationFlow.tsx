import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Bot, ShieldCheck, Banknote, ArrowRight, Radio, FileX, FileCheck, Zap, Thermometer, Wind, Megaphone, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { processClaim } from "@/lib/insurance-engine";
import { depositPayoutToUser } from "@/lib/payouts";
import type { PayoutMethod } from "@/lib/payouts";
import { anchorAuditHashOnHoodi } from "@/lib/blockchain";
import type { DisruptionType } from "@/lib/types";
import { toast } from "sonner";

type Step = "idle" | "detecting" | "analyzing" | "fraud" | "payout";

const DISRUPTION_OPTIONS: {
  type: DisruptionType;
  icon: React.ReactNode;
  label: string;
  emoji: string;
  threshold: string;
  color: string;
  detectMsg: string;
}[] = [
  {
    type: "Heavy Rain",
    icon: <CloudRain className="h-5 w-5" />,
    label: "Heavy Rain",
    emoji: "🌧",
    threshold: ">15mm/hr",
    color: "bg-shield-blue/10 text-shield-blue border-shield-blue/30",
    detectMsg: "Heavy Rain detected in your zone",
  },
  {
    type: "Extreme Heat",
    icon: <Thermometer className="h-5 w-5" />,
    label: "Extreme Heat",
    emoji: "🔥",
    threshold: ">42°C 3hrs",
    color: "bg-shield-red/10 text-shield-red border-shield-red/30",
    detectMsg: "Extreme Heat alert in your zone",
  },
  {
    type: "High AQI",
    icon: <Wind className="h-5 w-5" />,
    label: "High AQI",
    emoji: "💨",
    threshold: "AQI >300",
    color: "bg-shield-amber/10 text-shield-amber border-shield-amber/30",
    detectMsg: "Hazardous AQI levels detected",
  },
  {
    type: "Civic Strike",
    icon: <Megaphone className="h-5 w-5" />,
    label: "Civic Strike",
    emoji: "📢",
    threshold: "Zone lockdown",
    color: "bg-primary/10 text-primary border-primary/30",
    detectMsg: "Civic strike / bandh declared in your zone",
  },
  {
    type: "Platform Outage",
    icon: <Wifi className="h-5 w-5" />,
    label: "Platform Outage",
    emoji: "📡",
    threshold: ">2hr downtime",
    color: "bg-destructive/10 text-destructive border-destructive/30",
    detectMsg: "Platform outage detected (>2hrs)",
  },
];

function LiveTimer() {
  const [seconds, setSeconds] = useState(2);
  useEffect(() => {
    const iv = setInterval(() => setSeconds((s) => (s >= 59 ? 1 : s + 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  return <span>{seconds} sec ago</span>;
}

function getPayoutDestination(input: {
  payoutMethod: PayoutMethod;
  upiId: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankAccountName: string;
  walletProvider: string;
  walletNumber: string;
}): string {
  if (input.payoutMethod === "UPI") return input.upiId.trim();
  if (input.payoutMethod === "Bank Transfer") {
    const masked = input.bankAccountNumber.slice(-4).padStart(input.bankAccountNumber.length, "x");
    return `${input.bankAccountName.trim()} · ${masked} · ${input.bankIfsc.trim()}`;
  }
  return `${input.walletProvider.trim()} · ${input.walletNumber.trim()}`;
}

function validatePayoutDetails(input: {
  payoutMethod: PayoutMethod;
  upiId: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankAccountName: string;
  walletProvider: string;
  walletNumber: string;
}): string | null {
  if (input.payoutMethod === "UPI") {
    if (!/^[\w.-]+@[\w.-]+$/.test(input.upiId.trim())) {
      return "Enter a valid UPI ID before simulating payout.";
    }
    return null;
  }

  if (input.payoutMethod === "Bank Transfer") {
    if (input.bankAccountName.trim().length < 3) return "Enter account holder name.";
    if (!/^\d{9,18}$/.test(input.bankAccountNumber.trim())) return "Enter a valid bank account number.";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(input.bankIfsc.trim())) return "Enter a valid IFSC code.";
    return null;
  }

  if (input.walletProvider.trim().length < 2) return "Enter wallet provider name.";
  if (!/^\d{10}$/.test(input.walletNumber.trim())) return "Enter a valid 10-digit wallet number.";
  return null;
}

export default function SimulationFlow() {
  const { user, policy, addClaim, markClaimPaid, setPayoutAnimating } = useAppStore();
  const [step, setStep] = useState<Step>("idle");
  const [activeDisruption, setActiveDisruption] = useState<typeof DISRUPTION_OPTIONS[0] | null>(null);
  const [claimResult, setClaimResult] = useState<{
    expected: number;
    actual: number;
    loss: number;
    payout: number;
    status: string;
    payoutMethod?: PayoutMethod;
    referenceId?: string;
    payoutDestination?: string;
    chainTxHash?: string;
    payloadHash?: string;
  } | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("UPI");
  const [upiId, setUpiId] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [walletProvider, setWalletProvider] = useState("");
  const [walletNumber, setWalletNumber] = useState("");
  const explorerTxBaseUrl = import.meta.env.VITE_HOODI_EXPLORER_TX_BASE_URL;

  if (!user || !policy) return null;

  const isTriggered = step !== "idle";
  const payoutDestination = getPayoutDestination({
    payoutMethod,
    upiId,
    bankAccountNumber,
    bankIfsc,
    bankAccountName,
    walletProvider,
    walletNumber,
  });

  const runSimulation = async (disruption: typeof DISRUPTION_OPTIONS[0]) => {
    const validationError = validatePayoutDetails({
      payoutMethod,
      upiId,
      bankAccountNumber,
      bankIfsc,
      bankAccountName,
      walletProvider,
      walletNumber,
    });
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setActiveDisruption(disruption);
    
    toast.info(`${disruption.emoji} ${disruption.type} detected!`, {
      description: `Parametric trigger fired — processing your claim automatically...`,
    });

    setStep("detecting");
    await new Promise((r) => setTimeout(r, 1200));
    setStep("analyzing");
    await new Promise((r) => setTimeout(r, 1200));
    setStep("fraud");
    await new Promise((r) => setTimeout(r, 1000));

    const claim = processClaim(user, policy, disruption.type);
    addClaim(claim);

    setClaimResult({
      expected: claim.expectedEarnings,
      actual: claim.actualEarnings,
      loss: Math.max(0, claim.expectedEarnings - claim.actualEarnings),
      payout: claim.finalPayout,
      status: claim.status,
    });
    setStep("payout");

    if (claim.finalPayout > 0 && (claim.status === "approved" || claim.status === "partial")) {
      try {
        const payoutResult = await depositPayoutToUser({
          user,
          amount: claim.finalPayout,
          claimId: claim.id,
          method: payoutMethod,
          destination: payoutDestination,
        });
        setClaimResult((prev) =>
          prev
            ? {
                ...prev,
                payoutMethod: payoutResult.method,
                referenceId: payoutResult.referenceId,
                payoutDestination: payoutResult.destination,
              }
            : prev
        );
        toast.success(`₹${claim.finalPayout} deposited via ${payoutResult.method}`, {
          description: `${payoutResult.destination} · Ref: ${payoutResult.referenceId}`,
        });
        setTimeout(() => {
          markClaimPaid(claim.id);
          setPayoutAnimating(true, claim.finalPayout, payoutResult.destination);
          setTimeout(() => setPayoutAnimating(false), 3000);
        }, 400);

        try {
          const chainResult = await anchorAuditHashOnHoodi({
            eventType: "PAYOUT_PROCESSED",
            referenceId: claim.id,
            payload: {
              amount: claim.finalPayout,
              method: payoutResult.method,
              destination: payoutResult.destination,
              disruptionType: claim.disruptionType,
              status: claim.status,
            },
          });
          setClaimResult((prev) =>
            prev
              ? { ...prev, chainTxHash: chainResult.txHash, payloadHash: chainResult.payloadHash }
              : prev
          );
          toast.success("Audit hash anchored on Ethereum Hoodi", {
            description: `Tx: ${chainResult.txHash.slice(0, 10)}...`,
          });
        } catch (chainError) {
          const chainMessage =
            chainError instanceof Error ? chainError.message : "Blockchain anchor skipped.";
          toast.info(chainMessage);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Payout transfer failed.";
        toast.error(message, {
          description: "Claim was approved but transfer is pending.",
        });
      }
    } else if (claim.status === "rejected") {
      toast.error("Claim rejected", {
        description: "Fraud detection flagged this claim.",
      });
    }
  };

  const reset = () => {
    setStep("idle");
    setClaimResult(null);
    setActiveDisruption(null);
  };

  const stepOrder: Exclude<Step, "idle">[] = ["detecting", "analyzing", "fraud", "payout"];
  const currentIdx = step === "idle" ? -1 : stepOrder.indexOf(step as Exclude<Step, "idle">);

  const STEPS_CONFIG: Record<Exclude<Step, "idle">, { icon: React.ReactNode; text: string }> = {
    detecting: {
      icon: activeDisruption?.icon || <CloudRain className="h-5 w-5" />,
      text: `${activeDisruption?.emoji || "🌧"} ${activeDisruption?.detectMsg || "Disruption detected"}`,
    },
    analyzing: { icon: <Bot className="h-5 w-5" />, text: "🤖 AI analyzing risk & earnings impact..." },
    fraud: { icon: <ShieldCheck className="h-5 w-5" />, text: "✅ Fraud check passed — Dual-key verified" },
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
              ? `🔴 Disruption detected: ${activeDisruption?.label || "Unknown"}`
              : `🟡 Monitoring your zone (${user.city})`}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">
          Last checked: <LiveTimer />
        </span>
      </motion.div>

      {/* Simulate Disruption */}
      <h3 className="font-display font-bold text-base flex items-center gap-2">
        <Radio className="h-5 w-5 text-primary" />
        Simulate Disruption
      </h3>

      {step === "idle" ? (
        <div className="space-y-2">
          <div className="mb-3 rounded-lg border bg-card p-2">
            <p className="text-xs text-muted-foreground mb-2">Payout method for user deposit</p>
            <div className="grid grid-cols-3 gap-2">
              {(["UPI", "Bank Transfer", "Wallet"] as PayoutMethod[]).map((method) => (
                <Button
                  key={method}
                  variant={payoutMethod === method ? "default" : "outline"}
                  onClick={() => setPayoutMethod(method)}
                  className="h-8 text-xs"
                >
                  {method}
                </Button>
              ))}
            </div>
            <div className="mt-2">
              {payoutMethod === "UPI" && (
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="UPI ID (e.g. arjun@oksbi)"
                  className="h-8 text-xs"
                />
              )}
              {payoutMethod === "Bank Transfer" && (
                <div className="grid grid-cols-1 gap-2">
                  <Input
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="Account holder name"
                    className="h-8 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="Account number"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                      placeholder="IFSC code"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}
              {payoutMethod === "Wallet" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={walletProvider}
                    onChange={(e) => setWalletProvider(e.target.value)}
                    placeholder="Wallet (Paytm)"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Wallet number"
                    className="h-8 text-xs"
                  />
                </div>
              )}
            </div>
          </div>
          {/* Primary buttons grid */}
          <div className="grid grid-cols-2 gap-2">
            {DISRUPTION_OPTIONS.map((d) => (
              <motion.div
                key={d.type}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  onClick={() => runSimulation(d)}
                  variant="outline"
                  className={`w-full h-auto py-3 px-3 flex flex-col items-center gap-1.5 rounded-xl border-2 hover:scale-[1.02] transition-transform ${d.color}`}
                >
                  <span className="text-lg">{d.emoji}</span>
                  <span className="font-semibold text-xs">{d.label}</span>
                  <span className="text-[10px] opacity-70">{d.threshold}</span>
                </Button>
              </motion.div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-1">
            Tap any disruption to simulate a parametric trigger
          </p>
        </div>
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
                className={`mt-2 rounded-2xl p-6 shadow-elevated ${
                  claimResult.status === "rejected"
                    ? "bg-destructive/10 border border-destructive/30 text-foreground"
                    : "gradient-success text-accent-foreground"
                }`}
              >
                {claimResult.status === "rejected" ? (
                  <div className="text-center py-4">
                    <p className="text-3xl mb-2">🚫</p>
                    <p className="font-display text-xl font-bold">Claim Rejected</p>
                    <p className="text-sm opacity-70 mt-2">Fraud detection flagged this claim. No payout issued.</p>
                  </div>
                ) : (
                  <>
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
                        Amount Debited Successfully
                      </motion.p>
                      {claimResult.status === "partial" && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.55 }}
                          className="text-xs opacity-70 mt-1"
                        >
                          (Partial payout — 60% released, 40% pending verification)
                        </motion.p>
                      )}
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
                      <p className="opacity-85">{activeDisruption?.type} exceeded threshold ({activeDisruption?.threshold})</p>
                      <p className="opacity-85">Your earnings dropped significantly</p>
                      <p className="opacity-85">→ Compensation triggered automatically</p>
                      {claimResult.referenceId && (
                        <p className="opacity-85">
                          → Debited to {claimResult.payoutDestination}
                        </p>
                      )}
                      {claimResult.referenceId && (
                        <p className="opacity-85">
                          → {claimResult.payoutMethod} transfer ref: {claimResult.referenceId}
                        </p>
                      )}
                      {claimResult.chainTxHash && (
                        <p className="opacity-85">
                          → Hoodi tx: {claimResult.chainTxHash.slice(0, 14)}...
                        </p>
                      )}
                      {claimResult.chainTxHash && explorerTxBaseUrl && (
                        <p className="opacity-85">
                          →{" "}
                          <a
                            href={`${explorerTxBaseUrl}${claimResult.chainTxHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline font-semibold"
                          >
                            View Transaction
                          </a>
                        </p>
                      )}
                      {claimResult.payloadHash && (
                        <p className="opacity-85">
                          → Payload hash: {claimResult.payloadHash.slice(0, 14)}...
                        </p>
                      )}
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
                  </>
                )}

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
