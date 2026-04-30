import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const webhookSchema = z.object({
  leadId: z.string().uuid(),
  nome: z.string().min(1).max(160),
  email: z.string().email().max(200),
  telefone: z.string().min(1).max(40),
  cidade: z.string().min(1).max(120),
  momento_compra: z.string().max(40),
  uso_veiculo: z.string().max(40),
  veiculo_info: z.record(z.string(), z.any()),
  estimativa_plano: z.string().max(80),
  estimativa_valor: z.number().nullable(),
});

/**
 * Server function que dispara o webhook externo (Make/N8N).
 * Opcional: se LEADS_WEBHOOK_URL não estiver configurado, retorna { sent: false }.
 */
export const dispatchLeadWebhook = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => webhookSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env.LEADS_WEBHOOK_URL;
    if (!url) return { sent: false, reason: "no_webhook_configured" as const };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "corretora-suelen",
          createdAt: new Date().toISOString(),
          ...data,
        }),
      });
      if (!res.ok) {
        console.error(`Webhook respondeu ${res.status}`);
        return { sent: false, reason: `http_${res.status}` as const };
      }
      return { sent: true };
    } catch (err) {
      console.error("Webhook fetch falhou:", err);
      return { sent: false, reason: "fetch_failed" as const };
    }
  });

/**
 * Early-capture: cria/atualiza um lead PARCIAL com supabaseAdmin (bypass RLS).
 * - Se `id` informado, atualiza (UPDATE).
 * - Se não, cria novo lead com nome+email+telefone (status=novo, is_partial=true).
 */
const upsertSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  step: z.number().int().min(1).max(4),
  is_partial: z.boolean().default(true),
  lgpd_consent: z.literal(true, {
    message: "Consentimento LGPD obrigatório",
  }),
  nome: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  telefone: z.string().trim().min(8).max(30),
  contato_preferencia: z.enum(["whatsapp", "ligacao", "email"]),
  contato_horario: z.enum(["manha", "tarde", "noite", "qualquer"]),
  observacoes_cliente: z.string().trim().max(1000).optional().nullable(),
  cidade: z.string().trim().min(2).max(80).optional().nullable(),
  momento_compra: z.enum(["imediato", "pesquisando", "sem_pressa"]).optional().nullable(),
  uso_veiculo: z.enum(["particular", "app", "comercial"]).optional().nullable(),
  veiculo_info: z.record(z.string(), z.any()).optional().nullable(),
  estimativa_plano: z.string().max(80).optional().nullable(),
  estimativa_valor: z.number().nullable().optional(),
});

export const upsertLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => upsertSchema.parse(input))
  .handler(async ({ data }) => {
    const base = {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      contato_preferencia: data.contato_preferencia,
      contato_horario: data.contato_horario,
      observacoes_cliente: data.observacoes_cliente?.trim() || null,
      // momento_compra é NOT NULL no schema; default para registros parciais iniciais
      momento_compra: data.momento_compra ?? "pesquisando",
      cidade: data.cidade ?? "—",
      veiculo_info: data.veiculo_info ?? {},
      uso_veiculo: data.uso_veiculo ?? null,
      estimativa_plano: data.estimativa_plano ?? null,
      estimativa_valor: data.estimativa_valor ?? null,
      is_partial: data.is_partial,
      last_step: data.step,
      status: "novo" as const,
    };

    if (data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("leads")
        .update(base)
        .eq("id", data.id)
        .select("id")
        .single();
      if (error) {
        console.error("upsertLead update error", error);
        throw new Error(error.message);
      }
      return { id: row.id, created: false };
    }

    const { data: row, error } = await supabaseAdmin
      .from("leads")
      .insert(base)
      .select("id")
      .single();
    if (error) {
      console.error("upsertLead insert error", error);
      throw new Error(error.message);
    }
    return { id: row.id, created: true };
  });
