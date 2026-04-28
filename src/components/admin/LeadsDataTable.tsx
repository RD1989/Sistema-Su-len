import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABEL, STATUS_OPTIONS, type LeadStatus } from "@/lib/leads";
import type { Lead } from "@/hooks/use-leads";

interface LeadsDataTableProps {
  leads: Lead[];
  onStatusChange: (id: string, status: LeadStatus) => Promise<void>;
  onRowClick?: (lead: Lead) => void;
}

export function LeadsDataTable({ leads, onStatusChange, onRowClick }: LeadsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      const v = (l.veiculo_info ?? {}) as Record<string, unknown>;
      return (
        l.nome.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.telefone.toLowerCase().includes(q) ||
        l.cidade.toLowerCase().includes(q) ||
        String(v.marca ?? "").toLowerCase().includes(q) ||
        String(v.modelo ?? "").toLowerCase().includes(q)
      );
    });
  }, [leads, search, statusFilter]);

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {format(new Date(row.original.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
          </span>
        ),
      },
      {
        accessorKey: "nome",
        header: "Cliente",
        cell: ({ row }) => (
          <div className="min-w-[160px]">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{row.original.nome}</span>
              {row.original.is_partial && (
                <span
                  title={`Parou na etapa ${row.original.last_step ?? 1} de 4`}
                  className="shrink-0 rounded-full border border-warning/40 bg-warning/15 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider text-warning"
                >
                  Parcial
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{row.original.cidade}</div>
          </div>
        ),
      },
      {
        accessorKey: "telefone",
        header: "Contato",
        cell: ({ row }) => (
          <div className="min-w-[160px] text-sm">
            <div>{row.original.telefone}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
              {row.original.email}
            </div>
          </div>
        ),
      },
      {
        id: "veiculo",
        header: "Veículo",
        cell: ({ row }) => {
          const v = (row.original.veiculo_info ?? {}) as Record<string, unknown>;
          return (
            <div className="text-sm">
              <div>
                {String(v.marca ?? "")} {String(v.modelo ?? "")}
              </div>
              <div className="text-xs text-muted-foreground">
                {String(v.ano ?? "—")}{row.original.uso_veiculo ? ` · uso ${row.original.uso_veiculo}` : ""}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "estimativa_plano",
        header: "Plano",
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{row.original.estimativa_plano ?? "—"}</div>
            {row.original.estimativa_valor != null && (
              <div className="text-xs text-muted-foreground">
                R$ {Number(row.original.estimativa_valor).toFixed(0)}/mês
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status as LeadStatus;
          return (
            <Select
              value={s}
              onValueChange={(v) => onStatusChange(row.original.id, v as LeadStatus)}
            >
              <SelectTrigger
                className={cn(
                  "h-8 w-[170px] border text-xs font-medium",
                  STATUS_COLORS[s],
                )}
              >
                <SelectValue>{STATUS_LABEL[s] ?? s}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
    ],
    [onStatusChange],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, veículo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/40 transition-colors" : undefined}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("[data-no-row-click]")) return;
                    onRowClick?.(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      data-no-row-click={cell.column.id === "status" ? "" : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
