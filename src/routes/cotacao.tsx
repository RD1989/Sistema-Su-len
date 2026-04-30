import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Award, Car, Clock, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import heroImage from "@/assets/hero-funnel.jpg";
import { Button } from "@/components/ui/button";
import { FunnelStepper } from "@/components/funnel/FunnelStepper";
import { StepContato } from "@/components/funnel/StepContato";
import { StepMomento } from "@/components/funnel/StepMomento";
import { StepVeiculo } from "@/components/funnel/StepVeiculo";
import { StepEstimativa } from "@/components/funnel/StepEstimativa";
import { StepProgressTimer } from "@/components/funnel/StepProgressTimer";
import type { FunnelData } from "@/components/funnel/types";
import {
  stepContatoSchema,
  stepMomentoSchema,
  stepVeiculoSchema,
} from "@/lib/leads";
import { estimarCotacao } from "@/lib/quote";
import { buildWhatsAppLink } from "@/lib/submit-lead";
import { dispatchLeadWebhook, upsertLead } from "@/server/leads.functions";

export const Route = createFileRoute("/cotacao")({
  component: FunnelPage,
});

const fullSchema = stepContatoSchema.merge(stepMomentoSchema).merge(stepVeiculoSchema);
type FormValues = z.infer<typeof fullSchema>;

const STEP_LABELS = ["Contato", "Momento", "Veículo", "Cotação"];
const STEP_FIELDS: (keyof FormValues)[][] = [
  [
    "nome",
    "email",
    "telefone",
    "contato_preferencia",
    "contato_horario",
    "observacoes_cliente",
    "lgpd_consent",
  ],
  ["momento_compra"],
  ["marca", "modelo", "ano", "uso_veiculo", "placa", "versao", "cidade"],
  [],
];

const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || "5511999999999";

function FunnelPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [savingPartial, setSavingPartial] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  const methods = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      contato_preferencia: undefined as unknown as FormValues["contato_preferencia"],
      contato_horario: undefined as unknown as FormValues["contato_horario"],
      observacoes_cliente: "",
      lgpd_consent: false as unknown as true,
      momento_compra: undefined as unknown as FormValues["momento_compra"],
      marca: "",
      modelo: "",
      ano: "",
      versao: "",
      placa: "",
      uso_veiculo: undefined as unknown as FormValues["uso_veiculo"],
      cidade: "",
    },
  });

  const values = methods.watch();
  const quote = useMemo(
    () =>
      estimarCotacao(
        {
          marca: values.marca,
          modelo: values.modelo,
          ano: values.ano,
          versao: values.versao,
          placa: values.placa,
        },
        values.uso_veiculo as FunnelData["uso_veiculo"],
      ),
    [values.marca, values.modelo, values.ano, values.versao, values.placa, values.uso_veiculo],
  );

  /** Salva/atualiza o lead PARCIAL após validar o step atual. */
  async function persistPartial(currentStep: number): Promise<boolean> {
    const data = methods.getValues();
    setSavingPartial(true);
    try {
      const res = await upsertLead({
        data: {
          id: leadId,
          step: currentStep,
          is_partial: true,
          lgpd_consent: true,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          contato_preferencia: data.contato_preferencia,
          contato_horario: data.contato_horario,
          observacoes_cliente: data.observacoes_cliente || null,
          cidade: data.cidade || null,
          momento_compra: data.momento_compra || null,
          uso_veiculo: data.uso_veiculo || null,
          veiculo_info: data.marca
            ? {
                marca: data.marca,
                modelo: data.modelo,
                ano: data.ano,
                versao: data.versao || null,
                placa: data.placa || null,
              }
            : null,
        },
      });
      if (!leadId) setLeadId(res.id);
      return true;
    } catch (err) {
      console.error("persistPartial err", err);
      // Não bloqueia avanço — UX > consistência aqui
      toast.error("Não foi possível salvar agora, mas você pode continuar.");
      return true;
    } finally {
      setSavingPartial(false);
    }
  }

  async function handleNext() {
    const fields = STEP_FIELDS[step - 1];
    const ok = await methods.trigger(fields, { shouldFocus: true });
    if (!ok) return;
    await persistPartial(step);
    setStep((s) => Math.min(s + 1, 4));
  }

  async function handleConfirm() {
    if (submitting) return;
    setSubmitting(true);
    const data = methods.getValues();
    try {
      // Atualiza o lead como COMPLETO
      const res = await upsertLead({
        data: {
          id: leadId,
          step: 4,
          is_partial: false,
          lgpd_consent: true,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          contato_preferencia: data.contato_preferencia,
          contato_horario: data.contato_horario,
          observacoes_cliente: data.observacoes_cliente || null,
          cidade: data.cidade,
          momento_compra: data.momento_compra,
          uso_veiculo: data.uso_veiculo,
          veiculo_info: {
            marca: data.marca,
            modelo: data.modelo,
            ano: data.ano,
            versao: data.versao || null,
            placa: data.placa || null,
          },
          estimativa_plano: quote.plano,
          estimativa_valor: quote.valorMensal,
        },
      });
      if (!leadId) setLeadId(res.id);

      // Webhook (não bloqueia)
      dispatchLeadWebhook({
        data: {
          leadId: res.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cidade: data.cidade,
          momento_compra: data.momento_compra,
          uso_veiculo: data.uso_veiculo,
          veiculo_info: {
            marca: data.marca,
            modelo: data.modelo,
            ano: data.ano,
            versao: data.versao || null,
            placa: data.placa || null,
          },
          estimativa_plano: quote.plano,
          estimativa_valor: quote.valorMensal,
        },
      }).catch((e) => console.error("webhook err", e));

      toast.success("Cotação enviada! Abrindo WhatsApp...");
      const link = buildWhatsAppLink(WHATSAPP_NUMBER, data, quote);
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  }

  const isLast = step === 4;

  return (
    <div className="min-h-screen bg-soft">
      <div className="mx-auto grid min-h-screen w-full max-w-[1500px] lg:grid-cols-[1fr_1.05fr]">
        {/* HERO ASPIRACIONAL */}
        <aside className="relative hidden lg:flex lg:flex-col lg:justify-between overflow-hidden bg-tech p-12 text-white">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Mulher dirigindo em estrada costeira ao pôr do sol"
              className="h-full w-full object-cover opacity-35"
              width={1080}
              height={1920}
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.16_0.06_270)]/95 via-[oklch(0.20_0.10_290)]/80 to-[oklch(0.30_0.15_310)]/40" />
            <div className="absolute inset-0 bg-grid opacity-[0.18]" />
            <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[oklch(0.55_0.22_295)]/30 blur-3xl" />
            <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.7_0.18_55)]/15 blur-3xl" />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur ring-1 ring-white/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="text-base font-semibold tracking-tight">Corretora Suélen</div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/55">
                  Seguros Auto · Desde 2018
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-xs ring-1 ring-white/15">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Atendimento online
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative space-y-7 max-w-lg"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3.5 py-1.5 text-xs font-medium ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Cotação personalizada em 2 minutos
            </div>
            <h1 className="text-4xl xl:text-[3.5rem] font-bold leading-[1.02] tracking-tight">
              Proteção sob medida
              <br />
              <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
                pra sua tranquilidade.
              </span>
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-white/75">
              Comparamos as melhores seguradoras e desenhamos um plano sob
              medida pra você. Atendimento humano, resposta rápida, do início ao fim.
            </p>

            <div className="grid gap-2.5 pt-1">
              {[
                { icon: ShieldCheck, text: "+12 seguradoras parceiras" },
                { icon: Car, text: "Cobertura passeio, app e comercial" },
                { icon: Star, text: "Avaliação 4.9 no Google" },
                { icon: Clock, text: "Resposta em até 30 minutos" },
              ].map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  className="flex items-center gap-3 text-[13.5px] text-white/85"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {text}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl bg-white/[0.06] backdrop-blur p-4 ring-1 ring-white/10"
            >
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                "Atendimento excelente. Em 1 dia já estava tudo resolvido,
                com economia de quase 30% no meu seguro."
              </p>
              <div className="mt-2.5 flex items-center gap-2 text-xs text-white/55">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-glow to-accent text-[10px] font-bold text-white">
                  MR
                </div>
                Marina R. · Cliente desde 2024
              </div>
            </motion.div>
          </motion.div>

          <div className="relative space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Users, value: "+2.8k", label: "Clientes" },
                { icon: Award, value: "98%", label: "Satisfação" },
                { icon: Star, value: "4.9", label: "Avaliação" },
              ].map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="rounded-xl bg-white/[0.06] backdrop-blur p-3 ring-1 ring-white/10"
                >
                  <Icon className="h-4 w-4 text-accent" />
                  <div className="mt-1.5 text-xl font-bold leading-none tracking-tight">{value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/55 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-white/55">
              © 2024 Corretora Suélen ·{" "}
              <Link to="/login" className="underline-offset-2 hover:underline hover:text-white">
                Acesso do corretor
              </Link>
            </div>
          </div>
        </aside>

        {/* FORMULÁRIO */}
        <main className="relative flex flex-col bg-[oklch(0.985_0.005_240)] p-5 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
          </div>

          <div className="relative mb-5 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-glow">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold tracking-tight">Corretora Suélen</span>
            </div>
            <Link
              to="/login"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Sou corretor
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-[460px] flex-1 flex flex-col justify-center">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Etapa {step} de 4
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {Math.round((step / 4) * 100)}% concluído
              </span>
            </div>

            <FunnelStepper current={step} total={4} labels={STEP_LABELS} />
            <StepProgressTimer step={step} duration={0.7} />

            <FormProvider {...methods}>
              <div className="mt-8 flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24, filter: "blur(12px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -24, filter: "blur(12px)" }}
                    transition={{
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                      filter: { duration: 0.7 },
                    }}
                  >
                    {step === 1 && <StepContato />}
                    {step === 2 && <StepMomento />}
                    {step === 3 && <StepVeiculo />}
                    {step === 4 && (
                      <StepEstimativa
                        quote={quote}
                        veiculo={{
                          marca: values.marca,
                          modelo: values.modelo,
                          ano: values.ano,
                          versao: values.versao,
                          placa: values.placa,
                          uso: values.uso_veiculo,
                        }}
                        nome={values.nome}
                        submitting={submitting}
                        onConfirm={handleConfirm}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-8 flex items-center gap-3">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    disabled={submitting || savingPartial}
                    className="h-12 px-5"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Voltar
                  </Button>
                )}
                {!isLast && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={savingPartial}
                    className="ml-auto h-12 px-7 bg-gradient-to-r from-primary to-primary-glow shadow-glow hover:shadow-elegant transition-shadow text-[15px] font-semibold group"
                  >
                    {savingPartial ? "Salvando..." : "Continuar"}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                )}
              </div>

              <div className="mt-7 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" /> SSL Seguro
                </span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span>Dados protegidos LGPD</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span>SUSEP</span>
              </div>
            </FormProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
