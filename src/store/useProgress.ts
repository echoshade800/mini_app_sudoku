import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ExtendedDifficulty, Achievement, PlayerProgress, DifficultyStats } from '../types/game';
import { analytics } from '../bridge/dot';
import StorageUtils from '../utils/StorageUtils';
import { 
  calculateRankPoints, 
  getAchievementFromPoints, 
  isDifficultyUnlocked 
} from '../utils/achievements';

interface ProgressStore extends PlayerProgress {
  // Actions
  recordWin: (difficulty: ExtendedDifficulty, time: number) => Promise<void>;
  updateUnlockedDifficulties: () => void;
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
  clearProgress: () => Promise<void>;
}

const createInitialStats = (): Record<ExtendedDifficulty, DifficultyStats> => ({
  Easy: { totalWins: 0, bestTime: null },
  Medium: { totalWins: 0, bestTime: null },
  Hard: { totalWins: 0, bestTime: null },
  Expert: { totalWins: 0, bestTime: null },
  Master: { totalWins: 0, bestTime: null }
});

const initialState: PlayerProgress = {
  stats: createInitialStats(),
  unlockedDifficulties: new Set(['Easy', 'Medium']),
  achievement: 'Daycare',
  rankPoints: 0
};

export const useProgress = create<ProgressStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    recordWin: async (difficulty: ExtendedDifficulty, time: number) => {
      console.log('recordWin called with:', { difficulty, time });
      const state = get();
      const newStats = { ...state.stats };
      
      // Update stats for this difficulty
      const currentStats = newStats[difficulty];
      newStats[difficulty] = {
        totalWins: currentStats.totalWins + 1,
        bestTime: currentStats.bestTime === null ? time : Math.min(currentStats.bestTime, time)
      };

      // Calculate new rank points and achievement
      const newRankPoints = calculateRankPoints(newStats);
      const newAchievement = getAchievementFromPoints(newRankPoints);

      // Check for achievement upgrade
      const achievementUpgraded = newAchievement !== state.achievement;

      set({
        stats: newStats,
        rankPoints: newRankPoints,
        achievement: newAchievement
      });

      // Update unlocked difficulties
      get().updateUnlockedDifficulties();

      // Save progress
      await get().saveProgress();

      // Track analytics
      analytics.track('game_win', {
        difficulty,
        time,
        totalWins: newStats[difficulty].totalWins,
        rankPoints: newRankPoints,
        achievement: newAchievement,
        achievementUpgraded
      });

      if (achievementUpgraded) {
        analytics.track('achievement_unlocked', {
          achievement: newAchievement,
          rankPoints: newRankPoints
        });
      }
    },

    updateUnlockedDifficulties: () => {
      const state = get();
      const newUnlocked = new Set<ExtendedDifficulty>(['Easy', 'Medium']);

      (['Hard', 'Expert', 'Master'] as ExtendedDifficulty[]).forEach(difficulty => {
        if (isDifficultyUnlocked(difficulty, state.stats)) {
          newUnlocked.add(difficulty);
        }
      });

      set({ unlockedDifficulties: newUnlocked });
    },

    saveProgress: async () => {
      const state = get();
      const progressData = {
        stats: state.stats,
        unlockedDifficulties: Array.from(state.unlockedDifficulties),
        achievement: state.achievement,
        rankPoints: state.rankPoints
      };

      console.log('Saving progress:', progressData);
      try {
        const success = StorageUtils.setData({ progress: progressData });
        if (success) {
          console.log('Progress saved successfully using StorageUtils');
        } else {
          console.warn('Failed to save progress using StorageUtils');
        }
      } catch (error) {
        console.warn('Failed to save progress:', error);
      }
    },

    loadProgress: async () => {
      try {
        const savedData = StorageUtils.getData();
        if (savedData && savedData.progress) {
          const progressData = savedData.progress;
          set({
            stats: progressData.stats || createInitialStats(),
            unlockedDifficulties: new Set(progressData.unlockedDifficulties || ['Easy', 'Medium']),
            achievement: progressData.achievement || 'Daycare',
            rankPoints: progressData.rankPoints || 0
          });
          
          // Ensure unlocked difficulties are up to date
          get().updateUnlockedDifficulties();
          console.log('Progress loaded successfully using StorageUtils');
        } else {
          console.log('No progress data found, using initial state');
        }
      } catch (error) {
        console.warn('Failed to load progress:', error);
      }
    },

    clearProgress: async () => {
      try {
        const success = StorageUtils.setData({ progress: null });
        if (success) {
          set({
            ...initialState,
            unlockedDifficulties: new Set(['Easy', 'Medium'])
          });
          analytics.track('progress_cleared');
          console.log('Progress cleared successfully using StorageUtils');
        } else {
          console.warn('Failed to clear progress using StorageUtils');
        }
      } catch (error) {
        console.warn('Failed to clear progress:', error);
      }
    }
  }))
);