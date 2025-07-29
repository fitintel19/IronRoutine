#!/usr/bin/env node

/**
 * Bundle CSS into a JavaScript module for Cloudflare Workers
 * This script reads the built CSS file and creates a JS module that exports it as a string
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const CSS_INPUT = 'dist/style.css';
const CSS_OUTPUT = 'src/bundled/styles.js';

async function bundleCSS() {
  try {
    console.log('🎨 Bundling CSS for Cloudflare Workers...');
    
    // Ensure the bundled directory exists
    await fs.mkdir('src/bundled', { recursive: true });
    
    // Read the built CSS file
    const cssContent = await fs.readFile(CSS_INPUT, 'utf8');
    console.log(`📄 Read CSS file: ${cssContent.length} characters`);
    
    // Escape backticks and backslashes for template literal
    const escapedCSS = cssContent
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${');
    
    // Create the JavaScript module
    const jsContent = `/**
 * Bundled CSS styles for IronRoutine
 * Generated automatically by bundle-css.js
 * DO NOT EDIT MANUALLY
 */

export const CSS_CONTENT = \`${escapedCSS}\`;

export default CSS_CONTENT;
`;
    
    // Write the JavaScript module
    await fs.writeFile(CSS_OUTPUT, jsContent, 'utf8');
    console.log(`✅ CSS bundled to: ${CSS_OUTPUT}`);
    console.log(`📦 Final bundle size: ${jsContent.length} characters`);
    
  } catch (error) {
    console.error('❌ Error bundling CSS:', error);
    process.exit(1);
  }
}

// Run the bundling process
bundleCSS();