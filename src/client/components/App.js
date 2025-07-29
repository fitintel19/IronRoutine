import { html } from 'https://esm.sh/htm/preact';
import { useState, useEffect, useRef } from 'https://esm.sh/preact/hooks';
import confetti from 'https://esm.sh/canvas-confetti';
import { trackEvent } from '../utils.js';

// Import all components
import Home from './Home.js';
import GenerateWorkout from './GenerateWorkout.js';
import TrackProgress from './TrackProgress.js';
import Blog from './Blog.js';
import Profile from './Profile.js';
import AdminPanel from './AdminPanel.js';
import AuthModal from './AuthModal.js';
import UpgradeModal from './UpgradeModal.js';

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

export default App;