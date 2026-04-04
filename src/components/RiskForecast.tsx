import { motion } from "framer-motion";
import { CloudRain, Thermometer, Wind, Megaphone, Wifi, AlertTriangle, ShieldAlert } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { DisruptionType } from "@/lib/types";

const FORECAST_DATA: { type: DisruptionType; icon: React.ReactNode; emoji: string; risk: "Low" | "Medium" | "High" | "Extreme"; chance: number; detail: string }[] = [
  { type: "Heavy Rain", icon: <CloudRain className="h-4 w-4" />, emoji: "🌧", risk: "High", chance: 72, detail: "IMD predicts heavy showers Wed-Thu" },
  { type: "Extreme Heat", icon: <Thermometer className="h-4 w-4" />, emoji: "🔥", risk: "Medium", chance: 45, detail: "Temperature may cross 40°C on Friday" },
  { type: "High AQI", icon: <Wind className="h-4 w-4" />, emoji: "💨", risk: "Low", chance: 18, detail: "Air quality stable this week" },
  { type: "Civic Strike", icon: <Megaphone className="h-4 w-4" />, emoji: "📢", risk: "Low", chance: 8, detail: "No alerts from local authorities" },
  { type: "Platform Outage", icon: <Wifi className="h-4 w-4" />, emoji: "📡", risk: "Low", chance: 12, detail: "Platforms operating normally" },
];

const RISK_COLORS: Record<string, string> = {
  Low: "bg-shield-green/10 text-shield-green",
  Medium: "bg-shield-amber/10 text-shield-amber",
  High: "bg-shield-red/10 text-shield-red",
  Extreme: "bg-destructive/10 text-destructive",
};

export default function RiskForecast() {
  const { user } = useAppStore();
  if (!user) return null;

  return (
    <div className="px-4 mb-6">
      <h3 className="font-display font-bold text-base flex items-center gap-2 mb-3">
        <ShieldAlert className="h-5 w-5 text-primary" />
        7-Day Risk Forecast — {user.city}
      </h3>
      <div className="bg-card rounded-xl shadow-card border divide-y divide-border">
        {FORECAST_DATA.map((item, i) => (
          <motion.div
            key={item.type}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3"
          >
            <span className="text-lg">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{item.type}</p>
              <p className="text-[11px] text-muted-foreground truncate">{item.detail}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.chance > 60 ? "bg-shield-red" : item.chance > 30 ? "bg-shield-amber" : "bg-shield-green"
                  }`}
                  style={{ width: `${item.chance}%` }}
                />
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${RISK_COLORS[item.risk]}`}>
                {item.risk}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground text-center mt-2">
        Powered by HGRS (Hyperlocal Gig Risk Scorer) · Updated daily
      </p>
    </div>
  );
}
