import { Hono } from 'hono';
import { createSupabaseClient } from '../lib/database.js';
import { checkForNewAchievements, achievementDefinitions, calculateAchievementProgress, getAchievementsByCategory, formatAchievementStats } from '../utils/achievements.js';

const app = new Hono();

// Get user's achievements
app.get('/', async (c) => {
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
      console.error('Achievement auth error:', userError);
      return c.json({ error: 'Invalid session', details: userError?.message }, 401);
    }

    // Get user's achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (achievementsError) {
      console.error('Achievements fetch error:', achievementsError);
      return c.json({ error: 'Failed to fetch achievements' }, 500);
    }

    // Get user stats for progress calculation
    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null);

    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError);
      return c.json({ error: 'Failed to fetch user stats' }, 500);
    }

    // Calculate user stats
    const totalWorkouts = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    const totalCalories = sessions.reduce((sum, session) => sum + (session.calories_burned || 0), 0);
    const uniqueDays = new Set(sessions.map(session => 
      new Date(session.completed_at).toDateString()
    )).size;

    // Calculate current streak
    let currentStreak = 0;
    if (sessions.length > 0) {
      const uniqueDates = [...new Set(sessions.map(s => 
        new Date(s.completed_at).toDateString()
      ))].sort((a, b) => new Date(b) - new Date(a));
      
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
        let checkDate = uniqueDates.includes(today) ? today : yesterday;
        
        for (let i = 0; i < uniqueDates.length; i++) {
          if (uniqueDates[i] === checkDate) {
            currentStreak++;
            const nextDate = new Date(checkDate);
            nextDate.setDate(nextDate.getDate() - 1);
            checkDate = nextDate.toDateString();
          } else {
            break;
          }
        }
      }
    }

    const userStats = {
      totalWorkouts,
      totalMinutes,
      totalCalories,
      daysActive: uniqueDays,
      currentStreak,
      uniqueExercises: calculateUniqueExercises(sessions)
    };

    // Get all achievements with progress
    const allAchievements = [];
    for (const [id, definition] of Object.entries(achievementDefinitions)) {
      const userAchievement = achievements.find(a => a.achievement_type === id);
      const progress = calculateAchievementProgress(id, userStats);
      
      allAchievements.push({
        id,
        ...definition,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlocked_at || null,
        progress,
        completed: userAchievement ? true : definition.checkFunction(userStats)
      });
    }

    const totalPoints = achievements.reduce((sum, achievement) => {
      const definition = achievementDefinitions[achievement.achievement_type];
      return sum + (definition?.points || 0);
    }, 0);

    return c.json({
      achievements: allAchievements,
      userStats,
      totalPoints,
      achievementsByCategory: getAchievementsByCategory()
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return c.json({ error: 'Failed to fetch achievements' }, 500);
  }
});

// Check for new achievements after workout completion
app.post('/check', async (c) => {
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
      console.error('Achievement auth error:', userError);
      return c.json({ error: 'Invalid session', details: userError?.message }, 401);
    }

    // Get current user achievements
    const { data: currentAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('achievement_type')
      .eq('user_id', user.id);

    if (achievementsError) {
      console.error('Achievements fetch error:', achievementsError);
      return c.json({ error: 'Failed to fetch current achievements' }, 500);
    }

    // Get user stats (same calculation as above)
    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null);

    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError);
      return c.json({ error: 'Failed to fetch user stats' }, 500);
    }

    // Calculate current stats
    const totalWorkouts = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    const totalCalories = sessions.reduce((sum, session) => sum + (session.calories_burned || 0), 0);
    const uniqueDays = new Set(sessions.map(session => 
      new Date(session.completed_at).toDateString()
    )).size;

    // Calculate current streak (using same logic as above)
    let currentStreak = 0;
    if (sessions.length > 0) {
      const uniqueDates = [...new Set(sessions.map(s => 
        new Date(s.completed_at).toDateString()
      ))].sort((a, b) => new Date(b) - new Date(a));
      
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
        let checkDate = uniqueDates.includes(today) ? today : yesterday;
        
        for (let i = 0; i < uniqueDates.length; i++) {
          if (uniqueDates[i] === checkDate) {
            currentStreak++;
            const nextDate = new Date(checkDate);
            nextDate.setDate(nextDate.getDate() - 1);
            checkDate = nextDate.toDateString();
          } else {
            break;
          }
        }
      }
    }

    const userStats = formatAchievementStats({
      workouts: totalWorkouts,
      totalMinutes,
      totalCalories,
      daysActive: uniqueDays,
      currentStreak,
      uniqueExercises: calculateUniqueExercises(sessions)
    });

    // Check for new achievements
    const newAchievements = checkForNewAchievements(userStats, currentAchievements);

    // Save new achievements to database
    if (newAchievements.length > 0) {
      const achievementsToInsert = newAchievements.map(achievement => ({
        user_id: user.id,
        achievement_type: achievement.achievement_type,
        achievement_data: achievement.achievement_data
      }));

      const { data: insertedAchievements, error: insertError } = await supabase
        .from('achievements')
        .insert(achievementsToInsert)
        .select();

      if (insertError) {
        console.error('Achievement insert error:', insertError);
        return c.json({ error: 'Failed to save new achievements', details: insertError.message }, 500);
      }

      return c.json({
        newAchievements: insertedAchievements,
        count: newAchievements.length
      });
    }

    return c.json({
      newAchievements: [],
      count: 0
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    return c.json({ error: 'Failed to check achievements' }, 500);
  }
});

// Get achievement leaderboard (future feature)
app.get('/leaderboard', async (c) => {
  try {
    // TODO: Implement leaderboard logic
    return c.json({
      message: 'Leaderboard coming soon!',
      leaders: []
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

// Helper function to calculate unique exercises
function calculateUniqueExercises(sessions) {
  const exerciseNames = new Set();
  
  sessions.forEach(session => {
    if (session.exercises_completed) {
      session.exercises_completed.forEach(exercise => {
        if (exercise.name) {
          exerciseNames.add(exercise.name.toLowerCase().trim());
        }
      });
    }
  });
  
  return exerciseNames.size;
}

export { app as achievementsRoutes };