import type { Board, Cell, CellValue } from '../types/game';

export class SudokuSolver {
  private board: CellValue[][];

  constructor(board: Board) {
    this.board = this.boardToMatrix(board);
  }

  private boardToMatrix(board: Board): CellValue[][] {
    const matrix: CellValue[][] = [];
    for (let i = 0; i < 9; i++) {
      matrix[i] = [];
      for (let j = 0; j < 9; j++) {
        matrix[i][j] = board[i * 9 + j].value;
      }
    }
    return matrix;
  }

  private matrixToBoard(matrix: CellValue[][], originalBoard: Board): Board {
    const newBoard: Board = originalBoard.map((cell) => ({ ...cell, notes: new Set(cell.notes) }));
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        newBoard[i * 9 + j].value = matrix[i][j];
      }
    }
    return newBoard;
  }

  private isValid(row: number, col: number, num: CellValue): boolean {
    if (num === 0) return true;

    // Check row
    for (let j = 0; j < 9; j++) {
      if (j !== col && this.board[row][j] === num) return false;
    }

    // Check column
    for (let i = 0; i < 9; i++) {
      if (i !== row && this.board[i][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if ((i !== row || j !== col) && this.board[i][j] === num) return false;
      }
    }

    return true;
  }

  private solve(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValid(row, col, num as CellValue)) {
              this.board[row][col] = num as CellValue;
              if (this.solve()) return true;
              this.board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  public getSolution(originalBoard: Board): Board | null {
    const savedBoard = this.board.map(row => [...row]);
    if (this.solve()) {
      const solution = this.matrixToBoard(this.board, originalBoard);
      this.board = savedBoard; // Restore original state
      return solution;
    }
    this.board = savedBoard;
    return null;
  }

  public isUniqueSolution(): boolean {
    let solutionCount = 0;
    this.countSolutions(0, 0, solutionCount);
    return solutionCount === 1;
  }

  private countSolutions(row: number, col: number, count: number): number {
    if (count > 1) return count; // Early termination

    if (row === 9) return count + 1;

    const nextRow = col === 8 ? row + 1 : row;
    const nextCol = col === 8 ? 0 : col + 1;

    if (this.board[row][col] !== 0) {
      return this.countSolutions(nextRow, nextCol, count);
    }

    for (let num = 1; num <= 9 && count <= 1; num++) {
      if (this.isValid(row, col, num as CellValue)) {
        this.board[row][col] = num as CellValue;
        count = this.countSolutions(nextRow, nextCol, count);
        this.board[row][col] = 0;
      }
    }

    return count;
  }

  public getValidNumbers(cellIndex: number): Set<number> {
    const row = Math.floor(cellIndex / 9);
    const col = cellIndex % 9;
    const validNumbers = new Set<number>();

    if (this.board[row][col] !== 0) return validNumbers;

    for (let num = 1; num <= 9; num++) {
      if (this.isValid(row, col, num as CellValue)) {
        validNumbers.add(num);
      }
    }

    return validNumbers;
  }

  public getHint(originalBoard: Board): { cellIndex: number; value: CellValue } | null {
    // Find cells with only one possible value
    for (let i = 0; i < 81; i++) {
      if (originalBoard[i].value === 0) {
        const validNumbers = this.getValidNumbers(i);
        if (validNumbers.size === 1) {
          return {
            cellIndex: i,
            value: Array.from(validNumbers)[0] as CellValue
          };
        }
      }
    }

    // If no obvious moves, find any valid move from solution
    const solution = this.getSolution(originalBoard);
    if (solution) {
      for (let i = 0; i < 81; i++) {
        if (originalBoard[i].value === 0 && solution[i].value !== 0) {
          return {
            cellIndex: i,
            value: solution[i].value
          };
        }
      }
    }

    return null;
  }
}

export function validateBoard(board: Board): { isValid: boolean; conflicts: number[] } {
  const conflicts: number[] = [];
  
  for (let i = 0; i < 81; i++) {
    const cell = board[i];
    if (cell.value === 0) continue;

    const row = Math.floor(i / 9);
    const col = i % 9;
    const value = cell.value;

    // Check row conflicts
    for (let j = 0; j < 9; j++) {
      const checkIndex = row * 9 + j;
      if (j !== col && board[checkIndex].value === value) {
        if (!conflicts.includes(i)) conflicts.push(i);
        if (!conflicts.includes(checkIndex)) conflicts.push(checkIndex);
      }
    }

    // Check column conflicts
    for (let j = 0; j < 9; j++) {
      const checkIndex = j * 9 + col;
      if (j !== row && board[checkIndex].value === value) {
        if (!conflicts.includes(i)) conflicts.push(i);
        if (!conflicts.includes(checkIndex)) conflicts.push(checkIndex);
      }
    }

    // Check box conflicts
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        const checkIndex = r * 9 + c;
        if ((r !== row || c !== col) && board[checkIndex].value === value) {
          if (!conflicts.includes(i)) conflicts.push(i);
          if (!conflicts.includes(checkIndex)) conflicts.push(checkIndex);
        }
      }
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts
  };
}