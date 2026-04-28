import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  Download,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Table as TableIcon,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadsDataTable } from "@/components/admin/LeadsDataTable";
import { LeadsKanban } from "@/components/admin/LeadsKanban";
import { LeadDetailDialog } from "@/components/admin/LeadDetailDialog";
import { useAuth } from "@/hooks/use-auth";
import { useLeads, type Lead } from "@/hooks/use-leads";
import { exportLeadsToCSV } from "@/lib/csv";
import type { LeadStatus } from "@/lib/leads";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "CRM — Corretora Suélen" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const navigate = useNavigate();
  const { user, loading, isStaff, signOut } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tech bg-grid">
        <div className="text-sm text-white/70">Carregando…</div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tech bg-grid px-4">
        <div className="surface-tech rounded-2xl p-8 max-w-md text-center text-white">
          <h1 className="text-xl font-semibold">Acesso negado</h1>
          <p className="mt-2 text-sm text-white/70">
            Sua conta ainda não tem permissão de corretor. Entre em contato com a
            administração para liberar o acesso.
          </p>
          <Button
            variant="outline"
            className="mt-6 bg-white/5 border-white/20 text-white hover:bg-white/10"
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
          >
            Sair
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tech bg-grid text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-xl bg-[oklch(0.16_0.04_265)]/70">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow ring-1 ring-white/20 shadow-glow">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight text-white">Corretora Suélen</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                CRM · Painel do corretor
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/60 sm:inline">{user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={async () => {
                await signOut();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-1 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6">
        <AdminPage />
      </main>
    </div>
  );
}

function AdminPage() {
  const { leads, loading, refetch, updateStatus } = useLeads();
  const [selected, setSelected] = useState<Lead | null>(null);
  const [open, setOpen] = useState(false);

  const kpis = useMemo(() => {
    const by = (s: LeadStatus) => leads.filter((l) => l.status === s).length;
    return {
      total: leads.length,
      novos: by("novo"),
      em_atendimento: by("em_atendimento"),
      fechados: by("fechado"),
    };
  }, [leads]);

  async function handleStatusChange(id: string, status: LeadStatus) {
    try {
      await updateStatus(id, status);
      // keep dialog open with fresh data
      setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    } catch (err) {
      toast.error((err as Error).message || "Erro ao atualizar status");
    }
  }

  function openLead(lead: Lead) {
    setSelected(lead);
    setOpen(true);
  }

  function handleExport() {
    if (!leads.length) {
      toast.info("Nenhum lead para exportar.");
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    exportLeadsToCSV(leads, `leads-${date}.csv`);
    toast.success("CSV exportado.");
  }

  return (
    <div className="space-y-6">
      {/* Title row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 ring-1 ring-white/10">
            <LayoutDashboard className="h-3 w-3" /> Dashboard
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Gestão de leads
          </h1>
          <p className="text-sm text-white/60">
            Acompanhe e gerencie todos os clientes captados pelo funil em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="bg-white/5 border-white/15 text-white hover:bg-white/10"
          >
            <RefreshCw className={loading ? "mr-1 h-4 w-4 animate-spin" : "mr-1 h-4 w-4"} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            className="bg-gradient-to-r from-primary to-primary-glow shadow-glow"
          >
            <Download className="mr-1 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard icon={Users} label="Total de leads" value={kpis.total} accent="from-primary to-primary-glow" />
        <KpiCard icon={Sparkles} label="Novos" value={kpis.novos} accent="from-[oklch(0.62_0.18_280)] to-[oklch(0.72_0.16_300)]" />
        <KpiCard icon={Activity} label="Em atendimento" value={kpis.em_atendimento} accent="from-[oklch(0.7_0.14_195)] to-[oklch(0.78_0.16_220)]" />
        <KpiCard icon={CheckCircle2} label="Fechados" value={kpis.fechados} accent="from-success to-[oklch(0.78_0.16_155)]" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 ring-1 ring-white/5">
          <TabsTrigger
            value="table"
            className="gap-1.5 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
          >
            <TableIcon className="h-4 w-4" />
            Tabela
          </TabsTrigger>
          <TabsTrigger
            value="kanban"
            className="gap-1.5 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
          >
            <KanbanSquare className="h-4 w-4" />
            Kanban
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="mt-4">
          <div className="rounded-2xl surface-tech p-4 text-foreground bg-card">
            <LeadsDataTable
              leads={leads}
              onStatusChange={handleStatusChange}
              onRowClick={openLead}
            />
          </div>
        </TabsContent>
        <TabsContent value="kanban" className="mt-4">
          <div className="rounded-2xl surface-tech p-4 text-foreground bg-card">
            <LeadsKanban
              leads={leads}
              onStatusChange={handleStatusChange}
              onCardClick={openLead}
            />
          </div>
        </TabsContent>
      </Tabs>

      <LeadDetailDialog
        lead={selected}
        open={open}
        onOpenChange={setOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl surface-tech p-4">
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold text-white tabular-nums">{value}</div>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-glow`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
