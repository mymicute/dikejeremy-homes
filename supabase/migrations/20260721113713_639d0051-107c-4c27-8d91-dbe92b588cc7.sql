
-- Storage: drop overly permissive read policies on 'media' bucket
DROP POLICY IF EXISTS "Anon read media" ON storage.objects;
DROP POLICY IF EXISTS "Users read own media" ON storage.objects;

-- Only owners can read their own files in 'media' (folder path prefixed with their uid)
CREATE POLICY "Users read own media files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Profiles: hide phone column from anonymous users via column-level privileges
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, full_name, avatar_url, bio, created_at, updated_at, status_duration_hours)
  ON public.profiles TO anon;
