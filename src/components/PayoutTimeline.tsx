import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Claim } from "@/lib/types";

const STATUS_ICON: Record<string, { icon: React.ReactNode; color: string }> = {
  approved: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-shield-green bg-shield-green" },
  partial: { icon: <AlertTriangle className="h-4 w-4" />, color: "text-shield-amber bg-shield-amber" },
  rejected: { icon: <XCircle className="h-4 w-4" />, color: "text-shield-red bg-shield-red" },
  processing: { icon: <Clock className="h-4 w-4" />, color: "text-muted-foreground bg-muted-foreground" },
  paid: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-shield-green bg-shield-green" },
};

export default function PayoutTimeline() {
  const { claims } = useAppStore();
  
  if (claims.length === 0) return null;

  return (
    <div className="px-4 mb-6">
      <h3 className="font-display font-bold text-base flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-primary" />
        Payout Timeline
      </h3>
      <div className="bg-card rounded-xl shadow-card border p-4">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
          
          <div className="space-y-4">
            {claims.slice(0, 5).map((claim, i) => {
              const statusCfg = STATUS_ICON[claim.status];
              return (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 relative"
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 z-10 ${statusCfg.color.split(" ")[1]}/20`}>
                    <div className={`w-2 h-2 rounded-full ${statusCfg.color.split(" ")[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{claim.disruptionType}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(claim.triggeredAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {claim.finalPayout > 0 ? (
                          <span className="font-display font-bold text-shield-green text-sm">+₹{claim.finalPayout}</span>
                        ) : (
                          <span className="text-xs text-shield-red font-medium">₹0</span>
                        )}
                        <p className={`text-[10px] font-medium ${statusCfg.color.split(" ")[0]}`}>
                          {claim.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
