import type { Lead } from "@/hooks/use-leads";

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportLeadsToCSV(leads: Lead[], filename = "leads.csv") {
  const headers = [
    "id",
    "created_at",
    "nome",
    "email",
    "telefone",
    "cidade",
    "momento_compra",
    "uso_veiculo",
    "marca",
    "modelo",
    "ano",
    "versao",
    "placa",
    "status",
    "estimativa_plano",
    "estimativa_valor",
    "observacoes",
  ];

  const rows = leads.map((l) => {
    const v = (l.veiculo_info ?? {}) as Record<string, unknown>;
    return [
      l.id,
      l.created_at,
      l.nome,
      l.email,
      l.telefone,
      l.cidade,
      l.momento_compra,
      l.uso_veiculo,
      v.marca ?? "",
      v.modelo ?? "",
      v.ano ?? "",
      v.versao ?? "",
      v.placa ?? "",
      l.status,
      l.estimativa_plano ?? "",
      l.estimativa_valor ?? "",
      l.observacoes ?? "",
    ]
      .map(csvEscape)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
