import type { QuoteResult } from "@/lib/quote";
import type { FunnelData } from "@/components/funnel/types";

export function buildWhatsAppLink(
  phoneNumber: string,
  data: FunnelData,
  quote: QuoteResult,
): string {
  const lines = [
    `Olá! Acabei de fazer uma cotação no site.`,
    ``,
    `*Nome:* ${data.nome}`,
    `*Cidade:* ${data.cidade}`,
    `*Telefone:* ${data.telefone}`,
    ``,
    `*Veículo:* ${data.marca} ${data.modelo} ${data.ano}${data.versao ? " " + data.versao : ""}`,
    `*Uso:* ${data.uso_veiculo}`,
    ``,
    `*Plano de interesse:* ${quote.plano}`,
    `*Estimativa:* a partir de R$ ${quote.valorMensal.toFixed(0)}/mês`,
    ``,
    `Quero confirmar a cotação. 🙂`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  const phone = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${text}`;
}
