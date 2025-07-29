#!/usr/bin/env node

/**
 * Bundle all client components into a single JavaScript module for Cloudflare Workers
 * This script reads all component files and creates a single bundled module
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const COMPONENTS_DIR = 'src/client/components';
const UTILS_FILE = 'src/client/utils.js';
const INDEX_FILE = 'src/client/index.js';
const BUNDLED_OUTPUT = 'src/bundled/app.js';

async function bundleComponents() {
  try {
    console.log('📦 Bundling client components for Cloudflare Workers...');
    
    // Ensure the bundled directory exists
    await fs.mkdir('src/bundled', { recursive: true });
    
    // Read all component files
    const componentFiles = await fs.readdir(COMPONENTS_DIR);
    const jsFiles = componentFiles.filter(file => file.endsWith('.js'));
    
    console.log(`📁 Found ${jsFiles.length} component files:`, jsFiles);
    
    // Read utils.js
    let utilsContent = '';
    try {
      utilsContent = await fs.readFile(UTILS_FILE, 'utf8');
      console.log('📄 Read utils.js');
    } catch (error) {
      console.log('⚠️ No utils.js file found, skipping...');
    }
    
    // Start building the bundled content
    let bundledContent = `/**
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
`;

    // Add utils content if it exists
    if (utilsContent) {
      // Remove imports from utils and add the actual utility functions
      const cleanUtilsContent = utilsContent
        .replace(/import.*from.*;\n?/g, '') // Remove import statements
        .replace(/export\s*{\s*[^}]+\s*};\s*$/s, '') // Remove export statements
        .trim();
      
      bundledContent += cleanUtilsContent + '\n\n';
    } else {
      // Add basic utility functions if utils.js doesn't exist
      bundledContent += `
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

`;
    }
    
    bundledContent += '// ===== COMPONENTS =====\n\n';
    
    // Process each component file
    for (const file of jsFiles) {
      const componentPath = path.join(COMPONENTS_DIR, file);
      const componentContent = await fs.readFile(componentPath, 'utf8');
      const componentName = path.basename(file, '.js');
      
      console.log(`📄 Processing component: ${componentName}`);
      
      // Clean up the component content
      const cleanContent = componentContent
        .replace(/import.*from.*;\n?/g, '') // Remove import statements
        .replace(/export\s+default\s+/, '') // Remove export default
        .replace(/export\s*{\s*[^}]+\s*};\s*$/s, '') // Remove export statements
        .trim();
      
      // Add component to bundle with clear separation
      bundledContent += `// ===== ${componentName.toUpperCase()} COMPONENT =====\n`;
      bundledContent += cleanContent + '\n\n';
    }
    
    // Add the main App component and render logic
    bundledContent += `
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
render(html\`<\${App} />\`, document.getElementById('app'));

// Log after rendering
console.log('App component rendered successfully');
`;
    
    // Write the bundled file
    await fs.writeFile(BUNDLED_OUTPUT, bundledContent, 'utf8');
    console.log(`✅ Components bundled to: ${BUNDLED_OUTPUT}`);
    console.log(`📦 Final bundle size: ${bundledContent.length} characters`);
    
  } catch (error) {
    console.error('❌ Error bundling components:', error);
    process.exit(1);
  }
}

// Run the bundling process
bundleComponents();