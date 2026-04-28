import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Car,
  Clock,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  STATUS_COLORS,
  STATUS_LABEL,
  STATUS_OPTIONS,
  type LeadStatus,
} from "@/lib/leads";
import type { Lead } from "@/hooks/use-leads";

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: LeadStatus) => Promise<void>;
}

const MOMENTO_LABEL: Record<string, string> = {
  imediato: "Quero contratar agora",
  pesquisando: "Pesquisando preços",
  sem_pressa: "Sem pressa",
};
const USO_LABEL: Record<string, string> = {
  particular: "Particular",
  app: "Aplicativo (Uber/99)",
  comercial: "Comercial",
};
const CONTATO_PREF_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  ligacao: "Ligação",
  email: "E-mail",
};
const CONTATO_HORARIO_LABEL: Record<string, string> = {
  manha: "Manhã (08h–12h)",
  tarde: "Tarde (12h–18h)",
  noite: "Noite (18h–21h)",
  qualquer: "Qualquer horário",
};

export function LeadDetailDialog({
  lead,
  open,
  onOpenChange,
  onStatusChange,
}: LeadDetailDialogProps) {
  if (!lead) return null;
  const v = (lead.veiculo_info ?? {}) as Record<string, unknown>;
  const status = lead.status as LeadStatus;

  const waPhone = lead.telefone.replace(/\D/g, "");
  const waMessage = encodeURIComponent(
    `Olá ${lead.nome.split(" ")[0]}, aqui é da Corretora Suélen. Recebemos sua cotação para o ${String(v.marca ?? "")} ${String(v.modelo ?? "")} ${String(v.ano ?? "")}. Posso te ajudar?`,
  );
  const waLink = `https://wa.me/${waPhone}?text=${waMessage}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-card to-primary/5 p-6 border-b">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold truncate">
                  {lead.nome}
                </DialogTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(lead.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                  <span>·</span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      STATUS_COLORS[status],
                    )}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                  {lead.is_partial && (
                    <span className="rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning">
                      Parcial · Etapa {lead.last_step ?? 1}/4
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Cliente */}
          <Section icon={User} title="Dados do cliente">
            <Row icon={Mail} label="E-mail" value={lead.email} />
            <Row icon={Phone} label="Telefone" value={lead.telefone} />
            <Row icon={MapPin} label="Cidade" value={lead.cidade} />
            <Row icon={Clock} label="Momento de compra" value={MOMENTO_LABEL[lead.momento_compra] ?? lead.momento_compra} />
          </Section>

          {/* Preferências de contato */}
          {(lead.contato_preferencia || lead.contato_horario) && (
            <Section icon={Headphones} title="Preferências de contato">
              <Row
                icon={Phone}
                label="Canal preferido"
                value={
                  lead.contato_preferencia
                    ? (CONTATO_PREF_LABEL[lead.contato_preferencia] ?? lead.contato_preferencia)
                    : "—"
                }
              />
              <Row
                icon={Clock}
                label="Melhor horário"
                value={
                  lead.contato_horario
                    ? (CONTATO_HORARIO_LABEL[lead.contato_horario] ?? lead.contato_horario)
                    : "—"
                }
              />
            </Section>
          )}

          {/* Observações do cliente */}
          {lead.observacoes_cliente && (
            <Section icon={MessageSquare} title="Observações do cliente">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {lead.observacoes_cliente}
              </p>
            </Section>
          )}

          {/* Veículo */}
          <Section icon={Car} title="Veículo">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <Field label="Marca" value={String(v.marca ?? "—")} />
              <Field label="Modelo" value={String(v.modelo ?? "—")} />
              <Field label="Ano" value={String(v.ano ?? "—")} />
              <Field label="Versão" value={String(v.versao ?? "—")} />
              <Field label="Placa" value={String(v.placa ?? "—")} mono />
              <Field label="Uso" value={lead.uso_veiculo ? (USO_LABEL[lead.uso_veiculo] ?? lead.uso_veiculo) : "—"} />
            </div>
          </Section>

          {/* Cotação */}
          {lead.estimativa_plano && (
            <Section icon={Sparkles} title="Estimativa apresentada">
              <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Plano sugerido</div>
                    <div className="font-bold text-lg flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      {lead.estimativa_plano}
                    </div>
                  </div>
                  {lead.estimativa_valor != null && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">A partir de</div>
                      <div className="text-2xl font-bold text-gradient">
                        R$ {Number(lead.estimativa_valor).toFixed(0)}
                        <span className="text-sm text-muted-foreground font-normal">/mês</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Section>
          )}
        </div>

        {/* Footer ações */}
        <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <Select
              value={status}
              onValueChange={(s) => onStatusChange(lead.id, s as LeadStatus)}
            >
              <SelectTrigger className={cn("h-9 w-[180px] text-xs font-semibold", STATUS_COLORS[status])}>
                <SelectValue>{STATUS_LABEL[status]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${lead.email}`}>
                <Mail className="mr-1.5 h-4 w-4" /> E-mail
              </a>
            </Button>
            <Button size="sm" asChild className="bg-success hover:bg-success/90 text-success-foreground">
              <a href={waLink} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="rounded-lg border bg-card/50 p-3.5 space-y-2">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-medium text-right truncate">{value}</span>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-sm font-medium", mono && "font-mono")}>{value}</div>
    </div>
  );
}
