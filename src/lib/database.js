import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(supabaseUrl, supabaseKey, options = {}) {
  return createClient(supabaseUrl, supabaseKey, options);
}

// Grandfathering Configuration
export const GRANDFATHERING_CONFIG = {
  // Date when paywall was introduced (users before this date get grandfathered access)
  PAYWALL_INTRODUCTION_DATE: new Date('2025-07-26T00:00:00Z'), // July 26, 2025
  
  // Duration of grandfathered access in days
  GRANDFATHERED_DURATION_DAYS: 30,
  
  // Whether grandfathering is currently enabled
  GRANDFATHERING_ENABLED: true,
  
  // Expiration system configuration
  EXPIRATION: {
    // How many days before expiration to send warning notifications
    WARNING_DAYS_BEFORE: [7, 3, 1], // Send warnings 7, 3, and 1 days before expiration
    
    // Whether to automatically clean up expired grandfathered users
    AUTO_CLEANUP_ENABLED: true,
    
    // Grace period after expiration before removing grandfathered status (in hours)
    GRACE_PERIOD_HOURS: 24,
    
    // Whether to send expiration notifications (when email system is available)
    SEND_NOTIFICATIONS: false // Set to true when email system is implemented
  }
};

// Helper function to calculate grandfathered expiration date
export function calculateGrandfatheredExpiration(registrationDate = new Date()) {
  const expirationDate = new Date(registrationDate);
  expirationDate.setDate(expirationDate.getDate() + GRANDFATHERING_CONFIG.GRANDFATHERED_DURATION_DAYS);
  return expirationDate;
}

// Helper function to check if a user should be grandfathered based on registration date
export function shouldBeGrantedGrandfatheredAccess(userCreatedAt) {
  if (!GRANDFATHERING_CONFIG.GRANDFATHERING_ENABLED) {
    return false;
  }
  
  const userRegistrationDate = new Date(userCreatedAt);
  return userRegistrationDate < GRANDFATHERING_CONFIG.PAYWALL_INTRODUCTION_DATE;
}

// Helper function to check if grandfathered access is expiring soon
export function getExpirationStatus(grandfatheredUntil) {
  if (!grandfatheredUntil) return { status: 'none' };
  
  const now = new Date();
  const expirationDate = new Date(grandfatheredUntil);
  const timeUntilExpiration = expirationDate.getTime() - now.getTime();
  const daysUntilExpiration = Math.ceil(timeUntilExpiration / (1000 * 60 * 60 * 24));
  const hoursUntilExpiration = Math.ceil(timeUntilExpiration / (1000 * 60 * 60));

  if (timeUntilExpiration <= 0) {
    // Check if within grace period
    const hoursAfterExpiration = Math.abs(hoursUntilExpiration);
    if (hoursAfterExpiration <= GRANDFATHERING_CONFIG.EXPIRATION.GRACE_PERIOD_HOURS) {
      return {
        status: 'grace_period',
        daysUntilExpiration: 0,
        hoursUntilExpiration: 0,
        hoursInGrace: hoursAfterExpiration,
        expirationDate
      };
    } else {
      return {
        status: 'expired',
        daysUntilExpiration: 0,
        hoursUntilExpiration: 0,
        expirationDate
      };
    }
  }

  // Check if expiring soon (within warning period)
  const isExpiringSoon = GRANDFATHERING_CONFIG.EXPIRATION.WARNING_DAYS_BEFORE
    .some(days => daysUntilExpiration <= days);

  return {
    status: isExpiringSoon ? 'expiring_soon' : 'active',
    daysUntilExpiration,
    hoursUntilExpiration,
    expirationDate,
    isExpiringSoon,
    warningThresholds: GRANDFATHERING_CONFIG.EXPIRATION.WARNING_DAYS_BEFORE
  };
}

// Helper function to format expiration time for user display
export function formatTimeUntilExpiration(grandfatheredUntil) {
  const status = getExpirationStatus(grandfatheredUntil);
  
  switch (status.status) {
    case 'none':
      return 'No grandfathered access';
    case 'expired':
      return 'Expired';
    case 'grace_period':
      return `Expired ${status.hoursInGrace} hours ago (grace period)`;
    case 'expiring_soon':
      if (status.daysUntilExpiration <= 1) {
        return `Expires in ${status.hoursUntilExpiration} hours`;
      } else {
        return `Expires in ${status.daysUntilExpiration} days`;
      }
    case 'active':
      return `${status.daysUntilExpiration} days remaining`;
    default:
      return 'Unknown status';
  }
}

export const dbSchema = {
  users: {
    id: 'uuid PRIMARY KEY DEFAULT gen_random_uuid()',
    email: 'text UNIQUE NOT NULL',
    name: 'text',
    fitness_level: 'text DEFAULT \'beginner\'',
    goals: 'jsonb DEFAULT \'[]\'',
    preferences: 'jsonb DEFAULT \'{}\'',
    subscription_tier: 'text DEFAULT \'free\' CHECK (subscription_tier IN (\'free\', \'premium\', \'grandfathered\'))',
    grandfathered_until: 'timestamptz',
    created_at: 'timestamptz DEFAULT now()',
    updated_at: 'timestamptz DEFAULT now()'
  },
  
  workouts: {
    id: 'uuid PRIMARY KEY DEFAULT gen_random_uuid()',
    user_id: 'uuid REFERENCES users(id) ON DELETE CASCADE',
    name: 'text NOT NULL',
    description: 'text',
    exercises: 'jsonb NOT NULL',
    duration: 'integer',
    difficulty: 'integer',
    equipment: 'text',
    estimated_calories: 'integer',
    created_at: 'timestamptz DEFAULT now()',
    updated_at: 'timestamptz DEFAULT now()'
  },
  
  workout_sessions: {
    id: 'uuid PRIMARY KEY DEFAULT gen_random_uuid()',
    user_id: 'uuid REFERENCES users(id) ON DELETE CASCADE',
    workout_id: 'uuid REFERENCES workouts(id) ON DELETE CASCADE',
    started_at: 'timestamptz NOT NULL',
    completed_at: 'timestamptz',
    duration_minutes: 'integer',
    calories_burned: 'integer',
    exercises_completed: 'jsonb',
    notes: 'text',
    created_at: 'timestamptz DEFAULT now()'
  },
  
  progress_logs: {
    id: 'uuid PRIMARY KEY DEFAULT gen_random_uuid()',
    user_id: 'uuid REFERENCES users(id) ON DELETE CASCADE',
    session_id: 'uuid REFERENCES workout_sessions(id) ON DELETE CASCADE',
    exercise_name: 'text NOT NULL',
    sets_completed: 'integer',
    reps_completed: 'integer',
    weight_used: 'numeric',
    notes: 'text',
    created_at: 'timestamptz DEFAULT now()'
  },
  
  achievements: {
    id: 'uuid PRIMARY KEY DEFAULT gen_random_uuid()',
    user_id: 'uuid REFERENCES users(id) ON DELETE CASCADE',
    achievement_type: 'text NOT NULL',
    achievement_data: 'jsonb',
    unlocked_at: 'timestamptz DEFAULT now()'
  },
  
  blog_posts: {
    id: 'uuid PRIMARY KEY DEFAULT gen_random_uuid()',
    title: 'text NOT NULL',
    slug: 'text UNIQUE NOT NULL',
    excerpt: 'text',
    content: 'text NOT NULL',
    author_id: 'uuid REFERENCES auth.users(id) ON DELETE CASCADE',
    category: 'text DEFAULT \'fitness\'',
    tags: 'text[]',
    featured_image: 'text',
    meta_title: 'text',
    meta_description: 'text',
    published: 'boolean DEFAULT false',
    published_at: 'timestamptz',
    created_at: 'timestamptz DEFAULT now()',
    updated_at: 'timestamptz DEFAULT now()'
  },
  
  blog_categories: {
    id: 'uuid PRIMARY KEY DEFAULT gen_random_uuid()',
    name: 'text UNIQUE NOT NULL',
    slug: 'text UNIQUE NOT NULL',
    description: 'text',
    created_at: 'timestamptz DEFAULT now()'
  },
  
  workout_generations: {
    id: 'uuid PRIMARY KEY DEFAULT gen_random_uuid()',
    user_id: 'uuid REFERENCES auth.users(id) ON DELETE CASCADE',
    generated_at: 'timestamptz DEFAULT now()',
    workout_data: 'jsonb',
    generation_type: 'text DEFAULT \'ai\' CHECK (generation_type IN (\'ai\', \'template\', \'fallback\'))',
    created_at: 'timestamptz DEFAULT now()'
  },
  
  subscriptions: {
    id: 'uuid PRIMARY KEY DEFAULT gen_random_uuid()',
    user_id: 'uuid REFERENCES auth.users(id) ON DELETE CASCADE',
    paypal_subscription_id: 'text UNIQUE NOT NULL',
    paypal_plan_id: 'text NOT NULL',
    status: 'text NOT NULL CHECK (status IN (\'active\', \'cancelled\', \'suspended\', \'expired\', \'pending\'))',
    amount_per_cycle: 'numeric(10,2) NOT NULL',
    currency: 'text DEFAULT \'USD\' NOT NULL',
    billing_cycle: 'text DEFAULT \'monthly\' CHECK (billing_cycle IN (\'monthly\', \'yearly\'))',
    trial_end: 'timestamptz',
    current_period_start: 'timestamptz NOT NULL',
    current_period_end: 'timestamptz NOT NULL',
    cancelled_at: 'timestamptz',
    cancel_at_period_end: 'boolean DEFAULT false',
    paypal_webhook_data: 'jsonb',
    created_at: 'timestamptz DEFAULT now()',
    updated_at: 'timestamptz DEFAULT now()'
  }
};

export const sqlMigrations = {
  '001_initial_schema': `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Users table
    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      name text,
      fitness_level text DEFAULT 'beginner',
      goals jsonb DEFAULT '[]',
      preferences jsonb DEFAULT '{}',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- Workouts table
    CREATE TABLE workouts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      name text NOT NULL,
      description text,
      exercises jsonb NOT NULL,
      duration integer,
      difficulty integer,
      equipment text,
      estimated_calories integer,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- Workout sessions table
    CREATE TABLE workout_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
      started_at timestamptz NOT NULL,
      completed_at timestamptz,
      duration_minutes integer,
      calories_burned integer,
      exercises_completed jsonb,
      notes text,
      created_at timestamptz DEFAULT now()
    );
    
    -- Progress logs table
    CREATE TABLE progress_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      session_id uuid REFERENCES workout_sessions(id) ON DELETE CASCADE,
      exercise_name text NOT NULL,
      sets_completed integer,
      reps_completed integer,
      weight_used numeric,
      notes text,
      created_at timestamptz DEFAULT now()
    );
    
    -- Achievements table
    CREATE TABLE achievements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      achievement_type text NOT NULL,
      achievement_data jsonb,
      unlocked_at timestamptz DEFAULT now()
    );
    
    -- Create indexes for better performance
    CREATE INDEX idx_workouts_user_id ON workouts(user_id);
    CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
    CREATE INDEX idx_workout_sessions_workout_id ON workout_sessions(workout_id);
    CREATE INDEX idx_progress_logs_user_id ON progress_logs(user_id);
    CREATE INDEX idx_progress_logs_session_id ON progress_logs(session_id);
    CREATE INDEX idx_achievements_user_id ON achievements(user_id);
  `,
  
  '002_rls_policies': `
    -- Enable Row Level Security
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
    
    -- Users can only see and modify their own data
    CREATE POLICY "Users can view own profile" ON users
      FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Users can update own profile" ON users
      FOR UPDATE USING (auth.uid() = id);
    
    -- Workouts policies
    CREATE POLICY "Users can view own workouts" ON workouts
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can create workouts" ON workouts
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own workouts" ON workouts
      FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete own workouts" ON workouts
      FOR DELETE USING (auth.uid() = user_id);
    
    -- Workout sessions policies
    CREATE POLICY "Users can view own sessions" ON workout_sessions
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can create sessions" ON workout_sessions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own sessions" ON workout_sessions
      FOR UPDATE USING (auth.uid() = user_id);
    
    -- Progress logs policies
    CREATE POLICY "Users can view own progress" ON progress_logs
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can create progress logs" ON progress_logs
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Achievements policies
    CREATE POLICY "Users can view own achievements" ON achievements
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can create achievements" ON achievements
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  `,
  
  '003_blog_schema': `
    -- Blog posts table
    CREATE TABLE blog_posts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      slug text UNIQUE NOT NULL,
      excerpt text,
      content text NOT NULL,
      author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      category text DEFAULT 'fitness',
      tags text[],
      featured_image text,
      meta_title text,
      meta_description text,
      published boolean DEFAULT false,
      published_at timestamptz,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- Blog categories table
    CREATE TABLE blog_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text UNIQUE NOT NULL,
      slug text UNIQUE NOT NULL,
      description text,
      created_at timestamptz DEFAULT now()
    );
    
    -- Create indexes for blog performance
    CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
    CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_at);
    CREATE INDEX idx_blog_posts_category ON blog_posts(category);
    CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
    
    -- Enable RLS for blog tables
    ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
    
    -- Blog posts policies (public read, admin write)
    CREATE POLICY "Anyone can view published blog posts" ON blog_posts
      FOR SELECT USING (published = true);
    
    CREATE POLICY "Authors can view own posts" ON blog_posts
      FOR SELECT USING (auth.uid() = author_id);
    
    CREATE POLICY "Authors can create posts" ON blog_posts
      FOR INSERT WITH CHECK (auth.uid() = author_id);
    
    CREATE POLICY "Authors can update own posts" ON blog_posts
      FOR UPDATE USING (auth.uid() = author_id);
    
    CREATE POLICY "Authors can delete own posts" ON blog_posts
      FOR DELETE USING (auth.uid() = author_id);
    
    -- Blog categories policies (public read, admin write)
    CREATE POLICY "Anyone can view categories" ON blog_categories
      FOR SELECT USING (true);
    
    CREATE POLICY "Admins can manage categories" ON blog_categories
      FOR ALL USING (auth.uid() IS NOT NULL);
    
    -- Insert default categories
    INSERT INTO blog_categories (name, slug, description) VALUES
      ('Fitness', 'fitness', 'General fitness tips and advice'),
      ('Workouts', 'workouts', 'Specific workout routines and exercises'),
      ('Nutrition', 'nutrition', 'Diet and nutrition guidance'),
      ('Equipment', 'equipment', 'Home gym and equipment reviews'),
      ('Motivation', 'motivation', 'Inspirational content and success stories');
  `,
  
  '004_subscription_tier': `
    -- Add subscription_tier column to users table
    ALTER TABLE users ADD COLUMN subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'grandfathered'));
    
    -- Add grandfathered_until timestamp column for temporary premium access
    ALTER TABLE users ADD COLUMN grandfathered_until timestamptz;
    
    -- Add indexes for subscription queries
    CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
    CREATE INDEX idx_users_grandfathered_until ON users(grandfathered_until);
    
    -- Add comments for documentation
    COMMENT ON COLUMN users.subscription_tier IS 'User subscription level: free (1 workout/day), premium (unlimited), grandfathered (temporary premium)';
    COMMENT ON COLUMN users.grandfathered_until IS 'Timestamp when grandfathered premium access expires (NULL for non-grandfathered users)';
  `,
  
  '005_workout_generations': `
    -- Create workout_generations table to track daily AI workout generation usage
    CREATE TABLE workout_generations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      generated_at timestamptz DEFAULT now(),
      workout_data jsonb,
      generation_type text DEFAULT 'ai' CHECK (generation_type IN ('ai', 'template', 'fallback')),
      created_at timestamptz DEFAULT now()
    );
    
    -- Create indexes for efficient daily usage queries
    CREATE INDEX idx_workout_generations_user_id ON workout_generations(user_id);
    CREATE INDEX idx_workout_generations_user_generated ON workout_generations(user_id, generated_at);
    CREATE INDEX idx_workout_generations_generated_at ON workout_generations(generated_at);
    CREATE INDEX idx_workout_generations_type ON workout_generations(generation_type);
    
    -- Enable Row Level Security
    ALTER TABLE workout_generations ENABLE ROW LEVEL SECURITY;
    
    -- RLS policies for workout_generations
    CREATE POLICY "Users can view own workout generations" ON workout_generations
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can create workout generations" ON workout_generations
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Add comments for documentation
    COMMENT ON TABLE workout_generations IS 'Tracks daily AI workout generation usage for access control';
    COMMENT ON COLUMN workout_generations.user_id IS 'User who generated the workout';
    COMMENT ON COLUMN workout_generations.generated_at IS 'Timestamp when workout was generated';
    COMMENT ON COLUMN workout_generations.workout_data IS 'Generated workout content (JSON)';
    COMMENT ON COLUMN workout_generations.generation_type IS 'Type of generation: ai, template, or fallback';
  `,
  
  '006_subscriptions': `
    -- Create subscriptions table to manage PayPal subscription billing
    CREATE TABLE subscriptions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      paypal_subscription_id text UNIQUE NOT NULL,
      paypal_plan_id text NOT NULL,
      status text NOT NULL CHECK (status IN ('active', 'cancelled', 'suspended', 'expired', 'pending')),
      amount_per_cycle numeric(10,2) NOT NULL,
      currency text DEFAULT 'USD' NOT NULL,
      billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
      trial_end timestamptz,
      current_period_start timestamptz NOT NULL,
      current_period_end timestamptz NOT NULL,
      cancelled_at timestamptz,
      cancel_at_period_end boolean DEFAULT false,
      paypal_webhook_data jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- Create indexes for efficient subscription queries
    CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX idx_subscriptions_paypal_id ON subscriptions(paypal_subscription_id);
    CREATE INDEX idx_subscriptions_status ON subscriptions(status);
    CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);
    CREATE INDEX idx_subscriptions_trial_end ON subscriptions(trial_end);
    
    -- Enable Row Level Security
    ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
    
    -- RLS policies for subscriptions
    CREATE POLICY "Users can view own subscriptions" ON subscriptions
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "System can create subscriptions" ON subscriptions
      FOR INSERT WITH CHECK (true);
    
    CREATE POLICY "System can update subscriptions" ON subscriptions
      FOR UPDATE USING (true);
    
    -- Add comments for documentation
    COMMENT ON TABLE subscriptions IS 'PayPal subscription billing management for premium users';
    COMMENT ON COLUMN subscriptions.user_id IS 'User who owns the subscription';
    COMMENT ON COLUMN subscriptions.paypal_subscription_id IS 'PayPal subscription ID for API calls';
    COMMENT ON COLUMN subscriptions.paypal_plan_id IS 'PayPal plan/product ID';
    COMMENT ON COLUMN subscriptions.status IS 'Current subscription status from PayPal';
    COMMENT ON COLUMN subscriptions.amount_per_cycle IS 'Amount charged per billing cycle';
    COMMENT ON COLUMN subscriptions.currency IS 'Currency code (USD, EUR, etc.)';
    COMMENT ON COLUMN subscriptions.billing_cycle IS 'Billing frequency (monthly/yearly)';
    COMMENT ON COLUMN subscriptions.trial_end IS 'When free trial period ends';
    COMMENT ON COLUMN subscriptions.current_period_start IS 'Current billing period start';
    COMMENT ON COLUMN subscriptions.current_period_end IS 'Current billing period end';
    COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Whether to cancel at period end';
    COMMENT ON COLUMN subscriptions.paypal_webhook_data IS 'Raw PayPal webhook data for debugging';
  `
};

export class WorkoutDatabase {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async createWorkout(userId, workoutData) {
    const { data, error } = await this.supabase
      .from('workouts')
      .insert({
        user_id: userId,
        ...workoutData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserWorkouts(userId, limit = 10, offset = 0) {
    const { data, error } = await this.supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  async startWorkoutSession(userId, workoutId) {
    const { data, error } = await this.supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        workout_id: workoutId,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async completeWorkoutSession(sessionId, sessionData) {
    const { data, error } = await this.supabase
      .from('workout_sessions')
      .update({
        completed_at: new Date().toISOString(),
        ...sessionData
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async logProgress(userId, sessionId, exerciseData) {
    const { data, error } = await this.supabase
      .from('progress_logs')
      .insert({
        user_id: userId,
        session_id: sessionId,
        ...exerciseData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserStats(userId) {
    const { data: sessions, error: sessionsError } = await this.supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    if (sessionsError) throw sessionsError;

    const totalWorkouts = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    const caloriesBurned = sessions.reduce((sum, session) => sum + (session.calories_burned || 0), 0);

    return {
      totalWorkouts,
      totalMinutes,
      caloriesBurned,
      averageWorkoutDuration: totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0
    };
  }

  async unlockAchievement(userId, achievementType, achievementData) {
    const { data, error } = await this.supabase
      .from('achievements')
      .insert({
        user_id: userId,
        achievement_type: achievementType,
        achievement_data: achievementData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async trackWorkoutGeneration(userId, workoutData, generationType = 'ai') {
    console.log(`📝 Tracking workout generation for user ${userId}, type: ${generationType}`);
    
    const { data, error } = await this.supabase
      .from('workout_generations')
      .insert({
        user_id: userId,
        workout_data: workoutData,
        generation_type: generationType,
        generated_at: new Date().toISOString() // Explicitly set timestamp
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to track workout generation:`, error);
      throw error;
    }
    
    console.log(`✅ Successfully tracked workout generation:`, data.id);
    return data;
  }

  async updateLatestGeneration(userId, workoutData, generationType = 'ai') {
    console.log(`🔄 Updating latest generation for user ${userId}, type: ${generationType}`);
    
    // Find the most recent pretrack record for this user (marked with pretrack: true)
    const { data: latestRecord, error: findError } = await this.supabase
      .from('workout_generations')
      .select('id, workout_data')
      .eq('user_id', userId)
      .eq('generation_type', 'fallback')
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (findError || !latestRecord || !latestRecord.workout_data?.pretrack) {
      console.log(`No pretrack record found, creating new record for user ${userId}`);
      return await this.trackWorkoutGeneration(userId, workoutData, generationType);
    }

    // Update the placeholder record with actual workout data
    const { data, error } = await this.supabase
      .from('workout_generations')
      .update({
        workout_data: workoutData,
        generation_type: generationType,
        generated_at: new Date().toISOString()
      })
      .eq('id', latestRecord.id)
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to update workout generation:`, error);
      throw error;
    }
    
    console.log(`✅ Successfully updated workout generation:`, data.id);
    return data;
  }

  async getDailyGenerationCount(userId, date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`📊 Checking daily count for user ${userId} between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);

    const { data, error } = await this.supabase
      .from('workout_generations')
      .select('id, generated_at, generation_type')
      .eq('user_id', userId)
      .gte('generated_at', startOfDay.toISOString())
      .lte('generated_at', endOfDay.toISOString());

    if (error) {
      console.error(`❌ Error getting daily count:`, error);
      throw error;
    }
    
    const count = data ? data.length : 0;
    console.log(`📈 Found ${count} generations today for user ${userId}:`, data);
    return count;
  }

  async canGenerateWorkout(userId) {
    // First check if user is premium or grandfathered
    let { data: user, error: userError } = await this.supabase
      .from('users')
      .select('subscription_tier, grandfathered_until, created_at')
      .eq('id', userId)
      .single();

    // If user doesn't exist in our users table, create them with default 'free' tier
    if (userError && userError.code === 'PGRST116') {
      console.log(`Creating new user record for ${userId} with free tier`);
      try {
        await this.supabase
          .from('users')
          .insert({
            id: userId,
            subscription_tier: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        // Set user as free for the rest of this function
        user = { subscription_tier: 'free', grandfathered_until: null, created_at: new Date().toISOString() };
      } catch (insertError) {
        console.error('Failed to create user record:', insertError);
        return { canGenerate: false, reason: 'Database error' };
      }
    } else if (userError) {
      throw userError;
    }

    if (!user) return { canGenerate: false, reason: 'User not found' };

    // ✨ AUTOMATIC GRANDFATHERING: Check if user qualifies and assign grandfathered status
    if (user.subscription_tier === 'free' && shouldBeGrantedGrandfatheredAccess(user.created_at)) {
      console.log(`🎁 Auto-granting grandfathered access to user ${userId} (registered ${user.created_at})`);
      try {
        const updatedUser = await this.checkAndGrantGrandfatheredAccess(userId);
        if (updatedUser && updatedUser.subscription_tier === 'grandfathered') {
          user = updatedUser; // Update local user object to reflect the change
          console.log(`✅ Successfully auto-granted grandfathered access to user ${userId}`);
        }
      } catch (grandfatheringError) {
        console.error(`❌ Failed to auto-grant grandfathered access to user ${userId}:`, grandfatheringError);
        // Continue with normal flow even if grandfathering fails
      }
    }

    // Premium users have unlimited access
    if (user.subscription_tier === 'premium') {
      return { canGenerate: true, tier: 'premium' };
    }

    // Check grandfathered status with enhanced expiration system
    if (user.subscription_tier === 'grandfathered' && user.grandfathered_until) {
      const expirationStatus = getExpirationStatus(user.grandfathered_until);
      
      switch (expirationStatus.status) {
        case 'active':
        case 'expiring_soon':
          return { 
            canGenerate: true, 
            tier: 'grandfathered', 
            expiresAt: expirationStatus.expirationDate,
            expirationStatus: expirationStatus,
            timeUntilExpiration: formatTimeUntilExpiration(user.grandfathered_until)
          };
          
        case 'grace_period':
          console.log(`⏰ User ${userId} is in grace period (${expirationStatus.hoursInGrace} hours after expiration)`);
          return { 
            canGenerate: true, 
            tier: 'grandfathered_grace', 
            expiresAt: expirationStatus.expirationDate,
            expirationStatus: expirationStatus,
            timeUntilExpiration: formatTimeUntilExpiration(user.grandfathered_until),
            gracePeriod: true
          };
          
        case 'expired':
          console.log(`🔄 Converting expired grandfathered user ${userId} to free tier`);
          if (GRANDFATHERING_CONFIG.EXPIRATION.AUTO_CLEANUP_ENABLED) {
            try {
              await this.supabase
                .from('users')
                .update({ 
                  subscription_tier: 'free',
                  grandfathered_until: null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', userId);
              console.log(`✅ Successfully converted user ${userId} from expired grandfathered to free`);
            } catch (cleanupError) {
              console.error(`❌ Failed to cleanup expired grandfathered user ${userId}:`, cleanupError);
            }
          }
          break;
      }
    }

    // Free users: check daily limit (1 per day)
    const todayCount = await this.getDailyGenerationCount(userId);
    const dailyLimit = 1;

    if (todayCount >= dailyLimit) {
      return { 
        canGenerate: false, 
        tier: 'free',
        reason: 'Daily limit reached',
        usedToday: todayCount,
        dailyLimit: dailyLimit
      };
    }

    return { 
      canGenerate: true, 
      tier: 'free',
      usedToday: todayCount,
      dailyLimit: dailyLimit
    };
  }

  async createSubscription(userId, subscriptionData) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        ...subscriptionData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSubscription(paypalSubscriptionId, updateData) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', paypalSubscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserSubscription(userId) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  async getSubscriptionByPayPalId(paypalSubscriptionId) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('paypal_subscription_id', paypalSubscriptionId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserSubscriptionTier(userId, tier) {
    const { data, error } = await this.supabase
      .from('users')
      .update({ 
        subscription_tier: tier,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async cancelSubscription(paypalSubscriptionId) {
    const now = new Date().toISOString();
    
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: now,
        updated_at: now
      })
      .eq('paypal_subscription_id', paypalSubscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getExpiredTrials() {
    const now = new Date().toISOString();
    
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .not('trial_end', 'is', null)
      .lte('trial_end', now);

    if (error) throw error;
    return data || [];
  }

  async getExpiredSubscriptions() {
    const now = new Date().toISOString();
    
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .in('status', ['active', 'pending'])
      .lte('current_period_end', now);

    if (error) throw error;
    return data || [];
  }

  async updateSubscriptionStatus(paypalSubscriptionId, status) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', paypalSubscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeGrandfatheredStatus(userId) {
    const { data, error } = await this.supabase
      .from('users')
      .update({ 
        grandfathered_until: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Grant grandfathered access to a specific user
  async grantGrandfatheredAccess(userId, expirationDate = null) {
    if (!expirationDate) {
      // If no expiration date provided, calculate it based on current date
      expirationDate = calculateGrandfatheredExpiration();
    }

    const { data, error } = await this.supabase
      .from('users')
      .update({ 
        subscription_tier: 'grandfathered',
        grandfathered_until: expirationDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Check if a user qualifies for grandfathered access and grant it automatically
  async checkAndGrantGrandfatheredAccess(userId) {
    // Get user info
    const { data: user, error } = await this.supabase
      .from('users')
      .select('id, created_at, subscription_tier, grandfathered_until')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!user) return null;

    // Skip if user already has grandfathered or premium access
    if (user.subscription_tier === 'premium' || user.subscription_tier === 'grandfathered') {
      return user;
    }

    // Check if user qualifies for grandfathered access
    if (shouldBeGrantedGrandfatheredAccess(user.created_at)) {
      console.log(`🎁 User ${userId} qualifies for grandfathered access (registered ${user.created_at})`);
      
      const expirationDate = calculateGrandfatheredExpiration(new Date(user.created_at));
      return await this.grantGrandfatheredAccess(userId, expirationDate);
    }

    return user;
  }

  // Bulk grant grandfathered access to all eligible existing users
  async grantGrandfatheredAccessToEligibleUsers() {
    if (!GRANDFATHERING_CONFIG.GRANDFATHERING_ENABLED) {
      console.log('❌ Grandfathering is disabled');
      return { processed: 0, granted: 0 };
    }

    console.log(`🔍 Finding users registered before ${GRANDFATHERING_CONFIG.PAYWALL_INTRODUCTION_DATE.toISOString()}`);

    // Find all users who registered before the paywall and don't have premium/grandfathered access
    const { data: eligibleUsers, error } = await this.supabase
      .from('users')
      .select('id, created_at, subscription_tier')
      .lt('created_at', GRANDFATHERING_CONFIG.PAYWALL_INTRODUCTION_DATE.toISOString())
      .eq('subscription_tier', 'free');

    if (error) {
      console.error('❌ Error finding eligible users:', error);
      throw error;
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      console.log('✅ No eligible users found for grandfathering');
      return { processed: 0, granted: 0 };
    }

    console.log(`📊 Found ${eligibleUsers.length} eligible users for grandfathering`);

    let grantedCount = 0;
    const errors = [];

    for (const user of eligibleUsers) {
      try {
        const expirationDate = calculateGrandfatheredExpiration(new Date(user.created_at));
        await this.grantGrandfatheredAccess(user.id, expirationDate);
        grantedCount++;
        console.log(`✅ Granted grandfathered access to user ${user.id} (expires ${expirationDate.toISOString()})`);
      } catch (error) {
        console.error(`❌ Failed to grant grandfathered access to user ${user.id}:`, error);
        errors.push({ userId: user.id, error: error.message });
      }
    }

    console.log(`🎉 Grandfathering complete: ${grantedCount}/${eligibleUsers.length} users granted access`);

    return {
      processed: eligibleUsers.length,
      granted: grantedCount,
      errors: errors
    };
  }

  // Get statistics about grandfathered users
  async getGrandfatheringStats() {
    const { data: stats, error } = await this.supabase
      .from('users')
      .select('subscription_tier, grandfathered_until, created_at')
      .in('subscription_tier', ['free', 'premium', 'grandfathered']);

    if (error) throw error;

    const now = new Date();
    const paywalDate = GRANDFATHERING_CONFIG.PAYWALL_INTRODUCTION_DATE;
    
    const result = {
      total_users: stats.length,
      free_users: stats.filter(u => u.subscription_tier === 'free').length,
      premium_users: stats.filter(u => u.subscription_tier === 'premium').length,
      grandfathered_users: stats.filter(u => u.subscription_tier === 'grandfathered').length,
      active_grandfathered: stats.filter(u => 
        u.subscription_tier === 'grandfathered' && 
        u.grandfathered_until && 
        new Date(u.grandfathered_until) > now
      ).length,
      expired_grandfathered: stats.filter(u => 
        u.subscription_tier === 'grandfathered' && 
        u.grandfathered_until && 
        new Date(u.grandfathered_until) <= now
      ).length,
      users_before_paywall: stats.filter(u => new Date(u.created_at) < paywalDate).length,
      users_after_paywall: stats.filter(u => new Date(u.created_at) >= paywalDate).length
    };

    return result;
  }

  // ===== GRANDFATHERING EXPIRATION SYSTEM =====

  // Get users who are approaching expiration (need warnings)
  async getUsersApproachingExpiration() {
    const now = new Date();
    const warningDates = GRANDFATHERING_CONFIG.EXPIRATION.WARNING_DAYS_BEFORE.map(days => {
      const date = new Date(now);
      date.setDate(date.getDate() + days);
      return date.toISOString();
    });

    const { data: users, error } = await this.supabase
      .from('users')
      .select('id, email, grandfathered_until, created_at')
      .eq('subscription_tier', 'grandfathered')
      .not('grandfathered_until', 'is', null)
      .gte('grandfathered_until', now.toISOString())
      .lte('grandfathered_until', Math.max(...warningDates));

    if (error) throw error;

    // Categorize users by warning threshold
    const categorizedUsers = {
      expiring_in_1_day: [],
      expiring_in_3_days: [],
      expiring_in_7_days: []
    };

    for (const user of users || []) {
      const status = getExpirationStatus(user.grandfathered_until);
      
      if (status.daysUntilExpiration <= 1) {
        categorizedUsers.expiring_in_1_day.push({ ...user, expirationStatus: status });
      } else if (status.daysUntilExpiration <= 3) {
        categorizedUsers.expiring_in_3_days.push({ ...user, expirationStatus: status });
      } else if (status.daysUntilExpiration <= 7) {
        categorizedUsers.expiring_in_7_days.push({ ...user, expirationStatus: status });
      }
    }

    return categorizedUsers;
  }

  // Get users in grace period (expired but still have access)
  async getUsersInGracePeriod() {
    const now = new Date();
    const gracePeriodStart = new Date(now);
    gracePeriodStart.setHours(gracePeriodStart.getHours() - GRANDFATHERING_CONFIG.EXPIRATION.GRACE_PERIOD_HOURS);

    const { data: users, error } = await this.supabase
      .from('users')
      .select('id, email, grandfathered_until, created_at')
      .eq('subscription_tier', 'grandfathered')
      .not('grandfathered_until', 'is', null)
      .lt('grandfathered_until', now.toISOString())
      .gte('grandfathered_until', gracePeriodStart.toISOString());

    if (error) throw error;

    return (users || []).map(user => ({
      ...user,
      expirationStatus: getExpirationStatus(user.grandfathered_until)
    }));
  }

  // Get users whose grandfathered access has fully expired (past grace period)
  async getFullyExpiredGrandfatheredUsers() {
    const now = new Date();
    const gracePeriodEnd = new Date(now);
    gracePeriodEnd.setHours(gracePeriodEnd.getHours() - GRANDFATHERING_CONFIG.EXPIRATION.GRACE_PERIOD_HOURS);

    const { data: users, error } = await this.supabase
      .from('users')
      .select('id, email, grandfathered_until, created_at')
      .eq('subscription_tier', 'grandfathered')
      .not('grandfathered_until', 'is', null)
      .lt('grandfathered_until', gracePeriodEnd.toISOString());

    if (error) throw error;

    return (users || []).map(user => ({
      ...user,
      expirationStatus: getExpirationStatus(user.grandfathered_until)
    }));
  }

  // Clean up expired grandfathered users (convert to free tier)
  async cleanupExpiredGrandfatheredUsers() {
    if (!GRANDFATHERING_CONFIG.EXPIRATION.AUTO_CLEANUP_ENABLED) {
      console.log('⚠️ Auto-cleanup is disabled');
      return { processed: 0, cleaned: 0, errors: [] };
    }

    const expiredUsers = await this.getFullyExpiredGrandfatheredUsers();
    
    if (expiredUsers.length === 0) {
      console.log('✅ No expired grandfathered users to clean up');
      return { processed: 0, cleaned: 0, errors: [] };
    }

    console.log(`🧹 Cleaning up ${expiredUsers.length} expired grandfathered users`);

    let cleanedCount = 0;
    const errors = [];

    for (const user of expiredUsers) {
      try {
        const { error } = await this.supabase
          .from('users')
          .update({ 
            subscription_tier: 'free',
            grandfathered_until: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;

        cleanedCount++;
        console.log(`✅ Converted user ${user.id} from expired grandfathered to free`);
      } catch (error) {
        console.error(`❌ Failed to cleanup user ${user.id}:`, error);
        errors.push({ userId: user.id, error: error.message });
      }
    }

    console.log(`🎉 Cleanup complete: ${cleanedCount}/${expiredUsers.length} users converted to free`);

    return {
      processed: expiredUsers.length,
      cleaned: cleanedCount,
      errors: errors
    };
  }

  // Send expiration warnings to users (placeholder for email integration)
  async sendExpirationWarnings() {
    if (!GRANDFATHERING_CONFIG.EXPIRATION.SEND_NOTIFICATIONS) {
      console.log('📧 Expiration notifications are disabled');
      return { warnings_sent: 0, message: 'Notifications disabled' };
    }

    const approachingExpiration = await this.getUsersApproachingExpiration();
    let totalWarnings = 0;

    // TODO: Integrate with email service when available
    for (const [timeframe, users] of Object.entries(approachingExpiration)) {
      if (users.length > 0) {
        console.log(`📧 Would send ${timeframe} warnings to ${users.length} users`);
        totalWarnings += users.length;
        
        // Log user details for manual follow-up if needed
        users.forEach(user => {
          console.log(`  - User ${user.id}: ${user.email} (expires ${formatTimeUntilExpiration(user.grandfathered_until)})`);
        });
      }
    }

    return {
      warnings_sent: totalWarnings,
      breakdown: approachingExpiration,
      message: 'Email service not yet implemented - check logs for user details'
    };
  }

  // Run complete expiration maintenance (warnings + cleanup)
  async runExpirationMaintenance() {
    console.log('🔧 Starting grandfathering expiration maintenance...');
    
    const results = {
      timestamp: new Date().toISOString(),
      warnings: await this.sendExpirationWarnings(),
      cleanup: await this.cleanupExpiredGrandfatheredUsers(),
      grace_period_users: await this.getUsersInGracePeriod()
    };

    console.log('🎉 Expiration maintenance complete:', JSON.stringify(results, null, 2));
    return results;
  }

  // Get detailed expiration report for admin dashboard
  async getExpirationReport() {
    const [approaching, gracePeriod, fullyExpired] = await Promise.all([
      this.getUsersApproachingExpiration(),
      this.getUsersInGracePeriod(),
      this.getFullyExpiredGrandfatheredUsers()
    ]);

    const report = {
      timestamp: new Date().toISOString(),
      config: GRANDFATHERING_CONFIG.EXPIRATION,
      approaching_expiration: {
        total: Object.values(approaching).reduce((sum, users) => sum + users.length, 0),
        breakdown: approaching
      },
      grace_period: {
        total: gracePeriod.length,
        users: gracePeriod
      },
      fully_expired: {
        total: fullyExpired.length,
        users: fullyExpired
      }
    };

    return report;
  }
}