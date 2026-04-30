import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
  Car,
  Users,
  UserCircle2,
  Sparkles,
  Flame,
  BadgeCheck,
} from "lucide-react";
import { useFunnelLogic, FunnelData } from "@/hooks/useFunnelLogic";
import { StepContact, StepVehicle, StepUsage, StepFinal } from "@/components/funnel/StepComponents";

export const Route = createFileRoute("/cotacao")({
  head: () => ({
    meta: [
      { title: "Cotação Premium — Suelen Wab" },
      {
        name: "description",
        content: "Funil exclusivo de proteção veicular. Receba sua tabela personalizada em minutos.",
      },
    ],
  }),
  component: CotacaoPage,
});

const steps = [
  { id: 0, title: "Contato", subtitle: "Dados iniciais", icon: UserCircle2, fields: ["nome", "email", "whatsapp", "cidade"] as const },
  { id: 1, title: "Veículo", subtitle: "Sobre o carro", icon: Car, fields: ["veiculo_marca", "veiculo_modelo", "veiculo_ano", "veiculo_fipe"] as const },
  { id: 2, title: "Uso & Perfil", subtitle: "Finalidade e CEP", icon: Users, fields: ["uso_finalidade", "uso_condutor", "cep"] as const },
  { id: 3, title: "Finalização", subtitle: "Tabela exclusiva", icon: Sparkles, fields: ["observacoes"] as const },
];

function CotacaoPage() {
  const [done, setDone] = useState(false);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(15 * 60);

  const {
    step,
    form,
    submitting,
    advancing,
    handleNext,
    handleBack,
    onSubmit,
  } = useFunnelLogic({
    stepsCount: steps.length,
    onDone: (url) => {
      setWaUrl(url);
      setDone(true);
      window.open(url, "_blank");
    },
  });

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);
  const timer = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="dark relative min-h-screen overflow-hidden bg-[oklch(0.12_0.04_285)] text-foreground">
      {/* Background aura */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <div className="absolute -top-40 -left-32 h-[480px] w-[480px] rounded-full bg-primary/40 blur-[120px] animate-float-slow" />
        <div className="absolute top-1/3 -right-32 h-[520px] w-[520px] rounded-full bg-primary-glow/30 blur-[140px] animate-float-slower" />
      </div>

      <header className="relative z-10 border-b border-white/5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-brand bg-clip-text text-lg font-bold tracking-tight text-transparent">
              Suelen Wab
            </span>
          </Link>
          <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span>Encerra em <span className="font-mono font-bold text-white">{timer}</span></span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:py-20">
        {!done ? (
          <>
            <div className="mb-8 text-center">
              <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
                <BadgeCheck className="h-3.5 w-3.5" /> Cotação personalizada
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Sua tabela exclusiva em{" "}
                <span className="text-gradient-brand">poucos minutos</span>
              </h1>
            </div>

            <motion.div
              layout
              className="glass-strong rounded-3xl p-6 shadow-elevated sm:p-10"
            >
              {/* Progress */}
              <div className="mb-8">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-white/50">
                  <span>Etapa {step + 1} de {steps.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full bg-gradient-brand shadow-glow"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stepper icons */}
              <div className="mb-10 flex justify-between">
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  const active = idx === step;
                  const completed = idx < step;
                  return (
                    <div key={s.id} className="flex flex-col items-center gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                        active ? "border-primary bg-primary/20 text-white shadow-glow" :
                        completed ? "border-primary/50 bg-primary/10 text-primary" : "border-white/10 text-white/40"
                      }`}>
                        {completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-tight ${active ? "text-white" : "text-white/30"}`}>
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={onSubmit} className="space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step === 0 && <StepContact form={form} />}
                    {step === 1 && <StepVehicle form={form} />}
                    {step === 2 && <StepUsage form={form} />}
                    {step === 3 && <StepFinal form={form} />}
                  </motion.div>
                </AnimatePresence>

                <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 0 || submitting}
                    className="glass flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:bg-white/10 disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </button>

                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => handleNext(steps[step].fields)}
                      disabled={advancing}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-8 py-3.5 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.03] disabled:opacity-70"
                    >
                      {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Próximo <ArrowRight className="h-4 w-4" /></>}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-8 py-3.5 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.03] disabled:opacity-70"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Receber Tabela Exclusiva <Sparkles className="h-4 w-4" /></>}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>

            <div className="mt-8 flex justify-center gap-4 text-[10px] font-medium text-white/40 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Site Seguro SSL</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> LGPD Compliant</span>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-10 text-center shadow-elevated"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand shadow-glow">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white">Quase lá!</h2>
            <p className="mb-8 text-white/60">
              Sua cotação foi gerada. Caso o WhatsApp não tenha aberto automaticamente, clique no botão abaixo.
            </p>
            <a
              href={waUrl || "#"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-10 py-4 text-base font-bold text-white shadow-glow transition-transform hover:scale-[1.03]"
            >
              Abrir WhatsApp <ArrowRight className="h-5 w-5" />
            </a>
          </motion.div>
        )}
      </main>
    </div>
  );
}
