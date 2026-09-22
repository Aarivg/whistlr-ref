import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

type Mode = "league" | "referee";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";

const labelClass = "block text-sm font-medium text-foreground mb-1.5";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function WaitlistForms({ initialMode = "league" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [done, setDone] = useState<Mode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();

    try {
      if (mode === "league") {
        const { error } = await supabase.from("league_signups").insert({
          name: get("name"),
          org_name: get("org_name"),
          email: get("email"),
          region: get("region"),
          games_per_season: get("games_per_season") || null,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("referee_signups").insert({
          name: get("name"),
          email: get("email"),
          region: get("region"),
          sports: get("sports"),
          years_experience: get("years_experience") || null,
        });
        if (error) throw error;
      }
      setDone(mode);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8">
      <div className="mb-7 grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
        {(["league", "referee"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setDone(null);
              setError(null);
            }}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              mode === m
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "league" ? "League signup" : "Referee signup"}
          </button>
        ))}
      </div>

      {done === mode ? (
        <div className="py-10 text-center">
          <p className="font-display text-xl font-semibold text-primary">
            Thanks — we'll be in touch.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            You're on the {done === "league" ? "league" : "referee"} waitlist.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" key={mode}>
          <Field label="Your name">
            <input name="name" required maxLength={100} className={fieldClass} placeholder="Jordan Reese" />
          </Field>

          {mode === "league" && (
            <Field label="Organization name">
              <input name="org_name" required maxLength={120} className={fieldClass} placeholder="Richmond Youth Soccer" />
            </Field>
          )}

          <Field label="Email">
            <input type="email" name="email" required maxLength={255} className={fieldClass} placeholder="you@example.com" />
          </Field>

          <Field label="City / region">
            <input name="region" required maxLength={120} className={fieldClass} placeholder="Richmond, VA" />
          </Field>

          {mode === "league" ? (
            <Field label="Rough number of games per season">
              <input name="games_per_season" maxLength={50} className={fieldClass} placeholder="~120" />
            </Field>
          ) : (
            <>
              <Field label="Sport(s) you officiate">
                <input name="sports" required maxLength={150} className={fieldClass} placeholder="Soccer, basketball" />
              </Field>
              <Field label="Years of experience">
                <input name="years_experience" maxLength={50} className={fieldClass} placeholder="5" />
              </Field>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-accent px-6 py-3 font-display text-base font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Join the waitlist"}
          </button>
        </form>
      )}
    </div>
  );
}
