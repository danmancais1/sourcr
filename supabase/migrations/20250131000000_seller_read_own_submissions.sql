-- Sellers (authenticated users) can read their own landlord submissions by contact_email
CREATE POLICY "Sellers can read own submissions by email"
  ON public.landlord_submissions
  FOR SELECT
  USING (contact_email = (auth.jwt() ->> 'email'));

-- Sellers can read matches for their own submissions
CREATE POLICY "Sellers can read own matches"
  ON public.matches
  FOR SELECT
  USING (
    landlord_submission_id IN (
      SELECT id FROM public.landlord_submissions
      WHERE contact_email = (auth.jwt() ->> 'email')
    )
  );
