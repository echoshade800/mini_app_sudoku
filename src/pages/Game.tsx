import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Grid } from '../components/Grid';
import { Keypad } from '../components/Keypad';
import { Toolbar } from '../components/Toolbar';
import { GameHeader } from '../components/GameHeader';
import { GameComplete } from '../components/GameComplete';
import { DifficultySelect } from '../components/DifficultySelect';
import { useGame } from '../store/useGame';
import { useProgress } from '../store/useProgress';
import type { CellValue, Difficulty, ExtendedDifficulty } from '../types/game';

interface GameProps {
  difficulty: ExtendedDifficulty;
  onBack: () => void;
}

export const Game: React.FC<GameProps> = ({ difficulty: initialDifficulty, onBack }) => {
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const { recordWin } = useProgress();
  
  const {
    board,
    selectedCell,
    isNotesMode,
    mistakes,
    maxMistakes,
    elapsedTime,
    isComplete,
    isPaused,
    isGameOver,
    sessionMistakes,
    difficulty,
    score,
    hintsUsed,
    maxHints,
    history,
    historyIndex,
    startNewGame,
    selectCell,
    setNumber,
    toggleNotesMode,
    clearCell,
    undo,
    redo,
    useHint,
    pauseGame,
    resumeGame,
    loadGame,
    updateTimer,
    resetGameOver
  } = useGame();

  // Convert ExtendedDifficulty to Difficulty for the game engine
  const gameDifficulty: Difficulty = initialDifficulty === 'Master' ? 'Expert' : initialDifficulty as Difficulty;

  // Load saved game on mount
  useEffect(() => {
    const loadSavedGame = async () => {
      const loaded = await loadGame();
      if (!loaded) {
        // Start new game with the provided difficulty
        startNewGame(gameDifficulty);
      }
    };
    
    loadSavedGame();
  }, [loadGame, gameDifficulty, startNewGame]);

  // Handle game completion
  useEffect(() => {
    if (isComplete && !showDifficultySelect && !isGameOver) {
      // Record the win in progress
      recordWin(initialDifficulty, elapsedTime);
    }
  }, [isComplete, showDifficultySelect, isGameOver, recordWin, initialDifficulty, elapsedTime]);

  // Timer effect
  useEffect(() => {
    if (!isPaused && !isComplete && !isGameOver) {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [updateTimer, isPaused, isComplete, isGameOver]);

  const handleNumberSelect = (value: CellValue) => {
    setNumber(value);
  };

  const handleNewGameSelect = (selectedDifficulty: ExtendedDifficulty) => {
    const newGameDifficulty: Difficulty = selectedDifficulty === 'Master' ? 'Expert' : selectedDifficulty as Difficulty;
    startNewGame(newGameDifficulty);
    setShowDifficultySelect(false);
  };

  const handleNewGame = () => {
    setShowDifficultySelect(true);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hintsRemaining = maxHints - hintsUsed;
  const selectedValue = selectedCell !== null ? board[selectedCell].value : 0;

  // 防止页面滚动和缩放
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchmove', preventZoom);
    };
  }, []);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isComplete || isPaused || isGameOver) return;
      
      const key = e.key;
      if (key >= '1' && key <= '9') {
        handleNumberSelect(parseInt(key) as CellValue);
      } else if (key === '0' || key === 'Delete' || key === 'Backspace') {
        clearCell();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isComplete, isPaused, isGameOver, clearCell]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden safe-area-inset no-select">
      <div className="bg-white shadow-sm border-b border-gray-200 p-3 pb-2">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="p-2 active:bg-gray-100 rounded-full transition-colors touch-manipulation"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {initialDifficulty}
            </h1>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Mistakes</p>
              <p className={`font-semibold text-sm text-red-600`}>
                {mistakes}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Score</p>
              <p className="font-semibold text-sm text-gray-800">{score}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Time</p>
              <div className="flex items-center justify-center gap-2">
                <p className="font-semibold text-sm text-gray-800">
                  {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </p>
                <button
                  onClick={isPaused ? resumeGame : pauseGame}
                  className="p-1 active:bg-gray-100 rounded-full transition-colors touch-manipulation"
                >
                  {isPaused ? (
                    <span className="text-green-600 text-xs">▶</span>
                  ) : (
                    <span className="text-gray-600 text-xs">⏸</span>
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Hints</p>
              <p className="font-semibold text-sm text-gray-800">{hintsRemaining}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center p-3 space-y-3 overflow-hidden">
        {isPaused ? (
          <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Game Paused</h3>
            <button
              onClick={resumeGame}
              className="bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors touch-manipulation"
            >
              Resume
            </button>
          </div>
        ) : (
          <>
            <Grid
              board={board}
              selectedCell={selectedCell}
              onCellSelect={selectCell}
            />

            <div className="space-y-2">
              <Toolbar
                canUndo={canUndo}
                canRedo={canRedo}
                isNotesMode={isNotesMode}
                hintsRemaining={hintsRemaining}
                onUndo={undo}
                onRedo={redo}
                onErase={clearCell}
                onToggleNotes={toggleNotesMode}
                onHint={useHint}
                disabled={isComplete}
              />

              <Keypad
                onNumberSelect={handleNumberSelect}
                disabled={isComplete || isGameOver}
                selectedNumber={selectedValue}
              />
            </div>
          </>
        )}
      </div>

      {showDifficultySelect && (
        <DifficultySelect onSelect={handleNewGameSelect} />
      )}

      {isGameOver && (
        <GameOver onNewGame={handleGameOverNewGame} />
      )}

      {isComplete && !showDifficultySelect && (
        <GameComplete
          difficulty={initialDifficulty}
          elapsedTime={elapsedTime}
          mistakes={mistakes}
          score={score}
          hintsUsed={hintsUsed}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
};