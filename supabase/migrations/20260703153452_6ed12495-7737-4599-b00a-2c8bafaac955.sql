
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status_duration_hours integer NOT NULL DEFAULT 24
    CHECK (status_duration_hours IN (24, 48, 168));

CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  property_type text NOT NULL DEFAULT 'Apartment',
  listing_type text NOT NULL DEFAULT 'Buy',
  price numeric NOT NULL DEFAULT 0,
  beds integer,
  baths integer,
  size_sqm integer,
  location text,
  city text,
  state text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Properties viewable by everyone" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Users insert own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users update own properties" ON public.properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users delete own properties" ON public.properties FOR DELETE USING (auth.uid() = owner_id);

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX properties_owner_id_idx ON public.properties(owner_id);
CREATE INDEX properties_created_at_idx ON public.properties(created_at DESC);

CREATE TABLE public.status_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.status_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.status_posts TO authenticated;
GRANT ALL ON public.status_posts TO service_role;

ALTER TABLE public.status_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active statuses viewable by everyone" ON public.status_posts FOR SELECT USING (expires_at > now());
CREATE POLICY "Users insert own status" ON public.status_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own status" ON public.status_posts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX status_posts_expires_at_idx ON public.status_posts(expires_at);
CREATE INDEX status_posts_user_id_idx ON public.status_posts(user_id);
