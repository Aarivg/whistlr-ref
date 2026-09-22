import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { z } from "zod";

// --- Anti-abuse tuning -----------------------------------------------------

/** How far back to look when counting attempts from one IP. */
const RATE_LIMIT_WINDOW_MINUTES = 10;
/** Max attempts (successful or not) allowed from one IP in that window. */
const RATE_LIMIT_MAX_ATTEMPTS = 5;
/**
 * A form submitted faster than this after it rendered is almost certainly a
 * script, not a person. Real users take at least a couple of seconds to
 * read and fill four to five fields.
 */
const MIN_HUMAN_FILL_MS = 1200;

// --- Input validation --------------------------------------------------

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(255)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address");

const sharedFields = {
  name: z.string().trim().min(1, "Required").max(100),
  email: emailSchema,
  region: z.string().trim().min(1, "Required").max(120),
  // Honeypot: a real visitor never sees this field (it's hidden off-screen).
  // Any bot that blindly fills every input on the page fills this too.
  website: z.string().max(200).optional().default(""),
  // Epoch ms captured when the form first rendered, so we can tell a
  // sub-second scripted submission from a real person filling the form.
  formRenderedAt: z.number(),
};

const leagueSchema = z.object({
  ...sharedFields,
  mode: z.literal("league"),
  orgName: z.string().trim().min(1, "Required").max(120),
  gamesPerSeason: z.string().trim().max(50).optional().default(""),
});

const refereeSchema = z.object({
  ...sharedFields,
  mode: z.literal("referee"),
  yearsExperience: z.string().trim().max(50).optional().default(""),
});

const waitlistInputSchema = z.discriminatedUnion("mode", [leagueSchema, refereeSchema]);

export type WaitlistResult = { ok: true } | { ok: false; error: string };

// --- Helpers -------------------------------------------------------------

/**
 * We never store a submitter's raw IP — only a salted hash of it, purely so
 * repeat attempts from the same address can be counted for rate limiting.
 * Set WAITLIST_IP_SALT in the environment for a real deployment; the
 * fallback below still works, it's just weaker against someone trying to
 * reverse-correlate hashes back to IPs.
 */
function hashIp(ip: string): string {
  const salt = process.env["WAITLIST_IP_SALT"] || "whistlr-fallback-salt-set-WAITLIST_IP_SALT";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Explicit, auditable client-IP resolution rather than relying on a single header. */
function resolveClientIp(): string {
  const headers = getRequest().headers;
  const forwardedFor = headers.get("x-forwarded-for");
  return (
    headers.get("cf-connecting-ip") ??
    (forwardedFor ? forwardedFor.split(",")[0]?.trim() : undefined) ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * `waitlist_rate_limit` won't show up in the generated Supabase `Database`
 * type (src/integrations/supabase/types.ts) until Lovable resyncs types
 * after this migration runs. This minimal shape scopes the gap to just
 * this one table so `league_signups` and `referee_signups` stay fully
 * typed everywhere else in the app. Safe to delete once the real
 * generated type includes `waitlist_rate_limit`.
 */
type RateLimitOnlySchema = {
  public: {
    Tables: {
      waitlist_rate_limit: {
        Row: { id: string; created_at: string; ip_hash: string };
        Insert: { id?: string; created_at?: string; ip_hash: string };
        Update: { id?: string; created_at?: string; ip_hash?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

function rateLimitTable(client: SupabaseClient) {
  return (client as unknown as SupabaseClient<RateLimitOnlySchema>).from("waitlist_rate_limit");
}

// --- The server function --------------------------------------------------

export const submitWaitlist = createServerFn({ method: "POST" })
  .validator((data: unknown) => waitlistInputSchema.parse(data))
  .handler(async ({ data }): Promise<WaitlistResult> => {
    // Honeypot tripped: pretend success so a bot doesn't learn to leave it blank.
    if (data.website.trim().length > 0) {
      return { ok: true };
    }

    // Submitted too fast to be a person: pretend success rather than
    // telling an automated script exactly what tripped it.
    if (Date.now() - data.formRenderedAt < MIN_HUMAN_FILL_MS) {
      return { ok: true };
    }

    // Loaded dynamically (never as a top-level import) so the service-role
    // client is never pulled into any client-side bundle.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ipHash = hashIp(resolveClientIp());
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();

    const { count, error: countError } = await rateLimitTable(supabaseAdmin)
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if (countError) {
      // Fail open on our own infrastructure hiccups — don't block a real
      // signup because a monitoring query broke.
      console.error("[waitlist] rate limit lookup failed", countError);
    } else if ((count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
      return { ok: false, error: "Too many attempts. Please try again in a few minutes." };
    }

    await rateLimitTable(supabaseAdmin).insert({ ip_hash: ipHash });

    const insertResult =
      data.mode === "league"
        ? await supabaseAdmin.from("league_signups").insert({
            name: data.name,
            org_name: data.orgName,
            email: data.email,
            region: data.region,
            games_per_season: data.gamesPerSeason || null,
          })
        : await supabaseAdmin.from("referee_signups").insert({
            name: data.name,
            email: data.email,
            region: data.region,
            sports: "Soccer",
            years_experience: data.yearsExperience || null,
          });

    if (insertResult.error) {
      // 23505 = Postgres unique_violation — our case-insensitive email index.
      if (insertResult.error.code === "23505") {
        return { ok: false, error: "That email is already on the waitlist." };
      }
      console.error("[waitlist] insert failed", insertResult.error);
      return { ok: false, error: "Something went wrong. Please try again." };
    }

    return { ok: true };
  });
