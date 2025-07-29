#!/usr/bin/env node
import { serve } from '@hono/node-server';
import { config } from 'dotenv';
import app from './src/index.js';

// Load environment variables from .env file
config();

const port = process.env.PORT || 3000;

console.log(`🚀 Starting IronRoutine development server on port ${port}`);
console.log(`📱 Visit: http://localhost:${port}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔍 Debug - Supabase URL loaded: ${!!process.env.SUPABASE_URL}`);
console.log(`🔍 Debug - Supabase Key loaded: ${!!process.env.SUPABASE_ANON_KEY}`);

// Mock Cloudflare Workers environment for local development
const mockEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_ENVIRONMENT: process.env.PAYPAL_ENVIRONMENT,
  PAYPAL_PLAN_ID_MONTHLY: process.env.PAYPAL_PLAN_ID_MONTHLY,
  PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
  // ENVIRONMENT: 'development'
};

// Create enhanced fetch function that injects environment
const enhancedFetch = (request, env, ctx) => {
  return app.fetch(request, mockEnv, ctx);
};

serve({
  fetch: enhancedFetch,
  port: parseInt(port, 10)
});