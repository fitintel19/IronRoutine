import { html } from 'https://esm.sh/htm/preact';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';
import { trackEvent, formatDate, formatAmount, getStatusBadge } from '../utils.js';

const Profile = ({ user, setShowAuthModal, setAuthMode, setShowUpgradeModal }) => {
  const [stats, setStats] = useState({ workouts: 0, daysActive: 0, totalCalories: 0, totalMinutes: 0 });
  const [preferences, setPreferences] = useState({ goal: 'strength', level: 'beginner' });
  const [achievements, setAchievements] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [showBillingHistory, setShowBillingHistory] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchAchievements();
      fetchSubscriptionInfo();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const response = await fetch('/api/progress/stats', {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const response = await fetch('/api/achievements', {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        });
        if (response.ok) {
          const data = await response.json();
          setAchievements(data.achievements.filter(a => a.unlocked));
          setTotalPoints(data.totalPoints);
        }
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  };

  const fetchSubscriptionInfo = async () => {
    setSubscriptionLoading(true);
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        
        // Get user's subscription tier and grandfathered status from database
        const [subscriptionResponse, usageResponse] = await Promise.all([
          fetch('/api/subscriptions/status', {
            headers: { 'Authorization': 'Bearer ' + session.access_token }
          }),
          fetch('/api/workouts/daily-usage', {
            headers: { 'Authorization': 'Bearer ' + session.access_token }
          })
        ]);

        let subscriptionData = null;
        let usageData = null;

        if (subscriptionResponse.ok) {
          subscriptionData = await subscriptionResponse.json();
        }
        
        if (usageResponse.ok) {
          usageData = await usageResponse.json();
        }

        // Combine subscription and usage information
        const info = {
          tier: subscriptionData?.tier || 'free',
          isGrandfathered: subscriptionData?.tier === 'grandfathered',
          grandfatheredUntil: subscriptionData?.grandfatheredUntil || null,
          expirationStatus: subscriptionData?.expirationStatus || null,
          timeUntilExpiration: subscriptionData?.timeUntilExpiration || null,
          paypalSubscriptionId: subscriptionData?.paypalSubscriptionId || null,
          dailyUsage: usageData?.usedToday || 0,
          dailyLimit: usageData?.dailyLimit || 1,
          canGenerate: usageData?.canGenerate || false,
          nextResetTime: usageData?.nextResetTime || null
        };

        setSubscriptionInfo(info);
      }
    } catch (error) {
      console.error('Failed to fetch subscription info:', error);
      // Set default info for error case
      setSubscriptionInfo({
        tier: 'free',
        isGrandfathered: false,
        grandfatheredUntil: null,
        expirationStatus: null,
        timeUntilExpiration: null,
        paypalSubscriptionId: null,
        dailyUsage: 0,
        dailyLimit: 1,
        canGenerate: true,
        nextResetTime: null
      });
    }
    setSubscriptionLoading(false);
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        await fetch('/api/users/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + session.access_token
          },
          body: JSON.stringify(preferences)
        });
        alert('Preferences saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
    setLoading(false);
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionInfo?.paypalSubscriptionId) {
      alert('No active subscription found to cancel.');
      return;
    }

    // Show confirmation dialog with details
    const confirmCancel = confirm(
      'Are you sure you want to cancel your Premium subscription?\n\n' +
      '• You will lose unlimited AI workout generation\n' +
      '• You will be limited to 1 workout per day\n' +
      '• Your subscription will remain active until the end of your current billing period\n' +
      '• You can resubscribe at any time\n\n' +
      'Click OK to proceed with cancellation.'
    );

    if (!confirmCancel) {
      return;
    }

    // Get cancellation reason
    const reason = prompt(
      'Please tell us why you\'re canceling (optional):\n\n' +
      'This helps us improve our service.',
      ''
    );

    setLoading(true);
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        
        const response = await fetch('/api/subscriptions/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + session.access_token
          },
          body: JSON.stringify({ 
            reason: reason || 'User requested cancellation'
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alert('Subscription canceled successfully!\n\nYour Premium access will remain active until the end of your current billing period. After that, you\'ll be moved to the free plan with 1 workout per day.');
          
          // Refresh subscription info to reflect cancellation
          await fetchSubscriptionInfo();
        } else {
          throw new Error(data.error || 'Failed to cancel subscription');
        }
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription: ' + error.message + '\n\nPlease try again or contact support if the problem persists.');
    }
    setLoading(false);
  };

  const handleRetryPayment = async (subscriptionId) => {
    setLoading(true);
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        
        const response = await fetch('/api/subscriptions/retry-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + session.access_token
          },
          body: JSON.stringify({ subscriptionId })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Show PayPal management instructions
          const instructions = data.subscription.instructions.join('\n• ');
          const confirmGoToPayPal = confirm(
            'Payment Retry Information:\n\n' +
            '• ' + instructions + '\n\n' +
            'Next billing attempt: ' + (data.subscription.next_billing_time ? new Date(data.subscription.next_billing_time).toLocaleDateString() : 'Unknown') + '\n' +
            'Failed payments: ' + data.subscription.failed_payments_count + '\n\n' +
            'Would you like to open PayPal to manage your subscription?'
          );

          if (confirmGoToPayPal) {
            window.open(data.subscription.management_url, '_blank');
          }
          
          // Refresh billing history
          if (showBillingHistory) {
            await fetchBillingHistory();
          }
        } else {
          throw new Error(data.error || 'Failed to get retry information');
        }
      }
    } catch (error) {
      console.error('Failed to retry payment:', error);
      alert('Failed to get payment retry information: ' + error.message + '\n\nPlease try again or contact support if the problem persists.');
    }
    setLoading(false);
  };

  const fetchBillingHistory = async () => {
    setBillingLoading(true);
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        
        const response = await fetch('/api/subscriptions/billing-history', {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        });

        if (response.ok) {
          const data = await response.json();
          setBillingHistory(data.billing_history || []);
        } else {
          console.error('Failed to fetch billing history');
          setBillingHistory([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch billing history:', error);
      setBillingHistory([]);
    }
    setBillingLoading(false);
  };

  // Use the imported formatDate function with the specific options needed here
  const formatDateWithOptions = (dateString) => {
    if (!dateString) return 'N/A';
    return formatDate(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Create a component-specific wrapper for getStatusBadge that returns HTML
  const getStatusBadgeElement = (status) => {
    const config = getStatusBadge(status);
    
    return html`
      <span class="${config.color} text-white px-2 py-1 rounded-full text-xs font-medium">
        ${config.text}
      </span>
    `;
  };

  if (!user) {
    return html`
      <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl font-bold mb-8 text-center">Your Profile</h2>
        
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div class="text-center text-gray-400 py-8">
            <div class="text-4xl mb-4">👤</div>
            <p class="mb-6">Sign in to manage your profile and save your progress!</p>
            <div class="space-x-4">
              <button 
                onClick=${() => { setAuthMode('signin'); setShowAuthModal(true); }}
                class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transform hover:scale-105 border-0"
              >
                Sign In
              </button>
              <button 
                onClick=${() => { setAuthMode('signup'); setShowAuthModal(true); }}
                class="bg-gray-800/50 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 hover:bg-gray-700/50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 transform hover:scale-105"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return html`
    <div class="max-w-2xl mx-auto">
      <h2 class="text-3xl font-bold mb-8 text-center">Your Profile</h2>
      
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
        <div class="text-center mb-6">
          <div class="text-4xl mb-4">👤</div>
          <h3 class="text-xl font-semibold text-white">${user.user_metadata?.name || 'Fitness Enthusiast'}</h3>
          <p class="text-gray-400">${user.email}</p>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-700/50 rounded-lg p-4 text-center min-h-[80px] flex flex-col justify-center">
            <div class="text-2xl font-bold text-purple-400">${stats.workouts}</div>
            <div class="text-sm text-gray-400">Workouts Completed</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-4 text-center min-h-[80px] flex flex-col justify-center">
            <div class="text-2xl font-bold text-green-400">${stats.daysActive}</div>
            <div class="text-sm text-gray-400">Days Active</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-4 text-center min-h-[80px] flex flex-col justify-center">
            <div class="text-2xl font-bold text-blue-400">${stats.totalCalories}</div>
            <div class="text-sm text-gray-400">Calories Burned</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-4 text-center min-h-[80px] flex flex-col justify-center">
            <div class="text-2xl font-bold text-yellow-400">${Math.round(stats.totalMinutes / 60)}</div>
            <div class="text-sm text-gray-400">Hours Trained</div>
          </div>
        </div>
      </div>

      <!-- Subscription Status Section -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Subscription Status</h3>
          ${subscriptionLoading && html`
            <div class="text-sm text-gray-400">Loading...</div>
          `}
        </div>
        
        ${subscriptionInfo ? html`
          <div class="space-y-4">
            <!-- Current Plan Display -->
            <div class="flex items-center justify-between p-6 rounded-xl ${
              subscriptionInfo.tier === 'premium' ? 'bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20' :
              subscriptionInfo.tier === 'grandfathered' ? 'bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20' :
              'bg-gradient-to-r from-gray-600/10 to-gray-700/10 border border-gray-500/20'
            }">
              <div class="flex items-center space-x-4">
                <div class="text-2xl">
                  ${subscriptionInfo.tier === 'premium' ? '👑' : 
                    subscriptionInfo.tier === 'grandfathered' ? '🎁' : '🆓'}
                </div>
                <div>
                  <div class="text-lg font-semibold text-white">
                    ${subscriptionInfo.tier === 'premium' ? 'Premium Plan' : 
                      subscriptionInfo.tier === 'grandfathered' ? 'Grandfathered Access' : 'Free Plan'}
                  </div>
                  <div class="text-sm text-gray-400">
                    ${subscriptionInfo.tier === 'premium' ? 'Unlimited AI workouts' : 
                      subscriptionInfo.tier === 'grandfathered' ? 'Temporary unlimited access' : 
                      `${subscriptionInfo.dailyUsage}/${subscriptionInfo.dailyLimit} workouts used today`}
                  </div>
                </div>
              </div>
              ${subscriptionInfo.tier === 'free' && html`
                <button
                  onClick=${() => setShowUpgradeModal(true)}
                  class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 border border-purple-400/30 transition-all transform hover:scale-105"
                >
                  Upgrade
                </button>
              `}
            </div>
          </div>
        ` : html`
          <div class="text-center py-6">
            <div class="text-4xl mb-2">💳</div>
            <p class="text-gray-400 text-sm">
              ${subscriptionLoading ? 'Loading subscription status...' : 'Unable to load subscription status'}
            </p>
          </div>
        `}
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Achievements</h3>
          <div class="text-sm">
            <span class="text-purple-400 font-medium">${totalPoints}</span>
            <span class="text-gray-400"> points</span>
          </div>
        </div>
        
        ${achievements.length > 0 ? html`
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            ${achievements.slice(0, 6).map(achievement => html`
              <div key=${achievement.id} class="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-lg p-3 text-center">
                <div class="text-2xl mb-1">${achievement.icon}</div>
                <div class="text-xs font-medium text-white">${achievement.name}</div>
                <div class="text-xs text-gray-400 mt-1">${achievement.points} pts</div>
              </div>
            `)}
          </div>
          ${achievements.length > 6 && html`
            <div class="text-center mt-3">
              <span class="text-sm text-gray-400">+${achievements.length - 6} more achievements</span>
            </div>
          `}
        ` : html`
          <div class="text-center py-6">
            <div class="text-4xl mb-2">🏆</div>
            <p class="text-gray-400 text-sm">Complete your first workout to earn achievements!</p>
          </div>
        `}
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 class="text-lg font-semibold mb-4">Preferences</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Fitness Goal</label>
            <select 
              value=${preferences.goal}
              onChange=${(e) => setPreferences({...preferences, goal: e.target.value})}
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
            <label class="block text-sm font-medium mb-2">Experience Level</label>
            <select 
              value=${preferences.level}
              onChange=${(e) => setPreferences({...preferences, level: e.target.value})}
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button 
            onClick=${handleSavePreferences}
            disabled=${loading}
            class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:shadow-none border border-purple-400/30 disabled:border-gray-500/30 transition-all transform hover:scale-105 disabled:transform-none"
          >
            ${loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  `;
};

export default Profile;