import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Download,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  ShieldCheck as ShieldIcon,
  Sparkles,
  Table as TableIcon,
  Users,
  Circle,
  Zap
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { LeadsDataTable } from "@/components/admin/LeadsDataTable";
import { LeadsKanban } from "@/components/admin/LeadsKanban";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { LeadDetailDialog } from "@/components/admin/LeadDetailDialog";
import { useAuth } from "@/hooks/use-auth";
import { useLeads } from "@/hooks/use-leads";
import { exportLeadsToCSV } from "@/lib/csv";
import { STATUS_OPTIONS, type LeadStatus } from "@/lib/leads";
import type { Lead } from "@/hooks/use-leads";
import { cn } from "@/lib/utils";

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
  const { user, loading: authLoading, isStaff, signOut } = useAuth();
  const { leads, loading: leadsLoading, refetch, updateStatus } = useLeads();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
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
    <div className="min-h-screen dark bg-tech bg-grid text-tech-text selection:bg-primary/30">
      {/* Nexus Top Bar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-3xl">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-8 sm:px-12">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-primary-glow opacity-25 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 ring-1 ring-white/5 transition-all group-hover:scale-105 group-hover:border-primary/50 shadow-2xl">
                <ShieldIcon className="h-6 w-6 text-primary-glow animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black tracking-tight text-white">Nexus</span>
                <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary-glow">Staff Hub</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
                Corretora Suélen · CRM
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-3 rounded-full bg-slate-900/50 border border-white/5 px-4 py-2">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Operational Live</span>
            </div>
            
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={leadsLoading}
              className="hidden md:flex h-10 rounded-xl border border-white/5 bg-white/[0.03] px-4 font-bold text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", leadsLoading && "animate-spin")} />
              Sync
            </Button>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-5">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-white tracking-tight">{user.email?.split('@')[0]}</span>
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-tighter">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="group relative h-11 w-11 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/login" });
                }}
              >
                <LogOut className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
              </Button>
            </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] p-8 sm:p-12">
        <AdminPage 
          leads={leads} 
          loading={leadsLoading} 
          refetch={refetch} 
          updateStatus={updateStatus} 
        />
      </main>
    </div>
  );
}

interface AdminPageProps {
  leads: Lead[];
  loading: boolean;
  refetch: () => Promise<void>;
  updateStatus: (id: string, status: LeadStatus) => Promise<void>;
}

function AdminPage({ leads, loading, refetch, updateStatus }: AdminPageProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [open, setOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    if (statusFilter === "all") return leads;
    return leads.filter(l => l.status === statusFilter);
  }, [leads, statusFilter]);

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
    if (!filteredLeads.length) {
      toast.info("Nenhum lead correspondente ao filtro para exportar.");
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    const filterLabel = statusFilter === "all" ? "todos" : statusFilter;
    exportLeadsToCSV(filteredLeads, `leads-nexus-${filterLabel}-${date}.csv`);
    toast.success(`${filteredLeads.length} leads exportados.`);
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-transition-smooth">
      {/* Hero Section */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-900 border border-white/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary-glow shadow-2xl">
            <Zap className="h-4 w-4 fill-primary-glow" /> Intelligence Unit
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white sm:text-8xl drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
            Gestão de <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-glow via-white to-primary-glow">Leads</span>
          </h1>
          <p className="text-xl text-white/40 max-w-2xl font-medium leading-relaxed tracking-tight">
            Monitoramento tático e conversão acelerada. Sincronize dados operacionais em tempo real com a infraestrutura Nexus.
          </p>
        </div>
        
        <div className="flex flex-wrap items-end gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Filtro de Exportação</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] h-16 rounded-2xl border-white/10 bg-white/[0.03] text-white font-bold transition-all focus:ring-primary/40">
                <SelectValue placeholder="Todos os Leads" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white rounded-2xl">
                <SelectItem value="all" className="font-bold focus:bg-primary focus:text-white rounded-xl">Todos os Leads</SelectItem>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="font-bold focus:bg-primary focus:text-white rounded-xl">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            size="lg"
            onClick={handleExport}
            className="h-16 rounded-[1.25rem] bg-gradient-to-br from-primary to-indigo-600 px-10 font-black text-white shadow-[0_20px_50px_-15px_rgba(124,58,237,0.5)] transition-all hover:scale-[1.02] active:scale-95"
          >
            <Download className="mr-3 h-6 w-6" />
            Export to Nexus
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard icon={Users} label="Total Acumulado" value={kpis.total} accent="from-primary to-primary-glow" />
        <KpiCard icon={Sparkles} label="Novos Hoje" value={kpis.novos} accent="from-amber-400 to-orange-500" />
        <KpiCard icon={Activity} label="Em Negociação" value={kpis.em_atendimento} accent="from-blue-400 to-indigo-600" />
        <KpiCard icon={CheckCircle2} label="Conversões" value={kpis.fechados} accent="from-emerald-400 to-teal-600" />
      </div>

      {/* Main View Area */}
      <div className="glass-strong rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
        <Tabs defaultValue="table" className="w-full">
          <div className="flex items-center justify-between border-b border-white/5 bg-slate-950/50 px-10 py-6">
             <TabsList className="bg-slate-900 border border-white/10 h-16 p-2 rounded-2xl">
              <TabsTrigger
                value="table"
                className="gap-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white h-12 px-8 text-xs font-black uppercase tracking-widest transition-all shadow-2xl"
              >
                <TableIcon className="h-5 w-5" />
                Lista Operacional
              </TabsTrigger>
              <TabsTrigger
                value="kanban"
                className="gap-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white h-12 px-8 text-xs font-black uppercase tracking-widest transition-all shadow-2xl"
              >
                <KanbanSquare className="h-5 w-5" />
                Pipeline Kanban
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="gap-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white h-12 px-8 text-xs font-black uppercase tracking-widest transition-all shadow-2xl"
              >
                <BarChart3 className="h-5 w-5" />
                Analytics Deep
              </TabsTrigger>
            </TabsList>
            
            <div className="hidden xl:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                Nexus Online
              </div>
              <div className="h-6 w-px bg-white/5" />
              <span>Sincronizado: {loading ? 'Sincronizando...' : 'Ready'}</span>
            </div>
          </div>

          <div className="p-6">
            <TabsContent value="table" className="mt-0 focus-visible:outline-none">
              <LeadsDataTable
                leads={filteredLeads}
                onStatusChange={handleStatusChange}
                onRowClick={openLead}
              />
            </TabsContent>
            <TabsContent value="kanban" className="mt-0 focus-visible:outline-none">
              <LeadsKanban
                leads={filteredLeads}
                onStatusChange={handleStatusChange}
                onCardClick={openLead}
              />
            </TabsContent>
            <TabsContent value="analytics" className="mt-0 focus-visible:outline-none">
              <AnalyticsDashboard leads={filteredLeads} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

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
    <div className="group relative overflow-hidden rounded-3xl glass-strong border border-white/10 p-6 transition-all hover:scale-[1.02] hover:border-white/20 shadow-lg">
      <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-3xl transition-opacity group-hover:opacity-20`} />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
            {label}
          </div>
          <div className="mt-1 text-4xl font-black text-white tabular-nums tracking-tight">{value}</div>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-glow-lg transition-transform group-hover:rotate-6`}>
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
}
