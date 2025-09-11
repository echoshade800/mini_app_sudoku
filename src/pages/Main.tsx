import React, { useEffect } from 'react';
import { Trophy, Lock } from 'lucide-react';
import type { ExtendedDifficulty } from '../types/game';
import { useProgress } from '../store/useProgress';
import { getUnlockRequirementText } from '../utils/achievements';

interface MainProps {
  onDifficultySelect: (difficulty: ExtendedDifficulty) => void;
  onNavigateToMe: () => void;
}

const difficulties: { level: ExtendedDifficulty; description: string; color: string }[] = [
  { level: 'Easy', description: 'Perfect for beginners', color: 'bg-green-500' },
  { level: 'Medium', description: 'A balanced challenge', color: 'bg-blue-500' },
  { level: 'Hard', description: 'For experienced players', color: 'bg-orange-500' },
  { level: 'Expert', description: 'Ultimate challenge', color: 'bg-red-500' },
  { level: 'Master', description: 'Legendary difficulty', color: 'bg-purple-500' }
];

export const Main: React.FC<MainProps> = ({ onDifficultySelect, onNavigateToMe }) => {
  const { achievement, unlockedDifficulties, stats, loadProgress } = useProgress();

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 safe-area-inset">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-sm mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Brain Training</h1>
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full">
            <Trophy size={18} />
            <span className="font-semibold">{achievement}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-sm mx-auto space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            Select Difficulty
          </h2>

          {difficulties.map(({ level, description, color }) => {
            const isUnlocked = unlockedDifficulties.has(level);
            const requirementText = getUnlockRequirementText(level);
            const wins = stats[level].totalWins;

            return (
              <button
                key={level}
                onClick={() => isUnlocked && onDifficultySelect(level)}
                disabled={!isUnlocked}
                className={`
                  w-full p-4 rounded-xl transition-all duration-200 touch-manipulation
                  ${isUnlocked 
                    ? 'bg-white shadow-md active:shadow-lg active:scale-[0.98] border border-gray-200' 
                    : 'bg-gray-100 border border-gray-300 cursor-not-allowed opacity-60'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? color : 'bg-gray-400'}`}>
                    {isUnlocked ? (
                      <span className="text-white font-bold text-lg">
                        {level.charAt(0)}
                      </span>
                    ) : (
                      <Lock className="text-white" size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold text-lg ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                        {level}
                      </h3>
                      {isUnlocked && wins > 0 && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {wins} wins
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {isUnlocked ? description : requirementText}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-sm mx-auto">
          <button
            onClick={onNavigateToMe}
            className="w-full bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors touch-manipulation"
          >
            View Statistics
          </button>
        </div>
      </div>
    </div>
  );
};