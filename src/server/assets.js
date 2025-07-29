/**
 * Static asset handler functions for the IronRoutine application
 * These functions serve bundled content for Cloudflare Workers deployment
 */

// Import embedded content for Workers deployment
let EMBEDDED_CSS = '';
let EMBEDDED_APP = '';
let IS_WORKERS_ENV = false;

// Try to import embedded content for Workers deployment
try {
  const embeddedModule = await import('../bundled/embedded-content.js').catch(() => null);
  if (embeddedModule) {
    EMBEDDED_CSS = embeddedModule.EMBEDDED_CSS || '';
    EMBEDDED_APP = embeddedModule.EMBEDDED_APP || '';
    IS_WORKERS_ENV = true;
    console.log('✅ Using embedded content for Workers deployment');
    console.log(`📦 Embedded CSS: ${EMBEDDED_CSS.length} chars`);
    console.log(`📦 Embedded App: ${EMBEDDED_APP.length} chars`);
  }
} catch (error) {
  console.log('⚠️ Embedded content not available, using filesystem fallback');
}

// Filesystem imports for local development fallback
let fs, path;
try {
  fs = await import('node:fs/promises');
  path = await import('node:path');
} catch (error) {
  console.log('📦 Running in Cloudflare Workers environment (no filesystem access)');
}

/**
 * Returns the application JavaScript code
 * @returns {Promise<string>} The JavaScript code for the application
 */
async function getAppJS() {
  // If we have embedded content for Workers, serve that
  if (IS_WORKERS_ENV && EMBEDDED_APP) {
    console.log('✅ Serving embedded app content - length:', EMBEDDED_APP.length);
    return EMBEDDED_APP;
  }
  
  // Fallback to filesystem for local development
  if (fs && path) {
    try {
      // Check if we have the bundled client file first
      const bundledClientPath = path.join(process.cwd(), 'src/client/bundled-app.js');
      try {
        const bundledClientContent = await fs.readFile(bundledClientPath, 'utf8');
        console.log('✅ Serving bundled client app - length:', bundledClientContent.length);
        return bundledClientContent;
      } catch (bundledError) {
        // Fall back to modular approach
        const indexPath = path.join(process.cwd(), 'src/client/index.js');
        let indexContent = await fs.readFile(indexPath, 'utf8');
        console.log('⚠️ Serving modular approach - client/index.js - length:', indexContent.length);
        return indexContent;
      }
    } catch (error) {
      console.error('Error reading client JavaScript:', error);
    }
  }
  
  // Ultimate fallback
  return `
    // Fallback client-side code
    import { html, render } from 'https://esm.sh/htm/preact';
    
    const App = () => html\`<div class="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-4">IronRoutine</h1>
        <p>Loading application...</p>
      </div>
    </div>\`;
    
    render(html\`<\${App} />\`, document.getElementById('app'));
  `;
}

/**
 * Returns the CSS styles for the application
 * @returns {Promise<string>} The CSS styles
 */
async function getStyleCSS() {
  // If we have embedded CSS content for Workers, serve that
  if (IS_WORKERS_ENV && EMBEDDED_CSS) {
    console.log('✅ Serving embedded CSS content - length:', EMBEDDED_CSS.length);
    return EMBEDDED_CSS;
  }
  
  // Fallback to filesystem for local development
  if (fs && path) {
    try {
      // Read the content of the built CSS file with all gradient classes
      const filePath = path.join(process.cwd(), 'dist/style.css');
      const content = await fs.readFile(filePath, 'utf8');
      console.log('✅ Serving built CSS file from filesystem - length:', content.length);
      return content;
    } catch (error) {
      console.error('Error reading dist/style.css:', error);
      
      // Try to read the styles-full.css file as a fallback
      try {
        const fallbackPath = path.join(process.cwd(), 'src/styles-full.css');
        const fallbackContent = await fs.readFile(fallbackPath, 'utf8');
        console.log('⚠️ Using fallback CSS file');
        return fallbackContent;
      } catch (fallbackError) {
        console.error('Error reading fallback CSS:', fallbackError);
      }
    }
  }
  
  // Ultimate fallback CSS
  return `
    /* Fallback CSS for IronRoutine */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #db2777 100%);
      color: #fff;
      min-height: 100vh;
    }
    
    * { 
      box-sizing: border-box; 
    }
    
    .bg-gradient-to-br {
      background: linear-gradient(to bottom right, var(--tw-gradient-stops));
    }
    
    .from-purple-900 { --tw-gradient-from: #581c87; }
    .via-purple-700 { --tw-gradient-to: #7c3aed; }
    .to-pink-600 { --tw-gradient-to: #db2777; }
    
    .text-white { color: #ffffff; }
    .min-h-screen { min-height: 100vh; }
    .p-4 { padding: 1rem; }
    .text-center { text-align: center; }
    .text-2xl { font-size: 1.5rem; }
    .font-bold { font-weight: 700; }
    .mb-4 { margin-bottom: 1rem; }
  `;
}

/**
 * Returns the 16x16 favicon
 * @returns {Promise<Uint8Array>} The favicon as a Uint8Array
 */
async function getFavicon16() {
  try {
    const response = await fetch('https://www.ironroutine.app/favicon-16x16.png');
    if (!response.ok) throw new Error('Failed to fetch 16x16 favicon');
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching 16x16 favicon:', error);
    // Return a small transparent PNG as fallback
    const fallbackData = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAABhJREFUOI1jZGRiZqAEMFGkmyHVAAAAAElFTkSuQmCC';
    return Uint8Array.from(atob(fallbackData), c => c.charCodeAt(0));
  }
}

/**
 * Returns the 32x32 favicon
 * @returns {Promise<Uint8Array>} The favicon as a Uint8Array
 */
async function getFavicon32() {
  try {
    const response = await fetch('https://www.ironroutine.app/favicon-32x32.png');
    if (!response.ok) throw new Error('Failed to fetch 32x32 favicon');
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching 32x32 favicon:', error);
    // Return a small transparent PNG as fallback
    const fallbackData = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAABhJREFUWIXtzUEBAAAAwqD1T20JT6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4Ax8AAQAG3yoAAAAASUVORK5CYII=';
    return Uint8Array.from(atob(fallbackData), c => c.charCodeAt(0));
  }
}

/**
 * Returns the OG image for social media sharing
 * @returns {Promise<Uint8Array>} The OG image as a Uint8Array
 */
async function getOGImage() {
  try {
    const response = await fetch('https://www.ironroutine.app/ChatGPT%20Image%20Jul%2024%2C%202025%2C%2004_41_56%20PM.png');
    if (!response.ok) throw new Error('Failed to fetch OG image');
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching OG image:', error);
    // Fallback to favicon
    return await getFavicon32();
  }
}

/**
 * Returns the logo image - using properly sized logo
 * @returns {Promise<Uint8Array>} The logo as a Uint8Array
 */
async function getLogo() {
  try {
    const response = await fetch('https://www.ironroutine.app/RealSizeLogo.png');
    if (!response.ok) throw new Error('Failed to fetch logo');
    const arrayBuffer = await response.arrayBuffer();
    console.log('Serving properly sized logo - size:', arrayBuffer.byteLength, 'bytes');
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching logo:', error);
    // Fallback to local favicon
    try {
      const logoPath = path.join(process.cwd(), 'favicon-32x32.png');
      const logoData = await fs.readFile(logoPath);
      console.log('Using local favicon as fallback logo');
      return new Uint8Array(logoData);
    } catch (localError) {
      console.error('Error reading local fallback:', localError);
      return await getFavicon32();
    }
  }
}

// Export all the functions
export {
  getAppJS,
  getStyleCSS,
  getFavicon16,
  getFavicon32,
  getOGImage,
  getLogo
};