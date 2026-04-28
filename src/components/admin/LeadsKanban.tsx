import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GripVertical, Phone } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_OPTIONS, type LeadStatus } from "@/lib/leads";
import type { Lead } from "@/hooks/use-leads";

interface LeadsKanbanProps {
  leads: Lead[];
  onStatusChange: (id: string, status: LeadStatus) => Promise<void>;
  onCardClick?: (lead: Lead) => void;
}

export function LeadsKanban({ leads, onStatusChange, onCardClick }: LeadsKanbanProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      novo: [],
      em_atendimento: [],
      aguardando_cotacao: [],
      fechado: [],
      perdido: [],
    };
    for (const l of leads) {
      const s = l.status as LeadStatus;
      if (map[s]) map[s].push(l);
    }
    return map;
  }, [leads]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const targetStatus = over.id as LeadStatus;
    const lead = leads.find((l) => l.id === active.id);
    if (!lead || lead.status === targetStatus) return;
    try {
      await onStatusChange(lead.id, targetStatus);
      toast.success("Status atualizado.");
    } catch {
      toast.error("Não foi possível atualizar.");
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-3">
        {STATUS_OPTIONS.map((s) => (
          <KanbanColumn
            key={s.value}
            status={s.value}
            label={s.label}
            leads={grouped[s.value]}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  );
}

function KanbanColumn({
  status,
  label,
  leads,
  onCardClick,
}: {
  status: LeadStatus;
  label: string;
  leads: Lead[];
  onCardClick?: (lead: Lead) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-card/50 p-3 transition-colors",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", STATUS_COLORS[status])} />
          <h3 className="text-sm font-semibold">{label}</h3>
        </div>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {leads.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 min-h-[120px]">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onClick={onCardClick} />
        ))}
        {leads.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
            Arraste leads aqui
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ lead, onClick }: { lead: Lead; onClick?: (lead: Lead) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });
  const v = (lead.veiculo_info ?? {}) as Record<string, unknown>;
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      className={cn(
        "group rounded-lg border bg-card p-3 shadow-soft transition-shadow",
        isDragging && "opacity-60 shadow-elegant",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="mt-0.5 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Arrastar"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onClick?.(lead)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{lead.nome}</span>
            {lead.is_partial && (
              <span
                title={`Parou na etapa ${lead.last_step ?? 1} de 4`}
                className="shrink-0 rounded-full border border-warning/40 bg-warning/15 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider text-warning"
              >
                Parcial
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {lead.telefone}
          </div>
          <div className="mt-2 text-xs">
            <span className="font-medium">
              {String(v.marca ?? "")} {String(v.modelo ?? "")} {String(v.ano ?? "")}
            </span>
          </div>
          {lead.estimativa_plano && (
            <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {lead.estimativa_plano}
              {lead.estimativa_valor != null && ` · R$ ${Number(lead.estimativa_valor).toFixed(0)}`}
            </div>
          )}
          <div className="mt-2 text-[10px] text-muted-foreground">
            {format(new Date(lead.created_at), "dd MMM, HH:mm", { locale: ptBR })}
          </div>
        </button>
      </div>
    </div>
  );
}
