# World Cup 2026 — Knockout Predictor 🏆

A dark-mode, retro/synthwave bracket predictor for the **2026 FIFA World Cup
knockout stage**. Call every game from the confirmed **Round of 32** all the way
to the **Final**, crown your champion, and export a themed share image with your
name watermarked on it.

Built with **Next.js 16** (App Router) + **React 19**. Fully responsive for
mobile and desktop.

## Features

- ⚽ All 32 confirmed Round of 32 teams, fixtures, dates and venues
- 🧭 Round-by-round flow (R32 → R16 → QF → SF → Final) that auto-fills each
  round from your previous winners
- 💾 Progress auto-saves to `localStorage` — refresh-safe
- 📸 One-tap **share image** (`html-to-image`) with the user's name watermarked,
  in the same neon theme
- 🎨 Generated OG image + favicon, full metadata for link sharing

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

| Path | Purpose |
| --- | --- |
| `src/lib/teams.ts` | The 32 teams (name, code, flag, accent color) |
| `src/lib/bracket.ts` | Match data + bracket flow + pick resolution helpers |
| `src/components/Predictor.tsx` | Main client app / state machine |
| `src/components/MatchCard.tsx` | A single match (pick a winner) |
| `src/components/ShareCard.tsx` | The exportable, watermarked result card |
| `src/app/opengraph-image.tsx` | Generated social share image |
| `src/app/icon.tsx` | Generated favicon |

## Deploy on Vercel

This app is zero-config on Vercel:

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Import it at [vercel.com/new](https://vercel.com/new). Vercel auto-detects
   Next.js and pnpm (via `pnpm-lock.yaml`) — no settings to change.
3. (Optional) Set `NEXT_PUBLIC_SITE_URL` to your production URL so OG/Twitter
   images resolve to absolute URLs. If unset, Vercel's
   `VERCEL_PROJECT_PRODUCTION_URL` is used automatically.

Build command `next build` and output are detected automatically.
