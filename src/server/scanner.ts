import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Common ports we probe in the prototype.
const COMMON_PORTS: Array<{ port: number; service: string; protocol: "tcp" | "udp" }> = [
  { port: 21, service: "ftp", protocol: "tcp" },
  { port: 22, service: "ssh", protocol: "tcp" },
  { port: 23, service: "telnet", protocol: "tcp" },
  { port: 25, service: "smtp", protocol: "tcp" },
  { port: 53, service: "dns", protocol: "tcp" },
  { port: 80, service: "http", protocol: "tcp" },
  { port: 110, service: "pop3", protocol: "tcp" },
  { port: 143, service: "imap", protocol: "tcp" },
  { port: 443, service: "https", protocol: "tcp" },
  { port: 445, service: "smb", protocol: "tcp" },
  { port: 3306, service: "mysql", protocol: "tcp" },
  { port: 3389, service: "rdp", protocol: "tcp" },
  { port: 5432, service: "postgres", protocol: "tcp" },
  { port: 6379, service: "redis", protocol: "tcp" },
  { port: 8080, service: "http", protocol: "tcp" },
  { port: 8443, service: "https", protocol: "tcp" },
  { port: 8090, service: "http", protocol: "tcp" },
  { port: 27017, service: "mongodb", protocol: "tcp" },
];

const HTTP_PORTS = new Set([80, 8080, 8090]);
const HTTPS_PORTS = new Set([443, 8443]);

// Deterministic pseudo-random based on target so the same host gives the same mock.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seededRand(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export type ProbeResult = {
  port: number;
  service: string;
  protocol: "tcp" | "udp";
  state: "open" | "closed" | "filtered";
  banner: string | null;
  http_status: number | null;
  latency_ms: number;
};

const TargetSchema = z.object({
  target: z.string().trim().min(1).max(253).regex(
    /^[a-zA-Z0-9.\-:]+$/,
    "Target must be a hostname or IP (no protocol, no path)",
  ),
});

async function probeHttp(target: string, port: number, scheme: "http" | "https"): Promise<ProbeResult> {
  const url = `${scheme}://${target}:${port}/`;
  const start = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal, redirect: "manual" });
    clearTimeout(t);
    return {
      port,
      service: scheme,
      protocol: "tcp",
      state: "open",
      banner: res.headers.get("server") || res.headers.get("x-powered-by"),
      http_status: res.status,
      latency_ms: Date.now() - start,
    };
  } catch {
    return {
      port,
      service: scheme,
      protocol: "tcp",
      state: "closed",
      banner: null,
      http_status: null,
      latency_ms: Date.now() - start,
    };
  }
}

function mockProbe(target: string, port: number, service: string): ProbeResult {
  const r = seededRand(hash(`${target}:${port}`));
  // Probability of being open varies by service.
  const openWeight: Record<string, number> = {
    ssh: 0.55, ftp: 0.15, telnet: 0.05, smtp: 0.25, dns: 0.45,
    pop3: 0.1, imap: 0.1, smb: 0.18, mysql: 0.22, rdp: 0.18,
    postgres: 0.2, redis: 0.12, mongodb: 0.1, http: 0.4, https: 0.55,
  };
  const isOpen = r() < (openWeight[service] ?? 0.2);
  const banners: Record<string, string[]> = {
    ssh: ["OpenSSH 7.6p1 Ubuntu-4ubuntu0.7", "OpenSSH 8.2p1", "OpenSSH 9.0p1"],
    ftp: ["vsftpd 2.3.4", "vsftpd 3.0.3", "ProFTPD 1.3.5"],
    smtp: ["Postfix smtpd", "Sendmail 8.15.2", "Exim 4.94"],
    mysql: ["MySQL 5.5.40", "MariaDB 10.3.34", "MySQL 8.0.30"],
    redis: ["Redis 6.2.6", "Redis 5.0.7"],
    mongodb: ["MongoDB 4.4.6"],
    rdp: ["Microsoft RDP"],
    smb: ["Samba 4.10.7"],
    telnet: ["Linux telnetd"],
    postgres: ["PostgreSQL 12.9"],
  };
  const choices = banners[service];
  const banner = isOpen && choices ? choices[Math.floor(r() * choices.length)] : null;
  return {
    port,
    service,
    protocol: "tcp",
    state: isOpen ? "open" : "closed",
    banner,
    http_status: null,
    latency_ms: Math.floor(20 + r() * 180),
  };
}

export const runScan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TargetSchema.parse(input))
  .handler(async ({ data }) => {
    const target = data.target.toLowerCase();

    // Run probes in parallel.
    const probes = await Promise.all(
      COMMON_PORTS.map(async ({ port, service, protocol }) => {
        if (HTTP_PORTS.has(port)) return probeHttp(target, port, "http");
        if (HTTPS_PORTS.has(port)) return probeHttp(target, port, "https");
        return mockProbe(target, port, service);
      }),
    );

    return { target, results: probes };
  });
