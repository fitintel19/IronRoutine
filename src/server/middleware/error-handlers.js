/**
 * Error handling middleware for the application
 * Extracted from the original index.js file
 */

/**
 * Handles 404 Not Found errors
 * @param {import('hono').Context} c - Hono context object
 * @returns {Response} JSON response with 404 status
 */
export const notFoundHandler = (c) => {
  return c.json({ error: 'Not found' }, 404);
};

/**
 * Handles general application errors
 * @param {Error} err - The error object
 * @param {import('hono').Context} c - Hono context object
 * @returns {Response} JSON response with 500 status
 */
export const errorHandler = (err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
};