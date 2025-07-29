import { html } from 'https://esm.sh/htm/preact';
import { useState } from 'https://esm.sh/preact/hooks';

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
        class="relative bg-gray-900 backdrop-blur-lg rounded-2xl p-10 border border-purple-400/40 shadow-2xl shadow-purple-500/20" 
        style="width: 440px; max-width: 90vw; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(168, 85, 247, 0.25), 0 0 0 1px rgba(196, 181, 253, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);"
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
        
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-center text-white">
            ${authMode === 'signup' ? 'Create Account' : 'Sign In'}
          </h2>
        </div>

        <form onSubmit=${handleSubmit} class="space-y-6">
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
            class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md shadow-md shadow-purple-500/30 hover:shadow-purple-500/50 border-0 transition-all duration-200 transform hover:scale-105 disabled:transform-none text-sm"
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

        <div class="mt-6 text-center">
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

export default AuthModal;