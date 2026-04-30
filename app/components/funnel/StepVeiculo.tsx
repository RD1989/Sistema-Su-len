import { Controller, useFormContext } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { USO_OPTIONS } from "@/lib/leads";
import { cn } from "@/lib/utils";
import type { FunnelData } from "./types";

export function StepVeiculo() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FunnelData>();
  const uso = watch("uso_veiculo");

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary step-badge">
          Passo 3
        </div>
        <h2 className="mt-3 text-[28px] sm:text-[32px] font-bold leading-tight tracking-tight step-title">
          Sobre seu veículo
        </h2>
        <p className="mt-2 text-sm text-muted-foreground step-subtitle">
          Precisamos de algumas informações para a estimativa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="marca">Marca *</Label>
          <Input id="marca" placeholder="Ex: Volkswagen" {...register("marca")} />
          {errors.marca && (
            <p className="text-xs text-destructive">{errors.marca.message as string}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input id="modelo" placeholder="Ex: Polo" {...register("modelo")} />
          {errors.modelo && (
            <p className="text-xs text-destructive">{errors.modelo.message as string}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ano">Ano *</Label>
          <Input
            id="ano"
            inputMode="numeric"
            maxLength={4}
            placeholder="2022"
            {...register("ano")}
          />
          {errors.ano && (
            <p className="text-xs text-destructive">{errors.ano.message as string}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="versao">Versão</Label>
          <Input id="versao" placeholder="Ex: Highline 1.0 TSI" {...register("versao")} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="placa">Placa (opcional)</Label>
          <Controller
            control={control}
            name="placa"
            render={({ field }) => (
              <IMaskInput
                mask="aaa-0*00"
                definitions={{ "*": /[A-Za-z0-9]/ }}
                prepare={(s) => s.toUpperCase()}
                value={field.value ?? ""}
                onAccept={(v: string) => field.onChange(v)}
                placeholder="ABC-1D23"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-1 text-base shadow-sm transition-all placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary md:text-sm"
              />
            )}
          />
          {errors.placa && (
            <p className="text-xs text-destructive">{errors.placa.message as string}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Uso do veículo *</Label>
        <div className="grid grid-cols-3 gap-2">
          {USO_OPTIONS.map((opt) => {
            const selected = uso === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setValue("uso_veiculo", opt.value, { shouldValidate: true })
                }
                className={cn(
                  "relative overflow-hidden rounded-xl border-2 px-3 py-3.5 text-sm font-semibold transition-all",
                  selected
                    ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-glow"
                    : "border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-soft",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {errors.uso_veiculo && (
          <p className="text-xs text-destructive">{errors.uso_veiculo.message as string}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cidade">Cidade *</Label>
        <Input
          id="cidade"
          placeholder="Sua cidade"
          autoComplete="address-level2"
          {...register("cidade")}
        />
        {errors.cidade && (
          <p className="text-xs text-destructive">{errors.cidade.message as string}</p>
        )}
      </div>
    </div>
  );
}
