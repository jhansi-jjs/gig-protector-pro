import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAppStore } from "@/lib/store";
import { TrendingUp } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateWeeklyData(avgDaily: number, totalProtected: number) {
  const data = DAYS.map((day, i) => {
    const base = avgDaily + Math.round((Math.random() - 0.5) * 200);
    const disrupted = i === 2 || i === 4 ? Math.round(base * (0.2 + Math.random() * 0.3)) : base;
    const protectedAmt = disrupted < base * 0.7 ? Math.round((base - disrupted) * 0.8) : 0;
    return {
      day,
      earned: disrupted,
      protected: protectedAmt,
    };
  });
  return data;
}

export default function EarningsChart() {
  const { user, claims } = useAppStore();
  if (!user) return null;

  const totalProtected = claims.filter((c) => c.status === "paid" || c.status === "approved").reduce((s, c) => s + c.finalPayout, 0);
  const data = generateWeeklyData(user.avgDailyEarnings, totalProtected);

  return (
    <div className="px-4 mb-6">
      <h3 className="font-display font-bold text-base flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-primary" />
        Weekly Earnings Overview
      </h3>
      <div className="bg-card rounded-xl shadow-card border p-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                `₹${value}`,
                name === "earned" ? "Earned" : "Protected",
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
              formatter={(value) => (value === "earned" ? "Earned" : "ShieldRun Protected")}
            />
            <Bar dataKey="earned" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="protected" fill="hsl(var(--shield-green))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-muted-foreground text-center mt-2">
          Green bars show income protected by ShieldRun during disruptions
        </p>
      </div>
    </div>
  );
}
