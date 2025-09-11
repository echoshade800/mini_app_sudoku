import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { GameState, Board, CellValue, Difficulty } from '../types/game';
import { SudokuGenerator } from '../logic/generator';
import { SudokuSolver, validateBoard } from '../logic/solver';
import { storage, analytics } from '../bridge/dot';

interface GameHistory {
  board: Board;
  selectedCell: number | null;
  isNotesMode: boolean;
  mistakes: number;
  score: number;
}

interface GameStore extends GameState {
  history: GameHistory[];
  historyIndex: number;
  sessionMistakes: number;
  isGameOver: boolean;
  
  // Actions
  startNewGame: (difficulty: Difficulty) => void;
  selectCell: (index: number | null) => void;
  setNumber: (value: CellValue) => void;
  toggleNotesMode: () => void;
  toggleAutoNotes: () => void;
  clearCell: () => void;
  undo: () => void;
  redo: () => void;
  useHint: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
  clearAllData: () => Promise<void>;
  updateTimer: () => void;
  resetGameOver: () => void;
}

const createEmptyBoard = (): Board => {
  return Array(81).fill(null).map(() => ({
    value: 0 as CellValue,
    notes: new Set<number>(),
    fixed: false
  }));
};

const initialState: GameState = {
  board: createEmptyBoard(),
  solution: createEmptyBoard(),
  selectedCell: null,
  isNotesMode: false,
  mistakes: 0,
  maxMistakes: 5,
  startTime: Date.now(),
  elapsedTime: 0,
  isComplete: false,
  isPaused: false,
  difficulty: 'Medium',
  score: 0,
  hintsUsed: 0,
  maxHints: 3,
  autoNotes: false,
  pausedElapsedTime: 0,
  sessionMistakes: 0,
  isGameOver: false
};

export const useGame = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    history: [],
    historyIndex: -1,

    startNewGame: (difficulty: Difficulty) => {
      const generator = new SudokuGenerator();
      const { puzzle, solution } = generator.generatePuzzle(difficulty);
      
      const newState: Partial<GameState> = {
        board: puzzle,
        solution: solution,
        selectedCell: null,
        isNotesMode: false,
        mistakes: 0,
        startTime: Date.now(),
        elapsedTime: 0,
        isComplete: false,
        isPaused: false,
        difficulty,
        score: 0,
        hintsUsed: 0,
        maxHints: difficulty === 'Beginner' ? 8 : 
                  difficulty === 'Easy' ? 6 : 
                  difficulty === 'Medium' ? 4 : 
                  difficulty === 'Hard' ? 3 : 2,
        maxMistakes: difficulty === 'Beginner' ? 10 : 
                     difficulty === 'Easy' ? 8 : 
                     difficulty === 'Medium' ? 6 : 
                     difficulty === 'Hard' ? 4 : 3,
        autoNotes: difficulty === 'Beginner',
        pausedElapsedTime: 0,
        sessionMistakes: 0,
        isGameOver: false
      };

      set({
        ...newState,
        history: [{
          board: puzzle,
          selectedCell: null,
          isNotesMode: false,
          mistakes: 0,
          score: 0
        }],
        historyIndex: 0
      });

      analytics.track('game_start', { difficulty });
      get().saveGame();
    },

    selectCell: (index: number | null) => {
      const state = get();
      if (state.isComplete || state.isPaused) return;

      set({ selectedCell: index });

      // Auto-fill notes if autoNotes is enabled and cell is empty
      if (index !== null && state.autoNotes && state.board[index].value === 0) {
        const solver = new SudokuSolver(state.board);
        const validNumbers = solver.getValidNumbers(index);
        
        if (validNumbers.size > 0) {
          const newBoard = [...state.board];
          newBoard[index] = {
            ...newBoard[index],
            notes: validNumbers
          };
          set({ board: newBoard });
        }
      }
    },

    setNumber: (value: CellValue) => {
      const state = get();
      if (state.isComplete || state.isPaused || state.isGameOver || state.selectedCell === null) return;

      const cell = state.board[state.selectedCell];
      if (cell.fixed) return;

      const newBoard = [...state.board];
      const targetCell = { ...newBoard[state.selectedCell] };

      if (state.isNotesMode && value !== 0) {
        // Toggle note
        const newNotes = new Set(targetCell.notes);
        if (newNotes.has(value)) {
          newNotes.delete(value);
        } else {
          newNotes.add(value);
        }
        targetCell.notes = newNotes;
      } else {
        // Set actual value
        targetCell.value = value;
        targetCell.notes = new Set(); // Clear notes when setting value
      }

      newBoard[state.selectedCell] = targetCell;

      // Validate board and check for conflicts
      const validation = validateBoard(newBoard);
      const conflictIndexes = new Set(validation.conflicts);
      
      // Mark conflicts
      const boardWithConflicts = newBoard.map((cell, index) => ({
        ...cell,
        isConflict: conflictIndexes.has(index)
      }));

      let newMistakes = state.mistakes;
      let newScore = state.score;
      let isComplete = false;
      let newSessionMistakes = state.sessionMistakes;
      let isGameOver = false;

      // Check if this move is incorrect
      if (value !== 0 && !state.isNotesMode) {
        const correctValue = state.solution[state.selectedCell].value;
        const previousValue = state.board[state.selectedCell].value;
        
        if (value !== correctValue) {
          newMistakes++;
          newSessionMistakes++;
          
          // Check for game over (3 mistakes)
          if (newSessionMistakes >= 3) {
            isGameOver = true;
            analytics.track('game_over', { 
              difficulty: state.difficulty, 
              mistakes: newSessionMistakes,
              time: state.elapsedTime
            });
          }
          
          analytics.track('mistake', { 
            difficulty: state.difficulty, 
            mistakes: newMistakes,
            sessionMistakes: newSessionMistakes
          });
        } else if (previousValue !== correctValue) {
          // Only add score if this is a new correct value (not repeating the same correct value)
          const timeBonus = Math.max(0, 1000 - state.elapsedTime);
          const difficultyMultiplier = {
            'Beginner': 0.5,
            'Easy': 1,
            'Medium': 1.5,
            'Hard': 2,
            'Expert': 3
          }[state.difficulty] || 1;
          newScore += Math.floor(100 * difficultyMultiplier + timeBonus * 0.1);
        }
      }

      // Check if puzzle is complete
      const isFilled = boardWithConflicts.every(cell => cell.value !== 0);
      if (isFilled && validation.isValid && !isGameOver) {
        isComplete = true;
        analytics.track('game_finish', {
          difficulty: state.difficulty,
          time: state.elapsedTime,
          mistakes: newMistakes,
          hints: state.hintsUsed,
          score: newScore,
          sessionMistakes: newSessionMistakes
        });
      }

      // Save to history
      let newHistory = state.history;
      let newHistoryIndex = state.historyIndex;
      
      if (!isGameOver) {
        newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({
          board: boardWithConflicts,
          selectedCell: state.selectedCell,
          isNotesMode: state.isNotesMode,
          mistakes: newMistakes,
          score: newScore
        });
        newHistoryIndex = newHistory.length - 1;
      }

      set({
        board: boardWithConflicts,
        mistakes: newMistakes,
        score: newScore,
        isComplete,
        isGameOver,
        sessionMistakes: newSessionMistakes,
        history: newHistory,
        historyIndex: newHistoryIndex
      });

      get().saveGame();
    },

    toggleNotesMode: () => {
      const state = get();
      if (state.isComplete || state.isPaused) return;
      set({ isNotesMode: !state.isNotesMode });
    },

    toggleAutoNotes: () => {
      const state = get();
      if (state.isComplete || state.isPaused || state.isGameOver) return;
      set({ autoNotes: !state.autoNotes });
    },

    clearCell: () => {
      get().setNumber(0);
    },

    undo: () => {
      const state = get();
      if (state.historyIndex > 0) {
        const prevState = state.history[state.historyIndex - 1];
        set({
          ...prevState,
          historyIndex: state.historyIndex - 1
        });
        get().saveGame();
      }
    },

    redo: () => {
      const state = get();
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        set({
          ...nextState,
          historyIndex: state.historyIndex + 1
        });
        get().saveGame();
      }
    },

    useHint: () => {
      const state = get();
      if (state.isComplete || state.isPaused || state.hintsUsed >= state.maxHints) return;

      const solver = new SudokuSolver(state.board);
      const hint = solver.getHint(state.board);

      if (hint) {
        set({ selectedCell: hint.cellIndex });
        setTimeout(() => {
          get().setNumber(hint.value);
          set({ hintsUsed: state.hintsUsed + 1 });
          analytics.track('hint', { 
            difficulty: state.difficulty, 
            hints: state.hintsUsed + 1 
          });
        }, 100);
      }
    },

    pauseGame: () => {
      const state = get();
      set({ 
        isPaused: true,
        // 记录暂停时已经经过的时间
        pausedElapsedTime: state.elapsedTime
      });
    },

    resumeGame: () => {
      const state = get();
      set({ 
        isPaused: false,
        // 重新设置开始时间，减去已经暂停的时间
        startTime: Date.now() - (state.pausedElapsedTime || 0) * 1000
      });
    },

    updateTimer: () => {
      const state = get();
      if (!state.isPaused && !state.isComplete && !state.isGameOver) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        set({ elapsedTime: elapsed });
      }
    },

    resetGameOver: () => {
      set({ 
        isGameOver: false,
        sessionMistakes: 0
      });
    },

    saveGame: async () => {
      const state = get();
      const gameData = {
        board: state.board,
        solution: state.solution,
        selectedCell: state.selectedCell,
        isNotesMode: state.isNotesMode,
        mistakes: state.mistakes,
        maxMistakes: state.maxMistakes,
        startTime: state.startTime,
        elapsedTime: state.elapsedTime,
        isComplete: state.isComplete,
        isPaused: state.isPaused,
        difficulty: state.difficulty,
        score: state.score,
        hintsUsed: state.hintsUsed,
        maxHints: state.maxHints,
        autoNotes: state.autoNotes,
        pausedElapsedTime: state.pausedElapsedTime,
        history: state.history,
        historyIndex: state.historyIndex
      };

      try {
        await storage.set('sudoku/current', gameData);
      } catch (error) {
        console.warn('Failed to save game:', error);
      }
    },

    loadGame: async () => {
      try {
        const gameData = await storage.get('sudoku/current');
        if (gameData) {
          // Reconstruct Sets in notes
          const board = gameData.board.map((cell: any) => ({
            ...cell,
            notes: new Set(Array.isArray(cell.notes) ? cell.notes : [])
          }));
          
          const solution = gameData.solution.map((cell: any) => ({
            ...cell,
            notes: new Set(Array.isArray(cell.notes) ? cell.notes : [])
          }));

          const history = gameData.history.map((h: any) => ({
            ...h,
            board: h.board.map((cell: any) => ({
              ...cell,
              notes: new Set(Array.isArray(cell.notes) ? cell.notes : [])
            }))
          }));

          set({
            ...gameData,
            board,
            solution,
            history,
            sessionMistakes: gameData.sessionMistakes || 0,
            isGameOver: gameData.isGameOver || false
          });

          return true;
        }
      } catch (error) {
        console.warn('Failed to load game:', error);
      }
      return false;
    },

    clearAllData: async () => {
      try {
        // 清除所有存储的数据
        await storage.set('sudoku/current', null);
        
        // 重置游戏状态到初始状态
        set({
          ...initialState,
          history: [],
          historyIndex: -1,
          sessionMistakes: 0,
          isGameOver: false
        });
        
        analytics.track('clear_all_data');
        console.log('All game data cleared successfully');
      } catch (error) {
        console.warn('Failed to clear game data:', error);
      }
    }
  }))
);