// Lógica de "Estimativa Baseada em Regras" — sem API externa.
// Sempre prefixar valor com "A partir de".

export type VeiculoInfo = {
  marca: string;
  modelo: string;
  ano: string;
  versao?: string;
  placa?: string;
};

export type UsoVeiculo = "particular" | "app" | "comercial";

export type QuoteResult = {
  plano: "Essencial" | "Plus" | "Premium" | "Premium APP";
  valorMensal: number;
  destaque: string;
  beneficios: string[];
};

export function estimarCotacao(
  veiculo: VeiculoInfo,
  uso: UsoVeiculo,
): QuoteResult {
  const ano = parseInt(veiculo.ano, 10) || 0;

  // Veículo de aplicativo → cobertura APP
  if (uso === "app") {
    return {
      plano: "Premium APP",
      valorMensal: 289,
      destaque: "Cobertura especial para motoristas de aplicativo",
      beneficios: [
        "Cobertura para uso em apps (Uber, 99, InDriver)",
        "Carro reserva categoria executiva",
        "Assistência 24h ilimitada",
        "Roubo, furto, colisão e terceiros até R$ 100 mil",
        "Vidros, faróis e retrovisores",
      ],
    };
  }

  // Passeio + ano > 2015 → Premium recomendado
  if (uso === "particular" && ano > 2015) {
    return {
      plano: "Premium",
      valorMensal: 219,
      destaque: "Recomendado para o seu perfil",
      beneficios: [
        "Cobertura compreensiva (roubo, furto, colisão, incêndio)",
        "Carro reserva por 30 dias",
        "Assistência 24h em todo Brasil + Mercosul",
        "Cobertura a terceiros até R$ 200 mil",
        "Vidros, faróis e retrovisores",
        "Sem participação obrigatória em vidros",
      ],
    };
  }

  if (uso === "comercial") {
    return {
      plano: "Plus",
      valorMensal: 259,
      destaque: "Ideal para uso comercial",
      beneficios: [
        "Cobertura comercial (carga e descarga)",
        "Carro reserva 15 dias",
        "Assistência 24h",
        "Cobertura a terceiros até R$ 150 mil",
      ],
    };
  }

  // Demais casos
  return {
    plano: "Essencial",
    valorMensal: 159,
    destaque: "Proteção essencial com ótimo custo-benefício",
    beneficios: [
      "Cobertura contra roubo, furto e colisão",
      "Assistência 24h",
      "Cobertura a terceiros até R$ 80 mil",
      "Vidros (com participação)",
    ],
  };
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}
