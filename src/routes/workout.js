import { Hono } from 'hono';
import { OpenAI } from 'openai';
import { createSupabaseClient, WorkoutDatabase } from '../lib/database.js';

const app = new Hono();

// Debug endpoint to check access control status
app.get('/debug-access', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createSupabaseClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const db = new WorkoutDatabase(supabase);
    
    // Get user record
    const { data: userRecord, error: recordError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get access check
    const accessCheck = await db.canGenerateWorkout(user.id);
    
    // Get daily count
    const todayCount = await db.getDailyGenerationCount(user.id);
    
    // Get recent generations
    const { data: generations } = await supabase
      .from('workout_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(10);

    return c.json({
      userId: user.id,
      userRecord: userRecord,
      recordError: recordError?.message,
      accessCheck,
      todayCount,
      totalGenerations: generations?.length || 0,
      recentGenerations: generations || []
    });

  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/generate', async (c) => {
  try {
    // Get user authentication
    const authHeader = c.req.header('Authorization');
    let user = null;
    let generationType = 'fallback';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      const supabase = createSupabaseClient(
        c.env.SUPABASE_URL,
        c.env.SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );

      try {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
        if (!userError && authUser) {
          user = authUser;
          
          // Check if user can generate workout (access control)
          const db = new WorkoutDatabase(supabase);
          console.log(`🔍 Checking access for user ${user.id}`);
          
          const accessCheck = await db.canGenerateWorkout(user.id);
          console.log(`🔍 Access check result:`, JSON.stringify(accessCheck, null, 2));
          
          if (!accessCheck.canGenerate) {
            console.log(`🚫 Access denied for user ${user.id}: ${accessCheck.reason}`);
            return c.json({
              success: false,
              error: 'Daily workout limit reached',
              message: 'Free users can generate 1 workout per day. Upgrade to Premium for unlimited AI workouts!',
              accessInfo: accessCheck,
              upgradeRequired: true
            }, 429); // Too Many Requests
          }
          
          // User can generate - determine generation type and PRE-TRACK the generation
          generationType = (accessCheck.tier === 'premium' || accessCheck.tier === 'grandfathered') ? 'ai' : 'ai';
          console.log(`✅ Access granted for user ${user.id} (${accessCheck.tier}): ${accessCheck.usedToday || 0}/${accessCheck.dailyLimit || 'unlimited'} used today`);
          
          // For free users, pre-track the generation to prevent race conditions
          if (accessCheck.tier === 'free') {
            try {
              console.log(`📝 Pre-tracking workout generation for free user ${user.id}`);
              await db.trackWorkoutGeneration(user.id, { 
                pretrack: true, 
                timestamp: new Date().toISOString() 
              }, 'fallback');
              console.log(`✅ Pre-tracked generation for user ${user.id}`);
            } catch (preTrackError) {
              console.error('Failed to pre-track generation:', preTrackError);
              return c.json({
                success: false,
                error: 'Unable to track usage',
                details: preTrackError.message
              }, 500);
            }
          }
        }
      } catch (authError) {
        console.log('Auth check failed, proceeding as anonymous user:', authError);
      }
    }

    const { fitnessLevel, goals, duration, equipment } = await c.req.json();
    
    console.log('Generating workout with:', { fitnessLevel, goals, duration, equipment, generationType, userId: user?.id });
    console.log('OpenAI API Key exists:', !!c.env.OPENAI_API_KEY);
    
    // Create fallback workout first in case OpenAI fails
    const fallbackWorkout = {
      name: getWorkoutName(goals, fitnessLevel),
      description: `A ${duration}-minute ${goals} workout for ${fitnessLevel} level`,
      exercises: getExercisesForGoal(goals, equipment),
      estimatedCalories: parseInt(duration) * 5,
      difficulty: fitnessLevel === 'beginner' ? 3 : fitnessLevel === 'intermediate' ? 6 : 8
    };

    // Try OpenAI if API key exists
    if (c.env.OPENAI_API_KEY && (c.env.OPENAI_API_KEY.startsWith('sk-') || c.env.OPENAI_API_KEY.startsWith('sk-proj-'))) {
      try {
        const openai = new OpenAI({
          apiKey: c.env.OPENAI_API_KEY,
        });

        const prompt = `Generate a personalized workout plan with the following specifications:
        - Fitness Level: ${fitnessLevel}
        - Primary Goal: ${goals}
        - Duration: ${duration} minutes
        - Available Equipment: ${equipment}

        Please provide a structured workout plan in JSON format with:
        - name: A catchy workout name
        - description: Brief description of the workout
        - exercises: Array of main exercises with name, sets, reps, and optional notes
        - estimatedCalories: Estimated calories burned
        - difficulty: Difficulty rating (1-10)

        Make sure the workout is appropriate for the specified fitness level and achievable with the available equipment.`;

        console.log('Calling OpenAI API...');
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional fitness trainer. Create safe, effective workout plans. Respond only with valid JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        console.log('OpenAI response received');
        const aiResponse = completion.choices[0].message.content;
        console.log('AI Response:', aiResponse.substring(0, 200) + '...');
        
        const workoutPlan = JSON.parse(aiResponse);
        workoutPlan.id = globalThis.crypto.randomUUID();
        workoutPlan.createdAt = new Date().toISOString();
        workoutPlan.userPreferences = { fitnessLevel, goals, duration, equipment };
        workoutPlan.source = 'openai';
        
        // Track usage for authenticated users (update existing or create new record)
        if (user) {
          try {
            const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
            const db = new WorkoutDatabase(supabase);
            
            // For free users, we already pre-tracked, so update the placeholder record
            const accessCheck = await db.canGenerateWorkout(user.id);
            if (accessCheck.tier === 'free') {
              await db.updateLatestGeneration(user.id, workoutPlan, 'ai');
              console.log(`Updated pre-tracked AI workout generation for user ${user.id}`);
            } else {
              // For premium users, track normally
              await db.trackWorkoutGeneration(user.id, workoutPlan, 'ai');
              console.log(`Tracked AI workout generation for user ${user.id}`);
            }
          } catch (trackingError) {
            console.error('Failed to track workout generation:', trackingError);
            // Don't fail the request if tracking fails
          }
        }
        
        return c.json(workoutPlan);
      } catch (aiError) {
        console.error('OpenAI error, using fallback:', aiError.message);
        fallbackWorkout.source = 'fallback';
        fallbackWorkout.note = 'Generated using built-in templates due to AI service unavailability';
      }
    } else {
      console.log('No valid OpenAI API key, using fallback');
      fallbackWorkout.source = 'fallback';
      fallbackWorkout.note = 'Generated using built-in templates';
    }

    fallbackWorkout.id = globalThis.crypto.randomUUID();
    fallbackWorkout.createdAt = new Date().toISOString();
    fallbackWorkout.userPreferences = { fitnessLevel, goals, duration, equipment };
    
    // Track usage for authenticated users (fallback generation)
    if (user) {
      try {
        const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
        const db = new WorkoutDatabase(supabase);
        
        // Check if this is a free user with pre-tracking
        const accessCheck = await db.canGenerateWorkout(user.id);
        if (accessCheck.tier === 'free') {
          await db.updateLatestGeneration(user.id, fallbackWorkout, fallbackWorkout.source || 'fallback');
          console.log(`Updated pre-tracked ${fallbackWorkout.source || 'fallback'} workout generation for user ${user.id}`);
        } else {
          // For premium users, track normally
          await db.trackWorkoutGeneration(user.id, fallbackWorkout, fallbackWorkout.source || 'fallback');
          console.log(`Tracked ${fallbackWorkout.source || 'fallback'} workout generation for user ${user.id}`);
        }
      } catch (trackingError) {
        console.error('Failed to track workout generation:', trackingError);
        // Don't fail the request if tracking fails
      }
    }
    
    return c.json(fallbackWorkout);
  } catch (error) {
    console.error('Workout generation error:', error);
    return c.json({ 
      error: 'Failed to generate workout',
      details: error.message 
    }, 500);
  }
});

function getWorkoutName(goals, fitnessLevel) {
  const names = {
    strength: ['Power Builder', 'Strength Foundation', 'Iron Core'],
    muscle: ['Muscle Sculptor', 'Mass Builder', 'Hypertrophy Focus'],
    endurance: ['Cardio Crusher', 'Endurance Builder', 'Stamina Booster'],
    weight_loss: ['Fat Burner', 'Lean Machine', 'Metabolic Blast'],
    general: ['Total Body', 'Full Spectrum', 'Complete Fitness']
  };
  
  const goalNames = names[goals] || names.general;
  const randomName = goalNames[Math.floor(Math.random() * goalNames.length)];
  
  return `${randomName} (${fitnessLevel})`;
}

function getExercisesForGoal(goals, equipment) {
  const exercises = {
    strength: {
      bodyweight: [
        { name: "Push-ups", sets: "3", reps: "8-12", notes: "Keep body straight" },
        { name: "Squats", sets: "3", reps: "12-15", notes: "Go deep, chest up" },
        { name: "Pike Push-ups", sets: "3", reps: "6-10", notes: "Targets shoulders" },
        { name: "Single-leg Glute Bridges", sets: "3", reps: "10 each leg", notes: "Squeeze glutes" }
      ],
      dumbbells: [
        { name: "Dumbbell Press", sets: "3", reps: "8-10", notes: "Control the weight" },
        { name: "Goblet Squats", sets: "3", reps: "10-12", notes: "Hold dumbbell at chest" },
        { name: "Romanian Deadlifts", sets: "3", reps: "8-10", notes: "Hinge at hips" },
        { name: "Rows", sets: "3", reps: "10-12", notes: "Squeeze shoulder blades" }
      ],
      full_gym: [
        { name: "Bench Press", sets: "3", reps: "6-8", notes: "Use spotter if available" },
        { name: "Squats", sets: "3", reps: "8-10", notes: "Keep knees aligned" },
        { name: "Deadlifts", sets: "3", reps: "5-6", notes: "Perfect form essential" },
        { name: "Pull-ups", sets: "3", reps: "5-8", notes: "Use assistance if needed" }
      ]
    },
    endurance: {
      bodyweight: [
        { name: "Jumping Jacks", sets: "3", reps: "30 seconds", notes: "Keep steady rhythm" },
        { name: "Mountain Climbers", sets: "3", reps: "30 seconds", notes: "Fast alternating legs" },
        { name: "Burpees", sets: "3", reps: "10-15", notes: "Full body movement" },
        { name: "High Knees", sets: "3", reps: "30 seconds", notes: "Drive knees up high" }
      ]
    }
  };

  const goalExercises = exercises[goals] || exercises.strength;
  const equipmentExercises = goalExercises[equipment] || goalExercises.bodyweight || goalExercises[Object.keys(goalExercises)[0]];
  
  return equipmentExercises.slice(0, 4);
}

app.get('/', async (c) => {
  return c.json({ message: 'Workout routes available' });
});

app.post('/save', async (c) => {
  try {
    const authorization = c.req.header('Authorization');
    if (!authorization) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const token = authorization.replace('Bearer ', '');
    
    // Create authenticated Supabase client
    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('User auth error:', userError);
      return c.json({ error: 'Invalid session', details: userError?.message }, 401);
    }

    const workoutData = await c.req.json();
    console.log('Received workout data:', JSON.stringify(workoutData, null, 2));
    
    // First, save the workout template
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: workoutData.name,
        description: workoutData.description,
        exercises: workoutData.exercises,
        duration: calculateDuration(workoutData.startTime, workoutData.endTime),
        difficulty: workoutData.difficulty || 5,
        equipment: workoutData.userPreferences?.equipment || 'bodyweight',
        estimated_calories: workoutData.estimatedCalories || 0
      })
      .select()
      .single();

    if (workoutError) {
      console.error('Workout save error:', workoutError);
      return c.json({ error: 'Failed to save workout', details: workoutError.message }, 500);
    }

    // Then save the workout session
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        workout_id: workout.id,
        started_at: workoutData.startTime || new Date().toISOString(),
        completed_at: workoutData.endTime || new Date().toISOString(),
        duration_minutes: calculateDuration(workoutData.startTime, workoutData.endTime),
        calories_burned: calculateCaloriesBurned(workoutData),
        exercises_completed: (workoutData.exercises || []).map(ex => ({
          name: ex.name || 'Unknown Exercise',
          completed: Boolean(ex.completed),
          sets_completed: ex.actualSets?.length || 0,
          total_reps: ex.actualSets?.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0) || 0,
          total_weight: ex.actualSets?.reduce((sum, set) => sum + (parseFloat(set.weight) || 0), 0) || 0
        }))
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session save error:', sessionError);
      return c.json({ error: 'Failed to save workout session', details: sessionError.message }, 500);
    }
    
    return c.json({ 
      message: 'Workout saved successfully', 
      workoutId: workout.id,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Save workout error:', error);
    return c.json({ error: 'Failed to save workout' }, 500);
  }
});

function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / (1000 * 60)); // Duration in minutes
}

function calculateCaloriesBurned(workoutData) {
  // Simple calorie calculation based on duration and intensity
  const duration = calculateDuration(workoutData.startTime, workoutData.endTime);
  const completedExercises = workoutData.exercises?.filter(ex => ex.completed).length || 0;
  const totalExercises = workoutData.exercises?.length || 1;
  const completionRate = completedExercises / totalExercises;
  
  // Base calories per minute (varies by intensity)
  const baseCaloriesPerMinute = 8;
  return Math.round(duration * baseCaloriesPerMinute * completionRate);
}

app.get('/history', async (c) => {
  try {
    const authorization = c.req.header('Authorization');
    if (!authorization) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const token = authorization.replace('Bearer ', '');
    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Get workout sessions with workout details
    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workouts (
          name,
          description,
          exercises
        )
      `)
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(20);

    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError);
      return c.json({ error: 'Failed to fetch workout history' }, 500);
    }

    // Format the history data
    const history = sessions.map(session => ({
      id: session.id,
      name: session.workouts?.name || 'Unnamed Workout',
      description: session.workouts?.description || '',
      completed_at: session.completed_at,
      duration_minutes: session.duration_minutes,
      calories_burned: session.calories_burned,
      exercises_completed: session.exercises_completed || [],
      completion_rate: calculateCompletionRate(session.exercises_completed)
    }));
    
    return c.json(history);
  } catch (error) {
    console.error('Workout history error:', error);
    return c.json({ error: 'Failed to fetch workout history' }, 500);
  }
});

function calculateCompletionRate(exercisesCompleted) {
  if (!exercisesCompleted || exercisesCompleted.length === 0) return 1;
  
  const completedCount = exercisesCompleted.filter(ex => ex.completed).length;
  return completedCount / exercisesCompleted.length;
}

// Get user's daily workout generation usage
app.get('/daily-usage', async (c) => {
  try {
    // Get user from request
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: 'Authentication required'
      }, 401);
    }

    const token = authHeader.substring(7);
    
    // Create database connection
    const db = new WorkoutDatabase(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Get current user
    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return c.json({
        success: false,
        error: 'Invalid session'
      }, 401);
    }

    // Get access check information
    const accessCheck = await db.canGenerateWorkout(user.id);
    
    // Calculate next reset time (midnight UTC)
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setUTCHours(24, 0, 0, 0); // Next midnight UTC

    return c.json({
      success: true,
      canGenerate: accessCheck.canGenerate,
      tier: accessCheck.tier,
      usedToday: accessCheck.usedToday || 0,
      dailyLimit: accessCheck.dailyLimit || (accessCheck.tier === 'free' ? 1 : 999),
      nextResetTime: nextReset.toISOString(),
      reason: accessCheck.reason || null,
      expiresAt: accessCheck.expiresAt || null,
      timeUntilExpiration: accessCheck.timeUntilExpiration || null
    });

  } catch (error) {
    console.error('Error fetching daily usage:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch daily usage',
      details: error.message
    }, 500);
  }
});

export { app as workoutRoutes };