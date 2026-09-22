import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarPlus,
  Users,
  CreditCard,
  Search,
  Hand,
  Wallet,
} from "lucide-react";
import heroArt from "@/assets/hero-illustration.jpg";
import { WaitlistForms } from "@/components/WaitlistForms";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Whistlr — Find referees. Fill your schedule. Get paid fast." },
      {
        name: "description",
        content:
          "Whistlr connects youth and rec sports leagues with certified referees. Leagues get coverage, officials get flexible games and fast pay.",
      },
      {
        property: "og:title",
        content: "Whistlr — Referees and leagues, matched in minutes",
      },
      {
        property: "og:description",
        content:
          "Post open games, match with available officials, and pay quickly after the game. Join the Whistlr waitlist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-5 py-20 sm:py-24 ${className}`}>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}

const leagueSteps = [
  { icon: CalendarPlus, title: "Post a game", body: "Date, time, location, sport, and what you pay." },
  { icon: Users, title: "Get matched with available refs", body: "Officials nearby claim the games they can cover." },
  { icon: CreditCard, title: "Pay when the game is confirmed", body: "No chasing invoices or cutting checks weeks later." },
];

const refSteps = [
  { icon: Search, title: "Browse open games near you", body: "See sport, level, location, and pay up front." },
  { icon: Hand, title: "Claim what fits your schedule", body: "Take the games you want. No assignor bottleneck." },
  { icon: Wallet, title: "Get paid fast after the game", body: "Payment releases once the game is confirmed." },
];

const faqs = [
  {
    q: "What sports and regions do you support right now?",
    a: "We're starting in Virginia across soccer, basketball, baseball, softball, and flag football. We'll expand based on where interest comes from.",
  },
  { q: "Is it free for referees?", a: "Yes. Referees never pay to browse or claim games." },
  {
    q: "How does payment work?",
    a: "The league funds the game up front. We hold that payment until the game is played and confirmed, then release it to the referee — typically within a couple of days instead of weeks.",
  },
  {
    q: "When are you launching?",
    a: "We're pre-launch and building with early leagues and officials. Join the waitlist and we'll reach out before we open in your area.",
  },
];

function Index() {
  const [waitlistMode, setWaitlistMode] = useState<"league" | "referee">("league");

  const goToWaitlist = (mode: "league" | "referee") => {
    setWaitlistMode(mode);
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-background">
      <header className="px-5 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-display text-xl font-bold tracking-tight text-primary">
            Whistlr
          </span>
          <button
            onClick={() => goToWaitlist("league")}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            Join the waitlist
          </button>
        </div>
      </header>

      {/* Hero */}
      <Section className="pt-8 sm:pt-12">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold text-primary sm:text-5xl">
              Find referees. Fill your schedule.
              <br className="hidden sm:block" /> Get paid fast.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Whistlr is where rec and youth leagues post open games and certified
              officials claim the ones that fit — leagues get coverage, referees get
              flexibility and payment days after the whistle, not weeks.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => goToWaitlist("league")}
                className="rounded-lg bg-accent px-6 py-3.5 font-display text-base font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
              >
                I run a league
              </button>
              <button
                onClick={() => goToWaitlist("referee")}
                className="rounded-lg border border-primary/25 px-6 py-3.5 font-display text-base font-semibold text-primary transition-colors hover:bg-secondary"
              >
                I'm a referee
              </button>
            </div>
          </div>
          <img
            src={heroArt}
            alt="Abstract illustration of a soccer ball, basketball, and referee whistle"
            width={1200}
            height={1008}
            className="mx-auto w-full max-w-md"
          />
        </div>
      </Section>

      {/* Problem */}
      <Section className="bg-secondary/60">
        <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
          Assigning officials still runs on group texts
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            ["Last-minute cancellations", "A ref drops out Friday night and someone spends Saturday morning making calls."],
            ["Manual assigning", "Spreadsheets, text threads, and a shared contact list that's always out of date."],
            ["Slow payment", "Officials work the game, then wait weeks for a check to clear the league's process."],
          ].map(([title, body]) => (
            <li key={title}>
              <div className="h-1 w-10 rounded-full bg-accent" />
              <h3 className="mt-4 text-lg font-semibold text-primary">{title}</h3>
              <p className="mt-2 text-[15px] text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* How it works */}
      <Section>
        <h2 className="text-2xl font-semibold text-primary sm:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-14">
          {[
            { label: "For leagues", steps: leagueSteps },
            { label: "For referees", steps: refSteps },
          ].map((track) => (
            <div key={track.label}>
              <p className="font-display text-sm font-semibold uppercase tracking-widest text-accent">
                {track.label}
              </p>
              <ol className="mt-6 space-y-6">
                {track.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                      <step.icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-primary">
                        {i + 1}. {step.title}
                      </h3>
                      <p className="mt-1 text-[15px] text-muted-foreground">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>

      {/* Why different */}
      <Section className="bg-secondary/60">
        <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
          Why we're building it
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            ["No more spreadsheets and group texts", "One place to post games and see who's covering what."],
            ["Payment that doesn't take weeks", "Funds are held until the game is confirmed, then released."],
            ["Built for rec and independent leagues", "Not just large sanctioned programs with a dedicated assignor."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl bg-background p-6">
              <h3 className="text-base font-semibold text-primary">{title}</h3>
              <p className="mt-2 text-[15px] text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Waitlist */}
      <Section id="waitlist">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
            Join the waitlist
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tell us a bit about you and we'll reach out as we open up your area.
          </p>
        </div>
        <WaitlistForms key={waitlistMode} initialMode={waitlistMode} />
      </Section>

      {/* FAQ */}
      <Section className="bg-secondary/60">
        <h2 className="text-2xl font-semibold text-primary sm:text-3xl">FAQ</h2>
        <dl className="mt-8 divide-y divide-border">
          {faqs.map((f) => (
            <div key={f.q} className="py-6">
              <dt className="font-display text-base font-semibold text-primary">{f.q}</dt>
              <dd className="mt-2 max-w-3xl text-[15px] text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <footer className="px-5 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <span className="font-display font-bold text-primary">Whistlr</span>
          <a
            href="mailto:hello@whistlr.app"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            hello@whistlr.app
          </a>
        </div>
      </footer>
    </main>
  );
}
