import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface ChartProps {
  data: any[];
}

export function ConversionTimeChart({ data }: ChartProps) {
  const chartData = useMemo(() => {
    const days: Record<string, { date: string; views: number; quotes: number }> = {};
    
    // Sort by date first to ensure order
    const sorted = [...data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    sorted.forEach((e) => {
      const date = new Date(e.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      if (!days[date]) days[date] = { date, views: 0, quotes: 0 };
      
      if (e.event_name === "page_view") days[date].views++;
      if (e.event_name === "cotacao_enviada") days[date].quotes++;
    });

    return Object.values(days).slice(-15); // Last 15 days
  }, [data]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: "10px" }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: "10px" }} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
            itemStyle={{ fontSize: "12px" }}
          />
          <Line 
            type="monotone" 
            dataKey="views" 
            name="Acessos" 
            stroke="oklch(0.62 0.21 255)" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="quotes" 
            name="Cotações" 
            stroke="oklch(0.58 0.24 295)" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SourceBarChart({ data }: ChartProps) {
  const chartData = useMemo(() => {
    const sources: Record<string, number> = {};
    data.filter(e => e.event_name === "lead").forEach(e => {
      const s = e.utm_source || "(direto)";
      sources[s] = (sources[s] || 0) + 1;
    });

    return Object.entries(sources)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data]);

  const colors = ["#8b5cf6", "#6366f1", "#a855f7", "#d946ef", "#ec4899"];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: "11px" }}
            width={80}
          />
          <Tooltip 
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
          />
          <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
