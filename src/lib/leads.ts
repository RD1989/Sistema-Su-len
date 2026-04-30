import { z } from "zod";

export const STATUS_OPTIONS = [
  { value: "novo", label: "Novo" },
  { value: "em_atendimento", label: "Em atendimento" },
  { value: "aguardando_cotacao", label: "Aguardando cotação" },
  { value: "fechado", label: "Fechado" },
  { value: "perdido", label: "Perdido" },
] as const;

export type LeadStatus = (typeof STATUS_OPTIONS)[number]["value"];

export const STATUS_LABEL: Record<LeadStatus, string> = STATUS_OPTIONS.reduce(
  (acc, s) => ({ ...acc, [s.value]: s.label }),
  {} as Record<LeadStatus, string>,
);

export const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  em_atendimento: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  aguardando_cotacao: "bg-warning/15 text-warning border-warning/30",
  fechado: "bg-success/15 text-success border-success/30",
  perdido: "bg-destructive/15 text-destructive border-destructive/30",
};

export const MOMENTO_OPTIONS = [
  { value: "imediato", label: "Quero contratar agora" },
  { value: "pesquisando", label: "Estou pesquisando preços" },
  { value: "sem_pressa", label: "Sem pressa, comparando opções" },
] as const;

export const USO_OPTIONS = [
  { value: "particular", label: "Particular" },
  { value: "app", label: "Aplicativo (Uber/99)" },
  { value: "comercial", label: "Comercial" },
] as const;

export const CONTATO_PREFERENCIA_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "ligacao", label: "Ligação" },
  { value: "email", label: "E-mail" },
] as const;

export const CONTATO_HORARIO_OPTIONS = [
  { value: "manha", label: "Manhã (08h–12h)" },
  { value: "tarde", label: "Tarde (12h–18h)" },
  { value: "noite", label: "Noite (18h–21h)" },
  { value: "qualquer", label: "Qualquer horário" },
] as const;

// Schemas Zod por etapa
// Passo 1: Contato (early capture)
export const stepContatoSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(120),
  email: z.string().trim().email("E-mail inválido").max(160),
  telefone: z
    .string()
    .trim()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "WhatsApp inválido"),
  contato_preferencia: z.enum(["whatsapp", "ligacao", "email"], {
    message: "Selecione como prefere ser contatado",
  }),
  contato_horario: z.enum(["manha", "tarde", "noite", "qualquer"], {
    message: "Selecione o melhor horário",
  }),
  observacoes_cliente: z
    .string()
    .trim()
    .max(1000, "Máximo de 1000 caracteres")
    .optional()
    .or(z.literal("")),
  lgpd_consent: z.literal(true, {
    message: "É necessário aceitar os termos para continuar",
  }),
});

// Passo 2: Momento
export const stepMomentoSchema = z.object({
  momento_compra: z.enum(["imediato", "pesquisando", "sem_pressa"], {
    message: "Selecione uma opção",
  }),
});

// Passo 3: Veículo + cidade
export const stepVeiculoSchema = z.object({
  marca: z.string().trim().min(2, "Informe a marca").max(40),
  modelo: z.string().trim().min(1, "Informe o modelo").max(40),
  ano: z
    .string()
    .regex(/^\d{4}$/, "Ano com 4 dígitos")
    .refine((v) => {
      const n = parseInt(v, 10);
      return n >= 1980 && n <= new Date().getFullYear() + 1;
    }, "Ano inválido"),
  versao: z.string().trim().max(60).optional().or(z.literal("")),
  placa: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/, "Placa inválida (ex: ABC-1D23)")
    .optional()
    .or(z.literal("")),
  uso_veiculo: z.enum(["particular", "app", "comercial"], {
    message: "Selecione o uso do veículo",
  }),
  cidade: z.string().trim().min(2, "Cidade obrigatória").max(80),
});

export type StepContato = z.infer<typeof stepContatoSchema>;
export type StepMomento = z.infer<typeof stepMomentoSchema>;
export type StepVeiculo = z.infer<typeof stepVeiculoSchema>;
