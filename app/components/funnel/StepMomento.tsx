import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Clock, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOMENTO_OPTIONS } from "@/lib/leads";
import type { FunnelData } from "./types";

const ICONS = {
  imediato: Sparkles,
  pesquisando: Search,
  sem_pressa: Clock,
} as const;

export function StepMomento() {
  const { watch, setValue, formState: { errors } } = useFormContext<FunnelData>();
  const value = watch("momento_compra");

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary step-badge">
          Passo 2
        </div>
        <h2 className="mt-3 text-[28px] sm:text-[32px] font-bold leading-tight tracking-tight step-title">
          Quando você quer contratar?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground step-subtitle">
          Isso nos ajuda a priorizar seu atendimento.
        </p>
      </div>

      <div className="grid gap-3">
        {MOMENTO_OPTIONS.map((opt, i) => {
          const Icon = ICONS[opt.value];
          const selected = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => setValue("momento_compra", opt.value, { shouldValidate: true })}
              className={cn(
                "group relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-card p-4 text-left transition-all",
                selected
                  ? "border-primary shadow-glow ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40 hover:shadow-soft",
              )}
            >
              {selected && (
                <span className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-primary/5 pointer-events-none" />
              )}
              <span
                className={cn(
                  "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all",
                  selected
                    ? "bg-gradient-to-br from-primary to-primary-glow text-white shadow-glow"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="relative flex-1">
                <div className="font-semibold text-[15px]">{opt.label}</div>
              </div>
              <span
                className={cn(
                  "relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                  selected ? "border-primary bg-primary" : "border-border",
                )}
              >
                {selected && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
            </motion.button>
          );
        })}
      </div>

      {errors.momento_compra && (
        <p className="text-sm text-destructive">{errors.momento_compra.message as string}</p>
      )}
    </div>
  );
}
