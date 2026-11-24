# software_training

Software training suite for FRC 2713 — an onboarding curriculum for teaching
new students the fundamentals of programming with Java, the language FRC
robot code is written in.

**Start here:** https://learn.redhawkrobotics.org/

The live site is hosted via [Hawk Suite](https://github.com/FRC2713/hawk_suite)
(behind team Slack sign-in). It walks through each lesson page by page and lets
you compile and run Java code in the browser (via [CheerpJ](https://cheerpj.com),
no install required).

## Repository layout

- [`lessons/`](lessons) — the lesson content itself, one folder per lesson.
  See [`lessons/README.md`](lessons/README.md) if you want to add or edit a
  lesson.
- [`site/`](site) — the React + Vite app that renders `lessons/` as the
  interactive site.
- [`Dockerfile`](Dockerfile) and [`server.mjs`](server.mjs) — package the built
  site as `ghcr.io/frc2713/hawk-learn`, published on every push to `main` via
  [`.github/workflows/docker.yml`](.github/workflows/docker.yml).

## Running the site locally

```
cd site
npm install
npm run dev
```
