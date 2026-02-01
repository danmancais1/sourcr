-- Seller directory: sellers opt in to be listed for investors (like investor_directory for sellers).
CREATE TABLE IF NOT EXISTS public.seller_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  areas_or_criteria TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);
CREATE INDEX IF NOT EXISTS idx_seller_directory_workspace ON public.seller_directory(workspace_id);

ALTER TABLE public.seller_directory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace can manage own seller_directory" ON public.seller_directory;
CREATE POLICY "Workspace can manage own seller_directory" ON public.seller_directory FOR ALL
  USING (workspace_id IN (SELECT public.user_workspace_ids(auth.uid())));

DROP POLICY IF EXISTS "Authenticated can read seller_directory" ON public.seller_directory;
CREATE POLICY "Authenticated can read seller_directory" ON public.seller_directory FOR SELECT
  USING (auth.role() = 'authenticated');
