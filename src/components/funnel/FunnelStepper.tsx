import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FunnelStepperProps {
  current: number;
  total: number;
  labels: string[];
}

export function FunnelStepper({ current, total, labels }: FunnelStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const stepNum = i + 1;
          const completed = stepNum < current;
          const active = stepNum === current;
          return (
            <div key={i} className="flex flex-1 items-center gap-1 sm:gap-2">
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1.1 : 1,
                }}
                className={cn(
                  "relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  completed && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary/10 text-primary shadow-glow",
                  !completed && !active && "border-border bg-muted text-muted-foreground",
                )}
              >
                {completed ? <Check className="h-4 w-4" /> : stepNum}
              </motion.div>
              {i < total - 1 && (
                <div className="relative h-1 flex-1 rounded-full bg-border overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: completed ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-y-0 left-0 bg-primary"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        {labels.map((label, i) => (
          <span
            key={label}
            className={cn(
              "flex-1 text-[10px] sm:text-xs text-center font-medium transition-colors",
              i + 1 === current ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
