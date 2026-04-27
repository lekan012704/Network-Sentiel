import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SentryScan" },
      { name: "description", content: "Get in touch with the SentryScan team for sales, support, or partnerships." },
      { property: "og:title", content: "Contact SentryScan" },
      { property: "og:description", content: "Sales, support, or partnerships — we'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

const Schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(5).max(2000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    toast.success("Message received — we'll be in touch within 24 hours.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Contact</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Let's <span className="text-gradient-cyber">talk security</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Whether you're evaluating SentryScan for your team or curious about the project, drop us a line.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: Mail, title: "Email", value: "hello@sentryscan.dev" },
                { icon: MessageSquare, title: "Live chat", value: "Mon–Fri, 9am–6pm CET" },
              ].map((c) => (
                <div key={c.title} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <c.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.title}</p>
                    <p className="text-sm font-medium">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-elevated">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100}
                  className="input" />
              </Field>
              <Field label="Email">
                <input type="email" required maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input" />
              </Field>
            </div>
            <Field label="Message">
              <textarea required minLength={5} maxLength={2000} rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input resize-none" />
            </Field>
            <Button type="submit" variant="cyber" size="lg" className="mt-2 w-full" disabled={busy}>
              <Send /> Send message
            </Button>
            <style>{`.input{width:100%;border-radius:0.375rem;border:1px solid var(--input);background:var(--background);padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--primary);box-shadow:0 0 0 2px color-mix(in oklab, var(--primary) 30%, transparent)}`}</style>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-3 block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
