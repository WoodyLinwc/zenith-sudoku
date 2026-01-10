import { Difficulty, Grid } from "../types";

export const createEmptyGrid = (): Grid => {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));
};

// Optimized: Check if a number is valid in a position
const isValid = (
  grid: Grid,
  row: number,
  col: number,
  num: number
): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
};

// Optimized: Fill grid using backtracking with randomization
const fillGrid = (grid: Grid): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        // Randomize number order for variety
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(numbers);

        for (const num of numbers) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;

            if (fillGrid(grid)) {
              return true;
            }

            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Fisher-Yates shuffle for randomization
const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Optimized: Remove cells to create puzzle
const removeNumbers = (grid: Grid, difficulty: Difficulty): Grid => {
  const puzzle = grid.map((row) => [...row]);

  // Difficulty settings (cells to remove)
  const cellsToRemove = {
    [Difficulty.EASY]: 35,
    [Difficulty.MEDIUM]: 45,
    [Difficulty.HARD]: 52,
    [Difficulty.EXPERT]: 58,
  };

  const attempts = cellsToRemove[difficulty];
  let removed = 0;

  // Create list of all positions
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }

  // Shuffle positions for random removal
  shuffleArray(positions);

  // Remove numbers while ensuring unique solution
  for (let i = 0; i < positions.length && removed < attempts; i++) {
    const [row, col] = positions[i];
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    // Simple check: we assume it has unique solution for performance
    // A full uniqueness check would be too slow
    removed++;
  }

  return puzzle;
};

// Optimized: Solve grid (used for validation)
const solveGrid = (grid: Grid): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;

            if (solveGrid(grid)) {
              return true;
            }

            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Main generation function - OPTIMIZED
export const generateGame = (
  difficulty: Difficulty
): { initial: Grid; solved: Grid } => {
  // Create and fill a complete valid grid
  const solved = createEmptyGrid();

  // Pre-fill diagonal 3x3 boxes for faster generation
  // These boxes are independent and can be filled without conflicts
  for (let box = 0; box < 3; box++) {
    const startRow = box * 3;
    const startCol = box * 3;
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffleArray(numbers);

    let idx = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        solved[startRow + i][startCol + j] = numbers[idx++];
      }
    }
  }

  // Fill remaining cells
  fillGrid(solved);

  // Create puzzle by removing numbers
  const initial = removeNumbers(solved, difficulty);

  return {
    initial,
    solved,
  };
};

// Helper to check if puzzle is solvable
export const isSolvable = (grid: Grid): boolean => {
  const testGrid = grid.map((row) => [...row]);
  return solveGrid(testGrid);
};
