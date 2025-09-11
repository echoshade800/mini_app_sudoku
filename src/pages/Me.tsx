import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Clock, Target } from 'lucide-react';
import type { ExtendedDifficulty } from '../types/game';
import { useProgress } from '../store/useProgress';
import { formatTime } from '../utils/achievements';

interface MeProps {
  onBack: () => void;
}

const difficulties: ExtendedDifficulty[] = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];

const difficultyColors: Record<ExtendedDifficulty, string> = {
  Easy: 'border-green-500 text-green-600',
  Medium: 'border-blue-500 text-blue-600',
  Hard: 'border-orange-500 text-orange-600',
  Expert: 'border-red-500 text-red-600',
  Master: 'border-purple-500 text-purple-600'
};

export const Me: React.FC<MeProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<ExtendedDifficulty>('Easy');
  const { achievement, stats, loadProgress } = useProgress();

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const currentStats = stats[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 safe-area-inset">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="p-2 active:bg-gray-100 rounded-full transition-colors touch-manipulation"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Statistics</h1>
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full">
            <Trophy size={18} />
            <span className="font-semibold">{achievement}</span>
          </div>
        </div>
      </div>

      {/* Difficulty Tabs */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-sm mx-auto">
          <div className="flex gap-2 overflow-x-auto">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setActiveTab(difficulty)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all touch-manipulation
                  ${activeTab === difficulty
                    ? `bg-white border-2 ${difficultyColors[difficulty]} shadow-sm`
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent active:bg-gray-200'
                  }
                `}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Content */}
      <div className="flex-1 p-4">
        <div className="max-w-sm mx-auto space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            {activeTab} Statistics
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {/* Total Wins */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="text-green-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm text-gray-500 mb-1">Total Wins</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {currentStats.totalWins}
                  </p>
                </div>
              </div>
            </div>

            {/* Best Time */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm text-gray-500 mb-1">Best Time</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {currentStats.bestTime ? formatTime(currentStats.bestTime) : '--:--'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {currentStats.totalWins === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 text-sm">
                Complete your first {activeTab} game to see statistics here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};