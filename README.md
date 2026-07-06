# software_training

Software training suite for FRC 2713 — an onboarding curriculum for teaching
new students the fundamentals of programming with Java, the language FRC
robot code is written in.

**Start here:** https://frc2713.github.io/software_training/

The live site is the main way to go through the material: it walks through
each lesson page by page and lets you actually compile and run Java code in
the browser (via [CheerpJ](https://cheerpj.com), no install required).

## Repository layout

- [`lessons/`](lessons) — the lesson content itself, one folder per lesson.
  See [`lessons/README.md`](lessons/README.md) if you want to add or edit a
  lesson.
- [`site/`](site) — the React + Vite app that renders `lessons/` as the
  interactive site, deployed to GitHub Pages on every push to `main` via
  [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

## Running the site locally

```
cd site
npm install
npm run dev
```
