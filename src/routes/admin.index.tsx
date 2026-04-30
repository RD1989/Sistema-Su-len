import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  Loader2,
  RefreshCw,
  Activity,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminLeads } from "@/hooks/useAdminLeads";
import { KANBAN_COLUMNS, STATUS_LABEL, type LeadStatus } from "@/lib/kanban";
import { PageHeader } from "@/components/admin/PageHeader";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Nexus CRM" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardPage,
});

function trendPct(current: number, previous: number): { value: number; up: boolean } {
  if (previous === 0) return { value: current === 0 ? 0 : 100, up: current >= 0 };
  const v = Math.round(((current - previous) / previous) * 100);
  return { value: Math.abs(v), up: v >= 0 };
}

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const leadsEnabled = !authLoading && !!user;
  const { leads, loading, syncing, refresh } = useAdminLeads({ enabled: leadsEnabled });

  const fetchLeads = (showToast = false) =>
    refresh({ showToast, successMessage: "Dashboard atualizado", errorMessage: "Erro ao carregar dados" });

  const stats = useMemo(() => {
    const total = leads.length;
    const fechado = leads.filter((l) => l.status === "fechado").length;
    const ativos = leads.filter((l) => !["fechado", "perdido"].includes(l.status)).length;
    const conversao = total > 0 ? Math.round((fechado / total) * 100) : 0;

    const now = Date.now();
    const day = 86400000;
    const last7 = leads.filter((l) => now - new Date(l.created_at).getTime() < 7 * day).length;
    const prev7 = leads.filter((l) => {
      const t = now - new Date(l.created_at).getTime();
      return t >= 7 * day && t < 14 * day;
    }).length;
    const fechado7 = leads.filter(
      (l) => l.status === "fechado" && now - new Date(l.created_at).getTime() < 7 * day,
    ).length;
    const fechadoPrev7 = leads.filter(
      (l) =>
        l.status === "fechado" &&
        now - new Date(l.created_at).getTime() >= 7 * day &&
        now - new Date(l.created_at).getTime() < 14 * day,
    ).length;
    const ativos7 = leads.filter(
      (l) =>
        !["fechado", "perdido"].includes(l.status) &&
        now - new Date(l.created_at).getTime() < 7 * day,
    ).length;
    const ativosPrev7 = leads.filter(
      (l) =>
        !["fechado", "perdido"].includes(l.status) &&
        now - new Date(l.created_at).getTime() >= 7 * day &&
        now - new Date(l.created_at).getTime() < 14 * day,
    ).length;

    const byStatus: Record<LeadStatus, number> = {
      novo: 0,
      contatado: 0,
      cotacao_enviada: 0,
      fechado: 0,
      perdido: 0,
    };
    for (const l of leads) byStatus[l.status]++;

    // Origem
    const byOrigem = leads.reduce<Record<string, number>>((acc, l) => {
      const k = l.origem || "—";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

    // Daily trend (14 dias)
    const trend: { day: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = now - (i + 1) * day;
      const end = now - i * day;
      const count = leads.filter((l) => {
        const t = new Date(l.created_at).getTime();
        return t >= start && t < end;
      }).length;
      trend.push({
        day: new Date(end).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        count,
      });
    }

    return {
      total,
      fechado,
      ativos,
      conversao,
      last7,
      prev7,
      fechado7,
      fechadoPrev7,
      ativos7,
      ativosPrev7,
      byStatus,
      byOrigem,
      trend,
    };
  }, [leads]);

  const cards = [
    {
      label: "Total de leads",
      value: stats.total,
      icon: Users,
      accent: "from-blue-500 to-cyan-400",
      trend: trendPct(stats.last7, stats.prev7),
      hint: "vs. semana anterior",
    },
    {
      label: "Em pipeline",
      value: stats.ativos,
      icon: Activity,
      accent: "from-violet-500 to-purple-400",
      trend: trendPct(stats.ativos7, stats.ativosPrev7),
      hint: "ativos esta semana",
    },
    {
      label: "Fechados",
      value: stats.fechado,
      icon: CheckCircle2,
      accent: "from-emerald-500 to-teal-400",
      trend: trendPct(stats.fechado7, stats.fechadoPrev7),
      hint: "fechados em 7 dias",
    },
    {
      label: "Taxa de conversão",
      value: `${stats.conversao}%`,
      icon: TrendingUp,
      accent: "from-fuchsia-500 to-pink-400",
      trend: { value: stats.conversao, up: stats.conversao >= 20 },
      hint: "fechados / total",
    },
  ];

  const maxByStatus = Math.max(1, ...Object.values(stats.byStatus));
  const recent = leads.slice(0, 6);
  const maxTrend = Math.max(1, ...stats.trend.map((d) => d.count));
  const origemEntries = Object.entries(stats.byOrigem).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxOrigem = Math.max(1, ...origemEntries.map(([, v]) => v));

  return (
    <div className="relative min-h-screen">
      <div className="aura-bg pointer-events-none absolute inset-0 opacity-30" />

      <PageHeader
        title="Olá,"
        highlight="Suélen 👋"
        subtitle={`${stats.last7} novos leads nos últimos 7 dias · ${stats.ativos} no pipeline`}
        breadcrumbs={[{ label: "Painel" }, { label: "Dashboard" }]}
        actions={
          <>
            <Link
              to="/admin/kanban"
              className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors hover:bg-accent"
            >
              Abrir funil
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => fetchLeads(true)}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.04] disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          </>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="relative px-4 py-6 sm:px-6 md:px-8">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {cards.map((c, i) => {
              const TrendIcon = c.trend.up ? TrendingUp : TrendingDown;
              return (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="glass group relative overflow-hidden rounded-2xl p-4 sm:p-5"
                >
                  <div
                    className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${c.accent} opacity-15 blur-2xl transition-opacity group-hover:opacity-30`}
                  />
                  <div className="relative flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {c.label}
                      </p>
                      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">
                        {c.value}
                      </p>
                    </div>
                    <span
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.accent} text-white shadow-md`}
                    >
                      <c.icon className="h-[18px] w-[18px]" />
                    </span>
                  </div>
                  <div className="relative mt-3 flex items-center gap-2 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold ${
                        c.trend.up
                          ? "bg-emerald-500/12 text-emerald-600"
                          : "bg-rose-500/12 text-rose-600"
                      }`}
                    >
                      <TrendIcon className="h-3 w-3" />
                      {c.trend.value}%
                    </span>
                    <span className="truncate text-muted-foreground">{c.hint}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Trend chart + Distribution */}
          <div className="mt-5 grid gap-4 lg:grid-cols-5">
            {/* Trend (sparkline-bars) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="glass rounded-2xl p-5 lg:col-span-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-bold tracking-tight">
                    Captação dos últimos 14 dias
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Total no período: {stats.trend.reduce((a, b) => a + b.count, 0)} leads
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                  <Sparkles className="h-3 w-3" /> realtime
                </span>
              </div>
              <div className="mt-5 flex h-40 items-end gap-1.5">
                {stats.trend.map((d, i) => {
                  const h = Math.max(4, (d.count / maxTrend) * 100);
                  return (
                    <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
                      <span className="absolute -top-5 hidden text-[10px] font-bold tabular-nums text-foreground group-hover:block">
                        {d.count}
                      </span>
                      <motion.span
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.02, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary group-hover:from-primary group-hover:to-primary"
                        style={{ minHeight: 4 }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[9px] text-muted-foreground">
                <span>{stats.trend[0]?.day}</span>
                <span>{stats.trend[Math.floor(stats.trend.length / 2)]?.day}</span>
                <span>{stats.trend[stats.trend.length - 1]?.day}</span>
              </div>
            </motion.div>

            {/* Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.4 }}
              className="glass rounded-2xl p-5 lg:col-span-2"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold tracking-tight">Por estágio</h2>
                <Link to="/admin/kanban" className="text-xs font-semibold text-primary hover:underline">
                  Funil →
                </Link>
              </div>
              <div className="mt-4 space-y-2.5">
                {KANBAN_COLUMNS.map((col) => {
                  const value = stats.byStatus[col.id];
                  const pct = (value / maxByStatus) * 100;
                  return (
                    <div key={col.id}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${col.accent}`} />
                          {col.title}
                        </span>
                        <span className="tabular-nums text-muted-foreground">{value}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-full bg-gradient-to-r ${col.accent}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Origem + Recentes */}
          <div className="mt-5 grid gap-4 lg:grid-cols-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.4 }}
              className="glass rounded-2xl p-5 lg:col-span-2"
            >
              <h2 className="font-display text-base font-bold tracking-tight">Origem dos leads</h2>
              <p className="text-[11px] text-muted-foreground">Top canais de captação</p>
              <div className="mt-4 space-y-3">
                {origemEntries.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border/60 p-5 text-center text-xs text-muted-foreground">
                    Sem dados de origem.
                  </p>
                )}
                {origemEntries.map(([origem, count]) => {
                  const pct = (count / maxOrigem) * 100;
                  return (
                    <div key={origem}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium capitalize">{origem}</span>
                        <span className="tabular-nums text-muted-foreground">{count}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-gradient-brand"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="glass rounded-2xl p-5 lg:col-span-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold tracking-tight">Leads recentes</h2>
                <Link
                  to="/admin/leads"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <ul className="mt-4 divide-y divide-border/50">
                {recent.length === 0 && (
                  <li className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                    Nenhum lead ainda.
                  </li>
                )}
                {recent.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-[11px] font-bold text-primary-foreground">
                        {l.nome
                          .split(" ")
                          .map((p) => p[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{l.nome}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {[l.veiculo_marca, l.veiculo_modelo].filter(Boolean).join(" ") || l.whatsapp}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-[10px] tabular-nums text-muted-foreground sm:inline">
                        {new Date(l.created_at).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground/70">
                        {STATUS_LABEL[l.status]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
