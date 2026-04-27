import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ShieldCheck, Target, Code2, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SentryScan" },
      { name: "description", content: "SentryScan is a final-year project prototype demonstrating a modern, web-based port scanning and vulnerability analysis system." },
      { property: "og:title", content: "About SentryScan" },
      { property: "og:description", content: "A modern web-based port scanning & vulnerability analysis system." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-cyber-grid opacity-50" aria-hidden />
          <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">About</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Built to make security <span className="text-gradient-cyber">approachable</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              SentryScan is a final-year engineering project demonstrating how modern web technologies can deliver
              enterprise-grade security tooling — fast, beautiful, and easy to use.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { icon: GraduationCap, title: "Academic context", text: "Developed as a final-year project to explore vulnerability assessment, RLS-secured backends, and modern UX." },
              { icon: Target, title: "What it does", text: "Probes common ports on any host, fingerprints services, and matches them against a curated CVE database." },
              { icon: Code2, title: "Tech stack", text: "TanStack Start (React 19 + Vite 7), TypeScript, Tailwind v4, Lovable Cloud (Postgres + auth + RLS), Recharts." },
              { icon: ShieldCheck, title: "Ethical use", text: "Only scan hosts you own or are explicitly authorized to test. SentryScan is not a substitute for a professional pentest." },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-border/60 bg-card/60 p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
