import React from "react";
import { UseFormReturn } from "react-hook-form";
import { UserCircle2, Mail, Phone, MapPin, Car, Lock } from "lucide-react";
import { FunnelField, funnelInputClass } from "./FunnelField";
import { FunnelData } from "@/hooks/useFunnelLogic";

interface StepProps {
  form: UseFormReturn<FunnelData>;
}

export function StepContact({ form }: StepProps) {
  const onlyDigits = (s: string) => s.replace(/\D/g, "");
  const maskPhone = (v: string) => {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length === 0) return "";
    if (d.length < 3) return `(${d}`;
    if (d.length < 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FunnelField
          label="Nome completo *"
          icon={<UserCircle2 className="h-4 w-4" />}
          error={form.formState.errors.nome?.message}
          valid={!!form.watch("nome") && form.watch("nome").length >= 2}
        >
          <input {...form.register("nome")} placeholder="Como devemos te chamar" className={funnelInputClass} />
        </FunnelField>
      </div>
      <FunnelField
        label="E-mail *"
        icon={<Mail className="h-4 w-4" />}
        error={form.formState.errors.email?.message}
        valid={!!form.watch("email") && !form.formState.errors.email}
      >
        <input {...form.register("email")} type="email" placeholder="voce@email.com" className={funnelInputClass} />
      </FunnelField>
      <FunnelField
        label="WhatsApp *"
        icon={<Phone className="h-4 w-4" />}
        error={form.formState.errors.whatsapp?.message}
        valid={onlyDigits(form.watch("whatsapp") || "").length >= 10}
      >
        <input
          value={form.watch("whatsapp") || ""}
          onChange={(e) => form.setValue("whatsapp", maskPhone(e.target.value), { shouldValidate: true })}
          placeholder="(11) 99999-9999"
          inputMode="tel"
          className={funnelInputClass}
        />
      </FunnelField>
      <div className="sm:col-span-2">
        <FunnelField
          label="Cidade *"
          icon={<MapPin className="h-4 w-4" />}
          error={form.formState.errors.cidade?.message}
          valid={!!form.watch("cidade") && form.watch("cidade").length >= 2}
        >
          <input {...form.register("cidade")} placeholder="Ex: São Paulo - SP" className={funnelInputClass} />
        </FunnelField>
      </div>
    </div>
  );
}

export function StepVehicle({ form }: StepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FunnelField label="Marca *" error={form.formState.errors.veiculo_marca?.message} valid={!!form.watch("veiculo_marca")}>
        <input {...form.register("veiculo_marca")} placeholder="Ex: Toyota" className={funnelInputClass} />
      </FunnelField>
      <FunnelField label="Modelo *" error={form.formState.errors.veiculo_modelo?.message} valid={!!form.watch("veiculo_modelo")}>
        <input {...form.register("veiculo_modelo")} placeholder="Ex: Corolla" className={funnelInputClass} />
      </FunnelField>
      <FunnelField label="Ano *" error={form.formState.errors.veiculo_ano?.message} valid={!!form.watch("veiculo_ano")}>
        <input {...form.register("veiculo_ano")} placeholder="2022" inputMode="numeric" maxLength={4} className={funnelInputClass} />
      </FunnelField>
      <FunnelField label="FIPE (opcional)">
        <input {...form.register("veiculo_fipe")} placeholder="Se souber" className={funnelInputClass} />
      </FunnelField>
    </div>
  );
}

export function StepUsage({ form }: StepProps) {
  const onlyDigits = (s: string) => s.replace(/\D/g, "");
  const maskCep = (v: string) => {
    const d = onlyDigits(v).slice(0, 8);
    return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {["particular", "aplicativo", "trabalho", "comercial"].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => form.setValue("uso_finalidade", v as any, { shouldValidate: true })}
            className={`rounded-xl border p-3 text-xs font-medium transition-all ${
              form.watch("uso_finalidade") === v
                ? "border-primary bg-primary/20 text-white"
                : "border-white/10 bg-white/5 text-white/60"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
      <FunnelField
        label="CEP de pernoite *"
        icon={<MapPin className="h-4 w-4" />}
        error={form.formState.errors.cep?.message}
        valid={onlyDigits(form.watch("cep") || "").length === 8}
      >
        <input
          value={form.watch("cep") || ""}
          onChange={(e) => form.setValue("cep", maskCep(e.target.value), { shouldValidate: true })}
          placeholder="00000-000"
          className={funnelInputClass}
        />
      </FunnelField>
    </div>
  );
}

export function StepFinal({ form }: StepProps) {
  return (
    <div className="space-y-4">
      <FunnelField label="Observações (opcional)">
        <textarea
          {...form.register("observacoes")}
          rows={4}
          placeholder="Algo a mais?"
          className={funnelInputClass + " resize-none"}
        />
      </FunnelField>
      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-[11px] text-white/60">
        <Lock className="mt-0.5 h-3.5 w-3.5 text-primary" />
        <p>Seus dados são protegidos e usados apenas para sua cotação personalizada.</p>
      </div>
    </div>
  );
}
