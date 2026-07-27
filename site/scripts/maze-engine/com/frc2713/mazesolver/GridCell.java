package com.frc2713.mazesolver;

/** One square of a {@link GridMaze}. Wall flags come from the cell's bitmask. */
class GridCell implements Cell {
    // Bitmask of a cell's OPEN sides (a set bit = you can move that way).
    static final int UP = 1, DOWN = 2, RIGHT = 4, LEFT = 8;

    private final GridMaze maze;
    private final int row;
    private final int col;

    GridCell(GridMaze maze, int row, int col) {
        this.maze = maze;
        this.row = row;
        this.col = col;
    }

    private int mask() {
        return maze.mask(row, col);
    }

    public int row() {
        return row;
    }

    public int col() {
        return col;
    }

    public boolean wallUp() {
        return (mask() & UP) == 0;
    }

    public boolean wallDown() {
        return (mask() & DOWN) == 0;
    }

    public boolean wallLeft() {
        return (mask() & LEFT) == 0;
    }

    public boolean wallRight() {
        return (mask() & RIGHT) == 0;
    }

    public boolean isStart() {
        return row == 0 && col == 0;
    }

    public boolean isGoal() {
        return maze.isGoalCell(row, col);
    }
}
