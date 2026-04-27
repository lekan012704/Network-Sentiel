type Severity = "critical" | "high" | "medium" | "low" | "info";

const STYLES: Record<Severity, string> = {
  critical: "bg-sev-critical/15 text-sev-critical border-sev-critical/40",
  high: "bg-sev-high/15 text-sev-high border-sev-high/40",
  medium: "bg-sev-medium/15 text-sev-medium border-sev-medium/40",
  low: "bg-sev-low/15 text-sev-low border-sev-low/40",
  info: "bg-sev-info/15 text-sev-info border-sev-info/40",
};

export function SeverityBadge({ severity }: { severity: string }) {
  const sev = (["critical", "high", "medium", "low", "info"].includes(severity)
    ? severity
    : "info") as Severity;
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-semibold uppercase tracking-wider ${STYLES[sev]}`}>
      {sev}
    </span>
  );
}
