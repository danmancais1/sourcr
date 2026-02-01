-- Signals data source: watchlist, signals store, optional run logging.
-- Companies House connector and future signal sources.

-- Watchlist: companies to monitor (seed list). MVP: workspace_id nullable.
CREATE TABLE IF NOT EXISTS public.watchlist_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
  company_number text NOT NULL,
  company_name text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- MVP: unique per company_number (single global watchlist when workspace_id is null).
CREATE UNIQUE INDEX IF NOT EXISTS idx_watchlist_companies_company_number
  ON public.watchlist_companies (company_number);

CREATE INDEX IF NOT EXISTS idx_watchlist_companies_enabled
  ON public.watchlist_companies (enabled) WHERE enabled = true;

ALTER TABLE public.watchlist_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage watchlist_companies" ON public.watchlist_companies;
CREATE POLICY "Service role can manage watchlist_companies" ON public.watchlist_companies
  FOR ALL USING (true) WITH CHECK (true);

-- Signal events: standardised signal store from connectors (Companies House etc.).
-- Distinct from public.signals (lead-level signals). Idempotent by source + source_id.
CREATE TABLE IF NOT EXISTS public.signal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
  source text NOT NULL,
  source_id text NOT NULL,
  category text NOT NULL,
  headline text NOT NULL,
  occurred_at timestamptz NOT NULL,
  company_number text NOT NULL,
  company_name text NOT NULL,
  confidence int NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  raw jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Idempotency: one row per source + source_id (MVP: global).
CREATE UNIQUE INDEX IF NOT EXISTS idx_signal_events_source_source_id
  ON public.signal_events (source, source_id);

CREATE INDEX IF NOT EXISTS idx_signal_events_company_number ON public.signal_events (company_number);
CREATE INDEX IF NOT EXISTS idx_signal_events_category ON public.signal_events (category);
CREATE INDEX IF NOT EXISTS idx_signal_events_occurred_at ON public.signal_events (occurred_at DESC);

ALTER TABLE public.signal_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage signal_events" ON public.signal_events;
CREATE POLICY "Service role can manage signal_events" ON public.signal_events
  FOR ALL USING (true) WITH CHECK (true);

-- Optional: job run logging.
CREATE TABLE IF NOT EXISTS public.signal_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  processed_count int NOT NULL DEFAULT 0,
  created_signals int NOT NULL DEFAULT 0,
  errors jsonb DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_signal_runs_source_started
  ON public.signal_runs (source, started_at DESC);

ALTER TABLE public.signal_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage signal_runs" ON public.signal_runs;
CREATE POLICY "Service role can manage signal_runs" ON public.signal_runs
  FOR ALL USING (true) WITH CHECK (true);
