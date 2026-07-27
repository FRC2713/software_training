package com.frc2713.mazesolver;

import java.util.ArrayList;

/**
 * A {@link Robot} that walks a {@link GridMaze} with absolute moves. It records
 * a Maze Trail: every cell it has stood on, Start first. A move blocked by a
 * wall does nothing and adds no Trail entry, so an algorithm that drives into a
 * wall leaves a Trail that simply stays put there.
 */
class GridRobot implements Robot {
    private final GridMaze maze;
    private int row = 0;
    private int col = 0;
    private final ArrayList<int[]> path = new ArrayList<>();

    GridRobot(GridMaze maze) {
        this.maze = maze;
        path.add(new int[] { row, col });
    }

    private int mask() {
        return maze.mask(row, col);
    }

    private void step(int nextRow, int nextCol) {
        row = nextRow;
        col = nextCol;
        path.add(new int[] { row, col });
    }

    public int row() {
        return row;
    }

    public int col() {
        return col;
    }

    public Cell cell() {
        return maze.cellAt(row, col);
    }

    public boolean canMoveUp() {
        return (mask() & GridCell.UP) != 0;
    }

    public boolean canMoveDown() {
        return (mask() & GridCell.DOWN) != 0;
    }

    public boolean canMoveLeft() {
        return (mask() & GridCell.LEFT) != 0;
    }

    public boolean canMoveRight() {
        return (mask() & GridCell.RIGHT) != 0;
    }

    public void moveUp() {
        if (canMoveUp()) step(row - 1, col);
    }

    public void moveDown() {
        if (canMoveDown()) step(row + 1, col);
    }

    public void moveLeft() {
        if (canMoveLeft()) step(row, col - 1);
    }

    public void moveRight() {
        if (canMoveRight()) step(row, col + 1);
    }

    public boolean atGoal() {
        return maze.isGoalCell(row, col);
    }

    public int[][] trail() {
        return path.toArray(new int[0][]);
    }
}
