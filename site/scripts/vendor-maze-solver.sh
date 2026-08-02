#!/usr/bin/env bash
# Build the FRC2713/maze-solver-java jar and vendor it into public/ so the
# Java playground can load its com.frc2713.mazesolver API locally.
#
# Production doesn't use this script — the Pages workflow builds the jar fresh
# on every deploy (see .github/workflows/deploy-pages.yml). Run this once for
# local `npm run dev`/`npm run build`. Requires a JDK (>= 8, capable of
# --release 8) and Maven on your PATH.
set -euo pipefail

REPO="${MAZE_SOLVER_REPO:-https://github.com/FRC2713/maze-solver-java}"
REF="${MAZE_SOLVER_REF:-main}"
here="$(cd "$(dirname "$0")/.." && pwd)"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "Cloning $REPO@$REF ..."
git clone --depth 1 --branch "$REF" "$REPO" "$tmp/lib"
echo "Building jar ..."
( cd "$tmp/lib" && mvn -B -q -DskipTests package )
cp "$tmp/lib/target/maze-solver.jar" "$here/public/maze-solver.jar"
echo "Vendored public/maze-solver.jar ($(wc -c < "$here/public/maze-solver.jar") bytes)"
