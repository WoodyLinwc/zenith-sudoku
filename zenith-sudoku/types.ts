export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  EXPERT = 'Expert'
}

export type Grid = number[][];

export interface CellCoords {
  row: number;
  col: number;
}

export interface GameState {
  initialGrid: Grid;
  playerGrid: Grid;
  solvedGrid: Grid;
  difficulty: Difficulty;
  mistakes: number;
  isWon: boolean;
  history: Grid[]; // For undo functionality
}

export interface AiHint {
  text: string;
  coords?: CellCoords;
  value?: number;
}