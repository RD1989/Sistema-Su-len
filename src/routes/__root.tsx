import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-4">
      <div className="glass-strong rounded-2xl p-10 max-w-md text-center shadow-elegant">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Corretora Suélen — Seguro auto sob medida" },
      {
        name: "description",
        content:
          "Cotação rápida e personalizada do seu seguro auto com a Corretora Suélen. Atendimento humano, melhores seguradoras do mercado.",
      },
      { name: "author", content: "Corretora Suélen" },
      { property: "og:title", content: "Corretora Suélen — Seguro auto sob medida" },
      {
        property: "og:description",
        content: "Faça sua cotação em menos de 2 minutos com um especialista.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Corretora Suélen — Seguro auto sob medida" },
      { name: "description", content: "Suélen's Brokerage is a web application for insurance sales funnels and CRM." },
      { property: "og:description", content: "Suélen's Brokerage is a web application for insurance sales funnels and CRM." },
      { name: "twitter:description", content: "Suélen's Brokerage is a web application for insurance sales funnels and CRM." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/28d868ca-8cd1-494a-9093-a8fde7afb4a8/id-preview-44552483--47d88ad0-d76b-4298-a83a-2101beef0137.lovable.app-1777394364006.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/28d868ca-8cd1-494a-9093-a8fde7afb4a8/id-preview-44552483--47d88ad0-d76b-4298-a83a-2101beef0137.lovable.app-1777394364006.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap",
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
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="top-center" />
    </AuthProvider>
  );
}
