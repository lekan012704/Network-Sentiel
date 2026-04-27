import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, FileBarChart, Loader2, Radar, ShieldAlert, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — SentryScan" },
      { name: "description", content: "Browse your scan history, drill into vulnerabilities, and export reports." },
    ],
  }),
  component: ReportsPage,
});

const SEV_ORDER = ["critical", "high", "medium", "low", "info"] as const;
const SEV_COLORS: Record<string, string> = {
  critical: "var(--sev-critical)",
  high: "var(--sev-high)",
  medium: "var(--sev-medium)",
  low: "var(--sev-low)",
  info: "var(--sev-info)",
};

function ReportsPage() {
  const { user, loading } = useAuth();
  const [scans, setScans] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState<{ results: any[]; vulns: any[] } | null>(null);

  if (!loading && !user) throw redirect({ to: "/login" });

  useEffect(() => {
    if (!user) return;
    (async () => {
      setBusy(true);
      const { data } = await supabase.from("scans").select("*").order("created_at", { ascending: false });
      setScans(data ?? []);
      if (data && data.length) setSelected(data[0].id);
      setBusy(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!selected) { setDetails(null); return; }
    (async () => {
      const [{ data: results }, { data: vulns }] = await Promise.all([
        supabase.from("scan_results").select("*").eq("scan_id", selected).order("port"),
        supabase.from("vulnerabilities").select("*").eq("scan_id", selected),
      ]);
      setDetails({ results: results ?? [], vulns: vulns ?? [] });
    })();
  }, [selected]);

  const totals = useMemo(() => {
    const t = { critical: 0, high: 0, medium: 0, low: 0, info: 0 } as Record<string, number>;
    scans.forEach((s) => {
      const sm = s.severity_summary || {};
      SEV_ORDER.forEach((k) => (t[k] += Number(sm[k] ?? 0)));
    });
    return t;
  }, [scans]);

  const pieData = SEV_ORDER.map((k) => ({ name: k, value: totals[k] })).filter((d) => d.value > 0);
  const barData = scans.slice(0, 10).reverse().map((s) => ({
    name: s.target.length > 14 ? s.target.slice(0, 12) + "…" : s.target,
    open: s.open_port_count,
    vulns: s.vulnerability_count,
  }));

  const onDelete = async (id: string) => {
    if (!confirm("Delete this scan and its findings?")) return;
    await supabase.from("scans").delete().eq("id", id);
    setScans((cur) => cur.filter((s) => s.id !== id));
    if (selected === id) setSelected(null);
    toast.success("Scan deleted");
  };

  const exportJson = () => {
    if (!selected || !details) return;
    const scan = scans.find((s) => s.id === selected);
    const blob = new Blob(
      [JSON.stringify({ scan, results: details.results, vulnerabilities: details.vulns }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sentryscan-${scan?.target}-${selected.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container mx-auto max-w-7xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground">Browse your scan history and drill into findings.</p>
          </div>
          <Button asChild variant="cyber"><Link to="/dashboard"><Radar /> New scan</Link></Button>
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Severity distribution</h3>
            {pieData.length === 0 ? (
              <EmptyChart />
            ) : (
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                      {pieData.map((d) => (
                        <Cell key={d.name} fill={SEV_COLORS[d.name]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent scans</h3>
            {barData.length === 0 ? <EmptyChart /> : (
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="open" fill="var(--cyber-cyan)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="vulns" fill="var(--cyber-violet)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* History + detail */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-2xl border border-border/60 bg-card/60 p-3">
            <h3 className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">History</h3>
            {busy ? (
              <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : scans.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No scans yet. Run your first one from the dashboard.</p>
            ) : (
              <ul className="max-h-[600px] space-y-1 overflow-auto">
                {scans.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelected(s.id)}
                      className={`group w-full rounded-lg p-3 text-left transition-colors ${
                        selected === s.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-accent/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate font-mono text-sm">{s.target}</span>
                        <span className="ml-2 shrink-0 text-xs text-muted-foreground">{s.open_port_count} open</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {new Date(s.created_at).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-medium text-sev-high">
                          {s.vulnerability_count} CVEs
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="rounded-2xl border border-border/60 bg-card/60 p-5">
            {!selected || !details ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                <FileBarChart className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Select a scan to view its full report.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Target</p>
                    <p className="font-mono text-lg">{scans.find((s) => s.id === selected)?.target}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outlineGlow" size="sm" onClick={exportJson}><Download /> JSON</Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(selected)}><Trash2 className="text-sev-critical" /></Button>
                  </div>
                </div>

                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open ports</h4>
                <div className="mb-6 flex flex-wrap gap-2">
                  {details.results.filter((r) => r.state === "open").length === 0 ? (
                    <p className="text-sm text-muted-foreground">No open ports recorded.</p>
                  ) : (
                    details.results.filter((r) => r.state === "open").map((r) => (
                      <span key={r.port} className="rounded-md border border-primary/40 bg-primary/5 px-2 py-1 font-mono text-xs">
                        {r.port}/{r.protocol} <span className="text-muted-foreground">{r.service}</span>
                      </span>
                    ))
                  )}
                </div>

                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Findings ({details.vulns.length})
                </h4>
                {details.vulns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Clean — no known CVEs matched.</p>
                ) : (
                  <ul className="space-y-3">
                    {details.vulns.map((v) => (
                      <li key={v.id} className="rounded-lg border border-border/60 bg-background/60 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-xs text-muted-foreground">{v.cve_id}</span>
                          </div>
                          <SeverityBadge severity={v.severity} />
                        </div>
                        <h5 className="mt-2 text-sm font-semibold">{v.title}</h5>
                        <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
                        {v.recommendation && (
                          <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Recommendation</p>
                            <p className="mt-1 text-sm">{v.recommendation}</p>
                          </div>
                        )}
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {v.service ?? "—"} · port {v.port ?? "—"} · cvss {v.cvss_score ?? "—"} · {v.source}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 text-sm text-muted-foreground">
      Run a scan to see charts.
    </div>
  );
}
