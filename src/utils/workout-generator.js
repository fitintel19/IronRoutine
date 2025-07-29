import { FitnessLevel, WorkoutGoals, EquipmentType } from '../types/index.js';

export function generateWorkoutPrompt(preferences) {
  const { fitnessLevel, goals, duration, equipment } = preferences;
  
  const difficultyMapping = {
    [FitnessLevel.BEGINNER]: 'beginner-friendly with proper form instructions',
    [FitnessLevel.INTERMEDIATE]: 'moderately challenging with progression options',
    [FitnessLevel.ADVANCED]: 'highly challenging with advanced techniques'
  };

  const goalMapping = {
    [WorkoutGoals.STRENGTH]: 'building functional strength with compound movements',
    [WorkoutGoals.MUSCLE]: 'muscle hypertrophy with targeted isolation exercises',
    [WorkoutGoals.ENDURANCE]: 'cardiovascular endurance and stamina',
    [WorkoutGoals.WEIGHT_LOSS]: 'fat burning with high-intensity intervals',
    [WorkoutGoals.GENERAL]: 'overall fitness and wellness'
  };

  const equipmentMapping = {
    [EquipmentType.BODYWEIGHT]: 'bodyweight exercises only',
    [EquipmentType.DUMBBELLS]: 'dumbbell exercises',
    [EquipmentType.FULL_GYM]: 'full gym equipment including barbells, machines, and cables',
    [EquipmentType.HOME_GYM]: 'home gym equipment like dumbbells, resistance bands, and basic machines',
    [EquipmentType.RESISTANCE_BANDS]: 'resistance bands and bodyweight exercises'
  };

  return `Create a ${duration}-minute workout plan that is ${difficultyMapping[fitnessLevel]} and focused on ${goalMapping[goals]}. Use ${equipmentMapping[equipment]}.

  Structure the workout with:
  1. A 5-minute warm-up routine
  2. Main workout exercises (${duration - 10} minutes)
  3. A 5-minute cool-down routine

  For each exercise, provide:
  - Exercise name
  - Sets and reps (or duration for time-based exercises)
  - Brief form instructions
  - Modifications for different fitness levels
  - Rest periods between sets

  Format the response as a JSON object with:
  {
    "name": "Workout name",
    "description": "Brief workout description",
    "warmup": [{"name": "Exercise", "duration": "time", "instructions": "how to perform"}],
    "exercises": [{"name": "Exercise", "sets": "number", "reps": "number or time", "instructions": "form cues", "modifications": "easier/harder options", "restPeriod": "time between sets"}],
    "cooldown": [{"name": "Exercise", "duration": "time", "instructions": "how to perform"}],
    "estimatedCalories": number,
    "difficulty": number (1-10),
    "muscleGroups": ["targeted muscle groups"],
    "notes": "Additional tips or safety considerations"
  }`;
}

export function validateWorkoutData(workoutData) {
  const requiredFields = ['name', 'exercises'];
  const errors = [];

  for (const field of requiredFields) {
    if (!workoutData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (workoutData.exercises && !Array.isArray(workoutData.exercises)) {
    errors.push('Exercises must be an array');
  }

  if (workoutData.exercises && workoutData.exercises.length === 0) {
    errors.push('Workout must contain at least one exercise');
  }

  if (workoutData.difficulty && (workoutData.difficulty < 1 || workoutData.difficulty > 10)) {
    errors.push('Difficulty must be between 1 and 10');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function calculateWorkoutCalories(exercises, duration, fitnessLevel, bodyWeight = 70) {
  const intensityMultipliers = {
    [FitnessLevel.BEGINNER]: 0.8,
    [FitnessLevel.INTERMEDIATE]: 1.0,
    [FitnessLevel.ADVANCED]: 1.2
  };

  const baseCaloriesPerMinute = 8;
  const intensityMultiplier = intensityMultipliers[fitnessLevel] || 1.0;
  const weightMultiplier = bodyWeight / 70;

  return Math.round(duration * baseCaloriesPerMinute * intensityMultiplier * weightMultiplier);
}

export const exerciseDatabase = {
  bodyweight: {
    strength: ['Push-ups', 'Pull-ups', 'Squats', 'Lunges', 'Pike Push-ups', 'Single-leg Squats'],
    cardio: ['Burpees', 'Mountain Climbers', 'Jumping Jacks', 'High Knees', 'Jump Squats'],
    core: ['Plank', 'Side Plank', 'Russian Twists', 'Bicycle Crunches', 'Dead Bug']
  },
  dumbbells: {
    strength: ['Dumbbell Press', 'Rows', 'Goblet Squats', 'Romanian Deadlifts', 'Overhead Press'],
    cardio: ['Dumbbell Thrusters', 'Man Makers', 'Dumbbell Swings', 'Renegade Rows'],
    core: ['Weighted Russian Twists', 'Dumbbell Wood Chops', 'Weighted Plank']
  },
  gym: {
    strength: ['Bench Press', 'Deadlifts', 'Squats', 'Pull-ups', 'Rows', 'Overhead Press'],
    cardio: ['Treadmill Intervals', 'Rowing Machine', 'Battle Ropes', 'Box Jumps'],
    core: ['Cable Crunches', 'Hanging Leg Raises', 'Ab Wheel Rollouts']
  }
};

export function getExerciseRecommendations(equipment, goal, count = 6) {
  const equipmentMap = {
    [EquipmentType.BODYWEIGHT]: 'bodyweight',
    [EquipmentType.DUMBBELLS]: 'dumbbells',
    [EquipmentType.HOME_GYM]: 'dumbbells',
    [EquipmentType.FULL_GYM]: 'gym',
    [EquipmentType.RESISTANCE_BANDS]: 'bodyweight'
  };

  const goalMap = {
    [WorkoutGoals.STRENGTH]: 'strength',
    [WorkoutGoals.MUSCLE]: 'strength',
    [WorkoutGoals.ENDURANCE]: 'cardio',
    [WorkoutGoals.WEIGHT_LOSS]: 'cardio',
    [WorkoutGoals.GENERAL]: 'strength'
  };

  const equipmentType = equipmentMap[equipment] || 'bodyweight';
  const exerciseType = goalMap[goal] || 'strength';

  const exercises = exerciseDatabase[equipmentType]?.[exerciseType] || exerciseDatabase.bodyweight.strength;
  
  return exercises.slice(0, count).map((name) => ({
    name,
    sets: goal === WorkoutGoals.ENDURANCE ? '3' : '3-4',
    reps: goal === WorkoutGoals.ENDURANCE ? '15-20' : '8-12',
    restPeriod: goal === WorkoutGoals.ENDURANCE ? '30-45 seconds' : '60-90 seconds'
  }));
}