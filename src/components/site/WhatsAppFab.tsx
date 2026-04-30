import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Loader2, MessageCircle } from "lucide-react";
import { useConsultorWhatsapp, buildWhatsappUrl } from "@/hooks/useConsultorWhatsapp";
import { track } from "@/lib/tracking";

const DEFAULT_MESSAGE =
  "Olá Suélen! Vim pelo site e gostaria de fazer uma cotação de proteção veicular. 🚗";

interface WhatsAppFabProps {
  message?: string;
}

export function WhatsAppFab({ message = DEFAULT_MESSAGE }: WhatsAppFabProps) {
  const { number, loading, updating } = useConsultorWhatsapp();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Pequeno delay para animação de entrada após hidratação
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  const href = buildWhatsappUrl(number, message);
  const busy = loading || updating;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    track("whatsapp_click", { source: "fab", path: location.pathname });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label={
        loading
          ? "Carregando contato da Suélen no WhatsApp"
          : updating
            ? "Atualizando número do WhatsApp"
            : "Falar com a Suélen no WhatsApp"
      }
      aria-busy={busy}
      aria-disabled={loading}
      className={`fixed right-3 z-50 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-3 py-2.5 text-xs font-semibold text-white shadow-[0_10px_30px_-5px_rgba(37,211,102,0.55)] outline-none ring-offset-background transition-all duration-300 hover:scale-105 hover:bg-[#1faa55] focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:px-4 sm:py-3 sm:text-sm ${
        loading ? "cursor-progress opacity-80" : ""
      } ${mounted ? "translate-y-0 opacity-100" : "translate-y-[12px] opacity-0"}`}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <span className="relative flex h-4 w-4 items-center justify-center sm:h-5 sm:w-5">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" aria-hidden="true" />
        ) : (
          <>
            <span
              className={`absolute inset-0 rounded-full bg-white/40 ${updating ? "animate-pulse" : "animate-ping"}`}
              aria-hidden="true"
            />
            <MessageCircle className="relative h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" strokeWidth={0} />
          </>
        )}
      </span>
      <span className="hidden xs:inline sm:inline">
        {loading ? "Carregando..." : updating ? "Atualizando..." : "WhatsApp"}
      </span>
    </a>
  );
}
