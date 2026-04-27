import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Radar, ShieldAlert, ShieldCheck, Target, Activity } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { runScan } from "@/server/scanner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SentryScan" },
      { name: "description", content: "Run port scans, see open services, and surface known CVEs in real time." },
    ],
  }),
  component: DashboardPage,
});

const TargetSchema = z.string().trim().min(1).max(253).regex(
  /^[a-zA-Z0-9.\-:]+$/,
  "Target must be a hostname or IP, no protocol or path.",
);

type Stage = "idle" | "resolving" | "probing" | "matching" | "saving" | "done";

function severityFromCvss(score: number | null | undefined): "critical" | "high" | "medium" | "low" | "info" {
  if (score == null) return "info";
  if (score >= 9) return "critical";
  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  if (score > 0) return "low";
  return "info";
}

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const runScanFn = useServerFn(runScan);

  const [target, setTarget] = useState("scanme.nmap.org");
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [vulns, setVulns] = useState<any[]>([]);
  const [enrichLive, setEnrichLive] = useState(false);

  if (!loading && !user) {
    throw redirect({ to: "/login" });
  }

  const onScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = TargetSchema.safeParse(target);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid target");
    if (!user) return;

    setResults([]);
    setVulns([]);
    setStage("resolving");
    setProgress(10);

    // Animated stages
    await new Promise((r) => setTimeout(r, 500));
    setStage("probing");
    setProgress(35);

    let scanData: { target: string; results: any[] };
    try {
      scanData = await runScanFn({ data: { target: parsed.data } });
    } catch (err: any) {
      setStage("idle"); setProgress(0);
      return toast.error(err?.message || "Scan failed");
    }
    setResults(scanData.results);
    setProgress(60);

    setStage("matching");
    const openResults = scanData.results.filter((r) => r.state === "open");
    const services = Array.from(new Set(openResults.map((r) => r.service)));
    const ports = Array.from(new Set(openResults.map((r) => r.port)));

    let cves: any[] = [];
    if (services.length || ports.length) {
      const { data: matches } = await supabase
        .from("cve_database")
        .select("*")
        .or(`service.in.(${services.map((s) => `"${s}"`).join(",")}),port.in.(${ports.join(",")})`);
      cves = (matches ?? []).filter(
        (c) => services.includes(c.service) || ports.includes(c.port),
      );
    }

    // Optional NVD enrichment (best-effort)
    if (enrichLive && services.length) {
      try {
        const extras = await fetchNvd(services[0]);
        cves = [...cves, ...extras];
      } catch {}
    }

    setVulns(cves);
    setProgress(85);

    // Persist
    setStage("saving");
    const summary = { critical: 0, high: 0, medium: 0, low: 0, info: 0 } as Record<string, number>;
    cves.forEach((c) => { summary[c.severity] = (summary[c.severity] ?? 0) + 1; });

    const { data: scan, error: scanErr } = await supabase
      .from("scans")
      .insert({
        user_id: user.id,
        target: scanData.target,
        status: "completed",
        port_count: scanData.results.length,
        open_port_count: openResults.length,
        vulnerability_count: cves.length,
        severity_summary: summary,
        scan_type: "hybrid",
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (scanErr || !scan) {
      setStage("done"); setProgress(100);
      toast.error("Scan complete but couldn't save: " + (scanErr?.message ?? "unknown"));
      return;
    }

    if (scanData.results.length) {
      await supabase.from("scan_results").insert(
        scanData.results.map((r) => ({
          scan_id: scan.id,
          user_id: user.id,
          port: r.port,
          protocol: r.protocol,
          service: r.service,
          state: r.state,
          banner: r.banner,
          http_status: r.http_status,
          latency_ms: r.latency_ms,
        })),
      );
    }
    if (cves.length) {
      await supabase.from("vulnerabilities").insert(
        cves.map((c) => ({
          scan_id: scan.id,
          user_id: user.id,
          cve_id: c.cve_id,
          title: c.title,
          description: c.description,
          severity: c.severity,
          cvss_score: c.cvss_score,
          port: c.port,
          service: c.service,
          source: c.source ?? "curated",
          recommendation: c.recommendation,
        })),
      );
    }

    setProgress(100);
    setStage("done");
    toast.success(`Scan complete · ${cves.length} findings`);
  };

  const openCount = results.filter((r) => r.state === "open").length;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container mx-auto max-w-7xl flex-1 px-4 py-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Scanner</h1>
            <p className="text-sm text-muted-foreground">Run a hybrid port scan against any host you own or control.</p>
          </div>
          <Button asChild variant="outlineGlow"><Link to="/reports">View past reports</Link></Button>
        </div>

        {/* Scan form */}
        <form onSubmit={onScan} className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-elevated">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Target</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center rounded-md border border-input bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
              <Target className="mr-2 h-4 w-4 text-muted-foreground" />
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="example.com or 203.0.113.42"
                className="w-full bg-transparent py-2 font-mono text-sm focus:outline-none"
              />
            </div>
            <label className="inline-flex select-none items-center gap-2 rounded-md border border-border/60 bg-background px-3 text-xs">
              <input type="checkbox" checked={enrichLive} onChange={(e) => setEnrichLive(e.target.checked)} className="accent-primary" />
              Enrich with live NVD
            </label>
            <Button type="submit" variant="cyber" size="lg" disabled={stage !== "idle" && stage !== "done"}>
              {stage !== "idle" && stage !== "done" ? <Loader2 className="animate-spin" /> : <Radar />}
              {stage !== "idle" && stage !== "done" ? "Scanning…" : "Run scan"}
            </Button>
          </div>

          {stage !== "idle" && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">stage: {stage}</span>
                <span>{progress}%</span>
              </div>
              <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="absolute inset-y-0 left-0 bg-gradient-cyber transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </form>

        {/* KPI cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Kpi icon={Activity} label="Ports probed" value={results.length} />
          <Kpi icon={Radar} label="Open ports" value={openCount} accent />
          <Kpi icon={ShieldAlert} label="Vulnerabilities" value={vulns.length} danger={vulns.length > 0} />
        </div>

        {/* Results */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Port results" icon={Radar} subtitle={results.length ? `${results.length} probed` : "Run a scan to see results"}>
            {results.length === 0 ? (
              <Empty text="No scan yet — try scanme.nmap.org or your own host." />
            ) : (
              <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Port</th>
                      <th className="px-3 py-2 text-left">Service</th>
                      <th className="px-3 py-2 text-left">State</th>
                      <th className="px-3 py-2 text-left">Banner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-mono">
                    {results.map((r) => (
                      <tr key={r.port} className={r.state === "open" ? "bg-primary/5" : ""}>
                        <td className="px-3 py-2">{r.port}/{r.protocol}</td>
                        <td className="px-3 py-2">{r.service}</td>
                        <td className="px-3 py-2">
                          <span className={r.state === "open" ? "text-primary" : "text-muted-foreground"}>
                            ● {r.state}
                          </span>
                        </td>
                        <td className="max-w-[14rem] truncate px-3 py-2 text-xs text-muted-foreground">{r.banner ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Vulnerabilities" icon={ShieldAlert} subtitle={vulns.length ? `${vulns.length} matched` : "Findings will appear here"}>
            {vulns.length === 0 ? (
              <Empty text={results.length ? "No known CVEs matched the open services. Nice." : "Awaiting scan results."} />
            ) : (
              <ul className="space-y-3">
                {vulns.map((v, i) => (
                  <li key={`${v.cve_id}-${i}`} className="rounded-lg border border-border/60 bg-background/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{v.cve_id}</span>
                      <SeverityBadge severity={v.severity ?? severityFromCvss(v.cvss_score)} />
                    </div>
                    <p className="mt-1 text-sm font-medium">{v.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{v.description}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {v.service} · port {v.port} · cvss {v.cvss_score ?? "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {stage === "done" && (
              <div className="mt-4 flex justify-end">
                <Button variant="outlineGlow" size="sm" onClick={() => navigate({ to: "/reports" })}>
                  Open in reports →
                </Button>
              </div>
            )}
          </Panel>
        </div>
      </main>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent, danger }: { icon: any; label: string; value: number; accent?: boolean; danger?: boolean }) {
  return (
    <div className={`rounded-xl border bg-card/60 p-5 ${danger ? "border-sev-critical/40" : accent ? "border-primary/40 shadow-glow" : "border-border/60"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${danger ? "text-sev-critical" : accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Panel({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-elevated">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">{title}</h2>
        {subtitle && <span className="ml-auto text-xs text-muted-foreground">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 py-10 text-center">
      <ShieldCheck className="mb-2 h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

async function fetchNvd(service: string): Promise<any[]> {
  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(service)}&resultsPerPage=5`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as any;
  return (json?.vulnerabilities ?? []).slice(0, 5).map((v: any) => {
    const cve = v.cve;
    const metric = cve.metrics?.cvssMetricV31?.[0]?.cvssData ?? cve.metrics?.cvssMetricV30?.[0]?.cvssData;
    return {
      cve_id: cve.id,
      title: cve.descriptions?.[0]?.value?.slice(0, 90) ?? cve.id,
      description: cve.descriptions?.[0]?.value ?? "",
      severity: severityFromCvss(metric?.baseScore),
      cvss_score: metric?.baseScore ?? null,
      service,
      port: null,
      source: "nvd",
      recommendation: "Review the official advisory linked at nvd.nist.gov.",
    };
  });
}
