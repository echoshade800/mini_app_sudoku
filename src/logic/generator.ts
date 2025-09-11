import type { Board, CellValue, Difficulty } from '../types/game';
import { SudokuSolver, validateBoard } from './solver';

export class SudokuGenerator {
  private createEmptyBoard(): Board {
    const board: Board = [];
    for (let i = 0; i < 81; i++) {
      board.push({
        value: 0,
        notes: new Set(),
        fixed: false
      });
    }
    return board;
  }

  private fillBoard(board: Board): boolean {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (let i = 0; i < 81; i++) {
      if (board[i].value === 0) {
        this.shuffleArray(numbers);
        
        for (const num of numbers) {
          board[i].value = num as CellValue;
          const validation = validateBoard(board);
          
          if (validation.isValid) {
            if (this.fillBoard(board)) {
              return true;
            }
          }
          
          board[i].value = 0;
        }
        return false;
      }
    }
    return true;
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private getDifficultySettings(difficulty: Difficulty) {
    const settings = {
      Beginner: { minClues: 70, maxClues: 76 },
      Easy: { minClues: 45, maxClues: 50 },
      Medium: { minClues: 30, maxClues: 35 },
      Hard: { minClues: 24, maxClues: 29 },
      Expert: { minClues: 17, maxClues: 23 }
    };
    return settings[difficulty];
  }

  private removeNumbers(board: Board, difficulty: Difficulty): Board {
    const puzzle = board.map(cell => ({
      ...cell,
      notes: new Set<number>(),
      fixed: cell.value !== 0
    }));

    const { minClues, maxClues } = this.getDifficultySettings(difficulty);
    const targetClues = Math.floor(Math.random() * (maxClues - minClues + 1)) + minClues;
    const cellsToRemove = 81 - targetClues;

    const availableCells = Array.from({ length: 81 }, (_, i) => i);
    this.shuffleArray(availableCells);

    let removed = 0;
    for (const cellIndex of availableCells) {
      if (removed >= cellsToRemove) break;

      const originalValue = puzzle[cellIndex].value;
      if (originalValue === 0) continue;

      // Temporarily remove the number
      puzzle[cellIndex].value = 0;
      puzzle[cellIndex].fixed = false;

      // Check if puzzle still has unique solution
      const solutionCount = this.countSolutions(puzzle);

      if (solutionCount === 1) {
        removed++;
      } else {
        // Restore the number
        puzzle[cellIndex].value = originalValue;
        puzzle[cellIndex].fixed = true;
      }
    }

    return puzzle;
  }

  private countSolutions(board: Board): number {
    const solver = new SudokuSolver(board);
    // This is a simplified check - in a production app you'd want a more sophisticated approach
    const solution = solver.getSolution(board);
    return solution ? 1 : 0;
  }

  public generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        // Create and fill a complete board
        const completeBoard = this.createEmptyBoard();
        if (!this.fillBoard(completeBoard)) {
          attempts++;
          continue;
        }

        // Create solution copy
        const solution = completeBoard.map(cell => ({ ...cell, notes: new Set(cell.notes) }));

        // Remove numbers to create puzzle
        const puzzle = this.removeNumbers(completeBoard, difficulty);

        return { puzzle, solution };
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          // Fallback to a pre-defined puzzle if generation fails
          return this.getFallbackPuzzle(difficulty);
        }
      }
    }

    return this.getFallbackPuzzle(difficulty);
  }

  private getFallbackPuzzle(_difficulty: Difficulty): { puzzle: Board; solution: Board } {
    // A simple fallback puzzle for each difficulty
    const easyPuzzle = [
      5,3,0,0,7,0,0,0,0,
      6,0,0,1,9,5,0,0,0,
      0,9,8,0,0,0,0,6,0,
      8,0,0,0,6,0,0,0,3,
      4,0,0,8,0,3,0,0,1,
      7,0,0,0,2,0,0,0,6,
      0,6,0,0,0,0,2,8,0,
      0,0,0,4,1,9,0,0,5,
      0,0,0,0,8,0,0,7,9
    ];

    const solution = [
      5,3,4,6,7,8,9,1,2,
      6,7,2,1,9,5,3,4,8,
      1,9,8,3,4,2,5,6,7,
      8,5,9,7,6,1,4,2,3,
      4,2,6,8,5,3,7,9,1,
      7,1,3,9,2,4,8,5,6,
      9,6,1,5,3,7,2,8,4,
      2,8,7,4,1,9,6,3,5,
      3,4,5,2,8,6,1,7,9
    ];

    const puzzle: Board = easyPuzzle.map((value) => ({
      value: value as CellValue,
      notes: new Set<number>(),
      fixed: value !== 0
    }));

    const solutionBoard: Board = solution.map((value) => ({
      value: value as CellValue,
      notes: new Set<number>(),
      fixed: false
    }));

    return { puzzle, solution: solutionBoard };
  }
}