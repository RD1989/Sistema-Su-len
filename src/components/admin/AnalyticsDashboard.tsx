import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Car,
  Filter,
  BarChart3
} from "lucide-react";
import { type Lead } from "@/hooks/use-leads";

interface AnalyticsDashboardProps {
  leads: Lead[];
}

export function AnalyticsDashboard({ leads }: AnalyticsDashboardProps) {
  const stats = useMemo(() => {
    const total = leads.length;
    const completed = leads.filter(l => (l as any).last_step === 4 || !l.is_partial).length;
    const partials = total - completed;
    const conversionRate = total > 0 ? (completed / total) * 100 : 0;

    // Funnel steps (mapping last_step)
    const funnelData = [
      { name: "Início", value: leads.filter(l => (l as any).last_step >= 1).length, fill: "oklch(0.65 0.15 250)" },
      { name: "Veículo", value: leads.filter(l => (l as any).last_step >= 2).length, fill: "oklch(0.65 0.15 280)" },
      { name: "Uso", value: leads.filter(l => (l as any).last_step >= 3).length, fill: "oklch(0.65 0.15 310)" },
      { name: "Finalizado", value: leads.filter(l => (l as any).last_step >= 4).length, fill: "oklch(0.65 0.15 150)" },
    ];

    // Usage counts
    const usageData = [
      { name: "Particular", value: leads.filter(l => l.uso_veiculo === "particular").length },
      { name: "App", value: leads.filter(l => l.uso_veiculo === "app").length },
      { name: "Comercial", value: leads.filter(l => l.uso_veiculo === "comercial").length },
    ].filter(d => d.value > 0);

    // Geographic (top 5 cities)
    const citiesMap = new Map<string, number>();
    leads.forEach(l => {
      const city = l.cidade || "Não informada";
      citiesMap.set(city, (citiesMap.get(city) || 0) + 1);
    });
    const cityData = Array.from(citiesMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      total,
      completed,
      partials,
      conversionRate,
      funnelData,
      usageData,
      cityData
    };
  }, [leads]);

  const COLORS = ["oklch(0.65 0.15 250)", "oklch(0.65 0.15 280)", "oklch(0.65 0.15 310)", "oklch(0.65 0.15 150)"];

  return (
    <div className="space-y-8 pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Users} 
          label="Total de Inícios" 
          value={stats.total} 
          subValue="Formulários iniciados" 
          color="text-blue-400"
          accent="from-blue-500/20 to-transparent"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Leads Completos" 
          value={stats.completed} 
          subValue="Fluxo finalizado" 
          color="text-emerald-400"
          accent="from-emerald-500/20 to-transparent"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Abandono/Parciais" 
          value={stats.partials} 
          subValue="Não concluídos" 
          color="text-amber-400"
          accent="from-amber-500/20 to-transparent"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Taxa de Conversão" 
          value={`${stats.conversionRate.toFixed(1)}%`} 
          subValue="Web to Lead" 
          color="text-primary-glow"
          accent="from-primary/20 to-transparent"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Funnel Chart */}
        <div className="glass-strong rounded-[2rem] border border-white/10 p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Filter className="h-5 w-5 text-primary" />
              Funil de Conversão
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.funnelData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "bold" }}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{ backgroundColor: "oklch(0.16 0.04 265)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "1rem" }}
                  itemStyle={{ color: "white" }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                  {stats.funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {stats.funnelData.map((step, idx) => {
              const prev = idx > 0 ? stats.funnelData[idx-1].value : stats.total;
              const drop = prev - step.value;
              return (
                <div key={step.name} className="text-center">
                  <div className="text-[10px] font-black uppercase text-white/30">{step.name}</div>
                  {idx > 0 && drop > 0 && (
                    <div className="text-[10px] font-bold text-red-400">-{drop}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Usage Pie Chart */}
        <div className="glass-strong rounded-[2rem] border border-white/10 p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-black text-white uppercase tracking-tight">
              <Car className="h-5 w-5 text-primary" />
              Perfil de Uso
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.usageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.usageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "oklch(0.12 0.03 265)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "1.5rem", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
                  itemStyle={{ color: "white", fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-4">
            {stats.usageData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full shadow-glow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{entry.name}</span>
                <span className="text-xs font-black text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cities Distribution */}
      <div className="glass-strong rounded-[2rem] border border-white/10 p-8">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
          <MapPin className="h-5 w-5 text-primary" />
          Distribuição Geográfica (Top 5)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          {stats.cityData.map((city, idx) => (
            <div key={city.name} className="rounded-2xl bg-white/5 border border-white/5 p-4 text-center transition-all hover:bg-white/10">
              <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">#{idx + 1}</div>
              <div className="text-sm font-bold text-white truncate px-1">{city.name}</div>
              <div className="mt-2 text-2xl font-black text-white">{city.value}</div>
              <div className="text-[10px] font-bold text-white/40 uppercase">Leads</div>
            </div>
          ))}
          {stats.cityData.length === 0 && (
             <div className="col-span-5 py-10 text-center text-white/30 font-medium">
               Aguardando dados geográficos...
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subValue, color, accent }: {
  icon: any;
  label: string;
  value: string | number;
  subValue: string;
  color: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden glass-strong rounded-[2rem] border border-white/10 p-6 shadow-2xl transition-all hover:scale-[1.02] hover:border-white/20">
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-50 transition-opacity group-hover:opacity-80`} />
      <div className="relative flex items-center gap-5">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ${color} border border-white/10 shadow-glow-sm transition-transform group-hover:rotate-6`}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{label}</div>
          <div className="text-3xl font-black text-white tabular-nums tracking-tight">{value}</div>
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{subValue}</div>
        </div>
      </div>
    </div>
  );
}
