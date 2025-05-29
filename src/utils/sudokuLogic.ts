// src/utils/sudokuLogic.ts
import _ from 'lodash';
import type { SudokuGridType } from '../components/Grid'; // Ensure this path is correct

export const GRID_SIZE = 9;
export const SUBGRID_SIZE = 3;

// Helper to shuffle an array
function shuffle(array: any[]): any[] {
  return _.shuffle(array);
}

// Helper: Find an empty cell
function findEmpty(grid: SudokuGridType): [number, number] | null {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) {
        return [r, c];
      }
    }
  }
  return null;
}

// Check if a number can be placed in a given cell (no change from previous, but ensure it's robust)
export function isSafe(
  grid: SudokuGridType,
  row: number,
  col: number,
  num: number | null
): boolean {
  if (num === null) return true;

  // Check row
  for (let x = 0; x < GRID_SIZE; x++) {
    if (grid[row][x] === num && x !== col) { // Check only other cells
      return false;
    }
  }

  // Check column
  for (let x = 0; x < GRID_SIZE; x++) {
    if (grid[x][col] === num && x !== row) { // Check only other cells
      return false;
    }
  }

  // Check 3x3 subgrid
  const startRow = row - (row % SUBGRID_SIZE);
  const startCol = col - (col % SUBGRID_SIZE);
  for (let i = 0; i < SUBGRID_SIZE; i++) {
    for (let j = 0; j < SUBGRID_SIZE; j++) {
      if (grid[i + startRow][j + startCol] === num && (i + startRow !== row || j + startCol !== col)) { // Check only other cells
        return false;
      }
    }
  }
  return true;
}


// Main solving function (backtracking) - modifies grid in place
// Returns true if solvable, false otherwise. Used for generation and solving.
export function solveSudokuFill(grid: SudokuGridType): boolean {
  const find = findEmpty(grid);
  if (!find) {
    return true; // Solved
  }
  const [r, c] = find;

  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (const num of numbers) {
    // Check safety against the current state of the grid
    if (isSafe(grid, r, c, num)) {
      grid[r][c] = num;
      if (solveSudokuFill(grid)) {
        return true;
      }
      grid[r][c] = null; // Backtrack
    }
  }
  return false;
}

export interface GeneratedSudoku {
  puzzle: SudokuGridType;
  solution: SudokuGridType;
}

// Generates a Sudoku puzzle and its solution
export function generateSudoku(difficultyLevel: number = 0.5): GeneratedSudoku {
  const solution = createEmptyGrid();
  solveSudokuFill(solution); // Fill the grid completely

  const puzzle = _.cloneDeep(solution);

  // Determine number of cells to remove based on difficulty (0 easy, 1 hard)
  // More cells removed for higher difficulty.
  // Range from ~20 (very easy) to ~55-60 (very hard).
  // Let's say difficulty 0.2 removes 30 cells, 0.8 removes 55 cells.
  // Min cells to keep for a unique solution is 17, but that's extremely hard.
  // Typical puzzles have 22-35 clues.
  // Number of clues = 81 - cellsToRemove.
  // Easy: ~35 clues (46 removed). Medium: ~30 clues (51 removed). Hard: ~25 clues (56 removed).
  
  let cellsToRemove: number;
  if (difficultyLevel <= 0.3) { // Easy
    cellsToRemove = _.random(40, 46);
  } else if (difficultyLevel <= 0.6) { // Medium
    cellsToRemove = _.random(47, 53);
  } else { // Hard
    cellsToRemove = _.random(54, 58);
  }


  let removedCount = 0;
  const attempts = GRID_SIZE * GRID_SIZE * 2; // Limit attempts to avoid infinite loops

  for (let i = 0; i < attempts && removedCount < cellsToRemove; i++) {
    const r = _.random(0, GRID_SIZE - 1);
    const c = _.random(0, GRID_SIZE - 1);

    if (puzzle[r][c] !== null) {
      puzzle[r][c] = null;
      
      // Basic check: ensure there's still *a* solution.
      // A proper generator would check for a *unique* solution here, which is more complex.
      // const testGrid = _.cloneDeep(puzzle);
      // if (!solveSudokuFill(testGrid)) { // If removing makes it unsolvable
      //   puzzle[r][c] = temp; // Put it back
      // } else {
      //   removedCount++;
      // }
      // Simplified removal for now, as uniqueness check is heavy:
      removedCount++;
    }
  }
  return { puzzle, solution };
}

// Renamed from original solveSudoku - finds a solution for a given puzzle state
export function findSolutionForPuzzle(grid: SudokuGridType): SudokuGridType | null {
  const newGrid = _.cloneDeep(grid);
  if (solveSudokuFill(newGrid)) { // Use the in-place solver
    return newGrid;
  }
  return null; // No solution found
}

// Function to check if the current grid is solved correctly against the true solution
export function checkSolution(
  currentGrid: SudokuGridType,
  solution: SudokuGridType
): { isCorrect: boolean; isComplete: boolean; firstError?: [number, number] } {
  let isComplete = true;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (currentGrid[r][c] === null) {
        isComplete = false; // Not fully filled
        // Continue checking for errors even if not complete
      }
      if (currentGrid[r][c] !== null && currentGrid[r][c] !== solution[r][c]) {
        return { isCorrect: false, isComplete, firstError: [r,c] }; // Found a mistake
      }
    }
  }
  // If we reach here, all filled cells match the solution.
  // If isComplete is also true, then it's fully solved.
  return { isCorrect: true, isComplete };
}

// Function to create an empty grid
export function createEmptyGrid(): SudokuGridType {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
}
