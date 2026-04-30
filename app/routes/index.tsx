import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Car,
  CheckCircle2,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UserRoundCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import suelenFoto from "@/assets/suelen-foto.png";
import coonectaLogo from "@/assets/coonecta-logo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coonecta — Proteção Auto · Seguro com atendimento humano" },
      {
        name: "description",
        content:
          "Coonecta Proteção Auto: cotação online em 2 minutos, atendimento humano com a corretora Suélen e o melhor custo-benefício do mercado.",
      },
      { property: "og:title", content: "Coonecta — Proteção Auto" },
      {
        property: "og:description",
        content:
          "Cotação rápida, atendimento direto com a corretora Suélen e cobertura completa. Conecte-se à proteção que cuida de você.",
      },
    ],
  }),
  component: HomePage,
});

const BENEFITS = [
  { icon: Truck, title: "Guincho 24h", desc: "Em todo o território nacional, sempre que precisar." },
  { icon: ShieldCheck, title: "Roubo e Furto", desc: "Indenização justa e processo descomplicado." },
  { icon: Users, title: "Danos a Terceiros", desc: "Cobertura ampla pra você dirigir tranquilo." },
  { icon: Car, title: "Carro Reserva", desc: "Mobilidade garantida enquanto seu veículo é reparado." },
];

const BIO_HIGHLIGHTS = [
  { icon: Award, label: "+6 anos de experiência" },
  { icon: Heart, label: "Atendimento humano e próximo" },
  { icon: ShieldCheck, label: "+12 seguradoras parceiras" },
];

function PrimaryCta({
  label = "Fazer cotação agora",
  size = "lg",
}: {
  label?: string;
  size?: "default" | "lg";
}) {
  return (
    <Button
      asChild
      size={size}
      className="group h-14 rounded-xl bg-[image:var(--gradient-brand)] px-7 text-base font-semibold text-white shadow-[0_10px_40px_-10px_color-mix(in_oklab,var(--brand-purple)_55%,transparent)] transition-all hover:shadow-[0_14px_48px_-12px_color-mix(in_oklab,var(--brand-purple)_70%,transparent)]"
    >
      <Link to="/cotacao">
        {label}
        <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Button>
  );
}

function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Aura de fundo glassmorphism */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-[var(--brand-purple)]/15 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[28rem] w-[28rem] rounded-full bg-[var(--brand-blue)]/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[var(--brand-purple-soft)]/10 blur-3xl" />
      </div>

      {/* HEADER MINIMAL */}
      <header className="relative">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
          <Link to="/" className="flex items-center gap-3" aria-label="Coonecta — Proteção Auto">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[image:var(--gradient-brand)] shadow-md ring-1 ring-white/30">
              <img
                src={coonectaLogo}
                alt=""
                aria-hidden
                className="h-full w-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-extrabold tracking-tight text-[var(--brand-blue)]">
                COONECTA
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Proteção Auto
              </div>
            </div>
          </Link>

          <Button
            asChild
            size="sm"
            className="hidden rounded-lg bg-[image:var(--gradient-brand)] px-4 text-xs font-semibold text-white hover:opacity-95 sm:inline-flex"
          >
            <Link to="/cotacao">
              Fazer cotação
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative">
        {/* HERO */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-12 pt-4 sm:px-8 sm:pb-16 sm:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-purple)]/20 bg-white/60 px-4 py-1.5 text-xs font-medium text-[var(--brand-purple)] shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Cotação online em 2 minutos
            </div>

            <h1 className="mt-6 font-display text-[34px] font-extrabold leading-[1.05] tracking-tight text-[var(--brand-blue)] sm:text-[52px] md:text-[58px]">
              Conecte-se à
              <br />
              <span className="bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
                proteção que cuida
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Coonecta Proteção Auto: o melhor custo-benefício do mercado, com
              atendimento humano direto com a corretora Suélen — sem call center.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryCta />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <UserRoundCheck className="h-3.5 w-3.5 text-[var(--brand-purple)]" />
                +2.800 clientes protegidos
              </div>
            </div>
          </motion.div>
        </section>

        {/* SOBRE A SUÉLEN — foto + bio */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-3xl border border-white/60 bg-white/55 shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--brand-blue)_30%,transparent)] backdrop-blur-xl"
          >
            <div className="grid gap-0 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
              {/* Foto */}
              <div className="relative isolate overflow-hidden bg-[image:var(--gradient-brand)] p-6 sm:p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 20%, oklch(0.62 0.22 305 / 0.5), transparent 60%)",
                  }}
                />
                <div className="relative mx-auto flex max-w-sm flex-col items-center text-center text-white">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-white/20 blur-xl" />
                    <img
                      src={suelenFoto}
                      alt="Suélen, corretora de seguros responsável pela Coonecta"
                      width={288}
                      height={288}
                      loading="lazy"
                      decoding="async"
                      className="relative h-56 w-56 rounded-full object-cover shadow-xl ring-4 ring-white/40 sm:h-64 sm:w-64"
                    />
                  </div>
                  <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur ring-1 ring-white/20">
                    <Star className="h-3 w-3 fill-current" />
                    Sua corretora
                  </div>
                  <div className="mt-3 font-display text-2xl font-extrabold tracking-tight">
                    Suélen
                  </div>
                  <div className="text-xs text-white/75">
                    Corretora responsável · SUSEP autorizada
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="flex flex-col justify-center p-6 sm:p-10">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--brand-purple)]">
                  A corretora por trás da Coonecta
                </span>
                <h2 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-tight text-[var(--brand-blue)] sm:text-[32px]">
                  Proteção feita por quem se importa.
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  Sou a Suélen, corretora de seguros há mais de 6 anos e
                  responsável pela Coonecta Proteção Auto. Trabalho com as
                  principais seguradoras do país pra desenhar uma proteção sob
                  medida pra você — sem letras miúdas e com atendimento direto
                  comigo, do orçamento ao sinistro.
                </p>

                <ul className="mt-6 grid gap-2.5">
                  {BIO_HIGHLIGHTS.map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="flex items-center gap-3 text-sm text-[var(--brand-blue)]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-purple)]/10 text-[var(--brand-purple)] ring-1 ring-[var(--brand-purple)]/20">
                        <Icon className="h-4 w-4" />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <PrimaryCta label="Solicitar minha cotação" />
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.55_0.16_150)]" />
                    Sem compromisso · resposta em até 30 min
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* COBERTURAS */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-white/60 bg-white/55 p-5 shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--brand-blue)_30%,transparent)] backdrop-blur-xl sm:p-8"
          >
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--brand-purple)]">
                  Coberturas
                </span>
                <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-[var(--brand-blue)] sm:text-2xl">
                  Tudo que cuida de você na estrada
                </h2>
              </div>
              <span className="hidden text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block">
                Tudo incluso
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="group rounded-2xl border border-white/70 bg-white/70 p-4 transition-all hover:-translate-y-1 hover:scale-[1.02] hover:border-[var(--brand-purple)]/25 hover:shadow-elegant sm:p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-brand)] text-white shadow-sm">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="mt-3 font-display text-sm font-bold text-[var(--brand-blue)] sm:text-[15px]">
                    {title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-[12.5px]">
                    {desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* PROVA SOCIAL + CTA FINAL */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative isolate overflow-hidden rounded-3xl border border-white/60 bg-[image:var(--gradient-brand)] p-7 text-white shadow-[0_24px_70px_-25px_color-mix(in_oklab,var(--brand-purple)_55%,transparent)] sm:p-12"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 80% 20%, oklch(0.62 0.22 305 / 0.5), transparent 55%)",
              }}
            />
            <div className="relative grid gap-8 sm:grid-cols-[1.2fr_1fr] sm:items-center">
              <div>
                <div className="flex gap-0.5 text-white">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 font-display text-xl font-semibold leading-snug sm:text-2xl">
                  "Atendimento excelente. Em 1 dia já estava tudo resolvido, com
                  economia de quase 30% no meu seguro."
                </p>
                <div className="mt-3 text-sm text-white/75">
                  Marina R. · Cliente Coonecta desde 2024
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:items-end">
                <div className="text-sm text-white/80 sm:text-right">
                  Pronto pra proteger seu carro com quem realmente cuida?
                </div>
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-xl bg-white px-7 text-base font-bold text-[var(--brand-blue)] hover:bg-white/90"
                >
                  <Link to="/cotacao">
                    Fazer minha cotação
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <div className="flex items-center gap-1.5 text-xs text-white/70">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Atendimento direto com a Suélen
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* RODAPÉ MINIMAL */}
        <footer className="relative border-t border-[var(--brand-purple)]/10 bg-white/40 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:px-8">
            <div>
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span> <span className="font-extrabold tracking-wide text-[var(--brand-blue)]">COONECTA</span> Proteção Auto · Corretora responsável: Suélen
            </div>
            <Link
              to="/login"
              className="font-medium text-[var(--brand-purple)] underline-offset-4 hover:underline"
            >
              Acesso do corretor
            </Link>
          </div>
        </footer>
      </main>

      {/* FAB MOBILE — Fazer cotação */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:hidden"
        style={{
          backgroundImage:
            "linear-gradient(to top, oklch(0.985 0.005 270 / 0.95) 40%, oklch(0.985 0.005 270 / 0))",
        }}
      >
        <Link
          to="/cotacao"
          aria-label="Fazer cotação agora"
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[image:var(--gradient-brand)] px-6 text-base font-bold text-white shadow-[0_14px_40px_-10px_color-mix(in_oklab,var(--brand-purple)_65%,transparent)] ring-1 ring-white/20 backdrop-blur transition-all active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4" />
          Fazer cotação agora
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </div>
  );
}
