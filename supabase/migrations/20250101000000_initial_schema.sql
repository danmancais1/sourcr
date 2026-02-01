-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('investor', 'seller')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workspaces (multi-tenant)
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workspace members
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);

-- API keys (per-workspace, encrypted in app; we store which keys are set)
CREATE TABLE public.workspace_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  key_type TEXT NOT NULL CHECK (key_type IN ('companies_house', 'epc', 'resend', 'twilio')),
  is_valid BOOLEAN NOT NULL DEFAULT false,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, key_type)
);

-- Owners (lead/contact entity)
CREATE TABLE public.owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_number TEXT,
  consent_status TEXT NOT NULL DEFAULT 'unknown' CHECK (consent_status IN ('unknown', 'consented', 'opted_out')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_owners_workspace ON public.owners(workspace_id);

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT,
  postcode TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_workspace ON public.properties(workspace_id);
CREATE INDEX idx_properties_postcode ON public.properties(postcode);

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
  pipeline_stage TEXT NOT NULL DEFAULT 'new' CHECK (pipeline_stage IN ('new', 'contacted', 'viewing', 'offer', 'won', 'lost')),
  title TEXT,
  notes TEXT,
  score INTEGER,
  breakdown_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_workspace ON public.leads(workspace_id);
CREATE INDEX idx_leads_pipeline ON public.leads(workspace_id, pipeline_stage);

-- Signals (manual or from integrations)
CREATE TABLE public.signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 5),
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_signals_lead ON public.signals(lead_id);

-- Templates (letters, email, SMS)
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('letter', 'email', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_templates_workspace ON public.templates(workspace_id);

-- Campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  b2b_confirmed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'paused', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaigns_workspace ON public.campaigns(workspace_id);

-- Campaign steps (which lead/owner gets which message)
CREATE TABLE public.campaign_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaign_steps_campaign ON public.campaign_steps(campaign_id);

-- Outbox (audit of sent messages)
CREATE TABLE public.outbox_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('letter', 'email', 'sms')),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('owner', 'landlord')),
  recipient_id UUID,
  to_email TEXT,
  to_phone TEXT,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

CREATE INDEX idx_outbox_workspace ON public.outbox_messages(workspace_id);
CREATE INDEX idx_outbox_sent_at ON public.outbox_messages(sent_at);

-- Suppression list
CREATE TABLE public.suppression_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, email),
  UNIQUE(workspace_id, phone)
);

CREATE INDEX idx_suppression_workspace ON public.suppression_list(workspace_id);

-- Audit log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_workspace ON public.audit_log(workspace_id);

-- Landlord submissions (public Quiet Sale form)
CREATE TABLE public.landlord_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT,
  postcode TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_landlord_submissions_token ON public.landlord_submissions(public_token);

-- Investor buy box (investor interest criteria / inbox)
CREATE TABLE public.investor_buy_box (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  postcodes TEXT[],
  min_beds INTEGER,
  max_price INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_investor_buy_box_workspace ON public.investor_buy_box(workspace_id);

-- Matches (landlord submission matched to investor)
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_submission_id UUID NOT NULL REFERENCES public.landlord_submissions(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  investor_buy_box_id UUID REFERENCES public.investor_buy_box(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'viewing', 'offer', 'won', 'lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_workspace ON public.matches(workspace_id);
CREATE INDEX idx_matches_submission ON public.matches(landlord_submission_id);

-- Messages (investor <-> landlord thread)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('investor', 'landlord', 'system')),
  sender_workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_match ON public.messages(match_id);

-- cache_http for API response caching
CREATE TABLE public.cache_http (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cache_http_key ON public.cache_http(cache_key);
CREATE INDEX idx_cache_http_expires ON public.cache_http(expires_at);

-- PPD transactions (Land Registry Price Paid Data)
CREATE TABLE public.ppd_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id TEXT NOT NULL,
  price INTEGER NOT NULL,
  transfer_date DATE NOT NULL,
  postcode TEXT NOT NULL,
  property_type TEXT,
  paon TEXT,
  saon TEXT,
  street TEXT,
  locality TEXT,
  town TEXT,
  district TEXT,
  county TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ppd_postcode ON public.ppd_transactions(postcode);
CREATE INDEX idx_ppd_transfer_date ON public.ppd_transactions(transfer_date);
CREATE UNIQUE INDEX idx_ppd_transaction_id ON public.ppd_transactions(transaction_id);

-- Daily send count (for limits: Starter 25, Pro 200)
CREATE TABLE public.daily_send_count (
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  date_utc DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (workspace_id, date_utc)
);

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS: enable on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlord_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_buy_box ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_http ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppd_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_send_count ENABLE ROW LEVEL SECURITY;

-- Helper: user's workspace IDs
CREATE OR REPLACE FUNCTION public.user_workspace_ids(user_uuid UUID)
RETURNS SETOF UUID AS $$
  SELECT workspace_id FROM public.workspace_members WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS policies: profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS: workspaces (members only)
CREATE POLICY "Members can read workspace" ON public.workspaces FOR SELECT
  USING (id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can update workspace" ON public.workspaces FOR UPDATE
  USING (id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Authenticated can create workspace" ON public.workspaces FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS: workspace_members
CREATE POLICY "Members can read workspace_members" ON public.workspace_members FOR SELECT
  USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can insert workspace_members" ON public.workspace_members FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));

-- RLS: workspace_api_keys
CREATE POLICY "Members can manage api_keys" ON public.workspace_api_keys FOR ALL
  USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));

-- RLS: owners, properties, leads, signals, templates, campaigns, campaign_steps, outbox, suppression, audit_log
CREATE POLICY "Members can manage owners" ON public.owners FOR ALL USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can manage properties" ON public.properties FOR ALL USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can manage leads" ON public.leads FOR ALL USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can manage signals" ON public.signals FOR ALL USING (
  lead_id IN (SELECT id FROM public.leads WHERE workspace_id IN (SELECT public.user_workspace_ids(auth.uid())))
);
CREATE POLICY "Members can manage templates" ON public.templates FOR ALL USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can manage campaigns" ON public.campaigns FOR ALL USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can manage campaign_steps" ON public.campaign_steps FOR ALL USING (
  campaign_id IN (SELECT id FROM public.campaigns WHERE workspace_id IN (SELECT public.user_workspace_ids(auth.uid())))
);
CREATE POLICY "Members can read outbox" ON public.outbox_messages FOR SELECT USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can insert outbox" ON public.outbox_messages FOR INSERT WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can manage suppression_list" ON public.suppression_list FOR ALL USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can read audit_log" ON public.audit_log FOR SELECT USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can insert audit_log" ON public.audit_log FOR INSERT WITH CHECK (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));

-- Landlord submissions: anon can insert (public form), service role or match workspace can read
CREATE POLICY "Anyone can create landlord_submissions" ON public.landlord_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Members can read matched submissions" ON public.landlord_submissions FOR SELECT USING (
  id IN (SELECT landlord_submission_id FROM public.matches WHERE workspace_id IN (SELECT public.user_workspace_ids(auth.uid())))
);

-- Investor buy box, matches, messages
CREATE POLICY "Members can manage investor_buy_box" ON public.investor_buy_box FOR ALL USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can manage matches" ON public.matches FOR ALL USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can manage messages" ON public.messages FOR ALL USING (
  match_id IN (SELECT id FROM public.matches WHERE workspace_id IN (SELECT public.user_workspace_ids(auth.uid())))
);

-- cache_http: any authenticated user in a workspace can read/write (we key by workspace in app)
CREATE POLICY "Authenticated can manage cache_http" ON public.cache_http FOR ALL USING (auth.role() = 'authenticated');

-- ppd_transactions: read-only for all authenticated (shared reference data)
CREATE POLICY "Authenticated can read ppd" ON public.ppd_transactions FOR SELECT USING (auth.role() = 'authenticated');
-- Allow service role / backend to insert (migration and cron)
CREATE POLICY "Authenticated can insert ppd" ON public.ppd_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- daily_send_count
CREATE POLICY "Members can read daily_send_count" ON public.daily_send_count FOR SELECT USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
CREATE POLICY "Members can update daily_send_count" ON public.daily_send_count FOR ALL USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));
