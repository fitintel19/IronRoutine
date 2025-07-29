import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { workoutRoutes } from '../routes/workout.js';
import { userRoutes } from '../routes/user.js';
import { authRoutes } from '../routes/auth.js';
import { progressRoutes } from '../routes/progress.js';
import { achievementsRoutes } from '../routes/achievements.js';
import { blogRoutes } from '../routes/blog.js';
import subscriptionRoutes from '../routes/subscription.js';
import apiRouter from './routes/api.js';

const app = new Hono();

// Set up middleware
app.use(logger());
app.use(prettyJSON());
app.use('/api/*', cors({
  origin: ['https://ironroutine.app', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'file://'],
  allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));

// Set up routes
app.route('/api/auth', authRoutes);
app.route('/api/workouts', workoutRoutes);
app.route('/api/users', userRoutes);
app.route('/api/progress', progressRoutes);
app.route('/api/achievements', achievementsRoutes);
app.route('/api/blog', blogRoutes);
app.route('/api/subscriptions', subscriptionRoutes);
app.route('/api', apiRouter);

export { app };