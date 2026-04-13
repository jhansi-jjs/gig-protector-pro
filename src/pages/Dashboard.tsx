import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, AlertTriangle, XCircle, Clock, BarChart3, LogOut } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Claim } from "@/lib/types";
import { Button } from "@/components/ui/button";
import PayoutAnimation from "@/components/PayoutAnimation";
import SimulationFlow from "@/components/SimulationFlow";
import EarningsChart from "@/components/EarningsChart";
import RiskForecast from "@/components/RiskForecast";
import CoverageInfo from "@/components/CoverageInfo";
import PayoutTimeline from "@/components/PayoutTimeline";
import { getAllPlanOptions } from "@/lib/insurance-engine";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  approved: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Approved", className: "text-shield-green" },
  partial: { icon: <AlertTriangle className="h-4 w-4" />, label: "Partial", className: "text-shield-amber" },
  rejected: { icon: <XCircle className="h-4 w-4" />, label: "Rejected", className: "text-shield-red" },
  processing: { icon: <Clock className="h-4 w-4" />, label: "Processing", className: "text-muted-foreground" },
  paid: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Paid", className: "text-shield-green" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, policy, claims, payoutAnimating, lastPayout, lastPayoutDestination, reset, setPolicy } = useAppStore();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const totalPaid = claims.filter((c) => c.status === "paid" || c.status === "approved").reduce((s, c) => s + c.finalPayout, 0);
  const renewalDate = policy
    ? new Date(policy.coverageEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "--";

  const assignRandomPlanForTesting = async () => {
    try {
      const plans = await getAllPlanOptions(user);
      const randomPlan = plans[Math.floor(Math.random() * plans.length)];
      setPolicy(randomPlan);
      toast.success(`Test plan selected: ${randomPlan.tier}`);
    } catch {
      toast.error("Unable to assign random test plan right now.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AnimatePresence>
        {payoutAnimating && <PayoutAnimation amount={lastPayout} destination={lastPayoutDestination} />}
      </AnimatePresence>

      {/* Header */}
      <div className="gradient-hero px-5 pt-6 pb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-foreground" />
            <span className="font-display font-bold text-primary-foreground">ShieldRun</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/admin")} className="text-primary-foreground/70 hover:text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </button>
            <button onClick={() => { reset(); navigate("/"); }} className="text-primary-foreground/70 hover:text-primary-foreground">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="text-primary-foreground/80 text-sm">Welcome back, {user.name.split(" ")[0]}!</p>
        <p className="text-primary-foreground text-xs mt-1 opacity-70">{user.platform} · {user.city} · Risk Score: {user.riskScore}</p>
        <p className="text-primary-foreground font-display font-bold text-sm mt-3 tracking-wide">
          No claims. No forms. Instant protection.
        </p>
      </div>

      {/* Policy Card */}
      <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-4 -mt-6 bg-card rounded-lg shadow-elevated p-5 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground">Active Plan</p>
            <h3 className="font-display font-bold text-lg">{policy?.tier ?? "No active plan"}</h3>
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${policy ? "bg-shield-green/10 text-shield-green" : "bg-shield-amber/10 text-shield-amber"}`}>
            <div className="w-1.5 h-1.5 bg-shield-green rounded-full animate-pulse-glow" />
            {policy ? "Active" : "Pending"}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Premium</p>
            <p className="font-display font-bold text-sm text-foreground">{policy ? <>₹{policy.weeklyPremium}<span className="text-[10px] font-normal text-muted-foreground">/wk</span></> : "--"}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Max Payout</p>
            <p className="font-display font-bold text-sm text-foreground">{policy ? <>₹{policy.maxPayoutPerDay}<span className="text-[10px] font-normal text-muted-foreground">/day</span></> : "--"}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Protected</p>
            <p className="font-display font-bold text-sm text-shield-green">₹{totalPaid}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Renews</p>
            <p className="font-display font-bold text-sm text-foreground">{renewalDate}</p>
          </div>
        </div>
        {!policy && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs text-muted-foreground mb-2">
              You skipped plan selection. Choose a plan to activate coverage and payouts.
            </p>
            <button
              onClick={() => navigate("/choose-plan")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Choose Plan Now
            </button>
            <Button
              variant="outline"
              className="w-full mt-3 h-8 text-xs"
              onClick={() => void assignRandomPlanForTesting()}
            >
              Quick Test: Assign Random Plan
            </Button>
          </div>
        )}
      </motion.div>

      {/* Simulation Flow — All 5 disruption types */}
      {policy && <SimulationFlow />}

      {/* Earnings Chart */}
      <EarningsChart />

      {/* Payout Timeline */}
      <PayoutTimeline />

      {/* 7-Day Risk Forecast */}
      <RiskForecast />

      {/* Coverage & Exclusions */}
      <CoverageInfo />

      {/* Claims History */}
      <div className="px-4">
        <h3 className="font-display font-semibold text-sm mb-3">Claims History</h3>
        {claims.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No claims yet. Trigger a disruption above.</p>
        ) : (
          <div className="space-y-3">
            {claims.map((claim, i) => (
              <ClaimCard key={claim.id} claim={claim} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClaimCard({ claim, index }: { claim: Claim; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[claim.status];

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-lg shadow-card p-4 border"
    >
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div>
          <p className="font-semibold text-sm">{claim.disruptionType}</p>
          <p className="text-xs text-muted-foreground">{claim.id} · {new Date(claim.triggeredAt).toLocaleTimeString()}</p>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 text-xs font-medium ${statusCfg.className}`}>
            {statusCfg.icon} {statusCfg.label}
          </div>
          {claim.finalPayout > 0 && (
            <p className="font-display font-bold text-shield-green text-sm">₹{claim.finalPayout}</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 pt-3 border-t space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Expected Earnings</span><span>₹{claim.expectedEarnings}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Actual Earnings</span><span>₹{claim.actualEarnings}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Income Loss</span><span className="text-shield-red">₹{Math.max(0, claim.expectedEarnings - claim.actualEarnings)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Effort Score</span><span>{claim.effortScore}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Confidence</span><span>{claim.confidenceScore}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fraud Score</span><span className={claim.fraudScore > 0.5 ? "text-shield-red" : "text-shield-green"}>{claim.fraudScore}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Calculated Payout</span><span>₹{claim.calculatedPayout}</span></div>
              <div className="flex justify-between font-semibold"><span>Final Payout</span><span className="text-shield-green">₹{claim.finalPayout}</span></div>
              <div className="mt-2">
                <p className="text-muted-foreground mb-1">Fraud Checks:</p>
                {claim.fraudFlags.map((f, i) => (
                  <p key={i} className={`text-xs ${f.includes("No anomalies") ? "text-shield-green" : "text-shield-red"}`}>
                    {f.includes("No anomalies") ? "✓" : "⚠"} {f}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
