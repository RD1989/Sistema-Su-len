import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Loader2, TrendingUp, TrendingDown, Users, MessageCircle, Target, FileCheck2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConversionTimeChart, SourceBarChart } from "@/components/admin/AnalyticsCharts";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Painel" }, { name: "robots", content: "noindex" }] }),
  component: AdminAnalyticsPage,
});

type Range = 7 | 30 | 90;

interface EventRow {
  event_name: string;
  properties: Record<string, unknown> | null;
  session_id: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
}

const FUNNEL_STEPS = [
  { n: 1, label: "Contato" },
  { n: 2, label: "Veículo" },
  { n: 3, label: "Uso & Perfil" },
  { n: 4, label: "Finalização" },
];

function pct(n: number, d: number) { return d === 0 ? 0 : Math.round((n / d) * 100); }
function delta(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

function AdminAnalyticsPage() {
  const [range, setRange] = useState<Range>(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [prevEvents, setPrevEvents] = useState<EventRow[]>([]);

  const { user, loading: authLoading } = useAuth();

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const now = new Date();
      const start = new Date(now.getTime() - range * 86400000);
      const prevStart = new Date(start.getTime() - range * 86400000);

      const [curr, prev] = await Promise.all([
        supabase.from("analytics_events")
          .select("event_name, properties, session_id, utm_source, utm_campaign, created_at")
          .gte("created_at", start.toISOString())
          .order("created_at", { ascending: false })
          .limit(5000), // Limit increased but optimized
        supabase.from("analytics_events")
          .select("event_name, properties, session_id, utm_source, utm_campaign, created_at")
          .gte("created_at", prevStart.toISOString())
          .lt("created_at", start.toISOString())
          .limit(5000),
      ]);

      setEvents((curr.data ?? []) as EventRow[]);
      setPrevEvents((prev.data ?? []) as EventRow[]);
    } catch (err) {
      console.error("[analytics] fetch error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    if (!authLoading && user) fetchData();
  }, [fetchData, authLoading, user]);

  // Optimized KPI and Funnel computing
  const k = useMemo(() => computeKpis(events), [events]);
  const kPrev = useMemo(() => computeKpis(prevEvents), [prevEvents]);
  const funnel = useMemo(() => computeFunnel(events), [events]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Analytics" 
        subtitle="Métricas do funil em tempo real."
        actions={
          <button 
            onClick={() => fetchData(true)} 
            disabled={refreshing}
            className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Sincronizar
          </button>
        }
      />

      <div className="flex gap-2">
        {([7, 30, 90] as Range[]).map((r) => (
          <button 
            key={r} 
            onClick={() => setRange(r)} 
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              range === r ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {r} dias
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Calculando métricas...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi icon={Users} label="Visitantes únicos" value={k.uniqueSessions} delta={delta(k.uniqueSessions, kPrev.uniqueSessions)} />
            <Kpi icon={Target} label="Intenções de cotação" value={k.ctaClicks} delta={delta(k.ctaClicks, kPrev.ctaClicks)} />
            <Kpi icon={MessageCircle} label="Cliques WhatsApp" value={k.waClicks} delta={delta(k.waClicks, kPrev.waClicks)} />
            <Kpi icon={FileCheck2} label="Conversões (Vendas)" value={k.cotacoes} delta={delta(k.cotacoes, kPrev.cotacoes)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart View */}
            <div className="glass-strong flex flex-col rounded-2xl p-6 shadow-card lg:col-span-2">
              <h3 className="mb-6 text-base font-bold">Desempenho Temporal</h3>
              <ConversionTimeChart data={events} />
            </div>

            {/* Funnel Progress */}
            <div className="glass-strong rounded-2xl p-6 shadow-card">
              <h3 className="mb-1 text-base font-bold">Funil de Conversão</h3>
              <p className="mb-6 text-xs text-muted-foreground">Taxa de conclusão por etapa.</p>
              <div className="space-y-4">
                {FUNNEL_STEPS.map((s) => {
                  const views = funnel.views[s.n] ?? 0;
                  const completes = funnel.completes[s.n] ?? 0;
                  const rate = pct(completes, views);
                  const widthPct = funnel.views[1] ? Math.max(5, Math.round((views / funnel.views[1]) * 100)) : 5;
                  return (
                    <div key={s.n} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-muted-foreground">{s.n}. {s.label}</span>
                        <span>{rate}%</span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
                        <div 
                          className="h-full bg-gradient-brand shadow-glow transition-all duration-500" 
                          style={{ width: `${widthPct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 rounded-xl bg-primary/5 p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-primary/60">Conversão Total</p>
                <p className="text-2xl font-bold text-primary">{pct(k.cotacoes, k.uniqueSessions)}%</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-strong rounded-2xl p-6 shadow-card">
              <h3 className="mb-6 text-base font-bold">Leads por Canal (UTM Source)</h3>
              <SourceBarChart data={events} />
            </div>
            <div className="glass-strong rounded-2xl p-6 shadow-card">
              <h3 className="mb-6 text-base font-bold">Top Campanhas Ativas</h3>
              <div className="space-y-3">
                {groupBy(events.filter(e => e.event_name === "lead"), e => e.utm_campaign || "(orgânico)")
                  .slice(0, 5)
                  .map((g, i) => (
                    <div key={g.key} className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3 text-sm">
                      <span className="font-medium text-white/80">{g.key}</span>
                      <span className="font-bold text-primary">{g.count} <span className="text-[10px] font-normal text-muted-foreground ml-1">leads</span></span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, delta: d }: { icon: any; label: string; value: number; delta: number }) {
  const positive = d >= 0;
  return (
    <div className="glass-strong rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight">{value.toLocaleString("pt-BR")}</span>
        <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
          positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        }`}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {positive ? "+" : ""}{d}%
        </span>
      </div>
    </div>
  );
}

function computeKpis(rows: EventRow[]) {
  const uniqueSessions = new Set(rows.map((r) => r.session_id).filter(Boolean)).size;
  const ctaClicks = rows.filter((r) => r.event_name === "cta_quote_click").length;
  const waClicks = rows.filter((r) => r.event_name === "whatsapp_click").length;
  const cotacoes = rows.filter((r) => r.event_name === "cotacao_enviada").length;
  return { uniqueSessions, ctaClicks, waClicks, cotacoes };
}

function computeFunnel(rows: EventRow[]) {
  const views: Record<number, number> = {};
  const completes: Record<number, number> = {};
  views[1] = new Set(rows.filter((r) => r.event_name === "page_view" && (r.properties as any)?.path === "/cotacao").map((r) => r.session_id)).size;
  for (const r of rows) {
    const step = Number((r.properties as any)?.step ?? 0);
    if (!step) continue;
    if (r.event_name === "funnel_step_view") views[step] = (views[step] ?? 0) + 1;
    if (r.event_name === "funnel_step_complete") completes[step] = (completes[step] ?? 0) + 1;
  }
  completes[1] = rows.filter((r) => r.event_name === "lead").length;
  return { views, completes };
}

function groupBy<T>(rows: T[], key: (r: T) => string) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}
