#!/usr/bin/env bash
# Build the concrete maze engine (GridMaze/GridRobot/GridCell) into
# public/maze-engine.jar. This is a TEMPORARY shim: the maze-solver library
# ships only the interfaces (Maze/Robot/Cell), so lesson snippets that call
# `new GridMaze(grid)` need a concrete implementation on the classpath to run in
# the browser JVM (CheerpJ). Delete this script, scripts/maze-engine/, the jar,
# and the ENGINE_JAR classpath entry once the library ships its own GridMaze.
#
# The jar is committed (like public/tools.jar), so you only need to run this
# after editing the engine sources. Output must be Java 8 bytecode (class
# version 52) because CheerpJ runs OpenJDK 8. Requires a JDK capable of
# --release 8 and the interface jar at public/maze-solver.jar
# (run scripts/vendor-maze-solver.sh first).
set -euo pipefail

here="$(cd "$(dirname "$0")/.." && pwd)"
src="$here/scripts/maze-engine"
solver_jar="$here/public/maze-solver.jar"

if [ ! -f "$solver_jar" ]; then
  echo "Missing $solver_jar — run scripts/vendor-maze-solver.sh first." >&2
  exit 1
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "Compiling maze engine (--release 8) ..."
javac --release 8 -cp "$solver_jar" -d "$tmp" \
  "$src"/com/frc2713/mazesolver/*.java
jar cf "$here/public/maze-engine.jar" -C "$tmp" .
echo "Built public/maze-engine.jar ($(wc -c < "$here/public/maze-engine.jar") bytes)"
