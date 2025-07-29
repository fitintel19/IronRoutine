import { Hono } from 'hono';
import { WorkoutDatabase, getExpirationStatus, formatTimeUntilExpiration, createSupabaseClient } from '../lib/database.js';

const app = new Hono();

app.get('/profile', async (c) => {
  try {
    const mockProfile = {
      id: 'user_123',
      email: 'user@example.com',
      name: 'Fitness Enthusiast',
      fitnessLevel: 'intermediate',
      goals: ['strength', 'muscle'],
      joinDate: '2024-01-15',
      preferences: {
        units: 'metric',
        preferredWorkoutTime: 'morning',
        equipment: 'full_gym'
      },
      stats: {
        totalWorkouts: 24,
        totalMinutes: 1080,
        caloriesBurned: 8640,
        currentStreak: 5
      }
    };
    
    return c.json(mockProfile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.put('/profile', async (c) => {
  try {
    const updates = await c.req.json();
    
    return c.json({ 
      message: 'Profile updated successfully',
      updated: updates
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

app.get('/preferences', async (c) => {
  try {
    const mockPreferences = {
      notifications: {
        workoutReminders: true,
        progressUpdates: true,
        achievements: true
      },
      privacy: {
        profileVisibility: 'private',
        shareProgress: false
      },
      workout: {
        defaultDuration: 45,
        preferredEquipment: 'full_gym',
        fitnessLevel: 'intermediate'
      }
    };
    
    return c.json(mockPreferences);
  } catch (error) {
    console.error('Preferences fetch error:', error);
    return c.json({ error: 'Failed to fetch preferences' }, 500);
  }
});

app.put('/preferences', async (c) => {
  try {
    const preferences = await c.req.json();
    
    return c.json({ 
      message: 'Preferences updated successfully',
      preferences 
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    return c.json({ error: 'Failed to update preferences' }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Bulk grant grandfathered access to all eligible users
app.post('/admin/grant-grandfathered-access', async (c) => {
  try {
    // TODO: Add proper admin authentication here
    // For now, this is a protected endpoint that requires specific admin token
    
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    console.log('🔧 Starting bulk grandfathered access assignment...');
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    const result = await db.grantGrandfatheredAccessToEligibleUsers();
    
    console.log(`🎉 Bulk grandfathering completed:`, result);
    
    return c.json({
      success: true,
      message: 'Bulk grandfathered access assignment completed',
      stats: result
    });
  } catch (error) {
    console.error('❌ Bulk grandfathering failed:', error);
    return c.json({ 
      success: false,
      error: 'Failed to grant grandfathered access',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Get grandfathering statistics
app.get('/admin/grandfathering-stats', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    const stats = await db.getGrandfatheringStats();
    
    return c.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('❌ Failed to get grandfathering stats:', error);
    return c.json({ 
      success: false,
      error: 'Failed to get grandfathering statistics',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Run expiration maintenance (cleanup + warnings)
app.post('/admin/run-expiration-maintenance', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    console.log('🔧 Admin-triggered expiration maintenance...');
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    const results = await db.runExpirationMaintenance();
    
    return c.json({
      success: true,
      message: 'Expiration maintenance completed',
      results: results
    });
  } catch (error) {
    console.error('❌ Expiration maintenance failed:', error);
    return c.json({ 
      success: false,
      error: 'Failed to run expiration maintenance',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Get detailed expiration report
app.get('/admin/expiration-report', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    const report = await db.getExpirationReport();
    
    return c.json({
      success: true,
      report: report
    });
  } catch (error) {
    console.error('❌ Failed to get expiration report:', error);
    return c.json({ 
      success: false,
      error: 'Failed to get expiration report',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Manual cleanup of expired users
app.post('/admin/cleanup-expired-users', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    console.log('🧹 Admin-triggered cleanup of expired grandfathered users...');
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    const results = await db.cleanupExpiredGrandfatheredUsers();
    
    return c.json({
      success: true,
      message: 'Expired user cleanup completed',
      results: results
    });
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return c.json({ 
      success: false,
      error: 'Failed to cleanup expired users',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Send expiration warnings
app.post('/admin/send-expiration-warnings', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    console.log('📧 Admin-triggered expiration warnings...');
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    const results = await db.sendExpirationWarnings();
    
    return c.json({
      success: true,
      message: 'Expiration warnings processed',
      results: results
    });
  } catch (error) {
    console.error('❌ Warning sending failed:', error);
    return c.json({ 
      success: false,
      error: 'Failed to send expiration warnings',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Grant grandfathered access to specific user
app.post('/admin/grant-user-grandfathered/:userId', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    const userId = c.req.param('userId');
    const { durationDays } = await c.req.json().catch(() => ({}));
    
    console.log(`🎁 Admin granting grandfathered access to user ${userId}`);
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    
    // Calculate expiration date
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setDate(expirationDate.getDate() + (durationDays || 30));
    
    const result = await db.grantGrandfatheredAccess(userId, expirationDate);
    
    return c.json({
      success: true,
      message: `Grandfathered access granted to user ${userId}`,
      user: result,
      expiresAt: expirationDate.toISOString()
    });
  } catch (error) {
    console.error('❌ Failed to grant grandfathered access:', error);
    return c.json({ 
      success: false,
      error: 'Failed to grant grandfathered access',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Remove grandfathered access from specific user
app.delete('/admin/remove-user-grandfathered/:userId', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    const userId = c.req.param('userId');
    
    console.log(`🚫 Admin removing grandfathered access from user ${userId}`);
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    const result = await db.removeGrandfatheredStatus(userId);
    
    return c.json({
      success: true,
      message: `Grandfathered access removed from user ${userId}`,
      user: result
    });
  } catch (error) {
    console.error('❌ Failed to remove grandfathered access:', error);
    return c.json({ 
      success: false,
      error: 'Failed to remove grandfathered access',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Search users for management
app.get('/admin/search-users', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    const { email, tier, limit = 50 } = c.req.query();
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    
    let query = db.supabase
      .from('users')
      .select('id, email, subscription_tier, grandfathered_until, created_at, updated_at')
      .limit(parseInt(limit));

    if (email) {
      query = query.ilike('email', `%${email}%`);
    }
    
    if (tier) {
      query = query.eq('subscription_tier', tier);
    }

    const { data: users, error } = await query;
    
    if (error) throw error;

    // Enhance users with expiration status
    const enhancedUsers = (users || []).map(user => ({
      ...user,
      expirationStatus: user.grandfathered_until ? 
        getExpirationStatus(user.grandfathered_until) : null,
      timeUntilExpiration: user.grandfathered_until ?
        formatTimeUntilExpiration(user.grandfathered_until) : null
    }));
    
    return c.json({
      success: true,
      users: enhancedUsers,
      total: enhancedUsers.length
    });
  } catch (error) {
    console.error('❌ Failed to search users:', error);
    return c.json({ 
      success: false,
      error: 'Failed to search users',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Get specific user details
app.get('/admin/user/:userId', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    const userId = c.req.param('userId');
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    
    const { data: user, error } = await db.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get user's workout generation history
    const { data: generations } = await db.supabase
      .from('workout_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const enhancedUser = {
      ...user,
      expirationStatus: user.grandfathered_until ? 
        getExpirationStatus(user.grandfathered_until) : null,
      timeUntilExpiration: user.grandfathered_until ?
        formatTimeUntilExpiration(user.grandfathered_until) : null,
      recentGenerations: generations || []
    };
    
    return c.json({
      success: true,
      user: enhancedUser
    });
  } catch (error) {
    console.error('❌ Failed to get user details:', error);
    return c.json({ 
      success: false,
      error: 'Failed to get user details',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Create test scenarios for grandfathering
app.post('/admin/create-test-scenarios', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    console.log('🧪 Creating test scenarios for grandfathering system...');
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    const now = new Date();
    
    const testScenarios = [
      {
        email: 'pre-paywall-user@test.com',
        name: 'Pre-Paywall User',
        created_at: new Date('2025-07-20T00:00:00Z'), // Before paywall (July 26)
        subscription_tier: 'free',
        description: 'User registered before paywall - should auto-get grandfathered access'
      },
      {
        email: 'post-paywall-user@test.com', 
        name: 'Post-Paywall User',
        created_at: new Date('2025-07-27T00:00:00Z'), // After paywall
        subscription_tier: 'free',
        description: 'User registered after paywall - should remain free'
      },
      {
        email: 'expiring-soon-user@test.com',
        name: 'Expiring Soon User', 
        created_at: new Date('2025-07-15T00:00:00Z'),
        subscription_tier: 'grandfathered',
        grandfathered_until: new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)), // Expires in 2 days
        description: 'Grandfathered user expiring in 2 days - should show warning'
      },
      {
        email: 'grace-period-user@test.com',
        name: 'Grace Period User',
        created_at: new Date('2025-07-10T00:00:00Z'),
        subscription_tier: 'grandfathered', 
        grandfathered_until: new Date(now.getTime() - (2 * 60 * 60 * 1000)), // Expired 2 hours ago
        description: 'User in grace period (expired 2 hours ago) - should still have access'
      },
      {
        email: 'fully-expired-user@test.com',
        name: 'Fully Expired User',
        created_at: new Date('2025-07-05T00:00:00Z'),
        subscription_tier: 'grandfathered',
        grandfathered_until: new Date(now.getTime() - (30 * 60 * 60 * 1000)), // Expired 30 hours ago
        description: 'User past grace period - should be auto-converted to free'
      },
      {
        email: 'premium-user@test.com',
        name: 'Premium User',
        created_at: new Date('2025-07-22T00:00:00Z'),
        subscription_tier: 'premium',
        description: 'Premium subscriber - should have unlimited access'
      }
    ];

    const results = [];
    
    for (const scenario of testScenarios) {
      try {
        // Check if user already exists
        const { data: existingUser } = await db.supabase
          .from('users')
          .select('id')
          .eq('email', scenario.email)
          .single();

        if (existingUser) {
          console.log(`⚠️ Test user ${scenario.email} already exists, skipping creation`);
          results.push({
            scenario: scenario.description,
            email: scenario.email,
            status: 'already_exists',
            user_id: existingUser.id
          });
          continue;
        }

        // Create test user
        const userData = {
          email: scenario.email,
          name: scenario.name,
          subscription_tier: scenario.subscription_tier,
          created_at: scenario.created_at.toISOString(),
          updated_at: new Date().toISOString()
        };

        if (scenario.grandfathered_until) {
          userData.grandfathered_until = scenario.grandfathered_until.toISOString();
        }

        const { data: user, error } = await db.supabase
          .from('users')
          .insert(userData)
          .select()
          .single();

        if (error) throw error;

        console.log(`✅ Created test user: ${scenario.email} (${scenario.description})`);
        
        results.push({
          scenario: scenario.description,
          email: scenario.email,
          status: 'created',
          user_id: user.id,
          created_at: scenario.created_at.toISOString(),
          subscription_tier: scenario.subscription_tier,
          grandfathered_until: scenario.grandfathered_until?.toISOString() || null
        });
        
      } catch (error) {
        console.error(`❌ Failed to create test user ${scenario.email}:`, error);
        results.push({
          scenario: scenario.description,
          email: scenario.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    return c.json({
      success: true,
      message: 'Test scenarios created',
      results: results,
      next_steps: [
        '1. Use "Test Grandfathering Logic" to validate automatic assignment',
        '2. Use "Test Access Control" to validate workout generation limits',
        '3. Use "Test Expiration System" to validate expiration handling',
        '4. Check admin panel for user status overview'
      ]
    });
    
  } catch (error) {
    console.error('❌ Failed to create test scenarios:', error);
    return c.json({ 
      success: false,
      error: 'Failed to create test scenarios',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Test grandfathering logic for all test users
app.post('/admin/test-grandfathering-logic', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    console.log('🧪 Testing grandfathering logic...');
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    
    // Get all test users
    const { data: testUsers, error } = await db.supabase
      .from('users')
      .select('*')
      .like('email', '%@test.com');

    if (error) throw error;

    const results = [];
    
    for (const user of testUsers) {
      try {
        console.log(`\n🔍 Testing user: ${user.email}`);
        
        // Test automatic grandfathering assignment
        const updatedUser = await db.checkAndGrantGrandfatheredAccess(user.id);
        
        // Test access control
        const accessCheck = await db.canGenerateWorkout(user.id);
        
        const result = {
          email: user.email,
          user_id: user.id,
          original_tier: user.subscription_tier,
          original_grandfathered_until: user.grandfathered_until,
          updated_tier: updatedUser?.subscription_tier || user.subscription_tier,
          updated_grandfathered_until: updatedUser?.grandfathered_until || user.grandfathered_until,
          access_check: accessCheck,
          grandfathering_triggered: updatedUser?.subscription_tier !== user.subscription_tier,
          test_passed: true,
          notes: []
        };

        // Validate expected behavior
        if (user.email === 'pre-paywall-user@test.com') {
          if (result.updated_tier !== 'grandfathered') {
            result.test_passed = false;
            result.notes.push('❌ Pre-paywall user should be auto-grandfathered');
          } else {
            result.notes.push('✅ Pre-paywall user correctly auto-grandfathered');
          }
        }
        
        if (user.email === 'post-paywall-user@test.com') {
          if (result.updated_tier !== 'free') {
            result.test_passed = false;
            result.notes.push('❌ Post-paywall user should remain free');
          } else {
            result.notes.push('✅ Post-paywall user correctly remains free');
          }
        }

        if (user.email === 'premium-user@test.com') {
          if (!accessCheck.canGenerate || accessCheck.tier !== 'premium') {
            result.test_passed = false;
            result.notes.push('❌ Premium user should have unlimited access');
          } else {
            result.notes.push('✅ Premium user has unlimited access');
          }
        }

        results.push(result);
        console.log(`${result.test_passed ? '✅' : '❌'} ${user.email}: ${result.notes.join(', ')}`);
        
      } catch (error) {
        console.error(`❌ Test failed for ${user.email}:`, error);
        results.push({
          email: user.email,
          user_id: user.id,
          test_passed: false,
          error: error.message
        });
      }
    }

    const passedTests = results.filter(r => r.test_passed).length;
    const totalTests = results.length;
    
    console.log(`\n🎯 Test Results: ${passedTests}/${totalTests} passed`);

    return c.json({
      success: true,
      message: `Grandfathering logic test completed: ${passedTests}/${totalTests} passed`,
      results: results,
      summary: {
        total_tests: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        pass_rate: Math.round((passedTests / totalTests) * 100) + '%'
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to test grandfathering logic:', error);
    return c.json({ 
      success: false,
      error: 'Failed to test grandfathering logic',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Test expiration system
app.post('/admin/test-expiration-system', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    console.log('🧪 Testing expiration system...');
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    
    // Test expiration report
    const report = await db.getExpirationReport();
    
    // Test cleanup functionality
    const cleanupResults = await db.cleanupExpiredGrandfatheredUsers();
    
    // Test warning system  
    const warningResults = await db.sendExpirationWarnings();
    
    // Get test users and their expiration status
    const { data: testUsers } = await db.supabase
      .from('users')
      .select('*')
      .like('email', '%@test.com')
      .eq('subscription_tier', 'grandfathered');

    const userStatuses = testUsers?.map(user => ({
      email: user.email,
      grandfathered_until: user.grandfathered_until,
      expiration_status: getExpirationStatus(user.grandfathered_until),
      formatted_time: formatTimeUntilExpiration(user.grandfathered_until)
    })) || [];

    return c.json({
      success: true,
      message: 'Expiration system test completed',
      report: report,
      cleanup_results: cleanupResults,
      warning_results: warningResults,
      test_user_statuses: userStatuses,
      validation: {
        report_generated: !!report,
        cleanup_ran: !!cleanupResults,
        warnings_processed: !!warningResults,
        test_users_found: userStatuses.length
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to test expiration system:', error);
    return c.json({ 
      success: false,
      error: 'Failed to test expiration system',
      details: error.message 
    }, 500);
  }
});

// ✨ ADMIN ENDPOINT: Clean up test users
app.delete('/admin/cleanup-test-users', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'iron-routine-admin-2025') {
      return c.json({ error: 'Unauthorized admin access' }, 403);
    }

    console.log('🧹 Cleaning up test users...');
    
    const db = new WorkoutDatabase(createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } }));
    
    const { data: testUsers, error: fetchError } = await db.supabase
      .from('users')
      .select('id, email')
      .like('email', '%@test.com');

    if (fetchError) throw fetchError;

    let deletedCount = 0;
    const errors = [];

    for (const user of testUsers || []) {
      try {
        // Delete associated workout generations first
        await db.supabase
          .from('workout_generations')
          .delete()
          .eq('user_id', user.id);

        // Delete user
        const { error } = await db.supabase
          .from('users')
          .delete()
          .eq('id', user.id);

        if (error) throw error;
        
        deletedCount++;
        console.log(`🗑️ Deleted test user: ${user.email}`);
        
      } catch (error) {
        console.error(`❌ Failed to delete ${user.email}:`, error);
        errors.push({ email: user.email, error: error.message });
      }
    }

    return c.json({
      success: true,
      message: `Cleaned up ${deletedCount} test users`,
      deleted_count: deletedCount,
      total_found: testUsers?.length || 0,
      errors: errors
    });
    
  } catch (error) {
    console.error('❌ Failed to cleanup test users:', error);
    return c.json({ 
      success: false,
      error: 'Failed to cleanup test users',
      details: error.message 
    }, 500);
  }
});

export { app as userRoutes };