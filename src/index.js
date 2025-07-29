/**
 * IronRoutine - Main application entry point
 * This file imports the modular components and sets up the application
 */

// Import the Hono app from the server module
import { app } from './server/app.js';

// Import static routes
import staticRouter from './server/routes/static.js';

// Import error handlers
import { notFoundHandler, errorHandler } from './server/middleware/error-handlers.js';

// Register static routes
app.route('/', staticRouter);

// Register error handlers
app.notFound(notFoundHandler);
app.onError(errorHandler);

// Export the app for use by the server
export default app;
