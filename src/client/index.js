/**
 * Client-side entry point for the IronRoutine application
 * This file imports the necessary dependencies and renders the App component to the DOM
 */

// Import necessary dependencies from htm/preact
import { html, render } from 'https://esm.sh/htm/preact';

// Log initialization for debugging
console.log('IronRoutine client initializing...');

// Import the App component with explicit path to ensure it loads correctly
import App from './components/App.js';

// Add error handling for component loading
window.addEventListener('error', (event) => {
  console.error('Error loading component:', event.message, event.filename);
});

// Log before rendering
console.log('About to render App component');

// Render the App component to the DOM
render(html`<${App} />`, document.getElementById('app'));

// Log after rendering
console.log('App component rendered');