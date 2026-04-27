import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Terminal, ShieldCheck, Database, Workflow } from "lucide-react";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — SentryScan" },
      { name: "description", content: "Learn how to scan, interpret findings, and export reports with SentryScan." },
      { property: "og:title", content: "SentryScan Docs" },
      { property: "og:description", content: "Quickstart and reference for the SentryScan prototype." },
    ],
  }),
  component: DocsPage,
});

const SECTIONS = [
  {
    icon: Terminal,
    title: "Quickstart",
    body: (
      <>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Create a free account from the home page.</li>
          <li>Open the <strong>Dashboard</strong> and enter a target hostname or IP.</li>
          <li>Optionally toggle <em>Enrich with live NVD</em> to pull additional CVEs.</li>
          <li>Click <strong>Run scan</strong> and wait a couple of seconds.</li>
          <li>Review open ports and matched CVEs. Open <strong>Reports</strong> to revisit results or export JSON.</li>
        </ol>
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "How scanning works",
    body: (
      <p className="text-sm text-muted-foreground">
        SentryScan uses a hybrid model: it performs real <code className="font-mono text-primary">fetch()</code> probes
        against HTTP/HTTPS endpoints (ports 80, 443, 8080, 8443, 8090) and uses deterministic simulation for the
        remaining common ports. This keeps the prototype fast, safe, and runnable from any browser without TCP socket
        access.
      </p>
    ),
  },
  {
    icon: Database,
    title: "CVE database",
    body: (
      <p className="text-sm text-muted-foreground">
        The curated catalog ships with ~25 well-known CVEs covering SSH, FTP, HTTP, SMB, RDP, MySQL, Redis, MongoDB,
        and more. When the live NVD toggle is on, we additionally query the public NVD API for fresh entries.
      </p>
    ),
  },
  {
    icon: Workflow,
    title: "Data model",
    body: (
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li><code className="font-mono text-primary">scans</code> — one row per scan, with severity summary.</li>
        <li><code className="font-mono text-primary">scan_results</code> — per-port probe results.</li>
        <li><code className="font-mono text-primary">vulnerabilities</code> — matched CVEs for a given scan.</li>
        <li><code className="font-mono text-primary">cve_database</code> — public catalog (read-only for users).</li>
      </ul>
    ),
  },
];

function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-card/30">
          <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Documentation</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Get up and running in minutes</h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Everything you need to run scans, understand findings, and export reports.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-3xl px-4 py-16">
          <div className="space-y-6">
            {SECTIONS.map((s) => (
              <article key={s.title} className="rounded-2xl border border-border/60 bg-card/60 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-semibold">{s.title}</h2>
                </div>
                {s.body}
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
