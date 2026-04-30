import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acesso do corretor — Corretora Suélen" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/admin", replace: true });
    }
  }, [user, loading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error("E-mail ou senha incorretos.");
      return;
    }
    toast.success("Bem-vindo!");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-hero">
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-2 text-white">
            <ShieldCheck className="h-7 w-7" />
            <span className="text-xl font-semibold tracking-tight">Corretora Suélen</span>
          </div>

          <div className="glass-strong rounded-2xl p-8 shadow-elegant">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Acesso do corretor</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Entre para gerenciar seus leads.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@corretorasuelen.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Acesso restrito. Cadastros são feitos pela administração.
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-white/70">
            <a href="/" className="underline-offset-2 hover:underline">
              ← Voltar ao site
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
