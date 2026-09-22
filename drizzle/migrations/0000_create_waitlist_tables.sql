CREATE TABLE public.league_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  org_name TEXT NOT NULL,
  email TEXT NOT NULL,
  region TEXT NOT NULL,
  games_per_season TEXT
);

GRANT INSERT ON public.league_signups TO anon;
GRANT INSERT ON public.league_signups TO authenticated;
GRANT ALL ON public.league_signups TO service_role;

ALTER TABLE public.league_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the league waitlist"
  ON public.league_signups FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.referee_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  region TEXT NOT NULL,
  sports TEXT NOT NULL,
  years_experience TEXT
);

GRANT INSERT ON public.referee_signups TO anon;
GRANT INSERT ON public.referee_signups TO authenticated;
GRANT ALL ON public.referee_signups TO service_role;

ALTER TABLE public.referee_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the referee waitlist"
  ON public.referee_signups FOR INSERT TO anon, authenticated WITH CHECK (true);
