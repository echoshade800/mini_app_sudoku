import React, { useState } from 'react';
import { Game } from './pages/Game';
import { Main } from './pages/Main';
import { Me } from './pages/Me';
import type { ExtendedDifficulty } from './types/game';

type AppState = 'main' | 'game' | 'me';

function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('main');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExtendedDifficulty>('Easy');

  const handleDifficultySelect = (difficulty: ExtendedDifficulty) => {
    setSelectedDifficulty(difficulty);
    setCurrentPage('game');
  };

  const handleBackToMain = () => {
    setCurrentPage('main');
  };

  const handleNavigateToMe = () => {
    setCurrentPage('me');
  };

  switch (currentPage) {
    case 'main':
      return (
        <Main 
          onDifficultySelect={handleDifficultySelect}
          onNavigateToMe={handleNavigateToMe}
        />
      );
    case 'me':
      return <Me onBack={handleBackToMain} />;
    case 'game':
      return (
        <Game 
          difficulty={selectedDifficulty}
          onBack={handleBackToMain}
        />
      );
    default:
      return (
        <Main 
          onDifficultySelect={handleDifficultySelect}
          onNavigateToMe={handleNavigateToMe}
        />
      );
  }
}

export default App;