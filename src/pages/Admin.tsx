import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, TrendingUp, Users, AlertTriangle, DollarSign } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function Admin() {
  const navigate = useNavigate();
  const { claims, policy } = useAppStore();

  const totalClaims = claims.length;
  const approvedClaims = claims.filter((c) => c.status === "approved" || c.status === "paid" || c.status === "partial");
  const rejectedClaims = claims.filter((c) => c.status === "rejected");
  const totalPayout = claims.reduce((s, c) => s + c.finalPayout, 0);
  const totalPremium = policy ? policy.weeklyPremium : 0;
  const lossRatio = totalPremium > 0 ? (totalPayout / totalPremium).toFixed(2) : "0.00";

  const stats = [
    { label: "Total Claims", value: totalClaims, icon: <AlertTriangle className="h-5 w-5" />, color: "text-primary" },
    { label: "Approved", value: approvedClaims.length, icon: <Users className="h-5 w-5" />, color: "text-shield-green" },
    { label: "Rejected", value: rejectedClaims.length, icon: <AlertTriangle className="h-5 w-5" />, color: "text-shield-red" },
    { label: "Total Payout", value: `₹${totalPayout}`, icon: <DollarSign className="h-5 w-5" />, color: "text-shield-green" },
    { label: "Weekly Premium", value: `₹${totalPremium}`, icon: <TrendingUp className="h-5 w-5" />, color: "text-shield-blue" },
    { label: "Loss Ratio", value: lossRatio, icon: <TrendingUp className="h-5 w-5" />, color: parseFloat(lossRatio) > 1 ? "text-shield-red" : "text-shield-green" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero px-5 pt-6 pb-10">
        <button onClick={() => navigate("/dashboard")} className="text-primary-foreground/80 mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary-foreground" />
          <span className="font-display font-bold text-primary-foreground text-lg">Admin Panel</span>
        </div>
      </div>

      <div className="px-4 -mt-6 grid grid-cols-2 gap-3 pb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-lg shadow-card p-4"
          >
            <div className={`mb-2 ${s.color}`}>{s.icon}</div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-display font-bold text-lg">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Claims table */}
      <div className="px-4 pb-8">
        <h3 className="font-display font-semibold text-sm mb-3">All Claims</h3>
        {claims.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No claims data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">ID</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium">Fraud</th>
                  <th className="text-right py-2 font-medium">Payout</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-2 font-mono">{c.id}</td>
                    <td className="py-2">{c.disruptionType}</td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        c.status === "approved" || c.status === "paid" ? "bg-shield-green/10 text-shield-green" :
                        c.status === "partial" ? "bg-shield-amber/10 text-shield-amber" :
                        "bg-shield-red/10 text-shield-red"
                      }`}>{c.status}</span>
                    </td>
                    <td className="py-2 text-right">{c.fraudScore}</td>
                    <td className="py-2 text-right font-semibold">₹{c.finalPayout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
