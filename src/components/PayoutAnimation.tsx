import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function PayoutAnimation({ amount, destination }: { amount: number; destination?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="bg-card rounded-2xl p-8 mx-6 text-center shadow-elevated"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 rounded-full gradient-success flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
        </motion.div>
        <motion.p initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-muted-foreground mb-1">
          Payout Credited!
        </motion.p>
        <motion.p initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="font-display text-3xl font-bold text-shield-green">
          ₹{amount}
        </motion.p>
        <motion.p initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs text-muted-foreground mt-2">
          {destination ? `Debited to ${destination}` : "Debited instantly"}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
