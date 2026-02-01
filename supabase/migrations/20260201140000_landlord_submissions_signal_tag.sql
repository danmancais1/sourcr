-- Add category (signal_tag) to landlord submissions for sourcing categories.
-- Values match investor sourcing categories: financial_distress, probate_seller, landlord_exit,
-- corporate_disposal, stuck_asset, portfolio_rebalance, private_sale.

ALTER TABLE public.landlord_submissions
ADD COLUMN IF NOT EXISTS signal_tag TEXT
CHECK (signal_tag IS NULL OR signal_tag IN (
  'financial_distress',
  'probate_seller',
  'landlord_exit',
  'corporate_disposal',
  'stuck_asset',
  'portfolio_rebalance',
  'private_sale'
));

CREATE INDEX IF NOT EXISTS idx_landlord_submissions_signal_tag
ON public.landlord_submissions(signal_tag);

CREATE INDEX IF NOT EXISTS idx_signals_signal_type
ON public.signals(signal_type);
