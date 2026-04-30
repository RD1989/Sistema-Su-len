import React from "react";
import { Check } from "lucide-react";

interface FunnelFieldProps {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  valid?: boolean;
  children: React.ReactNode;
}

export const funnelInputClass = "w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/30";

export function FunnelField({ label, icon, error, valid, children }: FunnelFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/60">
        {icon}
        {label}
      </label>
      <div
        className={`funnel-input-glass relative flex items-center overflow-hidden rounded-xl ${
          error ? "border-red-500/50" : ""
        }`}
      >
        {children}
        {valid && !error && (
          <div className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
      {error && <p className="text-[10px] font-medium text-red-400">{error}</p>}
    </div>
  );
}
