/**
 * Bundled client-side code for the IronRoutine application
 * This file contains all components and utilities in a single file
 * to avoid 404 errors when loading individual component files
 */

// Import necessary dependencies from htm/preact
import { html, render } from 'https://esm.sh/htm/preact';
import { useState, useEffect, useRef } from 'https://esm.sh/preact/hooks';
import confetti from 'https://esm.sh/canvas-confetti';

// Utility functions
const trackEvent = (eventName, parameters = {}) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      app_name: 'ironroutine',
      ...parameters
    });
  }
  console.log('Analytics Event:', eventName, parameters);
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / (1000 * 60)); // Duration in minutes
};

const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

const formatAmount = (amount, currency = 'USD') => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const getStatusBadge = (status) => {
  const statusConfig = {
    active: { color: 'bg-green-600', text: 'Active' },
    cancelled: { color: 'bg-yellow-600', text: 'Cancelled' },
    expired: { color: 'bg-red-600', text: 'Expired' },
    pending: { color: 'bg-blue-600', text: 'Pending' },
    suspended: { color: 'bg-orange-600', text: 'Suspended' }
  };
  
  return statusConfig[status] || { color: 'bg-gray-600', text: status || 'Unknown' };
};

const formatBlogContent = (content, md) => {
  if (!content || !md) return '';
  
  try {
    // Render markdown to HTML
    let htmlContent = md.render(content);
    
    // Apply custom styling classes to rendered HTML
    htmlContent = htmlContent
      // Style headers
      .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-white mt-8 mb-4">')
      .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">')
      .replace(/<h3>/g, '<h3 class="text-xl font-bold text-white mt-6 mb-3">')
      .replace(/<h4>/g, '<h4 class="text-lg font-semibold text-white mt-4 mb-2">')
      .replace(/<h5>/g, '<h5 class="text-base font-semibold text-white mt-4 mb-2">')
      .replace(/<h6>/g, '<h6 class="text-sm font-semibold text-white mt-4 mb-2">')
      // Style paragraphs
      .replace(/<p>/g, '<p class="text-gray-300 mb-4 leading-relaxed">')
      // Style lists
      .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-2 mb-6 ml-4 text-gray-300">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-2 mb-6 ml-4 text-gray-300">')
      .replace(/<li>/g, '<li class="text-gray-300">')
      // Style links
      .replace(/<a /g, '<a class="text-purple-400 hover:text-purple-300 underline" ')
      // Style emphasis
      .replace(/<strong>/g, '<strong class="font-semibold text-white">')
      .replace(/<em>/g, '<em class="italic text-gray-200">')
      // Style code
      .replace(/<code>/g, '<code class="bg-gray-700 text-purple-300 px-2 py-1 rounded text-sm font-mono">')
      .replace(/<pre>/g, '<pre class="bg-gray-800 text-gray-200 p-4 rounded-lg mb-6 overflow-x-auto">')
      // Style blockquotes
      .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-purple-500 pl-4 py-2 mb-6 bg-gray-800/30 rounded-r-lg">')
      // Style horizontal rules
      .replace(/<hr>/g, '<hr class="border-gray-600 my-8">');
    
    return htmlContent;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    // Return original content on error
    return content;
  }
};

// Home component
const Home = () => {
  return html`
    <div class="text-center">
      <div class="max-w-3xl mx-auto">
        <div class="flex justify-center mb-8">
          <img src="/logo.png" alt="IronRoutine Logo" class="h-32 w-32 rounded-xl" />
        </div>
        <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Transform Your Fitness Journey
        </h1>
        <p class="text-xl text-gray-300 mb-8">
          AI-powered workout generation, smart progress tracking, and personalized fitness insights.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
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

// GenerateWorkout component (placeholder)
const GenerateWorkout = () => {
  return html`<div>Generate Workout Component</div>`;
};

// TrackProgress component (placeholder)
const TrackProgress = () => {
  return html`<div>Track Progress Component</div>`;
};

// Blog component (placeholder)
const Blog = () => {
  return html`<div>Blog Component</div>`;
};

// Profile component (placeholder)
const Profile = () => {
  return html`<div>Profile Component</div>`;
};

// AdminPanel component (placeholder)
const AdminPanel = () => {
  return html`<div>Admin Panel Component</div>`;
};

// AuthModal component (placeholder)
const AuthModal = () => {
  return html`<div>Auth Modal Component</div>`;
};

// UpgradeModal component (placeholder)
const UpgradeModal = () => {
  return html`<div>Upgrade Modal Component</div>`;
};

// App component
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
          
          if (response.ok) {
            const { user } = await response.json();
            setUser(user);
          } else {
            // Session expired or invalid, clean up
            console.log('Session validation failed, removing stored session');
            localStorage.removeItem('ironroutine_session');
          }
        }
      } catch (error) {
        console.error('Session restoration error:', error);
        localStorage.removeItem('ironroutine_session');
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
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
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
      setAuthError(error.message);
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
          
          if (response.ok) {
            const { session: newSession } = await response.json();
            localStorage.setItem('ironroutine_session', JSON.stringify(newSession));
          } else {
            // Refresh failed, sign out
            handleSignOut();
          }
        }
      } catch (error) {
        console.error('Session refresh error:', error);
        handleSignOut();
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
        <img src="/logo.png" alt="IronRoutine Logo" class="h-16 w-16 mx-auto mb-4 rounded-lg" />
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
      <nav class="bg-black/20 backdrop-blur-lg border-b border-purple-500/20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                IronRoutine
              </h1>
            </div>
            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center space-x-4">
              <button 
                onClick=${() => {
                  setCurrentView('home');
                  trackEvent('navigate', { page: 'home' });
                }}
                class=${currentView === 'home' ? 'text-purple-400' : 'text-gray-300 hover:text-white'}
              >
                Home
              </button>
              <button 
                onClick=${() => {
                  setCurrentView('generate');
                  trackEvent('navigate', { page: 'generate' });
                }}
                class=${currentView === 'generate' ? 'text-purple-400' : 'text-gray-300 hover:text-white'}
              >
                Generate
              </button>
              <button 
                onClick=${() => {
                  setCurrentView('track');
                  trackEvent('navigate', { page: 'track' });
                }}
                class=${currentView === 'track' ? 'text-purple-400' : 'text-gray-300 hover:text-white'}
              >
                Track
              </button>
              <button 
                onClick=${() => {
                  setCurrentView('blog');
                  trackEvent('navigate', { page: 'blog' });
                }}
                class=${currentView === 'blog' ? 'text-purple-400' : 'text-gray-300 hover:text-white'}
              >
                Blog
              </button>
              <button 
                onClick=${() => {
                  setCurrentView('profile');
                  trackEvent('navigate', { page: 'profile' });
                }}
                class=${currentView === 'profile' ? 'text-purple-400' : 'text-gray-300 hover:text-white'}
              >
                Profile
              </button>
              ${isAdmin ? html`
                <button 
                  onClick=${() => {
                    setCurrentView('admin');
                    trackEvent('navigate', { page: 'admin' });
                  }}
                  class=${currentView === 'admin' ? 'text-purple-400' : 'text-gray-300 hover:text-white'}
                >
                  Admin
                </button>
              ` : ''}
              ${user ? html`
                <span class="text-gray-300">Hi, ${user.user_metadata?.name?.split(' ')[0] || 'User'}</span>
                <button 
                  onClick=${handleSignOut}
                  class="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg text-white font-medium"
                >
                  Sign Out
                </button>
              ` : html`
                <button 
                  onClick=${() => setShowAuthModal(true)}
                  class="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg text-white font-medium"
                >
                  Sign In
                </button>
              `}
            </div>
            <!-- Mobile menu button -->
            <div class="md:hidden flex items-center">
              <button
                onClick=${() => setMobileMenuOpen(!mobileMenuOpen)}
                class="text-gray-300 hover:text-white focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d=${mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
          <!-- Mobile menu -->
          ${mobileMenuOpen ? html`
            <div class="md:hidden">
              <div class="px-2 pt-2 pb-3 space-y-1 bg-black/40 backdrop-blur-sm rounded-lg mt-2">
                <button 
                  onClick=${() => {
                    setCurrentView('home');
                    setMobileMenuOpen(false);
                    trackEvent('navigate', { page: 'home' });
                  }}
                  class=${(currentView === 'home' ? 'text-purple-400 bg-purple-900/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20') + ' block px-3 py-2 rounded-md text-base font-medium w-full text-left'}
                >
                  Home
                </button>
                <button 
                  onClick=${() => {
                    setCurrentView('generate');
                    setMobileMenuOpen(false);
                    trackEvent('navigate', { page: 'generate' });
                  }}
                  class=${(currentView === 'generate' ? 'text-purple-400 bg-purple-900/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20') + ' block px-3 py-2 rounded-md text-base font-medium w-full text-left'}
                >
                  Generate
                </button>
                <button 
                  onClick=${() => {
                    setCurrentView('track');
                    setMobileMenuOpen(false);
                    trackEvent('navigate', { page: 'track' });
                  }}
                  class=${(currentView === 'track' ? 'text-purple-400 bg-purple-900/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20') + ' block px-3 py-2 rounded-md text-base font-medium w-full text-left'}
                >
                  Track
                </button>
                <button 
                  onClick=${() => {
                    setCurrentView('blog');
                    setMobileMenuOpen(false);
                    trackEvent('navigate', { page: 'blog' });
                  }}
                  class=${(currentView === 'blog' ? 'text-purple-400 bg-purple-900/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20') + ' block px-3 py-2 rounded-md text-base font-medium w-full text-left'}
                >
                  Blog
                </button>
                <button 
                  onClick=${() => {
                    setCurrentView('profile');
                    setMobileMenuOpen(false);
                    trackEvent('navigate', { page: 'profile' });
                  }}
                  class=${(currentView === 'profile' ? 'text-purple-400 bg-purple-900/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20') + ' block px-3 py-2 rounded-md text-base font-medium w-full text-left'}
                >
                  Profile
                </button>
                ${isAdmin ? html`
                  <button 
                    onClick=${() => {
                      setCurrentView('admin');
                      setMobileMenuOpen(false);
                      trackEvent('navigate', { page: 'admin' });
                    }}
                    class=${(currentView === 'admin' ? 'text-purple-400 bg-purple-900/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20') + ' block px-3 py-2 rounded-md text-base font-medium w-full text-left'}
                  >
                    Admin
                  </button>
                ` : ''}
                ${user ? html`
                  <div class="border-t border-gray-600 pt-2 mt-2">
                    <div class="px-3 py-2 text-gray-300 text-sm">Hi, ${user.user_metadata?.name?.split(' ')[0] || 'User'}</div>
                    <button 
                      onClick=${() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      class="bg-purple-600 hover:bg-purple-700 block px-3 py-2 rounded-md text-base font-medium w-full text-left text-white"
                    >
                      Sign Out
                    </button>
                  </div>
                ` : html`
                  <div class="border-t border-gray-600 pt-2 mt-2">
                    <button 
                      onClick=${() => {
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }}
                      class="bg-purple-600 hover:bg-purple-700 block px-3 py-2 rounded-md text-base font-medium w-full text-left text-white"
                    >
                      Sign In
                    </button>
                  </div>
                `}
              </div>
            </div>
          ` : ''}
        </div>
      </nav>
      
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      
      ${showAuthModal && html`<${AuthModal}
        authMode=${authMode}
        setAuthMode=${setAuthMode}
        onClose=${() => setShowAuthModal(false)}
        onAuth=${handleAuth}
        loading=${loading}
        error=${authError}
      />`}
      
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

// Render the App component to the DOM
render(html`<${App} />`, document.getElementById('app'));