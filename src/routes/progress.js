import { Hono } from 'hono';
import { createSupabaseClient, WorkoutDatabase } from '../lib/database.js';

const app = new Hono();

app.post('/log', async (c) => {
  try {
    const progressData = await c.req.json();
    
    const logEntry = {
      id: globalThis.crypto.randomUUID(),
      ...progressData,
      timestamp: new Date().toISOString()
    };
    
    return c.json({ 
      message: 'Progress logged successfully',
      entry: logEntry
    });
  } catch (error) {
    console.error('Progress log error:', error);
    return c.json({ error: 'Failed to log progress' }, 500);
  }
});

app.get('/stats', async (c) => {
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

    // ✨ AUTOMATIC GRANDFATHERING: Check and assign grandfathered status when accessing progress stats
    try {
      const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
      const db = new WorkoutDatabase(supabase);
      await db.checkAndGrantGrandfatheredAccess(user.id);
      console.log(`✅ Auto-grandfathering check completed for user ${user.id} in /stats endpoint`);
    } catch (grandfatheringError) {
      console.error(`❌ Auto-grandfathering failed for user ${user.id} in /stats endpoint:`, grandfatheringError);
      // Continue with normal flow even if grandfathering fails
    }

    // Get workout sessions stats
    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null);

    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError);
      return c.json({ error: 'Failed to fetch workout sessions' }, 500);
    }

    // Calculate stats
    const totalWorkouts = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    const totalCalories = sessions.reduce((sum, session) => sum + (session.calories_burned || 0), 0);
    
    // Calculate unique days active
    const uniqueDays = new Set(sessions.map(session => 
      new Date(session.completed_at).toDateString()
    )).size;

    const stats = {
      workouts: totalWorkouts,
      daysActive: uniqueDays,
      totalCalories: totalCalories,
      totalMinutes: totalMinutes,
      avgDuration: totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0
    };
    
    return c.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

app.get('/history', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit')) || 10;
    const offset = parseInt(c.req.query('offset')) || 0;
    
    const mockHistory = Array.from({ length: limit }, (_, i) => ({
      id: `progress_${offset + i + 1}`,
      workoutId: `workout_${Math.floor(Math.random() * 100)}`,
      workoutName: `Workout ${offset + i + 1}`,
      date: new Date(Date.now() - (i + offset) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: 30 + Math.floor(Math.random() * 60),
      exercisesCompleted: 5 + Math.floor(Math.random() * 10),
      caloriesBurned: 200 + Math.floor(Math.random() * 300),
      notes: i % 3 === 0 ? 'Great workout today!' : null
    }));
    
    return c.json({
      history: mockHistory,
      total: 100,
      limit,
      offset
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return c.json({ error: 'Failed to fetch history' }, 500);
  }
});

app.get('/analytics', async (c) => {
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

    // Get workout sessions for analytics
    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError);
      return c.json({ error: 'Failed to fetch workout sessions' }, 500);
    }

    // Calculate analytics
    const totalWorkouts = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    const totalCalories = sessions.reduce((sum, session) => sum + (session.calories_burned || 0), 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

    const analytics = {
      totalWorkouts,
      totalMinutes,
      totalCalories,
      avgDuration
    };
    
    return c.json(analytics);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

export { app as progressRoutes };