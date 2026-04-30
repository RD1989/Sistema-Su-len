import { motion } from "framer-motion";

interface StepProgressTimerProps {
  /** Step atual (1-indexed). Usado como key para reiniciar a animação a cada transição. */
  step: number;
  /** Duração da animação em segundos. Deve casar com a transição de blur dos steps. */
  duration?: number;
}

/**
 * Barra fina de timer que se preenche em sincronia com a transição de blur entre steps.
 * Reinicia automaticamente a cada mudança de `step` graças ao `key`.
 */
export function StepProgressTimer({ step, duration = 0.7 }: StepProgressTimerProps) {
  return (
    <div
      className="relative mt-3 h-[3px] w-full overflow-hidden rounded-full bg-border/60"
      aria-hidden
    >
      {/* trilho com glow */}
      <motion.div
        key={step}
        initial={{ width: "0%", opacity: 0.85 }}
        animate={{ width: "100%", opacity: 1 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-primary-glow to-accent shadow-glow"
      />
      {/* shimmer sutil que viaja junto */}
      <motion.div
        key={`shimmer-${step}`}
        initial={{ x: "-30%", opacity: 0 }}
        animate={{ x: "110%", opacity: [0, 0.9, 0] }}
        transition={{ duration: duration + 0.05, ease: "easeOut" }}
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[2px]"
      />
    </div>
  );
}
