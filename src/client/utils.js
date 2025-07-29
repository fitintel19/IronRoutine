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