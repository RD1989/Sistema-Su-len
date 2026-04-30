import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const VerifySchema = z.object({
  leadId: z.string().uuid().optional(),
  whatsapp: z.string().min(8).max(32).optional(),
  email: z.string().email().optional(),
}).refine((d) => d.leadId || d.whatsapp || d.email, {
  message: "Informe leadId, whatsapp ou email",
});

export type VerifyLeadResult = {
  exists: boolean;
  leadId: string | null;
  status: string | null;
  createdAt: string | null;
};

/**
 * Confirma que o lead foi persistido na tabela `leads`.
 * Busca por id (preferencial) ou, em fallback, pelos últimos 30 minutos
 * por whatsapp/email — cobre casos em que o RPC retornou erro de rede
 * mas o INSERT foi efetivado no banco.
 */
export const verifyLeadPersisted = createServerFn({ method: "POST" })
  .inputValidator((input) => VerifySchema.parse(input))
  .handler(async ({ data }): Promise<VerifyLeadResult> => {
    if (data.leadId) {
      const { data: row, error } = await supabaseAdmin
        .from("leads")
        .select("id, status, created_at")
        .eq("id", data.leadId)
        .maybeSingle();
      if (error) {
        console.error("[verifyLeadPersisted] erro por id", error);
        return { exists: false, leadId: null, status: null, createdAt: null };
      }
      if (row) {
        return { exists: true, leadId: row.id, status: row.status, createdAt: row.created_at };
      }
    }

    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    let q = supabaseAdmin
      .from("leads")
      .select("id, status, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data.whatsapp) {
      const raw = data.whatsapp.trim();
      const digits = raw.replace(/\D/g, "");
      const variants = Array.from(new Set([raw, digits, digits ? `+${digits}` : ""].filter(Boolean)));
      q = q.in("whatsapp", variants);
    } else if (data.email) {
      q = q.eq("email", data.email.trim().toLowerCase());
    }

    const { data: rows, error } = await q;
    if (error) {
      console.error("[verifyLeadPersisted] erro fallback", error);
      return { exists: false, leadId: null, status: null, createdAt: null };
    }
    const row = rows?.[0];
    if (!row) return { exists: false, leadId: null, status: null, createdAt: null };
    return { exists: true, leadId: row.id, status: row.status, createdAt: row.created_at };
  });
