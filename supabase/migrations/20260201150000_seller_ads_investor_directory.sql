-- Seller opportunity ads: landlords/sellers post ads looking for investors.
CREATE TABLE IF NOT EXISTS public.seller_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  signal_tag TEXT CHECK (signal_tag IS NULL OR signal_tag IN (
    'financial_distress', 'probate_seller', 'landlord_exit', 'corporate_disposal',
    'stuck_asset', 'portfolio_rebalance', 'private_sale'
  )),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seller_ads_workspace ON public.seller_ads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_seller_ads_status ON public.seller_ads(status);

-- Investor directory: investors opt in to be listed with contact details for sellers.
CREATE TABLE IF NOT EXISTS public.investor_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  postcodes_or_areas TEXT,
  criteria TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);
CREATE INDEX IF NOT EXISTS idx_investor_directory_workspace ON public.investor_directory(workspace_id);

-- RLS
ALTER TABLE public.seller_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_directory ENABLE ROW LEVEL SECURITY;

-- Sellers: manage own workspace's ads
DROP POLICY IF EXISTS "Sellers can manage own ads" ON public.seller_ads;
CREATE POLICY "Sellers can manage own ads" ON public.seller_ads FOR ALL
  USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));

-- Investors: read all active ads (for future browse)
DROP POLICY IF EXISTS "Authenticated can read active seller_ads" ON public.seller_ads;
CREATE POLICY "Authenticated can read active seller_ads" ON public.seller_ads FOR SELECT
  USING (status = 'active' AND auth.role() = 'authenticated');

-- Investor directory: workspace can manage own row; authenticated can read
DROP POLICY IF EXISTS "Workspace can manage own directory" ON public.investor_directory;
CREATE POLICY "Workspace can manage own directory" ON public.investor_directory FOR ALL
  USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));

DROP POLICY IF EXISTS "Authenticated can read investor_directory" ON public.investor_directory;
CREATE POLICY "Authenticated can read investor_directory" ON public.investor_directory FOR SELECT
  USING (auth.role() = 'authenticated');
