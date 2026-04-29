import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GripVertical, Phone, RefreshCw } from "lucide-react";
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

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

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
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

  const activeLead = useMemo(() => 
    leads.find(l => l.id === activeId), 
    [leads, activeId]
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/10 h-[calc(100vh-420px)] min-h-[500px]">
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
      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: { active: { opacity: "0.5" } }
        })
      }}>
        {activeLead ? (
          <div className="w-[320px] rotate-2 scale-105 pointer-events-none">
            <KanbanCard lead={activeLead} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
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
        "flex w-80 shrink-0 flex-col rounded-[2rem] border border-white/5 bg-[#020617]/50 transition-all duration-300",
        isOver && "border-primary/50 bg-primary/5 ring-1 ring-primary/20",
      )}
    >
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]", STATUS_COLORS[status])} />
          <h3 className="text-xs font-black uppercase tracking-widest text-white/70">{label}</h3>
        </div>
        <span className="rounded-full bg-slate-900 border border-white/10 px-3 py-1 text-[10px] font-black text-primary-glow">
          {leads.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 pb-5 space-y-3 scrollbar-hide">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onClick={onCardClick} />
        ))}
        {leads.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-white/5 bg-white/[0.01] py-12 text-center transition-colors hover:bg-white/[0.03]">
            <div className="mb-2 rounded-full bg-white/5 p-2">
              <RefreshCw className="h-4 w-4 text-white/20" />
            </div>
            <p className="px-4 text-[10px] font-bold uppercase tracking-tighter text-white/20">
              Vazio
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ lead, onClick, isOverlay }: { lead: Lead; onClick?: (lead: Lead) => void; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });
  const v = (lead.veiculo_info ?? {}) as Record<string, unknown>;
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-xl transition-all duration-200",
        "hover:border-white/10 hover:bg-slate-900/60 hover:shadow-2xl",
        isDragging && !isOverlay && "opacity-20 grayscale",
        isOverlay && "border-primary/50 bg-slate-900 ring-2 ring-primary/40 shadow-glow-lg"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="mt-1 cursor-grab touch-none rounded-lg bg-white/5 p-1 text-white/20 hover:bg-white/10 hover:text-white/60 active:cursor-grabbing transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onClick?.(lead)}
          className="min-w-0 flex-1 text-left space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[13px] font-black text-white tracking-tight uppercase">{lead.nome}</span>
            {lead.is_partial && (
              <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-400">
                Parcial
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/40">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 border border-white/5">
              <Phone className="h-3 w-3 text-primary-glow" />
            </div>
            {lead.telefone}
          </div>

          <div className="rounded-xl bg-slate-900/50 border border-white/5 p-2.5">
            <div className="text-[10px] font-black text-primary-glow uppercase tracking-tighter">
              {String(v.marca ?? "")} {String(v.modelo ?? "")}
            </div>
            <div className="mt-0.5 text-[9px] font-bold text-white/30 uppercase tracking-widest">
              Ano {String(v.ano ?? "—")} · {lead.uso_veiculo || 'Particular'}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
             {lead.estimativa_plano ? (
              <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                {lead.estimativa_plano}
              </div>
            ) : <div />}
            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              {format(new Date(lead.created_at), "dd MMM · HH:mm", { locale: ptBR })}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
