import { html } from 'https://esm.sh/htm/preact';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';
import confetti from 'https://esm.sh/canvas-confetti';
import { trackEvent, calculateDuration } from '../utils.js';

/**
 * GenerateWorkout component for creating and tracking workouts
 * @param {Object} props - Component props
 * @returns {JSX.Element} GenerateWorkout component
 */
const GenerateWorkout = ({ loading, setLoading, user, setShowAuthModal, setAuthMode, setShowUpgradeModal, userSubscription }) => {
  const [formData, setFormData] = useState({
    fitnessLevel: 'beginner',
    goals: 'strength',
    duration: '30',
    equipment: 'bodyweight'
  });
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  // Force the component to always use the clean layout by setting activeWorkout to null
  // This ensures consistent behavior between local and live environments
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutProgress, setWorkoutProgress] = useState({});
  const [usageInfo, setUsageInfo] = useState(null);

  // Fetch usage info when component mounts or user changes
  const fetchUsageInfo = async () => {
    if (!user) return;
    
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const response = await fetch('/api/subscriptions/status', {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsageInfo(data.access);
        }
      }
    } catch (error) {
      console.error('Error fetching usage info:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsageInfo();
    } else {
      setUsageInfo(null);
    }
  }, [user]);

  const handleGenerate = async () => {
    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Check usage limits for free users
    if (usageInfo && !usageInfo.canGenerate) {
      console.log('🚨 TRIGGER 1: Setting showUpgradeModal to true due to usage limits');
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/workouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const workout = await response.json();
      
      // Check if the response indicates usage limit hit
      if (!workout.success && workout.error && workout.error.includes('usage limit')) {
        console.log('🚨 TRIGGER 2: Setting showUpgradeModal to true due to API response');
        setShowUpgradeModal(true);
        setLoading(false);
        return;
      }
      setGeneratedWorkout(workout);
      
      // Track workout generation
      trackEvent('generate_workout', {
        fitness_level: formData.fitnessLevel,
        goal: formData.goals,
        duration: formData.duration,
        equipment: formData.equipment,
        workout_source: workout.source || 'unknown',
        exercise_count: workout.exercises?.length || 0
      });
      
    } catch (error) {
      console.error('Failed to generate workout:', error);
      trackEvent('generate_workout_error', {
        error_message: error.message
      });
    }
    setLoading(false);
  };

  const handleStartWorkout = async () => {
    console.log('Start workout clicked! User:', user);
    
    if (!user) {
      setAuthMode('signin');
      setShowAuthModal(true);
      return;
    }

    if (!generatedWorkout) {
      alert('Please generate a workout first');
      return;
    }

    console.log('Starting workout:', generatedWorkout);

    // Initialize workout session
    const workoutSession = {
      ...generatedWorkout,
      startTime: new Date().toISOString(),
      exercises: generatedWorkout.exercises.map(exercise => ({
        ...exercise,
        completed: false,
        actualSets: []
      }))
    };

    // Set the active workout to show the tracking interface
    setActiveWorkout(workoutSession);
    
    // Track workout start
    trackEvent('start_workout', {
      workout_name: generatedWorkout.name,
      exercise_count: generatedWorkout.exercises?.length || 0,
      estimated_duration: generatedWorkout.userPreferences?.duration || 'unknown',
      fitness_level: generatedWorkout.userPreferences?.fitnessLevel || 'unknown',
      user_id: user.id
    });
    
    // Initialize progress tracking for each exercise
    const initialProgress = {};
    generatedWorkout.exercises.forEach((exercise, index) => {
      initialProgress[index] = {
        currentSet: 0,
        completed: false,
        sets: Array(parseInt(exercise.sets)).fill().map(() => ({
          reps: '',
          weight: '',
          completed: false
        }))
      };
    });
    setWorkoutProgress(initialProgress);
    
    console.log('Workout session started:', workoutSession);
  };

  const handleCompleteSet = (exerciseIndex, setIndex, reps, weight) => {
    const newProgress = { ...workoutProgress };
    newProgress[exerciseIndex].sets[setIndex] = {
      reps: parseInt(reps) || 0,
      weight: parseFloat(weight) || 0,
      completed: true
    };
    
    // Check if exercise is complete
    const allSetsComplete = newProgress[exerciseIndex].sets.every(set => set.completed);
    if (allSetsComplete) {
      newProgress[exerciseIndex].completed = true;
    }
    
    setWorkoutProgress(newProgress);
  };

  const handleFinishWorkout = async () => {
    if (!user || !activeWorkout) return;

    try {
      const completedWorkout = {
        ...activeWorkout,
        endTime: new Date().toISOString(),
        exercises: activeWorkout.exercises.map((exercise, index) => ({
          ...exercise,
          completed: workoutProgress[index]?.completed || false,
          actualSets: workoutProgress[index]?.sets || []
        }))
      };

      // Save workout to database
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const saveResponse = await fetch('/api/workouts/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + session.access_token
          },
          body: JSON.stringify(completedWorkout)
        });
        
        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          console.error('Failed to save workout:', errorData);
          alert('Failed to save workout: ' + (errorData.error || 'Unknown error'));
          return;
        }
        
        console.log('Workout saved successfully');
        
        // Track workout completion
        const completedExercises = completedWorkout.exercises.filter(ex => ex.completed).length;
        const totalExercises = completedWorkout.exercises.length;
        const completionRate = completedExercises / totalExercises;
        
        trackEvent('complete_workout', {
          workout_name: completedWorkout.name,
          duration_minutes: calculateDuration(completedWorkout.startTime, completedWorkout.endTime),
          exercises_completed: completedExercises,
          total_exercises: totalExercises,
          completion_rate: Math.round(completionRate * 100),
          user_id: user.id
        });
        
      } else {
        console.error('No session found for workout save');  
        alert('Please sign in again to save your workout');
        return;
      }

      // Check for new achievements
      try {
        const storedSession = localStorage.getItem('ironroutine_session');
        if (storedSession) {
          const session = JSON.parse(storedSession);
          const achievementResponse = await fetch('/api/achievements/check', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + session.access_token
            }
          });
          
          if (achievementResponse.ok) {
            const { newAchievements } = await achievementResponse.json();
            if (newAchievements.length > 0) {
              // Track achievement unlocks
              newAchievements.forEach(achievement => {
                trackEvent('unlock_achievement', {
                  achievement_name: achievement.achievement_data.name,
                  achievement_type: achievement.achievement_type,
                  achievement_points: achievement.achievement_data.points,
                  user_id: user.id
                });
              });
              
              // Show achievement celebration with confetti
              const achievementNames = newAchievements.map(a => a.achievement_data.name).join(', ');
              
              // Trigger confetti animation
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#a855f7', '#ec4899', '#8b5cf6', '#f59e0b']
              });
              
              // Show achievement notification
              setTimeout(() => {
                alert('🎉 Achievement Unlocked! ' + achievementNames);
              }, 500);
            }
          } else {
            const errorData = await achievementResponse.json();
            console.error('Achievement check failed:', errorData);
          }
        }
      } catch (achievementError) {
        console.error('Achievement check failed:', achievementError);
      }

      // Celebrate workout completion with confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b']
      });
      
      // Reset workout state
      setActiveWorkout(null);
      setWorkoutProgress({});
      alert('🎉 Workout completed and saved!');
    } catch (error) {
      console.error('Failed to save workout:', error);
      alert('Failed to save workout. Please try again.');
    }
  };

  // If there's an active workout, show the tracking interface
  if (activeWorkout) {
    return html`
      <div class="max-w-6xl mx-auto">
        <!-- Modern Header with Professional Buttons -->
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Active Workout</h2>
              <p class="text-lg text-purple-400 font-medium">${activeWorkout.name}</p>
            </div>
            <div class="flex gap-6">
              <button 
                onClick=${() => setActiveWorkout(null)}
                class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-gray-500/25 hover:shadow-gray-500/40 border border-gray-500/30 transition-all duration-200 transform hover:scale-105"
              >
                Back to Generate
              </button>
              <button 
                onClick=${handleFinishWorkout}
                class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 border border-green-400/30 transition-all duration-200 transform hover:scale-105"
              >
                Finish Workout
              </button>
            </div>
          </div>
        </div>
        
        <!-- Modern Exercise Cards -->
        <div class="space-y-8">
          ${activeWorkout.exercises?.map((exercise, exerciseIndex) => {
            const completedSets = workoutProgress[exerciseIndex]?.sets?.filter(set => set.completed).length || 0;
            const totalSets = parseInt(exercise.sets);
            const progressPercentage = (completedSets / totalSets) * 100;
            
            return html`
              <div key=${exerciseIndex} class="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
                <!-- Exercise Header -->
                <div class="bg-gradient-to-r from-purple-900/50 to-pink-900/30 p-6 border-b border-gray-700/50">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-2xl font-bold text-white">${exercise.name}</h3>
                    <div class="text-right">
                      <div class="text-lg font-semibold text-purple-400">${exercise.sets} sets × ${exercise.reps} reps</div>
                      <div class="text-sm text-gray-400">${completedSets}/${totalSets} sets completed</div>
                    </div>
                  </div>
                  
                  ${exercise.notes && html`
                    <p class="text-gray-300 bg-gray-900/30 rounded-lg p-3 text-sm">${exercise.notes}</p>
                  `}
                  
                  <!-- Progress Bar -->
                  <div class="mt-4">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-gray-400">Progress</span>
                      <span class="text-sm font-medium text-purple-400">${Math.round(progressPercentage)}%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style="width: ${progressPercentage}%"
                      ></div>
                    </div>
                  </div>
                </div>
                
                <!-- Sets Grid -->
                <div class="p-6">
                  <div class="grid gap-4">
                    ${Array(parseInt(exercise.sets)).fill().map((_, setIndex) => {
                      const setData = workoutProgress[exerciseIndex]?.sets[setIndex] || {};
                      const isCompleted = setData.completed;
                      
                      return html`
                        <div key=${setIndex} class="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border ${isCompleted ? 'border-green-500/40 bg-green-900/10' : 'border-gray-700/50'} transition-all duration-300">
                          <div class="flex items-center justify-between gap-6">
                            <!-- Set Number -->
                            <div class="flex items-center gap-4 min-w-0">
                              <div class="${isCompleted ? 'bg-green-500' : 'bg-purple-500'} text-white font-bold w-10 h-10 rounded-full flex items-center justify-center">
                                ${isCompleted ? '✓' : setIndex + 1}
                              </div>
                              <span class="font-semibold text-white text-lg">Set ${setIndex + 1}</span>
                            </div>
                            
                            <!-- Input Fields -->
                            <div class="flex items-center gap-6">
                              <div class="flex items-center gap-3">
                                <label class="text-sm font-medium text-gray-300 min-w-[40px]">Reps:</label>
                                <input 
                                  type="number" 
                                  value=${setData.reps || ''}
                                  onChange=${(e) => {
                                    const newProgress = { ...workoutProgress };
                                    if (!newProgress[exerciseIndex]) newProgress[exerciseIndex] = { sets: [] };
                                    if (!newProgress[exerciseIndex].sets[setIndex]) newProgress[exerciseIndex].sets[setIndex] = {};
                                    newProgress[exerciseIndex].sets[setIndex].reps = e.target.value;
                                    setWorkoutProgress(newProgress);
                                  }}
                                  class="w-24 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                  placeholder=${exercise.reps}
                                />
                              </div>
                              
                              ${!exercise.name.toLowerCase().includes('bodyweight') && !exercise.name.toLowerCase().includes('plank') && html`
                                <div class="flex items-center gap-3">
                                  <label class="text-sm font-medium text-gray-300 min-w-[50px]">Weight:</label>
                                  <input 
                                    type="number" 
                                    step="0.5"
                                    value=${setData.weight || ''}
                                    onChange=${(e) => {
                                      const newProgress = { ...workoutProgress };
                                      if (!newProgress[exerciseIndex]) newProgress[exerciseIndex] = { sets: [] };
                                      if (!newProgress[exerciseIndex].sets[setIndex]) newProgress[exerciseIndex].sets[setIndex] = {};
                                      newProgress[exerciseIndex].sets[setIndex].weight = e.target.value;
                                      setWorkoutProgress(newProgress);
                                    }}
                                    class="w-24 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                    placeholder="0"
                                  />
                                  <span class="text-sm text-gray-400 min-w-[25px]">lbs</span>
                                </div>
                              `}
                            </div>
                            
                            <!-- Complete Button -->
                            <button 
                              onClick=${() => handleCompleteSet(exerciseIndex, setIndex, workoutProgress[exerciseIndex]?.sets[setIndex]?.reps || exercise.reps, workoutProgress[exerciseIndex]?.sets[setIndex]?.weight || 0)}
                              class="${isCompleted 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/25 hover:shadow-green-500/40 border-green-400/30' 
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-500/25 hover:shadow-purple-500/40 border-purple-400/30'
                              } text-white font-bold px-6 py-3 rounded-xl shadow-lg border transition-all duration-200 transform hover:scale-105 min-w-[120px]"
                            >
                              ${isCompleted ? '✓ Done' : 'Complete'}
                            </button>
                          </div>
                        </div>
                      `;
                    })}
                  </div>
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  return html`
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8 text-center">Generate Your Workout</h2>
      
      <div class="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 class="text-xl font-semibold mb-4">Workout Preferences</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Fitness Level</label>
              <select 
                value=${formData.fitnessLevel}
                onChange=${(e) => setFormData({...formData, fitnessLevel: e.target.value})}
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Primary Goal</label>
              <select 
                value=${formData.goals}
                onChange=${(e) => setFormData({...formData, goals: e.target.value})}
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              >
                <option value="strength">Build Strength</option>
                <option value="muscle">Build Muscle</option>
                <option value="endurance">Improve Endurance</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="general">General Fitness</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Duration (minutes)</label>
              <select 
                value=${formData.duration}
                onChange=${(e) => setFormData({...formData, duration: e.target.value})}
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2 text-white">Available Equipment</label>
              <select 
                value=${formData.equipment}
                onChange=${(e) => setFormData({...formData, equipment: e.target.value})}
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              >
                <option value="bodyweight">Bodyweight Only</option>
                <option value="dumbbells">Dumbbells</option>
                <option value="full_gym">Full Gym</option>
                <option value="home_gym">Home Gym</option>
                <option value="resistance_bands">Resistance Bands</option>
              </select>
            </div>
            
            ${user && usageInfo && html`
              <div class="mb-4 p-3 rounded-lg ${usageInfo.tier === 'premium' ? 'bg-green-900/20 border border-green-500/30' : 'bg-orange-900/20 border border-orange-500/30'}">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    ${usageInfo.tier === 'premium' ? html`
                      <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span class="text-green-400 font-medium">Premium</span>
                    ` : html`
                      <svg class="w-5 h-5 text-orange-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      <span class="text-orange-400 font-medium"></span>
                    `}
                  </div>
                  ${usageInfo.tier === 'premium' ? html`
                    <span class="text-green-300 text-sm">Unlimited workouts</span>
                  ` : html`
                    <div class="text-right">
                      <div class="text-orange-300 text-sm">${usageInfo.remaining || 0} workouts left today</div>
                      ${!usageInfo.canGenerate && html`
                        <button 
                          onClick=${(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🚨 TRIGGER 3: Upgrade button clicked');
                            console.log('🚨 TRIGGER 3: Setting showUpgradeModal to true via small button');
                            setShowUpgradeModal(true);
                            console.log('🚨 TRIGGER 3: setShowUpgradeModal called');
                            return false;
                          }}
                          class="text-purple-400 hover:text-purple-300 text-xs underline mt-1"
                        >
                          Upgrade for unlimited
                        </button>
                      `}
                    </div>
                  `}
                </div>
              </div>
            `}
            
            <button 
              onClick=${handleGenerate}
              disabled=${loading || (usageInfo && !usageInfo.canGenerate)}
              class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:shadow-none border border-purple-400/30 disabled:border-gray-500/30 transition-all transform hover:scale-105 disabled:transform-none"
            >
              ${loading ? 'Generating...' : (usageInfo && !usageInfo.canGenerate ? 'Daily limit reached' : 'Generate Workout')}
            </button>
          </div>
        </div>
        
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 class="text-xl font-semibold mb-4">
            Your Workout
          </h3>
          
          ${generatedWorkout ? html`
            <div class="space-y-4">
              <h4 class="text-lg font-medium text-purple-400">${generatedWorkout.name}</h4>
              <p class="text-gray-300">${generatedWorkout.description}</p>
              
              <div class="space-y-3">
                ${generatedWorkout.exercises?.map((exercise, index) => html`
                  <div key=${index} class="bg-gray-700/50 rounded-lg p-3">
                    <div class="font-medium">${exercise.name}</div>
                    <div class="text-sm text-gray-400">${exercise.sets} sets × ${exercise.reps} reps</div>
                    ${exercise.notes && html`<div class="text-sm text-gray-300 mt-1">${exercise.notes}</div>`}
                  </div>
                `)}
              </div>
              
              <button 
                onClick=${handleStartWorkout}
                class="w-full ${user ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 border border-green-400/30' : 'bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-500 hover:to-gray-500 shadow-lg shadow-gray-500/25 hover:shadow-gray-500/40 border border-gray-500/30'} text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105"
              >
                ${user ? 'Start Workout' : 'Sign In to Track Workout'}
              </button>
            </div>
          ` : html`
            <div class="text-center text-gray-400 py-8">
              <div class="text-4xl mb-4">💪</div>
              <p>Generate a custom workout to get started!</p>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
};

export default GenerateWorkout;