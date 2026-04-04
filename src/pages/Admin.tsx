import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, TrendingUp, Users, AlertTriangle, DollarSign, PieChart, ShieldAlert } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { DisruptionType } from "@/lib/types";

const DISRUPTION_COLORS: Record<DisruptionType, string> = {
  "Heavy Rain": "hsl(210, 80%, 55%)",
  "Extreme Heat": "hsl(0, 75%, 55%)",
  "High AQI": "hsl(40, 85%, 55%)",
  "Civic Strike": "hsl(262, 80%, 55%)",
  "Platform Outage": "hsl(0, 60%, 45%)",
};

export default function Admin() {
  const navigate = useNavigate();
  const { claims, policy } = useAppStore();

  const totalClaims = claims.length;
  const approvedClaims = claims.filter((c) => c.status === "approved" || c.status === "paid" || c.status === "partial");
  const rejectedClaims = claims.filter((c) => c.status === "rejected");
  const totalPayout = claims.reduce((s, c) => s + c.finalPayout, 0);
  const totalPremium = policy ? policy.weeklyPremium * 4 : 0; // simulate monthly
  const lossRatio = totalPremium > 0 ? (totalPayout / totalPremium).toFixed(2) : "0.00";
  const avgFraudScore = claims.length > 0
    ? (claims.reduce((s, c) => s + c.fraudScore, 0) / claims.length).toFixed(2)
    : "0.00";

  const stats = [
    { label: "Total Claims", value: totalClaims, icon: <AlertTriangle className="h-5 w-5" />, color: "text-primary" },
    { label: "Approved", value: approvedClaims.length, icon: <Users className="h-5 w-5" />, color: "text-shield-green" },
    { label: "Rejected", value: rejectedClaims.length, icon: <AlertTriangle className="h-5 w-5" />, color: "text-shield-red" },
    { label: "Total Payout", value: `₹${totalPayout}`, icon: <DollarSign className="h-5 w-5" />, color: "text-shield-green" },
    { label: "Premium (Mo)", value: `₹${totalPremium}`, icon: <TrendingUp className="h-5 w-5" />, color: "text-shield-blue" },
    { label: "Loss Ratio", value: lossRatio, icon: <TrendingUp className="h-5 w-5" />, color: parseFloat(lossRatio) > 1 ? "text-shield-red" : "text-shield-green" },
  ];

  // Disruption breakdown for pie chart
  const disruptionCounts: Record<string, number> = {};
  const disruptionPayouts: Record<string, number> = {};
  claims.forEach((c) => {
    disruptionCounts[c.disruptionType] = (disruptionCounts[c.disruptionType] || 0) + 1;
    disruptionPayouts[c.disruptionType] = (disruptionPayouts[c.disruptionType] || 0) + c.finalPayout;
  });

  const pieData = Object.entries(disruptionCounts).map(([name, value]) => ({
    name,
    value,
    color: DISRUPTION_COLORS[name as DisruptionType] || "hsl(var(--muted-foreground))",
  }));

  const barData = Object.entries(disruptionPayouts).map(([name, payout]) => ({
    name: name.replace(" ", "\n"),
    payout,
    claims: disruptionCounts[name] || 0,
  }));

  // Fraud flagged claims
  const flaggedClaims = claims.filter((c) => c.fraudScore > 0.3 && c.fraudFlags.some(f => !f.includes("No anomalies")));

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero px-5 pt-6 pb-10">
        <button onClick={() => navigate("/dashboard")} className="text-primary-foreground/80 mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary-foreground" />
          <span className="font-display font-bold text-primary-foreground text-lg">Admin / Insurer Panel</span>
        </div>
        <p className="text-primary-foreground/70 text-xs mt-1">Real-time analytics · Fraud monitoring · Loss ratio tracking</p>
      </div>

      {/* Stats Grid */}
      <div className="px-4 -mt-6 grid grid-cols-3 gap-2 pb-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card rounded-lg shadow-card p-3"
          >
            <div className={`mb-1.5 ${s.color}`}>{s.icon}</div>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="font-display font-bold text-base">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Avg Fraud Score */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-lg shadow-card border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-shield-amber" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Fraud Score</p>
              <p className="font-display font-bold">{avgFraudScore}</p>
            </div>
          </div>
          <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            parseFloat(avgFraudScore) > 0.5 ? "bg-shield-red/10 text-shield-red" : "bg-shield-green/10 text-shield-green"
          }`}>
            {parseFloat(avgFraudScore) > 0.5 ? "High Risk" : "Healthy"}
          </div>
        </div>
      </div>

      {/* Claims by Disruption Type — Pie Chart */}
      {pieData.length > 0 && (
        <div className="px-4 mb-4">
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-primary" /> Claims by Disruption Type
          </h3>
          <div className="bg-card rounded-lg shadow-card border p-4">
            <ResponsiveContainer width="100%" height={180}>
              <RechartsPie>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {pieData.map((d) => (
                <span key={d.name} className="text-[10px] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payouts by Type — Bar Chart */}
      {barData.length > 0 && (
        <div className="px-4 mb-4">
          <h3 className="font-display font-semibold text-sm mb-3">Payouts by Disruption Type</h3>
          <div className="bg-card rounded-lg shadow-card border p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => [`₹${value}`, "Payout"]}
                />
                <Bar dataKey="payout" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Fraud Flag Queue */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-shield-red" /> Fraud Flag Queue
        </h3>
        {flaggedClaims.length === 0 ? (
          <div className="bg-card rounded-lg shadow-card border p-4 text-center">
            <p className="text-muted-foreground text-sm">No flagged claims. All checks passed.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {flaggedClaims.map((c) => (
              <div key={c.id} className="bg-card rounded-lg shadow-card border p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{c.disruptionType}</p>
                    <p className="text-[10px] text-muted-foreground">{c.id}</p>
                  </div>
                  <span className="text-xs font-semibold bg-shield-red/10 text-shield-red px-2 py-0.5 rounded-full">
                    Fraud: {c.fraudScore}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {c.fraudFlags.filter(f => !f.includes("No anomalies")).map((f, i) => (
                    <span key={i} className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                      ⚠ {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
