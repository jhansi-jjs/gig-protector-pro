import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CloudRain, Thermometer, Wind, Megaphone, Wifi, CheckCircle2, AlertTriangle, XCircle, Clock, ArrowRight, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { processClaim } from "@/lib/insurance-engine";
import type { DisruptionType, Claim } from "@/lib/types";
import PayoutAnimation from "@/components/PayoutAnimation";
import SimulationFlow from "@/components/SimulationFlow";

const TRIGGERS: { type: DisruptionType; icon: React.ReactNode; label: string; threshold: string; color: string }[] = [
  { type: "Heavy Rain", icon: <CloudRain className="h-5 w-5" />, label: "Heavy Rain", threshold: ">15mm/hr", color: "bg-shield-blue/10 text-shield-blue" },
  { type: "Extreme Heat", icon: <Thermometer className="h-5 w-5" />, label: "Extreme Heat", threshold: ">42°C 3hrs", color: "bg-shield-red/10 text-shield-red" },
  { type: "High AQI", icon: <Wind className="h-5 w-5" />, label: "High AQI", threshold: "AQI >300", color: "bg-shield-amber/10 text-shield-amber" },
  { type: "Civic Strike", icon: <Megaphone className="h-5 w-5" />, label: "Civic Strike", threshold: "Zone lockdown", color: "bg-primary/10 text-primary" },
  { type: "Platform Outage", icon: <Wifi className="h-5 w-5" />, label: "Platform Outage", threshold: ">2hr downtime", color: "bg-destructive/10 text-destructive" },
];

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  approved: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Approved", className: "text-shield-green" },
  partial: { icon: <AlertTriangle className="h-4 w-4" />, label: "Partial", className: "text-shield-amber" },
  rejected: { icon: <XCircle className="h-4 w-4" />, label: "Rejected", className: "text-shield-red" },
  processing: { icon: <Clock className="h-4 w-4" />, label: "Processing", className: "text-muted-foreground" },
  paid: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Paid", className: "text-shield-green" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, policy, claims, addClaim, markClaimPaid, setPayoutAnimating, payoutAnimating, lastPayout, reset } = useAppStore();
  const [processing, setProcessing] = useState<DisruptionType | null>(null);

  if (!user || !policy) {
    navigate("/");
    return null;
  }

  const totalPaid = claims.filter((c) => c.status === "paid" || c.status === "approved").reduce((s, c) => s + c.finalPayout, 0);

  const handleTrigger = async (type: DisruptionType) => {
    setProcessing(type);
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 1500));
    const claim = processClaim(user, policy, type);
    addClaim(claim);
    setProcessing(null);

    if (claim.finalPayout > 0 && (claim.status === "approved" || claim.status === "partial")) {
      // Simulate payout
      setTimeout(() => {
        markClaimPaid(claim.id);
        setPayoutAnimating(true, claim.finalPayout);
        setTimeout(() => setPayoutAnimating(false), 3000);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AnimatePresence>
        {payoutAnimating && <PayoutAnimation amount={lastPayout} />}
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
            <h3 className="font-display font-bold text-lg">{policy.tier}</h3>
          </div>
          <div className="flex items-center gap-1 bg-shield-green/10 text-shield-green text-xs font-semibold px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-shield-green rounded-full animate-pulse-glow" />
            Active
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Premium</p>
            <p className="font-display font-bold text-foreground">₹{policy.weeklyPremium}<span className="text-xs font-normal text-muted-foreground">/wk</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Max Payout</p>
            <p className="font-display font-bold text-foreground">₹{policy.maxPayoutPerDay}<span className="text-xs font-normal text-muted-foreground">/day</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Protected</p>
            <p className="font-display font-bold text-shield-green">₹{totalPaid}</p>
          </div>
        </div>
      </motion.div>

      {/* Simulation Flow */}
      <SimulationFlow />

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
