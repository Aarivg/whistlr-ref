import { useEffect, useRef, useState, type FormEvent } from "react";
import { submitWaitlist } from "@/server-fns/waitlist";

type Mode = "league" | "referee";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";

const labelClass = "block text-sm font-medium text-foreground mb-1.5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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

  // Reset whenever the visible form changes (mode switch or remount) so a
  // bot that pre-loads the page can't "bank" time from an earlier view.
  const formRenderedAtRef = useRef(Date.now());
  useEffect(() => {
    formRenderedAtRef.current = Date.now();
  }, [mode]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();

    try {
      const result = await submitWaitlist({
        data:
          mode === "league"
            ? {
                mode: "league",
                name: get("name"),
                orgName: get("org_name"),
                email: get("email"),
                region: get("region"),
                gamesPerSeason: get("games_per_season"),
                website: get("website"),
                formRenderedAt: formRenderedAtRef.current,
              }
            : {
                mode: "referee",
                name: get("name"),
                email: get("email"),
                region: get("region"),
                yearsExperience: get("years_experience"),
                website: get("website"),
                formRenderedAt: formRenderedAtRef.current,
              },
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(mode);
    } catch (err) {
      console.error(err);
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
          {/* Honeypot: hidden from real visitors, but a bot that fills every
              field on the page will fill this too. Never remove the name
              "website" without updating src/server-fns/waitlist.ts. */}
          <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true">
            <label>
              Leave this field blank
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <Field label="Your name">
            <input
              name="name"
              required
              maxLength={100}
              className={fieldClass}
              placeholder="Jordan Reese"
            />
          </Field>

          {mode === "league" && (
            <Field label="Organization name">
              <input
                name="org_name"
                required
                maxLength={120}
                className={fieldClass}
                placeholder="Richmond Youth Soccer"
              />
            </Field>
          )}

          <Field label="Email">
            <input
              type="email"
              name="email"
              required
              maxLength={255}
              className={fieldClass}
              placeholder="you@example.com"
            />
          </Field>

          <Field label="City / region">
            <input
              name="region"
              required
              maxLength={120}
              className={fieldClass}
              placeholder="Richmond, VA"
            />
          </Field>

          {mode === "league" ? (
            <Field label="Rough number of games per season">
              <input
                name="games_per_season"
                maxLength={50}
                className={fieldClass}
                placeholder="~120"
              />
            </Field>
          ) : (
            <Field label="Years of experience officiating soccer">
              <input
                name="years_experience"
                maxLength={50}
                className={fieldClass}
                placeholder="5"
              />
            </Field>
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
