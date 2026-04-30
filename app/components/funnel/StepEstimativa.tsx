import { motion } from "framer-motion";
import { Car, Check, Loader2, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL, type QuoteResult, type UsoVeiculo } from "@/lib/quote";

interface StepEstimativaProps {
  quote: QuoteResult;
  veiculo: {
    marca: string;
    modelo: string;
    ano: string;
    versao?: string;
    placa?: string;
    uso: UsoVeiculo;
  };
  nome?: string;
  submitting: boolean;
  onConfirm: () => void;
}

const USO_LABEL: Record<UsoVeiculo, string> = {
  particular: "Particular",
  app: "Aplicativo",
  comercial: "Comercial",
};

export function StepEstimativa({ quote, veiculo, nome, submitting, onConfirm }: StepEstimativaProps) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {quote.destaque}
          </span>
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
          {nome ? `${nome.split(" ")[0]}, ` : ""}sua estimativa está pronta
        </h2>
      </div>

      {/* Resumo do veículo */}
      <div className="rounded-xl border bg-card/60 p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Car className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Veículo</div>
            <div className="font-semibold truncate">
              {veiculo.marca} {veiculo.modelo} <span className="text-muted-foreground">· {veiculo.ano}</span>
            </div>
            {veiculo.versao && (
              <div className="text-xs text-muted-foreground truncate">{veiculo.versao}</div>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
              <span className="rounded-full border bg-background px-2 py-0.5 font-medium">
                {USO_LABEL[veiculo.uso]}
              </span>
              {veiculo.placa && (
                <span className="rounded-full border bg-background px-2 py-0.5 font-mono font-medium">
                  {veiculo.placa}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-primary/5 p-6 shadow-elegant"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                <Sparkles className="h-3 w-3" /> Recomendado
              </div>
              <h3 className="mt-2 text-2xl font-bold">Plano {quote.plano}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Baseado no seu perfil e veículo
              </p>
            </div>
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>

          <div className="mt-5">
            <div className="text-xs text-muted-foreground">A partir de</div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-bold text-gradient">
                {formatBRL(quote.valorMensal)}
              </span>
              <span className="text-base text-muted-foreground">/mês</span>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5">
            {quote.beneficios.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/15">
                  <Check className="h-3 w-3 text-success" />
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      <Button
        type="button"
        size="lg"
        onClick={onConfirm}
        disabled={submitting}
        className="w-full bg-gradient-to-r from-success to-success/85 hover:from-success/90 hover:to-success/80 text-success-foreground font-semibold shadow-glow text-base h-12"
      >
        {submitting ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <MessageCircle className="mr-2 h-5 w-5" />
        )}
        Falar com especialista no WhatsApp
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Ao confirmar, abrimos o WhatsApp com sua cotação pré-preenchida.
      </p>
    </div>
  );
}
