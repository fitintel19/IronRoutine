import { html } from 'https://esm.sh/htm/preact';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';
import { formatDate, formatAmount, getStatusBadge } from '../utils.js';

const AdminPanel = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchExpirationReport();
    }
  }, [user]);

  const makeAdminRequest = async (url, options = {}) => {
    const storedSession = localStorage.getItem('ironroutine_session');
    if (!storedSession) throw new Error('No session found');
    
    const session = JSON.parse(storedSession);
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'X-Admin-Token': 'iron-routine-admin-2025',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  };

  const fetchStats = async () => {
    try {
      const response = await makeAdminRequest('/api/users/admin/grandfathering-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchExpirationReport = async () => {
    try {
      const response = await makeAdminRequest('/api/users/admin/expiration-report');
      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
      }
    } catch (error) {
      console.error('Failed to fetch expiration report:', error);
    }
  };

  const runMaintenance = async () => {
    setLoading(true);
    try {
      const response = await makeAdminRequest('/api/users/admin/run-expiration-maintenance', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        alert('Maintenance completed: ' + JSON.stringify(data.results, null, 2));
        fetchStats();
        fetchExpirationReport();
      }
    } catch (error) {
      console.error('Failed to run maintenance:', error);
      alert('Maintenance failed: ' + error.message);
    }
    setLoading(false);
  };

  const grantBulkAccess = async () => {
    if (!confirm('Grant grandfathered access to all eligible users?')) return;
    
    setLoading(true);
    try {
      const response = await makeAdminRequest('/api/users/admin/grant-grandfathered-access', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        alert('Bulk access granted: ' + data.stats.granted + '/' + data.stats.processed + ' users');
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to grant bulk access:', error);
      alert('Bulk grant failed: ' + error.message);
    }
    setLoading(false);
  };

  const searchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchEmail) params.append('email', searchEmail);
      if (selectedTier) params.append('tier', selectedTier);
      params.append('limit', '50');

      const response = await makeAdminRequest(`/api/users/admin/search-users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    }
    setLoading(false);
  };

  const grantUserAccess = async (userId) => {
    const durationDays = prompt('Enter duration in days (default: 30):');
    const duration = parseInt(durationDays) || 30;
    
    try {
      const response = await makeAdminRequest(`/api/users/admin/grant-user-grandfathered/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ durationDays: duration })
      });
      if (response.ok) {
        alert('Grandfathered access granted!');
        searchUsers();
      }
    } catch (error) {
      console.error('Failed to grant access:', error);
      alert('Failed to grant access: ' + error.message);
    }
  };

  const removeUserAccess = async (userId) => {
    if (!confirm('Remove grandfathered access from this user?')) return;
    
    try {
      const response = await makeAdminRequest(`/api/users/admin/remove-user-grandfathered/${userId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Grandfathered access removed!');
        searchUsers();
      }
    } catch (error) {
      console.error('Failed to remove access:', error);
      alert('Failed to remove access: ' + error.message);
    }
  };

  if (!user) {
    return html`
      <div class="text-center py-8">
        <p class="text-gray-400">Please sign in to access admin panel.</p>
      </div>
    `;
  }

  const adminEmails = ['john@fitintel.com', 'admin@ironroutine.app', 'jetzfan19@gmail.com'];
  if (!adminEmails.includes(user.email)) {
    return html`
      <div class="text-center py-8">
        <p class="text-gray-400">Access denied. Admin privileges required.</p>
      </div>
    `;
  }

  return html`
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Admin Panel
        </h1>
        <p class="text-gray-400 mt-2">Grandfathering system management</p>
      </div>

      <!-- Tabs -->
      <div class="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
        <button
          onClick=${() => setActiveTab('overview')}
          class=${`${(activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white') + ' px-4 py-2 rounded-md font-medium transition-colors'}`}
        >
          Overview
        </button>
        <button
          onClick=${() => setActiveTab('users')}
          class=${`${(activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white') + ' px-4 py-2 rounded-md font-medium transition-colors'}`}
        >
          User Management
        </button>
        <button
          onClick=${() => setActiveTab('maintenance')}
          class=${`${(activeTab === 'maintenance' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white') + ' px-4 py-2 rounded-md font-medium transition-colors'}`}
        >
          Maintenance
        </button>
        <button
          onClick=${() => setActiveTab('testing')}
          class=${`${(activeTab === 'testing' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white') + ' px-4 py-2 rounded-md font-medium transition-colors'}`}
        >
          Testing
        </button>
      </div>

      ${activeTab === 'overview' && html`
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          ${stats && html`
            <div class="bg-gray-800 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-purple-400 mb-4">User Stats</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-400">Total Users:</span>
                  <span class="text-white">${stats.total_users}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Free Users:</span>
                  <span class="text-white">${stats.free_users}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Premium Users:</span>
                  <span class="text-white">${stats.premium_users}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Grandfathered:</span>
                  <span class="text-white">${stats.grandfathered_users}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Active Grandfathered:</span>
                  <span class="text-green-400">${stats.active_grandfathered}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Expired Grandfathered:</span>
                  <span class="text-red-400">${stats.expired_grandfathered}</span>
                </div>
              </div>
            </div>
          `}
          
          ${report && html`
            <div class="bg-gray-800 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-purple-400 mb-4">Expiration Status</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-400">Expiring Soon:</span>
                  <span class="text-yellow-400">${report.approaching_expiration.total}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">In Grace Period:</span>
                  <span class="text-orange-400">${report.grace_period.total}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Fully Expired:</span>
                  <span class="text-red-400">${report.fully_expired.total}</span>
                </div>
              </div>
            </div>
          `}
        </div>
      `}

      ${activeTab === 'users' && html`
        <div class="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-purple-400 mb-4">Search Users</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by email..."
              value=${searchEmail}
              onInput=${(e) => setSearchEmail(e.target.value)}
              class="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value=${selectedTier}
              onChange=${(e) => setSelectedTier(e.target.value)}
              class="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Tiers</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="grandfathered">Grandfathered</option>
            </select>
            <button
              onClick=${searchUsers}
              disabled=${loading}
              class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium"
            >
              Search
            </button>
          </div>
          
          ${users.length > 0 && html`
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-700">
                    <th class="text-left py-2 text-gray-400">Email</th>
                    <th class="text-left py-2 text-gray-400">Tier</th>
                    <th class="text-left py-2 text-gray-400">Expiration</th>
                    <th class="text-left py-2 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${users.map(user => html`
                    <tr class="border-b border-gray-700/50">
                      <td class="py-2 text-white">${user.email || 'No email'}</td>
                      <td class="py-2">
                        <span class="${
                          user.subscription_tier === 'premium' ? 'text-green-400' :
                          user.subscription_tier === 'grandfathered' ? 'text-purple-400' :
                          'text-gray-400'
                        }">
                          ${user.subscription_tier}
                        </span>
                      </td>
                      <td class="py-2 text-gray-300">${user.timeUntilExpiration || 'N/A'}</td>
                      <td class="py-2 space-x-2">
                        ${user.subscription_tier !== 'grandfathered' ? html`
                          <button
                            onClick=${() => grantUserAccess(user.id)}
                            class="text-green-400 hover:text-green-300 text-xs"
                          >
                            Grant
                          </button>
                        ` : html`
                          <button
                            onClick=${() => removeUserAccess(user.id)}
                            class="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        `}
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          `}
        </div>
      `}

      ${activeTab === 'maintenance' && html`
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-purple-400 mb-4">System Maintenance</h3>
          <div class="space-y-4">
            <button
              onClick=${runMaintenance}
              disabled=${loading}
              class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium mr-4"
            >
              Run Expiration Maintenance
            </button>
            <button
              onClick=${grantBulkAccess}
              disabled=${loading}
              class="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium"
            >
              Grant Bulk Grandfathered Access
            </button>
            <div class="text-sm text-gray-400 mt-4">
              <p>• Expiration Maintenance: Clean up expired users and send warnings</p>
              <p>• Bulk Grant: Grant grandfathered access to all eligible users (registered before paywall)</p>
            </div>
          </div>
        </div>
      `}

      ${activeTab === 'testing' && html`
        <div class="space-y-6">
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-purple-400 mb-4">Test Scenarios</h3>
            <p class="text-gray-400 mb-4">Create and test different user scenarios to validate the grandfathering system.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick=${async () => {
                  setLoading(true);
                  try {
                    const response = await makeAdminRequest('/api/users/admin/create-test-scenarios', {
                      method: 'POST'
                    });
                    if (response.ok) {
                      const data = await response.json();
                      alert('Test scenarios created:\\n' + data.results.map(r => '• ' + r.email + ': ' + r.status).join('\\n'));
                    }
                  } catch (error) {
                    alert('Failed to create test scenarios: ' + error.message);
                  }
                  setLoading(false);
                }}
                disabled=${loading}
                class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium"
              >
                Create Test Scenarios
              </button>
              
              <button
                onClick=${async () => {
                  setLoading(true);
                  try {
                    const response = await makeAdminRequest('/api/users/admin/test-grandfathering-logic', {
                      method: 'POST'
                    });
                    if (response.ok) {
                      const data = await response.json();
                      const passRate = data.summary.pass_rate;
                      const summary = 'Tests: ' + data.summary.total_tests + ', Passed: ' + data.summary.passed + ', Failed: ' + data.summary.failed + ', Pass Rate: ' + passRate;
                      alert('Grandfathering Logic Test Results:\\n' + summary + '\\n\\nCheck console for detailed results.');
                      console.log('🧪 Detailed Test Results:', data.results);
                    }
                  } catch (error) {
                    alert('Failed to test grandfathering logic: ' + error.message);
                  }
                  setLoading(false);
                }}
                disabled=${loading}
                class="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium"
              >
                Test Grandfathering Logic
              </button>
              
              <button
                onClick=${async () => {
                  setLoading(true);
                  try {
                    const response = await makeAdminRequest('/api/users/admin/test-expiration-system', {
                      method: 'POST'
                    });
                    if (response.ok) {
                      const data = await response.json();
                      const validation = data.validation;
                      const summary = 'Report Generated: ' + (validation.report_generated ? '✅' : '❌') + '\n' +
                        'Cleanup Ran: ' + (validation.cleanup_ran ? '✅' : '❌') + '\n' +
                        'Warnings Processed: ' + (validation.warnings_processed ? '✅' : '❌') + '\n' +
                        'Test Users Found: ' + validation.test_users_found;
                      alert('Expiration System Test Results:\\n' + summary + '\\n\\nCheck console for detailed results.');
                      console.log('🧪 Expiration Test Results:', data);
                    }
                  } catch (error) {
                    alert('Failed to test expiration system: ' + error.message);
                  }
                  setLoading(false);
                }}
                disabled=${loading}
                class="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium"
              >
                Test Expiration System
              </button>
              
              <button
                onClick=${async () => {
                  if (!confirm('This will delete all test users. Continue?')) return;
                  setLoading(true);
                  try {
                    const response = await makeAdminRequest('/api/users/admin/cleanup-test-users', {
                      method: 'DELETE'
                    });
                    if (response.ok) {
                      const data = await response.json();
                      alert('Cleanup completed: Deleted ' + data.deleted_count + '/' + data.total_found + ' test users');
                    }
                  } catch (error) {
                    alert('Failed to cleanup test users: ' + error.message);
                  }
                  setLoading(false);
                }}
                disabled=${loading}
                class="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium"
              >
                Cleanup Test Users
              </button>
            </div>
            
            <div class="bg-gray-700 rounded-lg p-4">
              <h4 class="text-purple-300 font-medium mb-2">Test Scenarios Include:</h4>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>• <strong>Pre-Paywall User:</strong> Registered before July 26 - should auto-get grandfathered access</li>
                <li>• <strong>Post-Paywall User:</strong> Registered after July 26 - should remain free tier</li>
                <li>• <strong>Expiring Soon User:</strong> Grandfathered access expiring in 2 days - should show warnings</li>
                <li>• <strong>Grace Period User:</strong> Expired 2 hours ago - should still have access (24h grace)</li>
                <li>• <strong>Fully Expired User:</strong> Expired 30 hours ago - should be auto-converted to free</li>
                <li>• <strong>Premium User:</strong> Paid subscriber - should have unlimited access</li>
              </ul>
            </div>
          </div>
          
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-purple-400 mb-4">Manual Testing Guide</h3>
            <div class="space-y-4 text-sm text-gray-300">
              <div>
                <h4 class="text-purple-300 font-medium mb-2">1. Test Automatic Grandfathering</h4>
                <p>Create a test user with email before July 26, 2025. When they access workout generation, they should automatically receive grandfathered status.</p>
              </div>
              
              <div>
                <h4 class="text-purple-300 font-medium mb-2">2. Test Usage Limits</h4>
                <p>Free users should be limited to 1 workout per day. Grandfathered and premium users should have unlimited access.</p>
              </div>
              
              <div>
                <h4 class="text-purple-300 font-medium mb-2">3. Test Expiration Warnings</h4>
                <p>Users with grandfathered access expiring within 7, 3, or 1 days should receive appropriate warnings.</p>
              </div>
              
              <div>
                <h4 class="text-purple-300 font-medium mb-2">4. Test Grace Period</h4>
                <p>Users whose grandfathered access expired within the last 24 hours should still have access.</p>
              </div>
              
              <div>
                <h4 class="text-purple-300 font-medium mb-2">5. Test Auto-Cleanup</h4>
                <p>Users whose grandfathered access expired more than 24 hours ago should be automatically converted to free tier.</p>
              </div>
            </div>
          </div>
          
          <!-- Subscription Testing Section -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-purple-400 mb-4">Subscription Testing</h3>
            <p class="text-gray-400 mb-4">Test subscription management workflows including cancellation, billing history, and payment failures.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick=${async () => {
                  setLoading(true);
                  try {
                    const response = await makeAdminRequest('/api/subscriptions/admin/test-scenarios', {
                      method: 'POST'
                    });
                    if (response.ok) {
                      const data = await response.json();
                      alert('Subscription test scenarios created:\\n' + data.results.map(r => '• ' + r.email + ': ' + r.status).join('\\n') + '\\n\\nNext steps:\\n' + data.test_instructions.join('\\n'));
                    }
                  } catch (error) {
                    alert('Failed to create subscription test scenarios: ' + error.message);
                  }
                  setLoading(false);
                }}
                disabled=${loading}
                class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium"
              >
                Create Subscription Test Scenarios
              </button>
              
              <button
                onClick=${async () => {
                  setLoading(true);
                  try {
                    const response = await makeAdminRequest('/api/subscriptions/admin/test-workflow', {
                      method: 'POST'
                    });
                    if (response.ok) {
                      const data = await response.json();
                      const summary = data.summary;
                      alert('Subscription Workflow Test Results:\\nTests: ' + summary.total_tests + ', Passed: ' + summary.passed + ', Failed: ' + summary.failed + ', Warnings: ' + summary.warnings + '\\nPass Rate: ' + summary.pass_rate + '\\n\\nCheck console for detailed results.');
                      console.log('🧪 Subscription Test Results:', data.results);
                    }
                  } catch (error) {
                    alert('Failed to test subscription workflow: ' + error.message);
                  }
                  setLoading(false);
                }}
                disabled=${loading}
                class="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium"
              >
                Test Subscription Workflow
              </button>
              
              <button
                onClick=${async () => {
                  if (!confirm('This will delete all subscription test data. Continue?')) return;
                  setLoading(true);
                  try {
                    const response = await makeAdminRequest('/api/subscriptions/admin/cleanup-test-data', {
                      method: 'DELETE'
                    });
                    if (response.ok) {
                      const data = await response.json();
                      alert('Subscription test cleanup completed:\\nDeleted ' + data.deleted_users + ' users and ' + data.deleted_subscriptions + ' subscriptions');
                    }
                  } catch (error) {
                    alert('Failed to cleanup subscription test data: ' + error.message);
                  }
                  setLoading(false);
                }}
                disabled=${loading}
                class="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium"
              >
                Cleanup Subscription Test Data
              </button>
            </div>
            
            <div class="bg-gray-700 rounded-lg p-4">
              <h4 class="text-purple-300 font-medium mb-2">Subscription Test Scenarios Include:</h4>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>• <strong>Premium Test User:</strong> Active premium subscriber with successful payments</li>
                <li>• <strong>Failed Payment Test User:</strong> Premium user with recent payment failure</li>
                <li>• <strong>Cancelled Test User:</strong> Cancelled subscription still in billing period</li>
                <li>• <strong>Expired Test User:</strong> Expired subscription reverted to free</li>
                <li>• <strong>Suspended Test User:</strong> Suspended subscription due to payment failures</li>
              </ul>
            </div>
          </div>
          
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-purple-400 mb-4">Subscription Testing Guide</h3>
            <div class="space-y-4 text-sm text-gray-300">
              <div>
                <h4 class="text-purple-300 font-medium mb-2">1. Test Subscription Status Display</h4>
                <p>Sign in as premium-test@test.com to verify subscription status display in profile.</p>
              </div>
              
              <div>
                <h4 class="text-purple-300 font-medium mb-2">2. Test Cancellation Flow</h4>
                <p>Use the cancel subscription button to test the complete cancellation workflow.</p>
              </div>
              
              <div>
                <h4 class="text-purple-300 font-medium mb-2">3. Test Payment Failure Handling</h4>
                <p>Sign in as failed-payment-test@test.com to see payment failure notifications and retry options.</p>
              </div>
              
              <div>
                <h4 class="text-purple-300 font-medium mb-2">4. Test Billing History</h4>
                <p>View billing history for all test users to verify proper data display and formatting.</p>
              </div>
              
              <div>
                <h4 class="text-purple-300 font-medium mb-2">5. Test Different Subscription States</h4>
                <p>Each test user represents a different subscription lifecycle state (active, cancelled, expired, suspended).</p>
              </div>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
};

export default AdminPanel;