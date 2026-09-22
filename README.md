# Whistlr: Game On

Build a clean, modern landing page for "Whistlr"— a marketplace that connects youth and rec sports leagues with referees/officials. Leagues post open games; referees browse and claim the ones that fit their schedule; referees get paid quickly after the game instead of waiting weeks.

AUDIENCE: Two distinct groups need to feel spoken to — (1) league/rec organization admins who currently coordinate referees by spreadsheet, text, or phone, and (2) certified referees who want more flexibility and faster pay than their current assigning system offers.

DESIGN DIRECTION:

- Clean, minimal, modern — lots of white space, no clutter

- Sporty but professional color palette: deep green (#1B4332 or similar) as primary, white background, one accent color (orange or yellow) for CTAs

- Clear sans-serif typography, generous line height

- Mobile-first responsive layout

- Subtle motion/hover states only — no gimmicks

PAGE STRUCTURE (single page, one clear scroll):

1. HERO

- Headline: something like "Find referees. Fill your schedule. Get paid fast." (write 2-3 headline options)

- Subheadline: one sentence explaining the two-sided value (leagues get coverage, refs get flexibility and fast pay)

- Two CTA buttons side by side: "I run a league" and "I'm a referee" — each scrolls to its own signup form further down

- Simple hero graphic or abstract illustration (soccer/basketball/baseball adjacent, not literal photos)

2. THE PROBLEM (short section)

- 2-3 short bullet points on the real pain: last-minute cancellations, slow manual assigning, delayed payment — written plainly, not salesy

3. HOW IT WORKS (two parallel tracks, side by side or tabbed)

- For Leagues: Post a game → Get matched with available refs → Pay automatically when the game's confirmed

- For Referees: Browse open games near you → Claim what fits your schedule → Get paid fast after the game

- Keep each track to 3 simple steps with a small icon per step

4. WHY IT'S DIFFERENT (short, honest — this is pre-launch, don't overclaim)

- No more spreadsheets and group texts

- Payment that doesn't take weeks

- Built for rec and independent leagues, not just big sanctioned programs

- Do NOT include fake testimonials, fake user counts, or "trusted by X leagues" — this is a pre-launch waitlist page, keep all copy honest

5. WAITLIST SIGNUP (the core conversion goal)

- Two separate forms/tabs: "League Signup" (name, org name, email, city/region, rough # of games per season) and "Referee Signup" (name, email, city/region, sport(s) you officiate, years of experience)

- Single clear submit button per form, simple confirmation message after submit ("Thanks — we'll be in touch")

- Store submissions in a simple backend table (leagues and referees as separate tables)

6. FAQ (short, 4-5 questions)

- What sports/regions do you support right now? (answer: currently focused on [Virginia/East Coast — let me know region], expanding based on interest)

- Is it free for referees? (yes)

- How does payment work? (explain plainly: payment is held until the game is confirmed, then released — don't use the word "escrow" since that's not technically accurate)

- When are you launching?

7. FOOTER

- Simple contact email, no social links needed yet

TECHNICAL NOTES:

- Build as a single responsive page, not multi-page nav

- Forms should validate required fields before submit

- Keep total copy tight — no walls of text, this is a scannable landing page

- Prioritize a fast, clean first impression over feature completeness

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a13b66ff-a7fc-4218-a75b-37e10b7d56e5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
