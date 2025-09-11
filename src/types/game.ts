export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Cell {
  value: CellValue;
  notes: Set<number>;
  fixed: boolean;
  isConflict?: boolean;
}

export type Board = Cell[];

export type Difficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert';

export type ExtendedDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Master';

export type Achievement = 
  | 'Daycare' 
  | 'Kindergarten' 
  | 'Elementary School' 
  | 'Middle School' 
  | 'High School' 
  | 'University' 
  | 'Graduate School' 
  | 'Genius';

export interface DifficultyStats {
  totalWins: number;
  bestTime: number | null;
}

export interface PlayerProgress {
  stats: Record<ExtendedDifficulty, DifficultyStats>;
  unlockedDifficulties: Set<ExtendedDifficulty>;
  achievement: Achievement;
  rankPoints: number;
}

export interface GameState {
  board: Board;
  solution: Board;
  selectedCell: number | null;
  isNotesMode: boolean;
  mistakes: number;
  maxMistakes: number;
  startTime: number;
  elapsedTime: number;
  isComplete: boolean;
  isPaused: boolean;
  difficulty: Difficulty;
  score: number;
  hintsUsed: number;
  maxHints: number;
  autoNotes: boolean;
  pausedElapsedTime?: number;
}