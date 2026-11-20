# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Janetide/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Janetide/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft
Auto VI. It is a static web app: a checklist with the official name,
description and grade of every trophy, progress saved in the browser, filters
by kind and grade, text search, a spoiler setting that hides story trophies
until they are earned, export and import of progress, a six-stage roadmap to
the platinum, a missables view that flags every trophy that can be missed,
and a guide to each trophy in our own words, with its sources named beside
it. Where a place or step is not pinned down by the official description, the
guide says so plainly instead of inventing it. No network is needed and no
network request is made; the app runs entirely from its own files.

## Run it

Serve the `app/` directory with any static file server and open it:

```sh
cd app
python3 -m http.server 8080
```

Then open `http://localhost:8080/` in a desktop browser. Everything works
with the network off.

To build the hand-in (copies `app/` and `screenshots/` and writes
`dossier.json`):

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Entered on make.fun

This guide was built for the make.fun bounty
[gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) —
"Build the best GTA 6 trophy guide". See `competition.yaml` in the kit for
the full rules.
