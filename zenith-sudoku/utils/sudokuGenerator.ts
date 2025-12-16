import { Difficulty, Grid } from '../types';

// Constants
const BLANK = 0;
const SIZE = 9;

// Utility to create an empty 9x9 grid
export const createEmptyGrid = (): Grid => Array.from({ length: SIZE }, () => Array(SIZE).fill(BLANK));

// Check if placing num at board[row][col] is valid
const isValid = (board: Grid, row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < SIZE; x++) {
    if (board[row][x] === num) return false;
  }

  // Check col
  for (let x = 0; x < SIZE; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
};

// Solves the board using backtracking. Returns true if solvable.
// Modifies the board in place.
const solveSudoku = (board: Grid): boolean => {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === BLANK) {
        // Try numbers 1-9
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        // Shuffle for randomness in generation
        for (let i = nums.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nums[i], nums[j]] = [nums[j], nums[i]];
        }

        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = BLANK;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Generate a new game
export const generateGame = (difficulty: Difficulty): { initial: Grid, solved: Grid } => {
  // 1. Create a full valid board
  const solved = createEmptyGrid();
  
  // Fill diagonal 3x3 boxes first (independent of each other) to optimize
  for (let i = 0; i < SIZE; i = i + 3) {
    fillBox(solved, i, i);
  }

  // Solve the rest
  solveSudoku(solved);

  // 2. Remove digits based on difficulty
  const initial = JSON.parse(JSON.stringify(solved)); // Deep copy
  let attempts = 0;
  
  switch (difficulty) {
    case Difficulty.EASY: attempts = 30; break;
    case Difficulty.MEDIUM: attempts = 45; break;
    case Difficulty.HARD: attempts = 55; break;
    case Difficulty.EXPERT: attempts = 64; break;
    default: attempts = 40;
  }

  while (attempts > 0) {
    let row = Math.floor(Math.random() * SIZE);
    let col = Math.floor(Math.random() * SIZE);
    while (initial[row][col] === BLANK) {
      row = Math.floor(Math.random() * SIZE);
      col = Math.floor(Math.random() * SIZE);
    }
    
    // Backup
    const backup = initial[row][col];
    initial[row][col] = BLANK;

    // Check if unique solution exists (simplified: just remove, complex unique check is slow for client)
    // For a robust game, we usually run a solver here to count solutions. 
    // To keep it responsive, we will just trust the removal count for now, 
    // or implement a quick check.
    
    // A proper unique check:
    const copy = JSON.parse(JSON.stringify(initial));
    if (!hasUniqueSolution(copy)) {
      initial[row][col] = backup; // Put it back if removing creates multiple solutions
    } else {
        attempts--;
    }
    // Safety break to prevent infinite loops if constraints are tight
    if (Math.random() > 0.99) attempts--; 
  }

  return { initial, solved };
};

const fillBox = (board: Grid, row: number, col: number) => {
  let num: number;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeInBox(board, row, col, num));
      board[row + i][col + j] = num;
    }
  }
};

const isSafeInBox = (board: Grid, row: number, col: number, num: number) => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[row + i][col + j] === num) return false;
    }
  }
  return true;
};

// Count solutions to ensure uniqueness (Standard backtracking)
const hasUniqueSolution = (board: Grid): boolean => {
    let solutions = 0;
    const solve = (b: Grid): boolean => {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (b[row][col] === BLANK) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValid(b, row, col, num)) {
                            b[row][col] = num;
                            if (solve(b)) {
                                if (solutions > 1) return true;
                            }
                            b[row][col] = BLANK;
                        }
                    }
                    return false;
                }
            }
        }
        solutions++;
        return true;
    };
    solve(board);
    return solutions === 1;
};