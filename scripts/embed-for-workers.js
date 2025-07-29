#!/usr/bin/env node

/**
 * Embed bundled content into source files for Cloudflare Workers deployment
 * This script replaces dynamic imports with embedded content strings
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const BUNDLED_CSS_PATH = 'src/bundled/styles.js';
const BUNDLED_APP_PATH = 'src/bundled/app.js';
const EMBEDDED_OUTPUT = 'src/bundled/embedded-content.js';

async function embedContent() {
  try {
    console.log('📦 Embedding content for Cloudflare Workers deployment...');
    
    // Read the bundled CSS content
    let cssContent = '';
    try {
      const cssModule = await fs.readFile(BUNDLED_CSS_PATH, 'utf8');
      // Extract the CSS content from the module
      const cssMatch = cssModule.match(/export const CSS_CONTENT = `([\s\S]*?)`;/);
      if (cssMatch) {
        cssContent = cssMatch[1];
        console.log('✅ Extracted CSS content');
      }
    } catch (error) {
      console.warn('⚠️ No bundled CSS found, using empty string');
    }
    
    // Read the bundled app content
    let appContent = '';
    try {
      appContent = await fs.readFile(BUNDLED_APP_PATH, 'utf8');
      console.log('✅ Read bundled app content');
    } catch (error) {
      console.warn('⚠️ No bundled app found, using empty string');
    }
    
    // Escape content for JavaScript strings (but don't double-escape backslashes in CSS)
    const escapedCSS = cssContent
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${');
    
    const escapedApp = appContent
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${');
    
    // Create the embedded content module
    const embeddedContent = `/**
 * Embedded content for Cloudflare Workers deployment
 * Generated automatically by embed-for-workers.js
 * DO NOT EDIT MANUALLY
 */

export const EMBEDDED_CSS = \`${escapedCSS}\`;

export const EMBEDDED_APP = \`${escapedApp}\`;

export function getEmbeddedCSS() {
  return EMBEDDED_CSS;
}

export function getEmbeddedApp() {
  return EMBEDDED_APP;
}

export default {
  css: EMBEDDED_CSS,
  app: EMBEDDED_APP,
  getCSS: getEmbeddedCSS,
  getApp: getEmbeddedApp
};
`;
    
    // Write the embedded content file
    await fs.writeFile(EMBEDDED_OUTPUT, embeddedContent, 'utf8');
    console.log(`✅ Content embedded to: ${EMBEDDED_OUTPUT}`);
    console.log(`📦 CSS size: ${cssContent.length} characters`);
    console.log(`📦 App size: ${appContent.length} characters`);
    console.log(`📦 Total embedded size: ${embeddedContent.length} characters`);
    
  } catch (error) {
    console.error('❌ Error embedding content:', error);
    process.exit(1);
  }
}

// Run the embedding process
embedContent();