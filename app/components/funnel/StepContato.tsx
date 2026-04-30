import { Controller, useFormContext } from "react-hook-form";
import type { FieldError as RHFFieldError } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { AlertCircle, Lock, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CONTATO_HORARIO_OPTIONS,
  CONTATO_PREFERENCIA_OPTIONS,
} from "@/lib/leads";
import type { FunnelData } from "./types";

/** Mensagem de erro padronizada — ícone + texto, sem quebras estranhas, acessível. */
function FieldError({ error, id }: { error?: RHFFieldError; id?: string }) {
  if (!error?.message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-snug text-destructive [text-wrap:pretty]"
    >
      <AlertCircle className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 break-words">{error.message as string}</span>
    </p>
  );
}

/** Classes compartilhadas — foco premium e estado inválido consistente. */
const FIELD_BASE =
  "transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary";
const FIELD_INVALID =
  "border-destructive/60 bg-destructive/5 focus-visible:ring-destructive/30 focus-visible:border-destructive";

export function StepContato() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<FunnelData>();

  const obs = watch("observacoes_cliente") ?? "";

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary step-badge">
          Passo 1
        </div>
        <h2 className="mt-3 text-[28px] sm:text-[32px] font-bold leading-tight tracking-tight step-title [text-wrap:balance]">
          Vamos começar pelo básico
        </h2>
        <p className="mt-2 text-sm text-muted-foreground step-subtitle [text-wrap:pretty]">
          Para garantir que sua cotação chegue até você — mesmo que precise sair antes de finalizar.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome completo *</Label>
          <Input
            id="nome"
            placeholder="Como podemos te chamar"
            autoComplete="name"
            aria-invalid={!!errors.nome}
            aria-describedby={errors.nome ? "nome-err" : undefined}
            className={cn(FIELD_BASE, errors.nome && FIELD_INVALID)}
            {...register("nome")}
          />
          <FieldError id="nome-err" error={errors.nome as RHFFieldError | undefined} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="voce@email.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-err" : undefined}
            className={cn(FIELD_BASE, errors.email && FIELD_INVALID)}
            {...register("email")}
          />
          <FieldError id="email-err" error={errors.email as RHFFieldError | undefined} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefone">WhatsApp *</Label>
          <Controller
            control={control}
            name="telefone"
            render={({ field }) => (
              <IMaskInput
                id="telefone"
                mask="(00) 00000-0000"
                value={field.value ?? ""}
                onAccept={(v: string) => field.onChange(v)}
                onBlur={field.onBlur}
                placeholder="(11) 99999-9999"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={!!errors.telefone}
                aria-describedby={errors.telefone ? "telefone-err" : undefined}
                className={cn(
                  "flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-1 text-base shadow-sm placeholder:text-muted-foreground/60 md:text-sm",
                  FIELD_BASE,
                  errors.telefone && FIELD_INVALID,
                )}
              />
            )}
          />
          <FieldError id="telefone-err" error={errors.telefone as RHFFieldError | undefined} />
        </div>

        <div
          className={cn(
            "rounded-xl border bg-muted/30 p-3.5 transition-colors sm:p-4",
            errors.contato_preferencia || errors.contato_horario
              ? "border-destructive/40 bg-destructive/5"
              : "border-border/70",
          )}
        >
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            Como prefere ser atendido
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="contato_preferencia" className="text-sm">
                Canal preferido *
              </Label>
              <Controller
                control={control}
                name="contato_preferencia"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="contato_preferencia"
                      aria-invalid={!!errors.contato_preferencia}
                      aria-describedby={
                        errors.contato_preferencia ? "contato_preferencia-err" : undefined
                      }
                      className={cn(
                        "h-12 w-full bg-background text-[15px] sm:h-11 sm:text-sm",
                        FIELD_BASE,
                        errors.contato_preferencia && FIELD_INVALID,
                      )}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTATO_PREFERENCIA_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError
                id="contato_preferencia-err"
                error={errors.contato_preferencia as RHFFieldError | undefined}
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="contato_horario" className="text-sm">
                Melhor horário *
              </Label>
              <Controller
                control={control}
                name="contato_horario"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="contato_horario"
                      aria-invalid={!!errors.contato_horario}
                      aria-describedby={
                        errors.contato_horario ? "contato_horario-err" : undefined
                      }
                      className={cn(
                        "h-12 w-full bg-background text-[15px] sm:h-11 sm:text-sm",
                        FIELD_BASE,
                        errors.contato_horario && FIELD_INVALID,
                      )}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTATO_HORARIO_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError
                id="contato_horario-err"
                error={errors.contato_horario as RHFFieldError | undefined}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="observacoes_cliente" className="flex items-center gap-1.5 text-sm">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            Observações{" "}
            <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="observacoes_cliente"
            placeholder="Algo que possa nos ajudar — ex: já tem outro seguro, prazo, dúvidas..."
            rows={4}
            maxLength={1000}
            aria-invalid={!!errors.observacoes_cliente}
            aria-describedby="observacoes_cliente-help"
            className={cn(
              "min-h-[110px] resize-none text-[15px] leading-relaxed sm:text-sm",
              FIELD_BASE,
              errors.observacoes_cliente && FIELD_INVALID,
            )}
            {...register("observacoes_cliente")}
          />
          <div
            id="observacoes_cliente-help"
            className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground"
          >
            {errors.observacoes_cliente ? (
              <p className="flex min-w-0 items-start gap-1.5 text-destructive [text-wrap:pretty]">
                <AlertCircle className="mt-[2px] h-3 w-3 shrink-0" aria-hidden />
                <span className="break-words">
                  {errors.observacoes_cliente.message as string}
                </span>
              </p>
            ) : (
              <span className="min-w-0 leading-snug [text-wrap:pretty]">
                Quanto mais detalhes, melhor a cotação.
              </span>
            )}
            <span className="ml-auto shrink-0 tabular-nums">{obs.length}/1000</span>
          </div>
        </div>
      </div>

      <Controller
        control={control}
        name="lgpd_consent"
        render={({ field }) => (
          <div
            className={cn(
              "rounded-xl border bg-background/60 p-3.5 backdrop-blur transition-colors",
              errors.lgpd_consent
                ? "border-destructive/50 bg-destructive/5"
                : "border-border hover:border-primary/40",
            )}
          >
            <label
              htmlFor="lgpd_consent"
              className="flex cursor-pointer select-none items-start gap-3"
            >
              <Checkbox
                id="lgpd_consent"
                checked={field.value === true}
                onCheckedChange={(v) => field.onChange(v === true)}
                aria-invalid={!!errors.lgpd_consent}
                aria-describedby={errors.lgpd_consent ? "lgpd_consent-err" : undefined}
                className="mt-0.5"
              />
              <span className="text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
                <span className="font-medium text-foreground">Concordo</span> com o tratamento dos
                meus dados pessoais (nome, e-mail e WhatsApp) pela Corretora Suélen para envio da
                cotação e contato comercial, conforme a{" "}
                <span className="font-medium text-foreground">LGPD (Lei 13.709/2018)</span>.
              </span>
            </label>
            {errors.lgpd_consent && (
              <p
                id="lgpd_consent-err"
                role="alert"
                className="mt-2 flex items-start gap-1.5 pl-7 text-[12.5px] leading-snug text-destructive [text-wrap:pretty]"
              >
                <AlertCircle className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="break-words">
                  {errors.lgpd_consent.message as string}
                </span>
              </p>
            )}
          </div>
        )}
      />

      <p className="flex items-start gap-2 text-xs text-muted-foreground [text-wrap:pretty]">
        <Lock className="mt-0.5 h-3 w-3 shrink-0" />
        Seus dados são confidenciais e usados apenas para o envio da cotação.
      </p>
    </div>
  );
}
