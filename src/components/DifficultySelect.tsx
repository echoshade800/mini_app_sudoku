import React from 'react';
import type { ExtendedDifficulty } from '../types/game';

interface DifficultySelectProps {
  onSelect: (difficulty: ExtendedDifficulty) => void;
}

const difficulties: { level: ExtendedDifficulty; description: string }[] = [
  { level: 'Easy', description: 'Great for learning the basics' },
  { level: 'Medium', description: 'A balanced challenge' },
  { level: 'Hard', description: 'For experienced players' },
  { level: 'Expert', description: 'Ultimate challenge' },
  { level: 'Master', description: 'Legendary difficulty' }
];

export const DifficultySelect: React.FC<DifficultySelectProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 safe-area-inset">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-5">
          Select Difficulty
        </h2>
        
        <div className="space-y-3">
          {difficulties.map(({ level, description }) => (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className="w-full p-3 text-left bg-gray-50 active:bg-blue-50 border border-gray-200 active:border-blue-300 rounded-lg transition-all duration-200 group touch-manipulation"
            >
              <div className="font-semibold text-gray-800 group-active:text-blue-700">
                {level}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};