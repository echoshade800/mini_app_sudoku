import type { ExtendedDifficulty, Achievement, PlayerProgress } from '../types/game';

export const DIFFICULTY_WEIGHTS: Record<ExtendedDifficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 4,
  Expert: 7,
  Master: 11
};

export const ACHIEVEMENT_THRESHOLDS: Record<Achievement, number> = {
  'Daycare': 0,
  'Kindergarten': 5,
  'Elementary School': 15,
  'Middle School': 35,
  'High School': 70,
  'University': 140,
  'Graduate School': 280,
  'Genius': 500
};

export const UNLOCK_REQUIREMENTS: Record<ExtendedDifficulty, { difficulty: ExtendedDifficulty; wins: number } | null> = {
  Easy: null,
  Medium: null,
  Hard: { difficulty: 'Medium', wins: 2 },
  Expert: { difficulty: 'Hard', wins: 4 },
  Master: { difficulty: 'Expert', wins: 10 }
};

export function calculateRankPoints(stats: Record<ExtendedDifficulty, { totalWins: number }>): number {
  return Object.entries(stats).reduce((total, [difficulty, stat]) => {
    const weight = DIFFICULTY_WEIGHTS[difficulty as ExtendedDifficulty];
    return total + (stat.totalWins * weight);
  }, 0);
}

export function getAchievementFromPoints(points: number): Achievement {
  const achievements = Object.entries(ACHIEVEMENT_THRESHOLDS)
    .sort(([, a], [, b]) => b - a);
  
  for (const [achievement, threshold] of achievements) {
    if (points >= threshold) {
      return achievement as Achievement;
    }
  }
  
  return 'Daycare';
}

export function isDifficultyUnlocked(
  difficulty: ExtendedDifficulty, 
  stats: Record<ExtendedDifficulty, { totalWins: number }>
): boolean {
  const requirement = UNLOCK_REQUIREMENTS[difficulty];
  if (!requirement) return true;
  
  return stats[requirement.difficulty].totalWins >= requirement.wins;
}

export function getUnlockRequirementText(difficulty: ExtendedDifficulty): string {
  const requirement = UNLOCK_REQUIREMENTS[difficulty];
  if (!requirement) return '';
  
  return `Complete ${requirement.wins} ${requirement.difficulty} games`;
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}