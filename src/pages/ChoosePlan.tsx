import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { getAllPlanOptions } from "@/lib/insurance-engine";
import { startRazorpayCheckout } from "@/lib/razorpay";
import type { Policy } from "@/lib/types";
import { toast } from "sonner";

const PLAN_FEATURES: Record<string, string[]> = {
  "Basic Shield": ["Up to ₹500/day payout", "Weather + AQI coverage", "Basic fraud protection"],
  "Pro Shield": ["Up to ₹800/day payout", "All 5 disruption types", "Priority processing", "5% loyalty rewards"],
  "Max Shield": ["Up to ₹1,200/day payout", "All 5 disruption types", "Instant processing", "10% loyalty rewards", "Multi-platform support"],
};

export default function ChoosePlan() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const setPolicy = useAppStore((s) => s.setPolicy);
  const [plans, setPlans] = useState<Policy[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [checkingOutTier, setCheckingOutTier] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const options = await getAllPlanOptions(user);
        if (!cancelled) setPlans(options);
      } catch {
        toast.error("Unable to load plan pricing right now.");
      } finally {
        if (!cancelled) setLoadingPlans(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, user]);

  if (!user) return null;

  const selectPlan = async (policy: Policy) => {
    setCheckingOutTier(policy.tier);
    setPolicy(policy);

    try {
      await startRazorpayCheckout(policy.tier, policy.weeklyPremium);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment could not be started.";
      toast.error(message);
      navigate("/dashboard");
    } finally {
      setCheckingOutTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero px-6 pt-8 pb-12">
        <button onClick={() => navigate("/")} className="text-primary-foreground/80 mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary-foreground" />
          <span className="font-display font-bold text-primary-foreground text-lg">Choose Your Shield</span>
        </div>
        <p className="text-primary-foreground/70 text-sm">
          AI Risk Score: <span className="font-semibold text-primary-foreground">{user.riskScore}/100</span> · {user.city}
        </p>
      </div>

      <div className="px-4 -mt-6 space-y-4 pb-8">
        {loadingPlans && <div className="text-sm text-muted-foreground text-center py-8">Loading API-based pricing...</div>}
        {!loadingPlans && plans.map((plan, i) => {
          const isPro = plan.tier === "Pro Shield";
          return (
            <motion.div
              key={plan.tier}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-card rounded-lg shadow-card p-5 border-2 ${isPro ? "border-primary" : "border-transparent"} relative`}
            >
              {isPro && (
                <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Recommended
                </span>
              )}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-display font-semibold text-base">{plan.tier}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">Max ₹{plan.maxPayoutPerDay}/day</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-display font-bold text-foreground">₹{plan.weeklyPremium}</span>
                  <span className="text-muted-foreground text-xs block">/week</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="text-xs text-muted-foreground mb-3 bg-secondary/50 rounded p-2 space-y-0.5">
                <div className="flex justify-between"><span>Base rate</span><span>₹{plan.basePremium}</span></div>
                <div className="flex justify-between"><span>Zone multiplier ({user.city})</span><span>×{plan.zoneMultiplier.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Season factor</span><span>×{plan.seasonFactor.toFixed(2)}</span></div>
                {plan.loyaltyDiscount > 0 && <div className="flex justify-between text-shield-green"><span>Loyalty discount</span><span>-{(plan.loyaltyDiscount * 100).toFixed(0)}%</span></div>}
              </div>

              <ul className="space-y-1.5 mb-4">
                {PLAN_FEATURES[plan.tier]?.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-3.5 w-3.5 text-shield-green flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => void selectPlan(plan)}
                disabled={Boolean(checkingOutTier)}
                className={`w-full h-10 font-semibold ${isPro ? "gradient-hero text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {checkingOutTier === plan.tier ? "Opening Razorpay..." : `Pay with Razorpay for ${plan.tier}`}
              </Button>
            </motion.div>
          );
        })}
        {!loadingPlans && (
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="w-full h-10 text-muted-foreground"
          >
            Skip for now
          </Button>
        )}
      </div>
    </div>
  );
}
