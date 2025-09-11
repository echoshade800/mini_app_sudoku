import React, { useEffect, useState } from 'react';
import { Grid } from '../components/Grid';
import { Keypad } from '../components/Keypad';
import { Toolbar } from '../components/Toolbar';
import { GameHeader } from '../components/GameHeader';
import { GameComplete } from '../components/GameComplete';
import { DifficultySelect } from '../components/DifficultySelect';
import { useGame } from '../store/useGame';
import type { CellValue, Difficulty } from '../types/game';

export const Game: React.FC = () => {
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  
  const {
    board,
    selectedCell,
    isNotesMode,
    mistakes,
    maxMistakes,
    elapsedTime,
    isComplete,
    isPaused,
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
    updateTimer
  } = useGame();

  // Load saved game on mount
  useEffect(() => {
    const loadSavedGame = async () => {
      const loaded = await loadGame();
      if (!loaded) {
        setShowDifficultySelect(true);
      }
    };
    
    loadSavedGame();
  }, [loadGame]);

  // Timer effect
  useEffect(() => {
    if (!isPaused && !isComplete) {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [updateTimer, isPaused, isComplete]);

  const handleNumberSelect = (value: CellValue) => {
    setNumber(value);
  };

  const handleNewGameSelect = (selectedDifficulty: Difficulty) => {
    startNewGame(selectedDifficulty);
    setShowDifficultySelect(false);
  };

  const handleNewGame = () => {
    setShowDifficultySelect(true);
    // 重置游戏完成状态，隐藏祝贺弹窗
    // 注意：这里不需要手动重置 isComplete，因为 startNewGame 会重置所有状态
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
      if (isComplete || isPaused) return;
      
      const key = e.key;
      if (key >= '1' && key <= '9') {
        handleNumberSelect(parseInt(key) as CellValue);
      } else if (key === '0' || key === 'Delete' || key === 'Backspace') {
        clearCell();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isComplete, isPaused, clearCell]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden safe-area-inset no-select">
      <GameHeader
        difficulty={difficulty}
        mistakes={mistakes}
        maxMistakes={maxMistakes}
        score={score}
        elapsedTime={elapsedTime}
        isPaused={isPaused}
        onPause={pauseGame}
        onResume={resumeGame}
      />

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
                disabled={isComplete}
                selectedNumber={selectedValue}
              />
            </div>
          </>
        )}
      </div>

      {showDifficultySelect && (
        <DifficultySelect onSelect={handleNewGameSelect} />
      )}

      {isComplete && !showDifficultySelect && (
        <GameComplete
          difficulty={difficulty}
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