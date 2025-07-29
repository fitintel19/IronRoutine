/**
 * Bundled client-side code for IronRoutine
 * Generated automatically by bundle-components.js
 * DO NOT EDIT MANUALLY - Changes will be overwritten
 */

// Import necessary dependencies from htm/preact
import { html, render } from 'https://esm.sh/htm/preact';
import { useState, useEffect, useRef } from 'https://esm.sh/preact/hooks';
import confetti from 'https://esm.sh/canvas-confetti';
import MarkdownIt from 'https://esm.sh/markdown-it';
import Chart from 'https://esm.sh/chart.js/auto';

// ===== UTILITY FUNCTIONS =====
/**
 * Client-side utility functions for the IronRoutine application
 */

/**
 * Track analytics events
 * @param {string} eventName - Name of the event to track
 * @param {Object} parameters - Additional parameters for the event
 */
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      app_name: 'ironroutine',
      ...parameters
    });
  }
  // Only log important events to reduce console spam
  if (!eventName.includes('navigate')) {
    console.log('Analytics Event:', eventName, parameters);
  }
};

/**
 * Calculate duration between two timestamps in minutes
 * @param {string} startTime - ISO timestamp for start time
 * @param {string} endTime - ISO timestamp for end time
 * @returns {number} Duration in minutes
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / (1000 * 60)); // Duration in minutes
};

/**
 * Format a date string into a localized date representation
 * @param {string} dateString - ISO date string to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

/**
 * Format a number as a currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatAmount = (amount, currency = 'USD') => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Get a status badge configuration based on status string
 * @param {string} status - Status string
 * @returns {Object} Configuration with color and text
 */
export const getStatusBadge = (status) => {
  const statusConfig = {
    active: { color: 'bg-green-600', text: 'Active' },
    cancelled: { color: 'bg-yellow-600', text: 'Cancelled' },
    expired: { color: 'bg-red-600', text: 'Expired' },
    pending: { color: 'bg-blue-600', text: 'Pending' },
    suspended: { color: 'bg-orange-600', text: 'Suspended' }
  };
  
  return statusConfig[status] || { color: 'bg-gray-600', text: status || 'Unknown' };
};

/**
 * Format blog content using markdown-it
 * @param {string} content - Markdown content to format
 * @param {Object} md - Markdown-it instance
 * @returns {string} Formatted HTML content with styling
 */
export const formatBlogContent = (content, md) => {
  if (!content || !md) return '';
  
  try {
    // Render markdown to HTML
    let htmlContent = md.render(content);
    
    // Apply custom styling classes to rendered HTML with improved spacing
    htmlContent = htmlContent
      // Style headers with tighter, more consistent spacing
      .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-white mt-0 first:mt-0 mb-4">')
      .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-white mt-8 first:mt-0 mb-3">')
      .replace(/<h3>/g, '<h3 class="text-xl font-bold text-white mt-6 first:mt-0 mb-3">')
      .replace(/<h4>/g, '<h4 class="text-lg font-semibold text-white mt-4 first:mt-0 mb-2">')
      .replace(/<h5>/g, '<h5 class="text-base font-semibold text-white mt-4 first:mt-0 mb-2">')
      .replace(/<h6>/g, '<h6 class="text-sm font-semibold text-white mt-3 first:mt-0 mb-2">')
      // Style paragraphs with tighter spacing
      .replace(/<p>/g, '<p class="text-gray-300 mb-4 leading-relaxed text-base">')
      // Style lists with reduced spacing
      .replace(/<ul>/g, '<ul class="list-disc list-outside space-y-2 mb-5 ml-6 text-gray-300">')
      .replace(/<ol>/g, '<ol class="list-decimal list-outside space-y-2 mb-5 ml-6 text-gray-300">')
      .replace(/<li>/g, '<li class="text-gray-300 leading-relaxed pl-1">')
      // Style links with better contrast
      .replace(/<a /g, '<a class="text-purple-400 hover:text-purple-300 underline decoration-purple-400/50 hover:decoration-purple-300 transition-colors" ')
      // Style emphasis with better contrast
      .replace(/<strong>/g, '<strong class="font-semibold text-white">')
      .replace(/<em>/g, '<em class="italic text-gray-200">')
      // Style inline code with better padding and spacing
      .replace(/<code>/g, '<code class="bg-gray-700/80 text-purple-300 px-2 py-1 rounded text-sm font-mono mx-0.5">')
      // Style code blocks with tighter spacing
      .replace(/<pre>/g, '<pre class="bg-gray-800/80 border border-gray-700/50 text-gray-200 p-4 rounded-xl mb-5 overflow-x-auto shadow-lg">')
      // Style blockquotes with reduced spacing
      .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-purple-500 pl-4 py-3 mb-5 bg-gray-800/40 rounded-r-xl italic text-gray-200 shadow-sm">')
      // Style horizontal rules with reduced spacing
      .replace(/<hr>/g, '<hr class="border-0 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-6">');
    
    return htmlContent;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    // Return original content on error
    return content;
  }
};

// ===== COMPONENTS =====

// ===== ADMINPANEL COMPONENT =====
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

AdminPanel;

// ===== APP COMPONENT =====
// Import all components









/**
 * Main App component that orchestrates the entire application
 * @returns {JSX.Element} The App component
 */
const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [authError, setAuthError] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Debug state changes
  useEffect(() => {
    console.log('🔄 showUpgradeModal state changed to:', showUpgradeModal);
  }, [showUpgradeModal]);
  
  useEffect(() => {
    console.log('🔄 showAuthModal state changed to:', showAuthModal);
  }, [showAuthModal]);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);
  
  // Admin access check
  const isAdmin = user && user.email && ['john@fitintel.com', 'admin@ironroutine.app', 'jetzfan19@gmail.com'].includes(user.email);

  // Session persistence - check for stored session on app load
  useEffect(() => {
    const checkStoredSession = async () => {
      try {
        const storedSession = localStorage.getItem('ironroutine_session');
        if (storedSession) {
          const session = JSON.parse(storedSession);
          
          // Validate session with backend
          const response = await fetch('/api/auth/user', {
            headers: {
              'Authorization': 'Bearer ' + session.access_token
            }
          });
          
          // Handle both successful and error responses with 200 status
          const data = await response.json();
          
          if (response.ok && data.user) {
            setUser(data.user);
          } else {
            // Session expired or invalid, clean up
            console.log('Session validation failed, removing stored session');
            localStorage.removeItem('ironroutine_session');
          }
        }
      } catch (error) {
        console.error('Session restoration error:', error);
        // Don't remove the session on network errors - might be temporary
        // Only remove if we got a response but it was invalid
        if (error.name !== 'TypeError' && error.name !== 'NetworkError') {
          localStorage.removeItem('ironroutine_session');
        }
      } finally {
        setIsCheckingSession(false);
      }
    };
    
    checkStoredSession();
  }, []);

  // Authentication functions
  const handleAuth = async (email, password, name = null) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/signin';
      const body = authMode === 'signup'
        ? { email, password, name }
        : { email, password };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      // Check if the response contains an error message
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      // Check if we have the expected data
      if (!data.user) {
        console.warn('Auth response missing user data:', data);
        throw new Error('Invalid response from server');
      }
      
      setUser(data.user);
      setShowAuthModal(false);
      
      // Track authentication event
      trackEvent(authMode === 'signup' ? 'sign_up' : 'login', {
        method: 'email',
        user_id: data.user.id
      });
      
      // Store session for persistence
      if (data.session) {
        localStorage.setItem('ironroutine_session', JSON.stringify(data.session));
      }
      
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError(error.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setUser(null);
      localStorage.removeItem('ironroutine_session');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if the API call fails, we should still sign out the user locally
      setUser(null);
      localStorage.removeItem('ironroutine_session');
    }
  };

  // Fetch user subscription status
  const fetchSubscriptionStatus = async () => {
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
          setUserSubscription(data.subscription);
          return data;
        }
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
    return null;
  };

  // Show upgrade modal (PayPal checkout happens when user clicks upgrade button in modal)
  const handleUpgrade = async () => {
    console.log('🚨 handleUpgrade called - this should show the modal, not redirect to PayPal!');
    console.log('🚨 Current showUpgradeModal state:', showUpgradeModal);
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Just show the modal - don't redirect to PayPal yet
    console.log('🚨 Setting showUpgradeModal to true...');
    setShowUpgradeModal(true);
    console.log('🚨 showUpgradeModal should now be true');
  };

  // Handle actual PayPal subscription creation (called from inside the modal)
  const handlePayPalUpgrade = async () => {
    console.log('🚨 handlePayPalUpgrade called - this should redirect to PayPal');
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSubscriptionLoading(true);
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (!storedSession) {
        throw new Error('Authentication required');
      }

      const session = JSON.parse(storedSession);
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token
        },
        body: JSON.stringify({
          planId: 'premium_monthly',
          returnUrl: 'https://ironroutine.app/subscription/success',
          cancelUrl: 'https://ironroutine.app/subscription/cancelled'
        })
      });

      const data = await response.json();
      
      if (data.success && data.approvalUrl) {
        // Redirect to PayPal for payment
        window.location.href = data.approvalUrl;
      } else {
        throw new Error(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to create subscription: ' + error.message);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!user) return;

    const refreshSession = async () => {
      try {
        const storedSession = localStorage.getItem('ironroutine_session');
        if (storedSession) {
          const session = JSON.parse(storedSession);
          
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: session.refresh_token })
          });
          
          const data = await response.json();
          
          if (response.ok && data.session) {
            localStorage.setItem('ironroutine_session', JSON.stringify(data.session));
            console.log('Session refreshed successfully');
          } else if (data.error) {
            console.warn('Session refresh returned error:', data.error);
            // Only sign out if it's an authentication error, not a server error
            if (data.error.includes('token') || data.error.includes('auth') || data.error.includes('session')) {
              handleSignOut();
            }
          } else {
            console.warn('Session refresh failed with unexpected response');
          }
        }
      } catch (error) {
        console.error('Session refresh error:', error);
        // Don't sign out on network errors - might be temporary
        if (error.name !== 'TypeError' && error.name !== 'NetworkError') {
          handleSignOut();
        }
      }
    };

    // Refresh session every 50 minutes (tokens typically expire in 60 minutes)
    const interval = setInterval(refreshSession, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch subscription status when user changes
  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
    } else {
      setUserSubscription(null);
    }
  }, [user]);

  const views = {
    home: Home,
    generate: GenerateWorkout,
    track: TrackProgress,
    blog: Blog,
    profile: Profile,
    admin: AdminPanel
  };

  const CurrentView = views[currentView] || Home;

  // Show loading screen while checking session
  if (isCheckingSession) {
    return html`
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div class="text-center">
        <div class="h-16 w-16 mx-auto mb-4"></div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
          IronRoutine
        </h1>
        <p class="text-gray-400">Loading...</p>
      </div>
    </div>
  `;
  }

  return html`
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <!-- Modern Professional Navigation -->
      <nav class="sticky top-0 z-50 bg-black/10 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-purple-500/5">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            
            <!-- Logo/Brand Section -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="cursor-pointer group" onClick=${() => {
                  setCurrentView('home');
                  trackEvent('navigate', { page: 'home' });
                }}>
                  <!-- Brand Text Only -->
                  <h1 class="text-lg sm:text-xl font-bold" style="
                    color: #a855f7;
                    background: linear-gradient(to right, #a855f7, #ec4899);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                  ">
                    IronRoutine
                  </h1>
                </div>
              </div>
            </div>

            <!-- Modern Desktop Navigation Menu -->
            <div class="hidden md:flex items-center space-x-2">
              <div class="flex items-center space-x-1 bg-gray-900/50 backdrop-blur-xl rounded-2xl p-2 border border-purple-500/20 shadow-xl shadow-purple-500/10">
                ${['home', 'generate', 'track', 'blog', 'profile'].map(page => {
                  const pageLabels = {
                    home: 'Home',
                    generate: 'Generate',
                    track: 'Track',
                    blog: 'Blog',
                    profile: 'Profile'
                  };
                  
                  const isActive = currentView === page;
                  
                  return html`
                    <button 
                      onClick=${() => {
                        setCurrentView(page);
                        setMobileMenuOpen(false);
                        trackEvent('navigate', { page });
                      }}
                      class="${isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 border border-purple-400/50 glow-purple' 
                        : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5 hover:shadow-md hover:shadow-purple-500/20 border border-transparent hover:border-purple-500/30'
                      } px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                    >
                      <span class="relative z-10">${pageLabels[page]}</span>
                      ${isActive ? html`<div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-sm"></div>` : ''}
                    </button>
                  `;
                })}
                ${isAdmin ? html`
                  <button 
                    onClick=${() => {
                      setCurrentView('admin');
                      setMobileMenuOpen(false);
                      trackEvent('navigate', { page: 'admin' });
                    }}
                    class="${currentView === 'admin' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 border border-purple-400/50 glow-purple' 
                      : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5 hover:shadow-md hover:shadow-purple-500/20 border border-transparent hover:border-purple-500/30'
                    } px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                  >
                    <span class="relative z-10">Admin</span>
                    ${currentView === 'admin' ? html`<div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-sm"></div>` : ''}
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- User Section & Mobile Menu -->
            <div class="flex items-center space-x-8">
              
              <!-- Desktop User Section -->
              ${user ? html`
                <div class="hidden md:flex items-center space-x-8">
                  <!-- User Avatar & Info -->
                  <div class="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold" data-avatar="desktop">
                      ${(user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <div class="text-sm">
                      <div class="text-white font-medium">
                        ${(user.user_metadata?.name?.split(' ')[0] || 'User')}
                      </div>
                      <div class="text-gray-400 text-xs">Welcome back!</div>
                    </div>
                  </div>
                  <!-- Sign Out Button -->
                  <button 
                    onClick=${handleSignOut}
                    class="ml-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transform hover:scale-105 border-0"
                  >
                    Sign Out
                  </button>
                </div>
              ` : html`
                <div class="hidden md:flex">
                  <button 
                    onClick=${() => {
                      console.log('🚨 Desktop Sign In button clicked');
                      setShowAuthModal(true);
                    }}
                    class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transform hover:scale-105 border-0"
                  >
                    Sign In
                  </button>
                </div>
              `}

              <!-- Mobile Menu Button -->
              <button
                onClick=${() => setMobileMenuOpen(!mobileMenuOpen)}
                class="md:hidden relative w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border border-purple-400/50 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 transition-all duration-200 transform hover:scale-105"
              >
                <!-- Hamburger Menu Icon -->
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="${mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}"
                    class="transition-all duration-300"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Enhanced Mobile Menu -->
          <div class="${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} md:hidden overflow-hidden transition-all duration-300 ease-in-out" data-mobile-menu="true">
            <div class="${mobileMenuOpen ? 'py-4' : 'py-0'} space-y-2">
              <!-- Mobile Navigation Links -->
              <div class="space-y-1">
                ${['home', 'generate', 'track', 'blog', 'profile'].map(page => {
                  const pageLabels = {
                    home: '🏠 Home',
                    generate: '⚡ Generate',
                    track: '📊 Track',
                    blog: '📝 Blog',
                    profile: '👤 Profile'
                  };
                  
                  const isActive = currentView === page;
                  
                  return html`
                    <button 
                      onClick=${() => {
                        setCurrentView(page);
                        setMobileMenuOpen(false);
                        trackEvent('navigate', { page });
                      }}
                      class="${isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-400/50 shadow-lg shadow-purple-500/30' 
                        : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600/50 hover:border-purple-500/30'
                      } w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 backdrop-blur-sm"
                    >
                      ${pageLabels[page]}
                    </button>
                  `;
                })}
                ${isAdmin ? html`
                  <button 
                    onClick=${() => {
                      setCurrentView('admin');
                      setMobileMenuOpen(false);
                      trackEvent('navigate', { page: 'admin' });
                    }}
                    class="${currentView === 'admin' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-400/50 shadow-lg shadow-purple-500/30' 
                      : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600/50 hover:border-purple-500/30'
                    } w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 backdrop-blur-sm"
                  >
                    🔧 Admin
                  </button>
                ` : ''}
              </div>

              <!-- Mobile User Section -->
              <div class="pt-4 mt-4 border-t border-white/10">
                ${user ? html`
                  <div class="space-y-3">
                    <!-- Mobile User Info -->
                    <div class="flex items-center space-x-4 bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-600/50">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold" data-avatar="mobile">
                        ${(user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                      </div>
                      <div>
                        <div class="text-white font-medium">
                          ${user.user_metadata?.name || 'User'}
                        </div>
                        <div class="text-gray-400 text-sm">${user.email}</div>
                      </div>
                    </div>
                    <!-- Mobile Sign Out -->
                    <button 
                      onClick=${() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 transform hover:scale-105 border-0"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                ` : html`
                  <button 
                    onClick=${() => {
                      console.log('🚨 Mobile Sign In button clicked');
                      setShowAuthModal(true);
                      setMobileMenuOpen(false);
                    }}
                    class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 transform hover:scale-105 border-0"
                  >
                    🔐 Sign In
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-8">
        <${CurrentView}
          user=${user}
          setUser=${setUser}
          workouts=${workouts}
          setWorkouts=${setWorkouts}
          loading=${loading}
          setLoading=${setLoading}
          setShowAuthModal=${setShowAuthModal}
          setAuthMode=${setAuthMode}
          setShowUpgradeModal=${setShowUpgradeModal}
          userSubscription=${userSubscription}
        />
      </main>
      
      ${showAuthModal && html`
        ${console.log('🔍 Rendering AuthModal, showAuthModal =', showAuthModal)}
        <${AuthModal}
          authMode=${authMode}
          setAuthMode=${setAuthMode}
          onClose=${() => {
            console.log('🚪 AuthModal close clicked');
            setShowAuthModal(false);
          }}
          onAuth=${handleAuth}
          loading=${loading}
          error=${authError}
        />
      `}
      
      ${showUpgradeModal && html`<${UpgradeModal}
            onClose=${() => {
              console.log('🔍 Modal close clicked');
              setShowUpgradeModal(false);
            }}
            onUpgrade=${handlePayPalUpgrade}
            loading=${subscriptionLoading}
            userSubscription=${userSubscription}
          />`}
    </div>
  `;
};

App;

// ===== AUTHMODAL COMPONENT =====
/**
 * Authentication Modal Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.authMode - Current authentication mode ('signin' or 'signup')
 * @param {Function} props.setAuthMode - Function to switch between auth modes
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onAuth - Function to handle authentication
 * @param {boolean} props.loading - Loading state
 * @param {string|null} props.error - Error message if authentication fails
 */
const AuthModal = ({ authMode, setAuthMode, onClose, onAuth, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuth(email, password, authMode === 'signup' ? name : null);
  };

  return html`
    <div 
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" 
      style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;"
      onClick=${(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        class="relative bg-gray-900 backdrop-blur-lg rounded-2xl p-12 border border-purple-400/40 shadow-2xl shadow-purple-500/20" 
        style="width: 480px; max-width: 90vw; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(168, 85, 247, 0.25), 0 0 0 1px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(168, 85, 247, 0.1);"
        onClick=${(e) => e.stopPropagation()}
      >
        <!-- Close Button - positioned at top right corner of modal -->
        <button 
          onClick=${onClose}
          class="absolute top-3 right-3 text-purple-400 hover:text-white hover:bg-purple-600/80 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 z-20 bg-purple-500/20 border border-purple-500/40 hover:border-purple-400"
          style="position: absolute; top: 12px; right: 12px;"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-center text-white">
            ${authMode === 'signup' ? 'Create Account' : 'Sign In'}
          </h2>
        </div>

        <form onSubmit=${handleSubmit} class="space-y-8">
          ${authMode === 'signup' ? html`
            <div class="relative">
              <label class="block text-xs font-semibold mb-3 text-purple-300 uppercase tracking-wide">Name</label>
              <div class="relative">
                <input
                  type="text"
                  value=${name}
                  onChange=${(e) => setName(e.target.value)}
                  class="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:bg-gray-900/70 transition-all duration-300 text-sm backdrop-blur-sm"
                  placeholder="Enter your full name"
                  required
                />
                <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ` : ''}
          
          <div class="relative">
            <label class="block text-xs font-semibold mb-3 text-purple-300 uppercase tracking-wide">Email</label>
            <div class="relative">
              <input
                type="email"
                value=${email}
                onChange=${(e) => setEmail(e.target.value)}
                class="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:bg-gray-900/70 transition-all duration-300 text-sm backdrop-blur-sm"
                placeholder="Enter your email address"
                required
              />
              <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          
          <div class="relative">
            <label class="block text-xs font-semibold mb-3 text-purple-300 uppercase tracking-wide">Password</label>
            <div class="relative">
              <input
                type="password"
                value=${password}
                onChange=${(e) => setPassword(e.target.value)}
                class="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:bg-gray-900/70 transition-all duration-300 text-sm backdrop-blur-sm"
                placeholder="Enter your password"
                required
              />
              <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          ${error ? html`
            <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <p class="text-red-400 text-sm">${error}</p>
            </div>
          ` : ''}

          <button
            type="submit"
            disabled=${loading}
            class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 border border-purple-400/30 disabled:border-gray-500/30 transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          >
            ${loading ? html`
              <div class="flex items-center justify-center space-x-2">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Please wait...</span>
              </div>
            ` : (authMode === 'signup' ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-gray-400">
            ${authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick=${() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
              class="text-purple-400 hover:text-purple-300 ml-2 font-medium hover:underline decoration-purple-400/70 hover:decoration-purple-300 underline-offset-2 transition-all duration-200 bg-transparent border-0 p-0"
            >
              ${authMode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  `;
};

AuthModal;

// ===== BLOG COMPONENT =====
// Initialize markdown-it with enhanced styling
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// Create a wrapper for formatBlogContent that returns HTML
const formatBlogContentElement = (content) => {
  if (!content) return '';
  
  try {
    const htmlContent = formatBlogContent(content, md);
    return html`<div dangerouslySetInnerHTML=${{ __html: htmlContent }}></div>`;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    // Fallback to plain text
    return html`<p class="text-gray-300 mb-4 leading-relaxed">${content}</p>`;
  }
};

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBlogPosts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const url = selectedCategory
        ? `/api/blog?category=${selectedCategory}`
        : '/api/blog';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data.posts || []);
      } else if (data.error) {
        console.error('Blog posts API error:', data.error);
        // Still set empty posts array to avoid showing loading indefinitely
        setPosts([]);
      } else {
        console.error('Blog posts API response not OK:', response.status);
        setPosts([]);
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
      // Set empty posts array on error to avoid showing loading indefinitely
      setPosts([]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data || []);
      } else if (data.error) {
        console.error('Categories API error:', data.error);
        // Set default categories if API fails
        setCategories([
          { id: '1', name: 'Fitness', slug: 'fitness' },
          { id: '2', name: 'Workouts', slug: 'workouts' },
          { id: '3', name: 'Nutrition', slug: 'nutrition' }
        ]);
      } else {
        console.error('Categories API response not OK:', response.status);
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Set default categories on error
      setCategories([
        { id: '1', name: 'Fitness', slug: 'fitness' },
        { id: '2', name: 'Workouts', slug: 'workouts' },
        { id: '3', name: 'Nutrition', slug: 'nutrition' }
      ]);
    }
  };

  const fetchPost = async (slug) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog/${slug}`);
      const data = await response.json();
      
      if (response.ok && !data.error) {
        setSelectedPost(data);
        
        // Track blog post view
        trackEvent('blog_post_view', {
          blog_title: data.title,
          blog_category: data.category
        });
      } else {
        console.error('Blog post API error:', data.error || 'Unknown error');
        // Return to post list on error
        setSelectedPost(null);
      }
    } catch (error) {
      console.error('Failed to fetch blog post:', error);
      // Return to post list on error
      setSelectedPost(null);
    }
    setLoading(false);
  };

  const formatBlogDate = (dateString) => {
    return formatDate(dateString, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Single post view
  if (selectedPost) {
    return html`
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick=${() => setSelectedPost(null)}
          class="mb-8 flex items-center px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-gray-700/50 hover:border-purple-500/30 transition-all duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Blog
        </button>
        
        <article class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 lg:p-12 border border-gray-700 shadow-xl">
          <header class="mb-8">
            <div class="flex items-center space-x-4 mb-4">
              <span class="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                ${selectedPost.category}
              </span>
              <time class="text-gray-400 text-sm">
                ${formatBlogDate(selectedPost.published_at)}
              </time>
            </div>
            
            <h1 class="text-4xl font-bold text-white mb-4">
              ${selectedPost.title}
            </h1>
            
            ${selectedPost.excerpt && html`
              <p class="text-xl text-gray-300 mb-6">
                ${selectedPost.excerpt}
              </p>
            `}
          </header>
          
          <div class="prose prose-invert prose-lg max-w-none">
            <div class="blog-content text-gray-300 leading-relaxed">
              ${formatBlogContentElement(selectedPost.content)}
            </div>
          </div>
          
          ${selectedPost.tags && selectedPost.tags.length > 0 && html`
            <footer class="mt-8 pt-6 border-t border-gray-700">
              <div class="flex items-center space-x-2">
                <span class="text-gray-400 text-sm">Tags:</span>
                ${selectedPost.tags.map(tag => html`
                  <span key=${tag} class="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                    ${tag}
                  </span>
                `)}
              </div>
            </footer>
          `}
        </article>
      </div>
    `;
  }

  // Blog list view
  return html`
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <div class="mb-6">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4 leading-normal">
            Fitness Knowledge Hub
          </h1>
          <div class="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mb-6"></div>
        </div>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Expert tips, workout guides, and fitness insights to help you reach your goals and transform your life
        </p>
      </div>

      <!-- Enhanced Category Filter -->
      <div class="mb-20">
        <div class="flex flex-wrap justify-center gap-4">
          <button
            onClick=${() => setSelectedCategory('')}
            class=${`${(!selectedCategory
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105 border-0'
              : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:border-purple-500/30 hover:text-white'
            ) + ' px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105'}`}
          >
            <span class="flex items-center space-x-2">
              <span>📚</span>
              <span>All Posts</span>
            </span>
          </button>
          ${categories.map(category => {
            const icons = {
              fitness: '🎯',
              workouts: '💪', 
              nutrition: '🥗',
              equipment: '🏋️',
              motivation: '🔥'
            };
            return html`
              <button
                key=${category.slug}
                onClick=${() => setSelectedCategory(category.slug)}
                class=${`${(selectedCategory === category.slug
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105 border-0'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:border-purple-500/30 hover:text-white'
                ) + ' px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105'}`}
              >
                <span class="flex items-center space-x-2">
                  <span>${icons[category.slug] || '📝'}</span>
                  <span>${category.name}</span>
                </span>
              </button>
            `;
          })}
        </div>
      </div>

      <!-- Blog Posts Grid -->
      ${loading ? html`
        <div class="text-center py-12">
          <div class="text-4xl mb-4">📝</div>
          <p class="text-gray-400">Loading blog posts...</p>
        </div>
      ` : html`
        ${posts.length > 0 ? html`
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            ${posts.map(post => html`
              <article
                key=${post.id}
                class="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500/30 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick=${() => fetchPost(post.slug)}
              >
                <!-- Simple Header with Icon -->
                <div class="p-6 pb-4">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="text-3xl">
                        ${post.category === 'workouts' ? '💪' :
                          post.category === 'nutrition' ? '🥗' :
                          post.category === 'equipment' ? '🏋️' :
                          post.category === 'motivation' ? '🔥' : '🎯'}
                      </div>
                      <div>
                        <span class="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                          ${post.category}
                        </span>
                      </div>
                    </div>
                    <time class="text-gray-500 text-xs">
                      ${formatBlogDate(post.published_at)}
                    </time>
                  </div>
                  
                  <h2 class="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors leading-tight">
                    ${post.title}
                  </h2>
                  
                  ${post.excerpt && html`
                    <p class="text-gray-400 text-sm mb-4 leading-relaxed">
                      ${post.excerpt}
                    </p>
                  `}
                  
                  <!-- Tags -->
                  ${post.tags && post.tags.length > 0 && html`
                    <div class="flex flex-wrap gap-2 mb-4">
                      ${post.tags.slice(0, 3).map(tag => html`
                        <span key=${tag} class="bg-purple-600/10 border border-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                          #${tag}
                        </span>
                      `)}
                    </div>
                  `}
                  
                  <!-- Read More Button -->
                  <div class="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <span class="text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors flex items-center">
                      Read More
                      <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </span>
                    <div class="text-gray-500 text-xs">
                      ${Math.ceil(post.content?.length / 1000) || 3} min read
                    </div>
                  </div>
                </div>
              </article>
            `)}
          </div>
        ` : html`
          <div class="text-center py-12">
            <div class="text-4xl mb-4">📝</div>
            <h3 class="text-xl font-semibold text-white mb-2">No Blog Posts Yet</h3>
            <p class="text-gray-400">
              ${selectedCategory
                ? 'No posts found in this category. Try selecting a different category.'
                : 'Blog posts will appear here soon. Check back later for fitness tips and guides!'
              }
            </p>
          </div>
        `}
      `}
    </div>
  `;
};

Blog;

// ===== GENERATEWORKOUT COMPONENT =====
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

GenerateWorkout;

// ===== HOME COMPONENT =====
/**
 * Home component for the IronRoutine application
 * Displays the landing page with feature highlights
 */
const Home = () => {
  return html`
    <div class="text-center">
      <div class="max-w-3xl mx-auto">
        <div class="flex justify-center mb-4 sm:mb-6 lg:mb-8">
          <img src="/logo.png?v=7" alt="IronRoutine Logo" class="h-32 w-32 sm:h-48 sm:w-48 lg:h-64 lg:w-64 rounded-xl" style="object-fit: contain; object-position: center;" />
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-pink-400 bg-clip-text text-transparent leading-normal">
          Transform Your Fitness Journey
        </h1>
        <p class="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
          AI-powered workout generation, smart progress tracking, and personalized fitness insights.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8 lg:mt-12">
          <div class="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div class="text-purple-400 text-3xl mb-4">🤖</div>
            <h3 class="text-xl font-semibold mb-2">AI-Generated Workouts</h3>
            <p class="text-gray-300">Custom workouts tailored to your goals and fitness level</p>
          </div>
          <div class="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div class="text-purple-400 text-3xl mb-4">📊</div>
            <h3 class="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p class="text-gray-300">Monitor your improvements with detailed analytics</p>
          </div>
          <div class="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div class="text-purple-400 text-3xl mb-4">🎯</div>
            <h3 class="text-xl font-semibold mb-2">Goal Achievement</h3>
            <p class="text-gray-300">Set and crush your fitness milestones</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

Home;

// ===== PROFILE COMPONENT =====
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

Profile;

// ===== TRACKPROGRESS COMPONENT =====
const TrackProgress = ({ user }) => {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalMinutes: 0, totalCalories: 0, avgDuration: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWorkoutHistory();
      fetchProgressStats();
    }
  }, [user]);

  const fetchWorkoutHistory = async () => {
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const response = await fetch('/api/workouts/history', {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        });
        if (response.ok) {
          const data = await response.json();
          setWorkoutHistory(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch workout history:', error);
    }
  };

  const fetchProgressStats = async () => {
    try {
      const storedSession = localStorage.getItem('ironroutine_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const response = await fetch('/api/progress/analytics', {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress stats:', error);
    }
  };

  if (!user) {
    return html`
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold mb-8 text-center">Track Your Progress</h2>
        
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div class="text-center text-gray-400 py-8">
            <div class="text-4xl mb-4">📊</div>
            <p class="mb-6">Sign in to track your fitness progress and see detailed analytics!</p>
          </div>
        </div>
      </div>
    `;
  }

  return html`
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold mb-8 text-center">Track Your Progress</h2>
      
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 class="text-xl font-semibold mb-4">Progress Overview</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-400">${stats.totalWorkouts}</div>
              <div class="text-sm text-gray-400">Total Workouts</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-400">${stats.totalCalories}</div>
              <div class="text-sm text-gray-400">Calories Burned</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-400">${Math.round(stats.totalMinutes / 60)}</div>
              <div class="text-sm text-gray-400">Hours Trained</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-400">${stats.avgDuration}</div>
              <div class="text-sm text-gray-400">Avg Duration (min)</div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 class="text-xl font-semibold mb-4">Recent Activity</h3>
          ${workoutHistory.length > 0 ? html`
            <div class="space-y-3">
              ${workoutHistory.slice(0, 5).map(workout => html`
                <div key=${workout.id} class="bg-gray-700/50 rounded-lg p-3">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-medium text-sm">${workout.name}</div>
                      <div class="text-xs text-gray-400">${new Date(workout.completed_at).toLocaleDateString()}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-medium text-purple-400">${workout.duration_minutes}min</div>
                      <div class="text-xs text-gray-400">${workout.calories_burned} cal</div>
                    </div>
                  </div>
                </div>
              `)}
            </div>
          ` : html`
            <div class="text-center text-gray-400 py-8">
              <div class="text-4xl mb-4">📊</div>
              <p>Complete your first workout to see progress here!</p>
            </div>
          `}
        </div>
      </div>

      <!-- Progress Chart -->
      ${workoutHistory.length > 0 ? html`
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
          <h3 class="text-xl font-semibold mb-4">Progress Chart</h3>
          <div class="relative h-64">
            <canvas ref=${(el) => {
              if (el && workoutHistory.length > 0) {
                // Destroy existing chart if it exists
                if (el.chart) {
                  el.chart.destroy();
                }
                
                // Prepare data for the last 7 workouts
                const recentWorkouts = workoutHistory.slice(0, 7).reverse();
                const labels = recentWorkouts.map(w => new Date(w.completed_at).toLocaleDateString());
                const calories = recentWorkouts.map(w => w.calories_burned || 0);
                const duration = recentWorkouts.map(w => w.duration_minutes || 0);
                
                // Create chart
                el.chart = new Chart(el, {
                  type: 'line',
                  data: {
                    labels: labels,
                    datasets: [{
                      label: 'Calories Burned',
                      data: calories,
                      borderColor: 'rgb(168, 85, 247)',
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      yAxisID: 'y'
                    }, {
                      label: 'Duration (min)',
                      data: duration,
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      yAxisID: 'y1'
                    }]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: 'white'
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: 'rgb(156, 163, 175)'
                        },
                        grid: {
                          color: 'rgba(156, 163, 175, 0.1)'
                        }
                      },
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'Calories',
                          color: 'rgb(168, 85, 247)'
                        },
                        ticks: {
                          color: 'rgb(156, 163, 175)'
                        },
                        grid: {
                          color: 'rgba(156, 163, 175, 0.1)'
                        }
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                          display: true,
                          text: 'Duration (min)',
                          color: 'rgb(34, 197, 94)'
                        },
                        ticks: {
                          color: 'rgb(156, 163, 175)'
                        },
                        grid: {
                          drawOnChartArea: false,
                        }
                      }
                    }
                  }
                });
              }
            }} class="w-full h-full"></canvas>
          </div>
        </div>
      ` : ''}

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 class="text-xl font-semibold mb-4">Workout History</h3>
        ${workoutHistory.length > 0 ? html`
          <div class="space-y-3">
            ${workoutHistory.map(workout => html`
              <div key=${workout.id} class="bg-gray-700/50 rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-medium text-white">${workout.name}</h4>
                    <p class="text-sm text-gray-400 mt-1">${workout.description || 'No description'}</p>
                    <div class="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>📅 ${new Date(workout.completed_at).toLocaleDateString()}</span>
                      <span>⏱️ ${workout.duration_minutes} minutes</span>
                      <span>🔥 ${workout.calories_burned} calories</span>
                      <span>💪 ${workout.exercises_completed?.length || 0} exercises</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-green-400">
                      ${workout.completion_rate ? Math.round(workout.completion_rate * 100) + '%' : 'Complete'}
                    </div>
                  </div>
                </div>
              </div>
            `)}
          </div>
        ` : html`
          <div class="text-center text-gray-400 py-8">
            <div class="text-4xl mb-4">🏋️</div>
            <p>Your workout history will appear here after completing workouts!</p>
          </div>
        `}
      </div>
    </div>
  `;
};

TrackProgress;

// ===== UPGRADEMODAL COMPONENT =====
/**
 * Upgrade Modal Component
 * 
 * Displays a modal for upgrading to premium subscription
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onUpgrade - Function to handle the upgrade action
 * @param {boolean} props.loading - Loading state during upgrade process
 * @param {Object|null} props.userSubscription - User's current subscription information
 */
const UpgradeModal = ({ onClose, onUpgrade, loading, userSubscription }) => {
  return html`
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 999999; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; color: black; padding: 40px; border-radius: 15px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
        <!-- Close Button -->
        <button onClick=${onClose} style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
        
        <!-- Header -->
        <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #333;">Upgrade to Premium</h2>
        
        <!-- Price -->
        <div style="margin-bottom: 20px;">
          <span style="font-size: 36px; font-weight: bold; color: #333;">$9.99</span>
          <span style="font-size: 18px; color: #666;">/month</span>
        </div>
        <div style="color: #8b5cf6; font-weight: 500; margin-bottom: 25px;">7-day free trial</div>
        
        <!-- Features -->
        <div style="text-align: left; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="color: #22c55e; margin-right: 10px; font-size: 18px;">✓</span>
            <span>Unlimited AI workout generation</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="color: #22c55e; margin-right: 10px; font-size: 18px;">✓</span>
            <span>Advanced progress analytics</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="color: #22c55e; margin-right: 10px; font-size: 18px;">✓</span>
            <span>AI nutrition planning</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="color: #22c55e; margin-right: 10px; font-size: 18px;">✓</span>
            <span>Priority customer support</span>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="color: #22c55e; margin-right: 10px; font-size: 18px;">✓</span>
            <span>Cancel anytime</span>
          </div>
        </div>
        
        <!-- Upgrade Button -->
        <button 
          onClick=${onUpgrade} 
          disabled=${loading}
          style="width: 100%; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; border: none; padding: 15px 30px; font-size: 18px; font-weight: bold; border-radius: 10px; cursor: pointer; margin-bottom: 15px; ${loading ? 'opacity: 0.7;' : ''}"
        >
          ${loading ? 'Processing...' : 'Start 7-Day Free Trial'}
        </button>
        
        <!-- PayPal Info -->
        <div style="font-size: 14px; color: #666; display: flex; align-items: center; justify-content: center;">
          <span style="margin-right: 5px;">🔒</span>
          Secure checkout powered by PayPal
        </div>
        <div style="font-size: 12px; color: #666; margin-top: 5px;">No commitment • Cancel anytime</div>
      </div>
    </div>
  `;
};

UpgradeModal;


// ===== MAIN APPLICATION INITIALIZATION =====

// Log initialization for debugging
console.log('IronRoutine bundled client initializing...');

// Add error handling for component loading
window.addEventListener('error', (event) => {
  console.error('Error in bundled app:', event.message, event.filename);
});

// Log before rendering
console.log('About to render App component');

// Render the App component to the DOM
render(html`<${App} />`, document.getElementById('app'));

// Log after rendering
console.log('App component rendered successfully');
