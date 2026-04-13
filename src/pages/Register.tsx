import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { calculateRiskScore } from "@/lib/insurance-engine";
import type { City, Platform, UserProfile } from "@/lib/types";

const CITIES: City[] = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Pune"];
const PLATFORMS: Platform[] = ["Zomato", "Swiggy", "Zepto", "Amazon Flex", "Dunzo"];

export default function Register() {
  const navigate = useNavigate();
  const setUser = useAppStore((s) => s.setUser);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "" as City,
    platform: "" as Platform,
    workingHours: "8",
  });
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const canProceed =
    step === 0
      ? form.name.trim().length > 0 && form.phone.length >= 10
      : form.city && form.platform;

  const handleSubmit = async () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    const profile: UserProfile = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      name: form.name,
      phone: form.phone,
      city: form.city,
      platform: form.platform,
      workingHoursPerDay: parseInt(form.workingHours) || 8,
      daysPerWeek: 6,
      avgDailyEarnings: 750 + Math.round(Math.random() * 250),
      registeredAt: new Date(),
      isActive: true,
      riskScore: 0,
      loyaltyDiscount: 0,
      claimHistory: [],
    };

    try {
      profile.riskScore = await calculateRiskScore(profile);
      setUser(profile);
      navigate("/choose-plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-hero px-6 pt-12 pb-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 mb-3">
          <Shield className="h-8 w-8 text-primary-foreground" />
          <span className="text-2xl font-display font-bold text-primary-foreground">ShieldRun</span>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-primary-foreground/80 text-sm">
          Income protection for delivery partners
        </motion.p>
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mx-4 -mt-8 bg-card rounded-lg shadow-elevated p-6 flex-1"
      >
        <h2 className="font-display text-lg font-semibold mb-1">
          {step === 0 ? "Welcome, Partner!" : "Work Details"}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {step === 0 ? "Tell us about yourself" : "Help us calculate your risk profile"}
        </p>

        {step === 0 ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Arjun Kumar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="9876543210" type="tel" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>City</Label>
              <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v as City })}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Delivery Platform</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v as Platform })}>
                <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hours">Daily Working Hours</Label>
              <Input id="hours" type="number" min={2} max={16} value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} />
            </div>
          </div>
        )}

        <Button className="w-full mt-8 gradient-hero text-primary-foreground h-12 text-base font-semibold" disabled={!canProceed || submitting} onClick={handleSubmit}>
          {step === 0 ? "Continue" : submitting ? "Creating Profile..." : "Create My Profile"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>

        {step === 1 && (
          <button onClick={() => setStep(0)} className="w-full text-center text-sm text-muted-foreground mt-3">
            ← Back
          </button>
        )}
      </motion.div>
    </div>
  );
}
