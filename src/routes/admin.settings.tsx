import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Phone, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Nexus CRM" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SettingsPage,
});

const onlyDigits = (v: string) => v.replace(/\D/g, "");

const formatBr = (digits: string) => {
  const d = onlyDigits(digits);
  if (d.length < 12) return digits;
  // 55 + DDD(2) + numero(8 ou 9)
  const cc = d.slice(0, 2);
  const ddd = d.slice(2, 4);
  const rest = d.slice(4);
  if (rest.length === 9) return `+${cc} (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  if (rest.length === 8) return `+${cc} (${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `+${cc} ${ddd} ${rest}`;
};

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [original, setOriginal] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("app_settings")
      .select("value, updated_at")
      .eq("key", "whatsapp_number")
      .maybeSingle();
    if (error) {
      toast.error("Erro ao carregar configuração", { description: error.message });
    } else {
      const v = data?.value ?? "";
      setWhatsapp(v);
      setOriginal(v);
      setUpdatedAt(data?.updated_at ?? null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("app-settings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const digits = onlyDigits(whatsapp);
  const isValid = digits.length >= 12 && digits.length <= 13 && digits.startsWith("55");
  const dirty = digits !== onlyDigits(original);

  const handleSave = async () => {
    if (!isValid) {
      toast.error("Número inválido", {
        description: "Informe DDI 55 + DDD + número (ex.: 55 41 9 8853-2879).",
      });
      return;
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("app_settings")
      .upsert(
        {
          key: "whatsapp_number",
          value: digits,
          updated_by: userData.user?.id ?? null,
        },
        { onConflict: "key" },
      );
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar", { description: error.message });
      return;
    }
    toast.success("WhatsApp atualizado!", {
      description: "As próximas cotações já usam o novo número.",
    });
    setOriginal(digits);
  };

  return (
    <div className="relative min-h-screen">
      <div className="aura-bg pointer-events-none absolute inset-0 opacity-30" />

      <PageHeader
        title="Configurações"
        highlight="do funil"
        subtitle="Defina o número de WhatsApp que receberá os leads finalizados"
        breadcrumbs={[{ label: "Painel" }, { label: "Configurações" }]}
      />

      <div className="relative px-4 py-6 sm:px-6 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="glass rounded-2xl p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold tracking-tight">
                  WhatsApp da consultora
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ao finalizar a cotação, o usuário é redirecionado para este número com
                  uma mensagem pronta. A alteração vale em tempo real para todos os
                  visitantes.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    Número (com DDI 55)
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="55 41 9 8853-2879"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium tabular-nums shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="mt-1.5 block text-[11px] text-muted-foreground">
                    Apenas dígitos são salvos. Formato esperado:{" "}
                    <span className="font-mono">55 + DDD + número</span> (12 ou 13
                    dígitos).
                  </span>
                </label>

                {digits.length > 0 && (
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pré-visualização</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isValid
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-rose-500/15 text-rose-600"
                        }`}
                      >
                        {isValid ? "Válido" : "Incompleto"}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-sm font-semibold">
                      {formatBr(digits) || "—"}
                    </p>
                    {isValid && (
                      <a
                        href={`https://wa.me/${digits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
                      >
                        Testar link no WhatsApp →
                      </a>
                    )}
                  </div>
                )}

                {updatedAt && (
                  <p className="text-[11px] text-muted-foreground">
                    Última atualização:{" "}
                    {new Date(updatedAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={load}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Recarregar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!dirty || !isValid || saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.04] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Salvar alterações
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
