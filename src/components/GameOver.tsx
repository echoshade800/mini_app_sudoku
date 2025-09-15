import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface GameOverProps {
  onNewGame: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ onNewGame }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 safe-area-inset">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in duration-300">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Game Over
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            You have made 3 mistakes and lost this game.
          </p>

          <button
            onClick={onNewGame}
            className="w-full bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            <RotateCcw size={18} />
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};