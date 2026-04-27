import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck, Zap, Radar, Server, Lock, Eye, Globe, ArrowRight, Check,
  TerminalSquare, Activity, FileBarChart,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/SeverityBadge";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <LogoCloud />
        <Features />
        <DemoTerminal />
        <Stats />
        <Pricing />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid animate-grid-flow opacity-60" aria-hidden />
      <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
      <div className="absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" aria-hidden />

      <div className="container relative mx-auto max-w-7xl px-4 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-mono text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live · 1,247 scans completed today
          </div>

          <h1 className="mt-6 animate-slide-up text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            See every open port.{" "}
            <span className="text-gradient-cyber">Stop every threat.</span>
          </h1>

          <p className="mt-6 animate-slide-up text-lg text-muted-foreground md:text-xl">
            SentryScan combines lightning-fast port discovery with a curated CVE database to surface
            the vulnerabilities that actually matter — in seconds, not hours.
          </p>

          <div className="mt-10 flex animate-slide-up flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="cyber" size="xl">
              <Link to="/signup">Start free scan <ArrowRight /></Link>
            </Button>
            <Button asChild variant="outlineGlow" size="xl">
              <Link to="/dashboard"><Radar /> Live demo</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required · Free tier includes 50 scans/month
          </p>
        </div>

        {/* Hero scanner mock */}
        <div className="mx-auto mt-16 max-w-5xl animate-fade-in">
          <div className="relative rounded-2xl border border-border/60 bg-card/60 p-2 shadow-elevated backdrop-blur">
            <div className="overflow-hidden rounded-xl border border-border/40 bg-background/80">
              <div className="flex items-center gap-2 border-b border-border/40 bg-card/40 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-sev-critical/70" />
                  <span className="h-3 w-3 rounded-full bg-sev-medium/70" />
                  <span className="h-3 w-3 rounded-full bg-sev-low/70" />
                </div>
                <span className="ml-2 font-mono text-xs text-muted-foreground">sentryscan ~ scan in progress</span>
              </div>

              <div className="grid gap-0 md:grid-cols-[1fr_320px]">
                <div className="relative overflow-hidden p-6 font-mono text-sm">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground">$ sentryscan run --target acme-corp.com</p>
                    <p className="text-primary">▸ Resolving DNS… <span className="text-foreground">203.0.113.42</span></p>
                    <p className="text-primary">▸ Probing common ports…</p>
                    <p className="pl-4 text-foreground">22/tcp   open    ssh        OpenSSH 7.6p1</p>
                    <p className="pl-4 text-foreground">80/tcp   open    http       nginx 1.18.0</p>
                    <p className="pl-4 text-foreground">443/tcp  open    https      nginx 1.18.0</p>
                    <p className="pl-4 text-foreground">3306/tcp open    mysql      MySQL 5.5.40</p>
                    <p className="pl-4 text-muted-foreground">8080/tcp closed</p>
                    <p className="text-primary">▸ Matching CVE database…</p>
                    <p className="text-foreground">
                      Found <span className="text-sev-critical">3 critical</span>,{" "}
                      <span className="text-sev-high">5 high</span>, 7 medium issues
                    </p>
                    <p className="text-foreground terminal-cursor">▸ Generating report</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border/40 bg-card/40 p-6 md:border-l md:border-t-0">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Latest findings</h4>
                  {[
                    { sev: "critical", title: "OpenSSH regreSSHion RCE", port: 22 },
                    { sev: "critical", title: "MySQL auth bypass", port: 3306 },
                    { sev: "high", title: "Outdated TLS suite", port: 443 },
                  ].map((v) => (
                    <div key={v.title} className="rounded-lg border border-border/60 bg-background/60 p-3">
                      <div className="flex items-center justify-between">
                        <SeverityBadge severity={v.sev} />
                        <span className="font-mono text-xs text-muted-foreground">:{v.port}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium">{v.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoCloud() {
  const items = ["NVD", "CVE", "MITRE ATT&CK", "OWASP", "ISO 27001", "SOC 2"];
  return (
    <section className="border-y border-border/40 bg-card/30 py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Backed by industry-standard intelligence
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {items.map((i) => (
            <span key={i} className="font-mono text-sm tracking-wider text-muted-foreground">{i}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Radar, title: "Hybrid scanning", desc: "Smart simulation plus real HTTP/HTTPS reachability checks. No agents, no installs.", color: "text-primary" },
  { icon: ShieldCheck, title: "Curated CVE database", desc: "Hand-picked CVEs mapped to services & ports. Optionally enrich with live NVD lookups.", color: "text-accent" },
  { icon: Zap, title: "Sub-second results", desc: "Animated scan progress with results streaming in as ports respond.", color: "text-primary" },
  { icon: FileBarChart, title: "Beautiful reports", desc: "Severity charts, exec summaries, and one-click JSON export. Built for stakeholders.", color: "text-accent" },
  { icon: Lock, title: "Owner-only access", desc: "Per-user RLS in the database. Your scans are never visible to anyone else.", color: "text-primary" },
  { icon: Activity, title: "Continuous monitoring", desc: "Re-run scans on a schedule and get notified the moment a new CVE matches.", color: "text-accent" },
];

function Features() {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to <span className="text-gradient-cyber">harden your perimeter</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Purpose-built for security engineers, devops teams, and the next generation of pentesters.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoTerminal() {
  return (
    <section className="border-y border-border/40 bg-card/30 py-24">
      <div className="container mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Built for engineers</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            From DNS to CVE in <span className="text-gradient-cyber">three steps</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Point SentryScan at any host. We resolve, probe, fingerprint services, and cross-reference
            our curated CVE catalog. You get an actionable report — not a wall of text.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Drop in any domain or IP — we handle the rest",
              "Real fetch() probes against HTTP/HTTPS endpoints",
              "Severity-scored findings with remediation steps",
              "Export reports as JSON for your CI pipeline",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm text-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-2xl bg-gradient-cyber opacity-20 blur-2xl" aria-hidden />
          <div className="relative rounded-xl border border-border/60 bg-background/80 p-5 font-mono text-xs shadow-elevated">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <TerminalSquare className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">api/scan.json</span>
            </div>
            <pre className="mt-3 overflow-x-auto leading-relaxed text-foreground/90">
{`{
  "target": "acme-corp.com",
  "ip": "203.0.113.42",
  "open_ports": [22, 80, 443, 3306],
  "vulnerabilities": [
    {
      "cve": "CVE-2024-6387",
      "severity": "critical",
      "cvss": 8.1,
      "service": "ssh",
      "port": 22
    },
    {
      "cve": "CVE-2012-2122",
      "severity": "high",
      "cvss": 7.5,
      "service": "mysql",
      "port": 3306
    }
  ],
  "summary": { "critical": 1, "high": 1, "medium": 0 }
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "180k+", label: "ports scanned" },
    { value: "25+", label: "curated CVEs" },
    { value: "<2s", label: "median scan time" },
    { value: "99.9%", label: "uptime" },
  ];
  return (
    <section className="py-20">
      <div className="container mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-card/40 p-6 text-center">
            <p className="text-3xl font-bold text-gradient-cyber md:text-4xl">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "For students, hobbyists, and demos.",
    features: ["50 scans / month", "Curated CVE database", "JSON export", "Community support"],
    cta: "Start free",
    variant: "outlineGlow" as const,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For security engineers and small teams.",
    features: ["Unlimited scans", "Live NVD enrichment", "Scheduled monitoring", "Email alerts", "PDF reports"],
    cta: "Start 14-day trial",
    variant: "cyber" as const,
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For organizations with compliance needs.",
    features: ["SSO / SAML", "RBAC & audit logs", "Dedicated CVE feeds", "On-prem deployment", "24/7 SLA"],
    cta: "Contact sales",
    variant: "outlineGlow" as const,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="border-y border-border/40 bg-card/30 py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Simple, <span className="text-gradient-cyber">transparent pricing</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Pay only for what you scan. Cancel anytime.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-8 transition-all ${
                p.highlight
                  ? "border-primary/60 bg-card shadow-glow lg:-translate-y-2"
                  : "border-border/60 bg-card/60 hover:border-primary/40"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-cyber px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant={p.variant} className="mt-8 w-full" size="lg">
                <Link to="/signup">{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card/60 p-12 text-center shadow-glow">
          <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
          <div className="absolute -top-20 left-1/2 h-60 w-[40rem] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" aria-hidden />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to find what you've been missing?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Join thousands of teams using SentryScan to harden their attack surface.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="cyber" size="xl">
                <Link to="/signup">Run your first scan <ArrowRight /></Link>
              </Button>
              <Button asChild variant="outlineGlow" size="xl">
                <Link to="/docs">Read the docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
