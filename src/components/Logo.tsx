import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-cyber shadow-glow transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>
      <span className="text-lg">
        <span className="text-foreground">Sentry</span>
        <span className="text-gradient-cyber">Scan</span>
      </span>
    </Link>
  );
}
