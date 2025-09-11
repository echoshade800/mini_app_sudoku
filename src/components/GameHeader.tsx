import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { Difficulty } from '../types/game';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

interface GameHeaderProps {
  difficulty: Difficulty;
  mistakes: number;
  maxMistakes: number;
  score: number;
  elapsedTime: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  difficulty,
  mistakes,
  score,
  elapsedTime,
  isPaused,
  onPause,
  onResume
}) => {
  const formatTime = (seconds: number): string => {
    const duration = dayjs.duration(seconds, 'seconds');
    return duration.format(seconds >= 3600 ? 'H:mm:ss' : 'm:ss');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-3 pb-2">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-3">
          <h1 className="text-xl font-bold text-gray-800">
            Brain Training
          </h1>
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Difficulty</p>
            <p className="font-semibold text-sm text-gray-800">{difficulty}</p>
          </div>
          
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
                {formatTime(elapsedTime)}
              </p>
              <button
                onClick={isPaused ? onResume : onPause}
                className="p-1 active:bg-gray-100 rounded-full transition-colors touch-manipulation"
              >
                {isPaused ? (
                  <Play size={14} className="text-green-600" />
                ) : (
                  <Pause size={14} className="text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};