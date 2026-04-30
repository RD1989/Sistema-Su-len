import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/tracking";
import { verifyLeadPersisted } from "@/server/leads.functions";

const onlyDigits = (s: string) => s.replace(/\D/g, "");

export const funnelSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(200),
  whatsapp: z.string().trim().superRefine((v, ctx) => {
    const d = onlyDigits(v);
    if (d.length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "WhatsApp incompleto" });
      return;
    }
    const ddd = parseInt(d.slice(0, 2), 10);
    if (isNaN(ddd) || ddd < 11 || ddd > 99) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "DDD inválido (use 11–99)" });
    }
  }),
  cidade: z.string().trim().min(2, "Informe sua cidade").max(120),
  veiculo_marca: z.string().trim().min(2, "Informe a marca").max(60),
  veiculo_modelo: z.string().trim().min(1, "Informe o modelo").max(80),
  veiculo_ano: z.string().trim().regex(/^\d{4}$/, "Ano inválido (4 dígitos)"),
  veiculo_fipe: z.string().trim().max(40).optional().or(z.literal("")),
  uso_finalidade: z.enum(["particular", "aplicativo", "trabalho", "comercial"], {
    errorMap: () => ({ message: "Selecione a finalidade" }),
  }),
  uso_condutor: z.enum(["proprio", "familia", "varios"], {
    errorMap: () => ({ message: "Selecione o condutor" }),
  }),
  cep: z.string().trim().refine((v) => onlyDigits(v).length === 8, "CEP inválido"),
  observacoes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type FunnelData = z.infer<typeof funnelSchema>;

const STORAGE_KEY = "cotacao-funnel-v1";

interface UseFunnelLogicProps {
  stepsCount: number;
  onDone: (url: string) => void;
}

export function useFunnelLogic({ stepsCount, onDone }: UseFunnelLogicProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  const form = useForm<FunnelData>({
    resolver: zodResolver(funnelSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      email: "",
      whatsapp: "",
      cidade: "",
      veiculo_marca: "",
      veiculo_modelo: "",
      veiculo_ano: "",
      veiculo_fipe: "",
      uso_finalidade: undefined,
      uso_condutor: undefined,
      cep: "",
      observacoes: "",
    },
  });

  // Hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        form.reset({ ...form.getValues(), ...data.values });
        if (typeof data.step === "number") setStep(Math.min(data.step, stepsCount - 1));
        if (typeof data.leadId === "string") setLeadId(data.leadId);
      }
    } catch {}
  }, [form, stepsCount]);

  // Persist
  useEffect(() => {
    const sub = form.watch((values) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, step, leadId }));
      } catch {}
    });
    return () => sub.unsubscribe();
  }, [form, step, leadId]);

  const normalizeWhatsapp = (raw: string) => {
    const d = onlyDigits(raw);
    return `+55${d.startsWith("55") && d.length >= 12 ? d.slice(2) : d}`;
  };

  // Track step view
  useEffect(() => {
    if (leadId) {
      track("funnel_step_view", { step: step + 1 }, leadId);
    }
  }, [step, leadId]);

  const isTransientError = (err: unknown) => {
    const msg = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase();
    return ["failed", "network", "timeout", "aborted", "load failed"].some(s => msg.includes(s));
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleNext = async (fields: readonly (keyof FunnelData)[]) => {
    const valid = await form.trigger(fields as never);
    if (!valid) return;

    if (step === 0 && !leadId) {
      setAdvancing(true);
      const v = form.getValues();
      const payload = {
        _nome: v.nome.trim(),
        _email: v.email.trim().toLowerCase(),
        _whatsapp: normalizeWhatsapp(v.whatsapp),
        _cidade: v.cidade.trim(),
        _origem: "site",
      };

      const delays = [0, 600, 1400, 3000];
      let savedId: string | null = null;
      let lastError: unknown = null;

      for (let attempt = 0; attempt < delays.length; attempt++) {
        if (delays[attempt] > 0) await sleep(delays[attempt]);
        try {
          const { data, error } = await supabase.rpc("create_lead", payload);
          if (error) throw error;
          savedId = data as string;
          break;
        } catch (err) {
          lastError = err;
          if (!isTransientError(err)) break;
        }
      }

      if (!savedId) {
        toast.error("Erro ao salvar contato", { description: "Tente novamente em instantes." });
        setAdvancing(false);
        return;
      }

      setLeadId(savedId);
      track("lead", { source: "funnel_step_1" }, savedId);
      track("funnel_step_complete", { step: 1 }, savedId);
      setAdvancing(false);
    } else if (leadId) {
      // Partial enrichment for steps 2 and 3
      const v = form.getValues();
      if (step === 1) {
        track("funnel_step_complete", { step: 2 }, leadId);
        void supabase.rpc("enrich_lead", {
          _lead_id: leadId,
          _veiculo_marca: v.veiculo_marca.trim(),
          _veiculo_modelo: v.veiculo_modelo.trim(),
          _veiculo_ano: v.veiculo_ano.trim(),
          _veiculo_fipe: v.veiculo_fipe?.trim() || "",
        });
      } else if (step === 2) {
        track("funnel_step_complete", { step: 3 }, leadId);
        void supabase.rpc("enrich_lead", {
          _lead_id: leadId,
          _cep: onlyDigits(v.cep),
          _observacoes: `Uso: ${v.uso_finalidade} • Condutor: ${v.uso_condutor}`,
        });
      }
    }

    setStep(s => Math.min(s + 1, stepsCount - 1));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const fetchConsultorWhatsapp = async () => {
    const fallback = "5541998532879";
    try {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "whatsapp_number").maybeSingle();
      const digits = onlyDigits(data?.value ?? "");
      return digits.length >= 10 ? digits : fallback;
    } catch { return fallback; }
  };

  const onSubmit = async (values: FunnelData) => {
    setSubmitting(true);
    try {
      const obs = [values.observacoes, `Uso: ${values.uso_finalidade}`, `Condutor: ${values.uso_condutor}`].filter(Boolean).join(" • ");

      if (leadId) {
        await supabase.rpc("enrich_lead", {
          _lead_id: leadId,
          _veiculo_marca: values.veiculo_marca.trim(),
          _veiculo_modelo: values.veiculo_modelo.trim(),
          _veiculo_ano: values.veiculo_ano.trim(),
          _veiculo_fipe: values.veiculo_fipe?.trim() || "",
          _cep: onlyDigits(values.cep),
          _observacoes: obs,
        });
      }

      // Verify
      const result = await verifyLeadPersisted({
        leadId: leadId || undefined,
        whatsapp: normalizeWhatsapp(values.whatsapp),
        email: values.email.trim().toLowerCase()
      });

      if (!result.exists) {
        toast.error("Erro ao confirmar envio");
        setSubmitting(false);
        return;
      }

      const consultor = await fetchConsultorWhatsapp();
      const msg = [
        `Olá Suélen! Acabei de finalizar minha cotação no site. 🚗`,
        `\n*Meus dados*`,
        `• Nome: ${values.nome}`,
        `• WhatsApp: ${values.whatsapp}`,
        `\n*Veículo*`,
        `• ${values.veiculo_marca} ${values.veiculo_modelo} — ${values.veiculo_ano}`,
        `\n*Perfil*`,
        `• Uso: ${values.uso_finalidade}`,
        `• CEP: ${values.cep}`,
      ].join("\n");

      const url = `https://wa.me/${consultor}?text=${encodeURIComponent(msg)}`;
      localStorage.removeItem(STORAGE_KEY);
      onDone(url);
    } catch (err) {
      console.error(err);
      toast.error("Erro no envio");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    form,
    submitting,
    advancing,
    leadId,
    handleNext,
    handleBack,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
