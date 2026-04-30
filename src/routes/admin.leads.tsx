import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, RefreshCw, Download, FileText, FileSpreadsheet, Filter, Loader2, Trash2, Phone, Mail, Car, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminLeads, useAdminLeadsRealtime } from "@/hooks/useAdminLeads";
import { KANBAN_COLUMNS, STATUS_LABEL, type Lead, type LeadStatus } from "@/lib/kanban";
import { LeadDetailModal } from "@/components/leads/LeadDetailModal";
import { PageHeader } from "@/components/admin/PageHeader";

export const Route = createFileRoute("/admin/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Nexus CRM" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LeadsPage,
});

const statusBadge: Record<LeadStatus, string> = {
  novo: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
  contatado: "bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20",
  cotacao_enviada: "bg-fuchsia-500/10 text-fuchsia-600 ring-1 ring-fuchsia-500/20",
  fechado: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
  perdido: "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20",
};

function exportCSV(leads: Lead[]) {
  const headers = ["Nome", "WhatsApp", "Email", "CEP", "Marca", "Modelo", "Ano", "Status", "Origem", "Criado em"];
  const rows = leads.map((l) => [
    l.nome, l.whatsapp, l.email ?? "", l.cep ?? "",
    l.veiculo_marca ?? "", l.veiculo_modelo ?? "", l.veiculo_ano ?? "",
    STATUS_LABEL[l.status], l.origem,
    new Date(l.created_at).toLocaleString("pt-BR"),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nexus-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(leads: Lead[], meta: { search: string; status: string }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const today = new Date().toLocaleString("pt-BR");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Nexus CRM — Leads", 40, 40);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  doc.text(`Gerado em ${today}`, 40, 56);
  doc.text(
    `Filtros: status = ${meta.status}${meta.search ? ` · busca = "${meta.search}"` : ""} · total = ${leads.length}`,
    40, 70,
  );
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 90,
    head: [["Nome", "WhatsApp", "E-mail", "Veículo", "Status", "Origem", "Criado em"]],
    body: leads.map((l) => [
      l.nome,
      l.whatsapp,
      l.email ?? "—",
      [l.veiculo_marca, l.veiculo_modelo, l.veiculo_ano].filter(Boolean).join(" ") || "—",
      STATUS_LABEL[l.status],
      l.origem,
      new Date(l.created_at).toLocaleDateString("pt-BR"),
    ]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    margin: { left: 40, right: 40 },
  });

  doc.save(`nexus-leads-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function exportXLSX(leads: Lead[], meta: { search: string; status: string }) {
  const safe = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = String(v).trim();
    return s.toLowerCase() === "null" || s.toLowerCase() === "undefined" ? "" : s;
  };
  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const data = leads.map((l) => ({
    Nome: safe(l.nome),
    WhatsApp: safe(l.whatsapp),
    "E-mail": safe(l.email),
    CEP: safe(l.cep),
    Marca: safe(l.veiculo_marca),
    Modelo: safe(l.veiculo_modelo),
    Ano: safe(l.veiculo_ano),
    Status: safe(STATUS_LABEL[l.status]),
    Origem: safe(l.origem),
    "Criado em": formatDate(l.created_at),
  }));

  const headers = ["Nome", "WhatsApp", "E-mail", "CEP", "Marca", "Modelo", "Ano", "Status", "Origem", "Criado em"];
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });

  // Force text format on all data cells to keep nulls/CEP/WhatsApp/e-mail intact
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let R = 1; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[addr];
      if (!cell) {
        ws[addr] = { t: "s", v: "" };
      } else {
        cell.t = "s";
        cell.v = cell.v ?? "";
        cell.z = "@";
      }
    }
  }

  ws["!cols"] = [
    { wch: 24 }, { wch: 16 }, { wch: 28 }, { wch: 10 },
    { wch: 14 }, { wch: 18 }, { wch: 8 }, { wch: 16 },
    { wch: 14 }, { wch: 20 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");

  const metaWs = XLSX.utils.aoa_to_sheet([
    ["Nexus CRM — Leads"],
    ["Gerado em", formatDate(new Date().toISOString())],
    ["Status", meta.status],
    ["Busca", meta.search || ""],
    ["Total", String(leads.length)],
  ]);
  XLSX.utils.book_append_sheet(wb, metaWs, "Filtros");

  XLSX.writeFile(wb, `nexus-leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

type SortKey = "nome" | "whatsapp" | "status" | "created_at";
type SortDir = "asc" | "desc";

function LeadsPage() {
  const { user, loading: authLoading } = useAuth();
  const leadsEnabled = !authLoading && !!user;
  const { leads, loading, syncing, refresh, setLeads } = useAdminLeads({ enabled: leadsEnabled });
  
  // Realtime activation
  useAdminLeadsRealtime(leadsEnabled);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const fetchLeads = (showToast = false) =>
    refresh({ showToast, successMessage: "Leads atualizados", errorMessage: "Erro ao carregar leads" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      return [l.nome, l.whatsapp, l.email, l.veiculo_marca, l.veiculo_modelo]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = sortKey === "created_at" ? new Date(a.created_at).getTime() : String(a[sortKey] ?? "").toLowerCase();
      const bv = sortKey === "created_at" ? new Date(b.created_at).getTime() : String(b[sortKey] ?? "").toLowerCase();
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [leads, search, statusFilter, sortKey, sortDir]);

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    const previous = leads;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      setLeads(previous);
      toast.error("Falha ao atualizar");
    } else toast.success("Status atualizado");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este lead permanentemente?")) return;
    const previous = leads;
    setLeads((prev) => prev.filter((l) => l.id !== id));
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      setLeads(previous);
      toast.error("Falha ao excluir");
    } else toast.success("Lead excluído");
  };

  return (
    <div className="relative min-h-screen">
      <PageHeader
        title="Todos os"
        highlight="Leads"
        subtitle={`${filtered.length} de ${leads.length} ${leads.length === 1 ? "lead" : "leads"}`}
        breadcrumbs={[{ label: "Painel" }, { label: "Gestão" }, { label: "Leads" }]}
        actions={
          <>
            <button
              onClick={() => exportCSV(filtered)}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors hover:bg-accent"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button
              onClick={() => exportXLSX(filtered, { search, status: statusFilter })}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors hover:bg-accent"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
            </button>
            <button
              onClick={() => exportPDF(filtered, { search, status: statusFilter })}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors hover:bg-accent"
            >
              <FileText className="h-3.5 w-3.5" /> PDF
            </button>
            <button
              onClick={() => fetchLeads(true)}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.04] disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              Sincronizar
            </button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="glass relative flex flex-1 items-center gap-2 rounded-full px-3 py-1.5 min-w-[200px] max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, WhatsApp, e-mail, veículo…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="glass flex items-center gap-1.5 rounded-full px-2 py-1.5">
            <Filter className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
              className="bg-transparent pr-2 text-xs font-medium outline-none"
            >
              <option value="all">Todos os status</option>
              {KANBAN_COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PageHeader>

      <div className="px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">Nenhum lead encontrado.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="glass hidden overflow-hidden rounded-2xl md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      {([
                        { key: "nome" as SortKey, label: "Lead" },
                        { key: "whatsapp" as SortKey, label: "Contato" },
                        { key: null, label: "Veículo" },
                        { key: "status" as SortKey, label: "Status" },
                        { key: "created_at" as SortKey, label: "Data" },
                      ] as const).map((col) => (
                        <th key={col.label} className="px-4 py-3 font-semibold">
                          {col.key ? (
                            <button
                              onClick={() => toggleSort(col.key as SortKey)}
                              className="inline-flex items-center gap-1 hover:text-foreground"
                            >
                              {col.label}
                              {sortKey === col.key
                                ? (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)
                                : <ArrowUpDown className="h-3 w-3 opacity-50" />}
                            </button>
                          ) : col.label}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l) => (
                      <tr key={l.id} className="border-b border-border/40 transition-colors hover:bg-accent/30">
                        <td className="px-4 py-3">
                          <p className="font-semibold">{l.nome}</p>
                          {l.cep && <p className="text-xs text-muted-foreground">CEP {l.cep}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5 text-xs">
                            <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" />{l.whatsapp}</span>
                            {l.email && <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Mail className="h-3 w-3" />{l.email}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="inline-flex items-center gap-1.5">
                            <Car className="h-3 w-3 text-muted-foreground" />
                            {[l.veiculo_marca, l.veiculo_modelo].filter(Boolean).join(" ") || "—"}
                            {l.veiculo_ano ? ` · ${l.veiculo_ano}` : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={l.status}
                            onChange={(e) => handleStatusChange(l.id, e.target.value as LeadStatus)}
                            className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-semibold outline-none ${statusBadge[l.status]}`}
                          >
                            {KANBAN_COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                          {new Date(l.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelected(l)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                              aria-label="Ver detalhes"
                              title="Ver detalhes"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(l.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              aria-label="Excluir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {filtered.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelected(l)}
                  className="glass rounded-2xl p-4 text-left transition-transform active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{l.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{l.whatsapp}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[l.status]}`}>
                      {STATUS_LABEL[l.status]}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Car className="h-3.5 w-3.5" />
                    {[l.veiculo_marca, l.veiculo_modelo].filter(Boolean).join(" ") || "—"}
                    {l.veiculo_ano ? ` · ${l.veiculo_ano}` : ""}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
                    <span>{new Date(l.created_at).toLocaleDateString("pt-BR")}</span>
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Eye className="h-3 w-3" /> Detalhes
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <LeadDetailModal
        lead={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onSaved={(updated) =>
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
        }
        onDeleted={(id) => setLeads((prev) => prev.filter((l) => l.id !== id))}
      />
    </div>
  );
}
