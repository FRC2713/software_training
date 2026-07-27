package com.frc2713.mazesolver;

/**
 * A concrete {@link Maze} backed by an N/S/E/W bitmask grid (a set bit means
 * that side of the cell is OPEN). Start is the top-left cell (0,0); Goal is the
 * bottom-right cell (rows-1, cols-1) — the convention the whole maze module
 * uses.
 *
 * <p>This is a temporary shim: the {@code maze-solver} library currently ships
 * only the interfaces, so the site vendors this small implementation as
 * {@code maze-engine.jar} to make {@code new GridMaze(grid)} runnable in the
 * browser. Delete it once the library ships its own {@code GridMaze}.
 */
public class GridMaze implements Maze {
    private final int[][] grid;
    private final int rows;
    private final int cols;
    private final int goalRow;
    private final int goalCol;
    private final GridRobot bot;

    public GridMaze(int[][] grid) {
        this.grid = grid;
        this.rows = grid.length;
        this.cols = grid.length == 0 ? 0 : grid[0].length;
        this.goalRow = rows - 1;
        this.goalCol = cols - 1;
        this.bot = new GridRobot(this);
    }

    int mask(int row, int col) {
        return grid[row][col];
    }

    int goalRow() {
        return goalRow;
    }

    int goalCol() {
        return goalCol;
    }

    public int rows() {
        return rows;
    }

    public int cols() {
        return cols;
    }

    public Cell cellAt(int row, int col) {
        return new GridCell(this, row, col);
    }

    public boolean isGoalCell(int row, int col) {
        return row == goalRow && col == goalCol;
    }

    public Robot robot() {
        return bot;
    }
}
