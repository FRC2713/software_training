// The `maze-generator` npm package ships no types. It exports a single function
// that returns a grid of cells, each an N/S/E/W bitmask (N=1, S=2, E=4, W=8)
// marking which sides are carved open.
declare module 'maze-generator' {
  export default function mazeGenerator(
    size: [number, number],
    algorithm?: string,
  ): number[][]
}
