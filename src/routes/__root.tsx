import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TrackingProvider } from "@/components/TrackingProvider";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="aura-bg pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative max-w-md text-center">
        <h1 className="text-gradient-brand text-8xl font-bold">404</h1>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-105"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nexus CRM — Coonecta Proteção Auto" },
      {
        name: "description",
        content:
          "Cotação de proteção veicular rápida, transparente e atendimento humano com a corretora Suélen. Faça sua cotação online em minutos.",
      },
      { name: "author", content: "Coonecta Proteção Auto" },
      { property: "og:title", content: "Nexus CRM — Coonecta Proteção Auto" },
      {
        property: "og:description",
        content: "Cotação de proteção veicular online com atendimento humano e transparente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nexus CRM — Coonecta Proteção Auto" },
      { name: "description", content: "A digital space for Consultora Suélen, featuring a clean, branded landing page." },
      { property: "og:description", content: "A digital space for Consultora Suélen, featuring a clean, branded landing page." },
      { name: "twitter:description", content: "A digital space for Consultora Suélen, featuring a clean, branded landing page." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e2866b6c-23e5-4e5b-a49a-cd423abc27a1/id-preview-aa53e472--dc74fe9c-0c2a-4bc0-a386-677e2adc4235.lovable.app-1777513956512.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e2866b6c-23e5-4e5b-a49a-cd423abc27a1/id-preview-aa53e472--dc74fe9c-0c2a-4bc0-a386-677e2adc4235.lovable.app-1777513956512.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster richColors position="top-right" />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <TrackingProvider />
      <Outlet />
      <WhatsAppFab />
    </QueryClientProvider>
  );
}
