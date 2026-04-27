import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-cyber">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-cyber px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SentryScan — Port Scanning & Vulnerability Analysis" },
      {
        name: "description",
        content:
          "Find open ports and known vulnerabilities across your infrastructure in seconds. SentryScan delivers fast, accurate, and beautiful security reports.",
      },
      { name: "author", content: "SentryScan" },
      { property: "og:title", content: "SentryScan — Port Scanning & Vulnerability Analysis" },
      {
        property: "og:description",
        content:
          "Find open ports and known vulnerabilities across your infrastructure in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SentryScan — Port Scanning & Vulnerability Analysis" },
      { name: "description", content: "Network Sentinel is a web-based system for port scanning and network vulnerability analysis." },
      { property: "og:description", content: "Network Sentinel is a web-based system for port scanning and network vulnerability analysis." },
      { name: "twitter:description", content: "Network Sentinel is a web-based system for port scanning and network vulnerability analysis." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/52a4d852-5bf6-4956-a016-ea59d6e1e0b5/id-preview-9e3b2648--db2d21ee-4624-473a-94e3-2b93de69db41.lovable.app-1777059106782.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/52a4d852-5bf6-4956-a016-ea59d6e1e0b5/id-preview-9e3b2648--db2d21ee-4624-473a-94e3-2b93de69db41.lovable.app-1777059106782.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <Toaster richColors closeButton position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}
