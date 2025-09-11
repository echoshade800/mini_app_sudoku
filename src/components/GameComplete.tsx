import React from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import dayjs from 'dayjs';
import type { Difficulty } from '../types/game';

interface GameCompleteProps {
  difficulty: Difficulty;
  elapsedTime: number;
  mistakes: number;
  score: number;
  hintsUsed: number;
  onNewGame: () => void;
}

export const GameComplete: React.FC<GameCompleteProps> = ({
  difficulty,
  elapsedTime,
  mistakes,
  score,
  hintsUsed,
  onNewGame
}) => {
  const formatTime = (seconds: number): string => {
    const duration = dayjs.duration(seconds, 'seconds');
    return duration.format(seconds >= 3600 ? 'H:mm:ss' : 'm:ss');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 safe-area-inset">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 animate-in zoom-in duration-300">
        <div className="text-center">
          <div className="bg-yellow-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-yellow-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Congratulations!
          </h2>
          
          <p className="text-sm text-gray-600 mb-5">
            You've successfully completed this {difficulty} puzzle!
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-500">Time</p>
              <p className="font-semibold text-gray-800">{formatTime(elapsedTime)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-500">Score</p>
              <p className="font-semibold text-gray-800">{score}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-500">Mistakes</p>
              <p className="font-semibold text-gray-800">{mistakes}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-500">Hints Used</p>
              <p className="font-semibold text-gray-800">{hintsUsed}</p>
            </div>
          </div>

          <button
            onClick={onNewGame}
            className="w-full bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            <RotateCcw size={18} />
            Next Round
          </button>
        </div>
      </div>
    </div>
  );
};