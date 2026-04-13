import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ChevronRight, CloudRain, Thermometer, Wind, Megaphone, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export default function Index() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const policy = useAppStore((s) => s.policy);

  if (user && policy) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="gradient-hero px-6 pt-16 pb-24 text-center relative overflow-hidden">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 12 }} className="w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
          <Shield className="h-9 w-9 text-primary-foreground" />
        </motion.div>
        <motion.h1 initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-3xl font-display font-bold text-primary-foreground mb-2">
          ShieldRun
        </motion.h1>
        <motion.p initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-primary-foreground/80 text-sm max-w-xs mx-auto">
          AI-powered income protection for India's delivery partners. Zero forms. Instant payouts.
        </motion.p>
      </div>

      {/* Features */}
      <div className="px-6 -mt-6 relative z-10 space-y-3 mb-8">
        {[
          { icon: <CloudRain className="h-5 w-5 text-shield-blue" />, title: "Weather Protection", desc: "Auto-detect rain, heat & AQI disruptions" },
          { icon: <Megaphone className="h-5 w-5 text-primary" />, title: "Strike & Outage Cover", desc: "Civic bandh & platform downtime coverage" },
          { icon: <Shield className="h-5 w-5 text-shield-green" />, title: "Instant Payouts", desc: "₹500–₹1,200/day credited to UPI" },
        ].map((f, i) => (
          <motion.div key={f.title} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }} className="bg-card rounded-lg shadow-card p-4 flex items-center gap-3">
            <div className="p-2 bg-secondary rounded-lg">{f.icon}</div>
            <div>
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 mt-auto pb-8">
        <Button onClick={() => navigate("/register")} className="w-full h-14 gradient-hero text-primary-foreground text-base font-display font-bold rounded-xl shadow-elevated">
          Get Protected Now <ChevronRight className="ml-1 h-5 w-5" />
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Starting from ₹29/week · No documents needed
        </p>
      </div>
    </div>
  );
}
