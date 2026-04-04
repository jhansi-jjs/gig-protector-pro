import { motion } from "framer-motion";
import { ShieldCheck, ShieldX, Info } from "lucide-react";

const COVERED = [
  "Heavy rainfall disrupting delivery operations",
  "Extreme heat reducing delivery activity",
  "Hazardous AQI levels affecting outdoor work",
  "Civic restrictions (bandh, curfew, closures)",
  "Platform outages preventing order allocation",
];

const NOT_COVERED = [
  "Health or medical issues",
  "Accidents or injuries",
  "Vehicle damage or repair costs",
  "Personal unavailability (non-working hours)",
];

export default function CoverageInfo() {
  return (
    <div className="px-4 mb-6">
      <h3 className="font-display font-bold text-base flex items-center gap-2 mb-3">
        <Info className="h-5 w-5 text-primary" />
        Coverage & Exclusions
      </h3>
      <div className="bg-card rounded-xl shadow-card border p-4 space-y-4">
        <div>
          <p className="font-semibold text-sm flex items-center gap-1.5 text-shield-green mb-2">
            <ShieldCheck className="h-4 w-4" /> Covered (Income Loss Only)
          </p>
          <ul className="space-y-1.5">
            {COVERED.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <span className="text-shield-green mt-0.5">✓</span>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="border-t pt-3">
          <p className="font-semibold text-sm flex items-center gap-1.5 text-shield-red mb-2">
            <ShieldX className="h-4 w-4" /> Not Covered
          </p>
          <ul className="space-y-1.5">
            {NOT_COVERED.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="text-shield-red mt-0.5">✕</span>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] text-muted-foreground border-t pt-3">
          ShieldRun follows a strict parametric insurance model. Only measurable, external events are valid triggers for automated payouts.
        </p>
      </div>
    </div>
  );
}
