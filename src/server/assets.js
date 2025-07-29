/**
 * Static asset handler functions for the IronRoutine application
 * These functions were extracted from the original index.js file
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Returns the application JavaScript code
 * @returns {Promise<string>} The JavaScript code for the application
 */
async function getAppJS() {
  try {
    // Serve the modular approach - index.js imports individual components
    const indexPath = path.join(process.cwd(), 'src/client/index.js');
    let indexContent = await fs.readFile(indexPath, 'utf8');
    console.log('Serving modular approach - client/index.js - length:', indexContent.length);
    return indexContent;
  } catch (error) {
    console.error('Error reading client JavaScript:', error);
    
    // Return a minimal fallback in case of error
    return `
      // Fallback client-side code
      import { html, render } from 'https://esm.sh/htm/preact';
      
      const App = () => html\`<div>Error loading application</div>\`;
      
      render(html\`<\${App} />\`, document.getElementById('app'));
    `;
  }
}

/**
 * Returns the CSS styles for the application
 * @returns {Promise<string>} The CSS styles
 */
async function getStyleCSS() {
  // Use the fs/promises module to read the file
  
  try {
    // Read the content of the built CSS file with all gradient classes
    const filePath = path.join(process.cwd(), 'dist/style.css');
    const content = await fs.readFile(filePath, 'utf8');
    console.log('✅ Serving built CSS file with gradient classes - length:', content.length);
    
    // Return the content
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
      
      // Return a minimal fallback in case of error
      return `
        /* Fallback CSS */
        body {
          font-family: Inter, sans-serif;
          margin: 0;
          padding: 0;
          background: #111827;
          color: #fff;
        }
        * { box-sizing: border-box; }
      `;
    }
  }
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