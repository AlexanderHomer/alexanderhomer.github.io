# Clinic Ops Dashboard

A personal, local-only dashboard for tracking todos and incoming messages
during clinic — Slack, WhatsApp, TigerText, and Epic — with hands-free
voice control. Runs on your own machine only. It is **not** part of the
published GitHub Pages site (excluded from the Jekyll build) and should
never be deployed publicly, because Slack credentials live in a
server-side `.env` file.

## Why it's not "live" for all four sources

- **Slack** — real, live integration. The server polls Slack's API with a
  bot token you create.
- **WhatsApp** — there is no API for a personal WhatsApp account (only the
  WhatsApp *Business* API, which needs business verification). This panel
  is quick-log + a deep link to open the real app.
- **TigerText / TigerConnect** — has an Enterprise API, but it's gated
  behind a contract with TigerConnect and your health system's IT. Same
  quick-log + deep-link treatment here.
- **Epic** — needs FHIR/Interconnect access provisioned by your
  hospital's Epic/IT team; not something available to a personal project.
  Same treatment.

If your employer later grants API access to TigerConnect or Epic, those
panels can be upgraded to live polling the same way Slack is.

## Setup

1. `cd clinic-dashboard`
2. Copy the env file: `cp .env.example .env`
3. (Optional, for live Slack) Create a Slack app at
   https://api.slack.com/apps, install it to your workspace, grant it the
   Bot Token scopes listed in `.env.example`, invite the bot to the
   channels you care about, and fill in `SLACK_BOT_TOKEN` and
   `SLACK_CHANNELS` in `.env`.
4. Run it: `node --env-file=.env server.js` (Node 20+; this repo has been
   tested with Node 22). No `npm install` needed — it uses only Node's
   built-in `http` and `fetch`.
5. Open http://localhost:4173

If you skip step 3, the dashboard still works fully in manual mode —
Slack messages just won't appear automatically; log them the same way you
would WhatsApp/TigerText/Epic.

## Deep links

Open the "Deep-link settings" panel to set:
- **WhatsApp** — a `https://wa.me/<number>` or group invite link
- **TigerText** — its app's URL scheme if you know one, otherwise leave
  blank and use quick-log only
- **Epic** — your organization's Hyperspace URL, if it has one

These are stored locally in `data/state.json` (gitignored) and are just
convenience shortcuts — they don't grant any programmatic access.

## Voice commands

Click the mic button once (Chrome only — uses the Web Speech API) and grant
microphone access. Then say:

- **"done" / "next"** — resolve the newest open queue item
- **"snooze"** — snooze the newest open item
- **"escalate"** — flag the newest open item urgent (moves it into the
  red escalation lane and reads it aloud)
- **"add todo <text>"** — add a todo to the Today column
- **"log whatsapp <text>"** / **"log tigertext <text>"** / **"log epic
  <text>"** — quick-log a message from that source
- **"read queue"** — hear a spoken summary of what's outstanding
- **"stop listening"** — turns voice off

New urgent items (Slack messages matching "stat"/"urgent"/"asap"/"now", or
anything you escalate) are read aloud automatically while voice mode is on.

## Data

Everything is stored in `clinic-dashboard/data/state.json`, a plain JSON
file (gitignored — it's local scratch state, not something to commit or
sync). Avoid logging real patient identifiers; use room numbers or
initials as your tag instead.
