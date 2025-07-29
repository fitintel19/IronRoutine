import { AchievementType, AchievementCategory, AchievementDifficulty } from '../types/index.js';

export const achievementDefinitions = {
  // First Time Achievements
  [AchievementType.FIRST_WORKOUT]: {
    name: 'First Steps',
    description: 'Complete your very first workout',
    icon: '🎯',
    category: AchievementCategory.MILESTONE,
    difficulty: AchievementDifficulty.BRONZE,
    points: 10,
    requirement: 1,
    checkFunction: (stats) => stats.totalWorkouts >= 1
  },
  
  [AchievementType.FIRST_WEEK]: {
    name: 'Week One Complete',
    description: 'You\'ve been working out for a full week!',
    icon: '📅',
    category: AchievementCategory.MILESTONE,
    difficulty: AchievementDifficulty.BRONZE,
    points: 25,
    requirement: 7,
    checkFunction: (stats) => stats.daysActive >= 7
  },
  
  // Workout Count Milestones
  [AchievementType.WORKOUTS_5]: {
    name: 'Getting Started',
    description: 'Complete 5 workouts',
    icon: '💪',
    category: AchievementCategory.MILESTONE,
    difficulty: AchievementDifficulty.BRONZE,
    points: 25,
    requirement: 5,
    checkFunction: (stats) => stats.totalWorkouts >= 5
  },
  
  [AchievementType.WORKOUTS_10]: {
    name: 'Committed',
    description: 'Complete 10 workouts',
    icon: '🏋️',
    category: AchievementCategory.MILESTONE,
    difficulty: AchievementDifficulty.SILVER,
    points: 50,
    requirement: 10,
    checkFunction: (stats) => stats.totalWorkouts >= 10
  },
  
  [AchievementType.WORKOUTS_25]: {
    name: 'Quarter Century',
    description: 'Complete 25 workouts',
    icon: '🏆',
    category: AchievementCategory.MILESTONE,
    difficulty: AchievementDifficulty.SILVER,
    points: 100,
    requirement: 25,
    checkFunction: (stats) => stats.totalWorkouts >= 25
  },
  
  [AchievementType.WORKOUTS_50]: {
    name: 'Half Century',
    description: 'Complete 50 workouts',
    icon: '👑',
    category: AchievementCategory.MILESTONE,
    difficulty: AchievementDifficulty.GOLD,
    points: 200,
    requirement: 50,
    checkFunction: (stats) => stats.totalWorkouts >= 50
  },
  
  [AchievementType.WORKOUTS_100]: {
    name: 'Century Club',
    description: 'Complete 100 workouts - You\'re a legend!',
    icon: '🌟',
    category: AchievementCategory.MILESTONE,
    difficulty: AchievementDifficulty.PLATINUM,
    points: 500,
    requirement: 100,
    checkFunction: (stats) => stats.totalWorkouts >= 100
  },
  
  // Streak Achievements
  [AchievementType.STREAK_3]: {
    name: 'On Fire',
    description: 'Workout 3 days in a row',
    icon: '🔥',
    category: AchievementCategory.STREAK,
    difficulty: AchievementDifficulty.BRONZE,
    points: 30,
    requirement: 3,
    checkFunction: (stats) => stats.currentStreak >= 3
  },
  
  [AchievementType.STREAK_7]: {
    name: 'Week Warrior',
    description: 'Workout 7 days in a row',
    icon: '⚡',
    category: AchievementCategory.STREAK,
    difficulty: AchievementDifficulty.SILVER,
    points: 75,
    requirement: 7,
    checkFunction: (stats) => stats.currentStreak >= 7
  },
  
  [AchievementType.STREAK_14]: {
    name: 'Two Week Titan',
    description: 'Workout 14 days in a row',
    icon: '🚀',
    category: AchievementCategory.STREAK,
    difficulty: AchievementDifficulty.GOLD,
    points: 150,
    requirement: 14,
    checkFunction: (stats) => stats.currentStreak >= 14
  },
  
  [AchievementType.STREAK_30]: {
    name: 'Unstoppable',
    description: 'Workout 30 days in a row - Incredible!',
    icon: '💎',
    category: AchievementCategory.STREAK,
    difficulty: AchievementDifficulty.PLATINUM,
    points: 300,
    requirement: 30,
    checkFunction: (stats) => stats.currentStreak >= 30
  },
  
  // Time-based Achievements
  [AchievementType.TIME_30MIN]: {
    name: 'Time Keeper',
    description: 'Log 30 minutes of total workout time',
    icon: '⏱️',
    category: AchievementCategory.TIME,
    difficulty: AchievementDifficulty.BRONZE,
    points: 15,
    requirement: 30,
    checkFunction: (stats) => stats.totalMinutes >= 30
  },
  
  [AchievementType.TIME_1HOUR]: {
    name: 'Hour Power',
    description: 'Log 1 hour of total workout time',
    icon: '⏰',
    category: AchievementCategory.TIME,
    difficulty: AchievementDifficulty.SILVER,
    points: 40,
    requirement: 60,
    checkFunction: (stats) => stats.totalMinutes >= 60
  },
  
  [AchievementType.TIME_5HOURS]: {
    name: 'Time Master',
    description: 'Log 5 hours of total workout time',
    icon: '🕐',
    category: AchievementCategory.TIME,
    difficulty: AchievementDifficulty.GOLD,
    points: 150,
    requirement: 300,
    checkFunction: (stats) => stats.totalMinutes >= 300
  },
  
  [AchievementType.TIME_10HOURS]: {
    name: 'Time Lord',
    description: 'Log 10 hours of total workout time',
    icon: '👑',
    category: AchievementCategory.TIME,
    difficulty: AchievementDifficulty.PLATINUM,
    points: 300,
    requirement: 600,
    checkFunction: (stats) => stats.totalMinutes >= 600
  },
  
  // Calories Achievements
  [AchievementType.CALORIES_500]: {
    name: 'Calorie Crusher',
    description: 'Burn 500 total calories',
    icon: '🔥',
    category: AchievementCategory.CALORIES,
    difficulty: AchievementDifficulty.BRONZE,
    points: 25,
    requirement: 500,
    checkFunction: (stats) => stats.totalCalories >= 500
  },
  
  [AchievementType.CALORIES_1000]: {
    name: 'Kiloburner',
    description: 'Burn 1,000 total calories',
    icon: '💥',
    category: AchievementCategory.CALORIES,
    difficulty: AchievementDifficulty.SILVER,
    points: 60,
    requirement: 1000,
    checkFunction: (stats) => stats.totalCalories >= 1000
  },
  
  [AchievementType.CALORIES_5000]: {
    name: 'Inferno',
    description: 'Burn 5,000 total calories',
    icon: '🌋',
    category: AchievementCategory.CALORIES,
    difficulty: AchievementDifficulty.GOLD,
    points: 200,
    requirement: 5000,
    checkFunction: (stats) => stats.totalCalories >= 5000
  },
  
  [AchievementType.CALORIES_10000]: {
    name: 'Calorie Destroyer',
    description: 'Burn 10,000 total calories - Incredible dedication!',
    icon: '💀',
    category: AchievementCategory.CALORIES,
    difficulty: AchievementDifficulty.PLATINUM,
    points: 400,
    requirement: 10000,
    checkFunction: (stats) => stats.totalCalories >= 10000
  },
  
  // Days Active Achievements
  [AchievementType.DAYS_ACTIVE_30]: {
    name: 'Monthly Dedication',
    description: 'Stay active for 30 different days',
    icon: '📅',
    category: AchievementCategory.MILESTONE,
    difficulty: AchievementDifficulty.GOLD,
    points: 150,
    requirement: 30,
    checkFunction: (stats) => stats.daysActive >= 30
  },
  
  // Legacy achievements (keeping for compatibility)
  [AchievementType.WEEK_STREAK]: {
    name: 'Week Warrior (Legacy)',
    description: 'Worked out 7 days in a row',
    icon: '🔥',
    category: AchievementCategory.STREAK,
    difficulty: AchievementDifficulty.SILVER,
    points: 50,
    requirement: 7,
    checkFunction: (stats) => stats.currentStreak >= 7
  },
  
  [AchievementType.MONTH_STREAK]: {
    name: 'Monthly Master',
    description: 'Maintained a 30-day workout streak',
    icon: '🏆',
    category: AchievementCategory.STREAK,
    difficulty: AchievementDifficulty.PLATINUM,
    points: 200,
    requirement: 30,
    checkFunction: (stats) => stats.currentStreak >= 30
  },
  
  [AchievementType.TOTAL_WORKOUTS]: {
    name: 'Workout Warrior',
    description: 'Completed 100 workouts',
    icon: '💪',
    category: AchievementCategory.MILESTONE,
    difficulty: AchievementDifficulty.PLATINUM,
    points: 150,
    requirement: 100,
    checkFunction: (stats) => stats.totalWorkouts >= 100
  },
  
  [AchievementType.CALORIES_BURNED]: {
    name: 'Calorie Crusher (Legacy)',
    description: 'Burned 10,000 calories total',
    icon: '🔥',
    category: AchievementCategory.CALORIES,
    difficulty: AchievementDifficulty.PLATINUM,
    points: 100,
    requirement: 10000,
    checkFunction: (stats) => stats.totalCalories >= 10000
  },
  
  [AchievementType.EXERCISE_MASTERY]: {
    name: 'Exercise Expert',
    description: 'Mastered 50 different exercises',
    icon: '🎓',
    category: AchievementCategory.EXERCISE,
    difficulty: AchievementDifficulty.GOLD,
    points: 75,
    requirement: 50,
    checkFunction: (stats) => (stats.uniqueExercises || 0) >= 50
  }
};

export const DIFFICULTY_COLORS = {
  [AchievementDifficulty.BRONZE]: {
    bg: 'bg-amber-600/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    ring: 'ring-amber-500/20'
  },
  [AchievementDifficulty.SILVER]: {
    bg: 'bg-gray-400/20',
    border: 'border-gray-400/30',
    text: 'text-gray-300',
    ring: 'ring-gray-400/20'
  },
  [AchievementDifficulty.GOLD]: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-400/30',
    text: 'text-yellow-400',
    ring: 'ring-yellow-400/20'
  },
  [AchievementDifficulty.PLATINUM]: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-400/30',
    text: 'text-purple-400',
    ring: 'ring-purple-400/20'
  }
};

export function checkForNewAchievements(userStats, userAchievements = []) {
  const existingAchievementIds = userAchievements.map(a => a.achievement_type);
  const newAchievements = [];
  
  for (const [achievementId, definition] of Object.entries(achievementDefinitions)) {
    // Skip if user already has this achievement
    if (existingAchievementIds.includes(achievementId)) {
      continue;
    }
    
    // Check if user qualifies for this achievement
    if (definition.checkFunction(userStats)) {
      newAchievements.push({
        achievement_type: achievementId,
        achievement_data: {
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
          category: definition.category,
          difficulty: definition.difficulty,
          points: definition.points,
          requirement: definition.requirement
        }
      });
    }
  }
  
  return newAchievements;
}

export function checkAchievements(userStats, previousStats = {}) {
  // Legacy function - keeping for compatibility
  const newAchievements = [];

  if (userStats.totalWorkouts === 1 && previousStats.totalWorkouts === 0) {
    newAchievements.push({
      type: AchievementType.FIRST_WORKOUT,
      ...achievementDefinitions[AchievementType.FIRST_WORKOUT]
    });
  }

  if (userStats.totalWorkouts >= 100 && previousStats.totalWorkouts < 100) {
    newAchievements.push({
      type: AchievementType.TOTAL_WORKOUTS,
      ...achievementDefinitions[AchievementType.TOTAL_WORKOUTS]
    });
  }

  if (userStats.totalCalories >= 10000 && (previousStats.totalCalories || 0) < 10000) {
    newAchievements.push({
      type: AchievementType.CALORIES_BURNED,
      ...achievementDefinitions[AchievementType.CALORIES_BURNED]
    });
  }

  if (userStats.currentStreak >= 7 && previousStats.currentStreak < 7) {
    newAchievements.push({
      type: AchievementType.WEEK_STREAK,
      ...achievementDefinitions[AchievementType.WEEK_STREAK]
    });
  }

  if (userStats.currentStreak >= 30 && previousStats.currentStreak < 30) {
    newAchievements.push({
      type: AchievementType.MONTH_STREAK,
      ...achievementDefinitions[AchievementType.MONTH_STREAK]
    });
  }

  return newAchievements;
}

export function calculateAchievementProgress(achievementId, userStats) {
  const definition = achievementDefinitions[achievementId];
  if (!definition) return 0;
  
  let current = 0;
  const requirement = definition.requirement;
  
  switch (definition.category) {
    case AchievementCategory.MILESTONE:
      current = userStats.totalWorkouts || 0;
      break;
    case AchievementCategory.STREAK:
      current = userStats.currentStreak || 0;
      break;
    case AchievementCategory.TIME:
      current = userStats.totalMinutes || 0;
      break;
    case AchievementCategory.CALORIES:
      current = userStats.totalCalories || 0;
      break;
    case AchievementCategory.EXERCISE:
      current = userStats.uniqueExercises || 0;
      break;
    default:
      current = 0;
  }
  
  return Math.min(100, Math.round((current / requirement) * 100));
}

export function getAchievementsByCategory() {
  const categories = {};
  
  for (const [id, achievement] of Object.entries(achievementDefinitions)) {
    if (!categories[achievement.category]) {
      categories[achievement.category] = [];
    }
    categories[achievement.category].push({ id, ...achievement });
  }
  
  return categories;
}

export function formatAchievementStats(userStats) {
  return {
    totalWorkouts: userStats.workouts || 0,
    totalMinutes: userStats.totalMinutes || 0,
    totalCalories: userStats.totalCalories || 0,
    daysActive: userStats.daysActive || 0,
    currentStreak: userStats.currentStreak || 0,
    uniqueExercises: userStats.uniqueExercises || 0
  };
}

export function calculateUserLevel(totalPoints) {
  if (totalPoints < 50) return { level: 1, title: 'Beginner', nextLevelPoints: 50 };
  if (totalPoints < 150) return { level: 2, title: 'Novice', nextLevelPoints: 150 };
  if (totalPoints < 300) return { level: 3, title: 'Intermediate', nextLevelPoints: 300 };
  if (totalPoints < 500) return { level: 4, title: 'Advanced', nextLevelPoints: 500 };
  if (totalPoints < 750) return { level: 5, title: 'Expert', nextLevelPoints: 750 };
  if (totalPoints < 1000) return { level: 6, title: 'Master', nextLevelPoints: 1000 };
  return { level: 7, title: 'Legend', nextLevelPoints: null };
}