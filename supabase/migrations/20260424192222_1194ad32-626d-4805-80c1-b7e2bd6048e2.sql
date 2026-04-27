
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Scans table
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  port_count INTEGER NOT NULL DEFAULT 0,
  open_port_count INTEGER NOT NULL DEFAULT 0,
  vulnerability_count INTEGER NOT NULL DEFAULT 0,
  severity_summary JSONB NOT NULL DEFAULT '{"critical":0,"high":0,"medium":0,"low":0,"info":0}'::jsonb,
  scan_type TEXT NOT NULL DEFAULT 'hybrid',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own scans"  ON public.scans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scans" ON public.scans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own scans" ON public.scans FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own scans" ON public.scans FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX scans_user_id_idx ON public.scans(user_id, created_at DESC);

-- Scan results (per port)
CREATE TABLE public.scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  port INTEGER NOT NULL,
  protocol TEXT NOT NULL DEFAULT 'tcp',
  service TEXT,
  state TEXT NOT NULL,
  banner TEXT,
  http_status INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own results"   ON public.scan_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own results" ON public.scan_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own results" ON public.scan_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX scan_results_scan_idx ON public.scan_results(scan_id);

-- Vulnerabilities
CREATE TABLE public.vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cve_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL,
  cvss_score NUMERIC(3,1),
  port INTEGER,
  service TEXT,
  source TEXT NOT NULL DEFAULT 'curated',
  recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vulnerabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own vulns"   ON public.vulnerabilities FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own vulns" ON public.vulnerabilities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own vulns" ON public.vulnerabilities FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX vulns_scan_idx ON public.vulnerabilities(scan_id);

-- Public CVE catalog
CREATE TABLE public.cve_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cve_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  cvss_score NUMERIC(3,1),
  service TEXT NOT NULL,
  port INTEGER,
  recommendation TEXT,
  references_urls TEXT[],
  published_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cve_database ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CVE catalog is public" ON public.cve_database FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX cve_service_idx ON public.cve_database(service);
CREATE INDEX cve_port_idx ON public.cve_database(port);
