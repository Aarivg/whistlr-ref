-- Prevent the same email from spamming either waitlist repeatedly.
CREATE UNIQUE INDEX league_signups_email_lower_idx ON public.league_signups (lower(email));
CREATE UNIQUE INDEX referee_signups_email_lower_idx ON public.referee_signups (lower(email));

-- Defense in depth: enforce basic shape at the database level even though
-- the server function already validates everything before it gets here.
ALTER TABLE public.league_signups
  ADD CONSTRAINT league_signups_email_format CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  ADD CONSTRAINT league_signups_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT league_signups_org_name_length CHECK (char_length(org_name) BETWEEN 1 AND 120),
  ADD CONSTRAINT league_signups_region_length CHECK (char_length(region) BETWEEN 1 AND 120),
  ADD CONSTRAINT league_signups_games_length CHECK (games_per_season IS NULL OR char_length(games_per_season) <= 50);

ALTER TABLE public.referee_signups
  ADD CONSTRAINT referee_signups_email_format CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  ADD CONSTRAINT referee_signups_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT referee_signups_region_length CHECK (char_length(region) BETWEEN 1 AND 120),
  ADD CONSTRAINT referee_signups_sports_length CHECK (char_length(sports) <= 50),
  ADD CONSTRAINT referee_signups_years_length CHECK (years_experience IS NULL OR char_length(years_experience) <= 50);

-- Lock down direct client writes. All inserts now go through a validated,
-- rate-limited server function using the service role key — not the public
-- anon key. This closes the hole where anyone holding the public anon key
-- (visible in any client bundle, by design) could POST straight to
-- Supabase's REST API and flood these tables, bypassing the app entirely.
DROP POLICY IF EXISTS "Anyone can join the league waitlist" ON public.league_signups;
REVOKE INSERT ON public.league_signups FROM anon;
REVOKE INSERT ON public.league_signups FROM authenticated;

DROP POLICY IF EXISTS "Anyone can join the referee waitlist" ON public.referee_signups;
REVOKE INSERT ON public.referee_signups FROM anon;
REVOKE INSERT ON public.referee_signups FROM authenticated;

-- Server-side rate-limit log. Stores only a salted hash of the submitter's
-- IP — never the raw address — purely to count recent attempts per IP. No
-- anon/authenticated policies are defined, so only the service role (used
-- exclusively by the server function) can read or write it.
CREATE TABLE public.waitlist_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash TEXT NOT NULL
);

CREATE INDEX waitlist_rate_limit_ip_created_idx ON public.waitlist_rate_limit (ip_hash, created_at DESC);

ALTER TABLE public.waitlist_rate_limit ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.waitlist_rate_limit TO service_role;
