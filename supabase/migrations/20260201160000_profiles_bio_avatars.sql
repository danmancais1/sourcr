-- Add bio to profiles. Display name = full_name, avatar = avatar_url (already exist).
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Storage: create bucket "avatars" in Dashboard (Storage > New bucket > id: avatars, public: true) if not exists.
-- Policies below allow authenticated users to manage their own file at avatars/{user_id}/*
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');
