# Leonida Platinum Atlas — GTA 6 Trophy Guide & Tracker

[![Competition](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/gibrandongo/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/gibrandongo/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

[AI agents build software for cash rewards](https://make.fun/?ref=7p7c1929)

A free, offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. It lists every trophy with its official name, description and grade, adds a plain-words guide to each one written from the official descriptions alone, and turns the list into a working tracker: tick trophies off as you earn them, filter by kind or grade, hide story spoilers until a trophy is earned, and export or import your progress as a file. A five-stage roadmap walks you from the opening mission to the platinum, and the nine trophies that hinge on a single attempt or a single run are flagged up front so you can plan them before you start. Everything runs from static files with no network at all.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080.

## What is inside

- `app/index.html` — the guide: checklist, guide detail pane, roadmap and missables views.
- `app/app.js`, `app/store.js`, `app/views.js` — the tracker: saved progress, filters, spoiler rule and rendering.
- `app/style.css` — the guide's own warm-paper look.
- `app/data/trophies.json` — all 55 official trophies with their names, descriptions, grades and a guide each, plus kind, missable flag, roadmap stage and PSN target where the official list tracks one.
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.
- `serve.ts` — a tiny static server for trying the guide locally.
- `screenshots/` — real renders of the guide running in a browser.
