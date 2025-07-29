/**
 * Static route handlers for the IronRoutine application
 * These routes were extracted from the original index.js file
 */

import { Hono } from 'hono';
import { 
  getAppJS, 
  getStyleCSS, 
  getFavicon16, 
  getFavicon32, 
  getLogo, 
  getOGImage 
} from '../assets.js';

// Create a router for static routes
const staticRouter = new Hono();

// Serve the HTML page
staticRouter.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IronRoutine - AI-Powered Fitness</title>
      <meta name="description" content="Generate personalized AI-powered workouts tailored to your fitness goals. Track progress, earn achievements, and build your ideal routine with IronRoutine.">
      
      <!-- Favicon -->
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
      <link rel="shortcut icon" href="/favicon-32x32.png">
      
      <!-- Open Graph / Social Media -->
      <meta property="og:type" content="website">
      <meta property="og:title" content="IronRoutine - AI-Powered Fitness">
      <meta property="og:description" content="Generate personalized AI-powered workouts tailored to your fitness goals. Track progress, earn achievements, and build your ideal routine.">
      <meta property="og:image" content="https://www.ironroutine.app/ChatGPT%20Image%20Jul%2024%2C%202025%2C%2004_41_56%20PM.png">
      <meta property="og:url" content="https://ironroutine.app">
      <meta property="og:site_name" content="IronRoutine">
      
      <!-- Twitter Card -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="IronRoutine - AI-Powered Fitness">
      <meta name="twitter:description" content="Generate personalized AI-powered workouts tailored to your fitness goals. Track progress, earn achievements, and build your ideal routine.">
      <meta name="twitter:image" content="https://www.ironroutine.app/ChatGPT%20Image%20Jul%2024%2C%202025%2C%2004_41_56%20PM.png">
      
      <link rel="stylesheet" href="/static/style.css">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      
      <!-- Google tag (gtag.js) -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-WRFP83JJ25"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-WRFP83JJ25');
      </script>
      
      <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
        * { box-sizing: border-box; }
      </style>
    </head>
    <body class="bg-gray-900 text-white">
      <div id="app"></div>
      <script type="module" src="/static/app.js?t=${Date.now()}&cb=${Math.random()}"></script>
      <!-- Add debugging info to help troubleshoot component loading -->
      <script>
        console.log('IronRoutine app initializing...');
        window.addEventListener('error', function(event) {
          console.error('Script error detected:', event.filename, event.message);
        });
      </script>
    </body>
    </html>
  `);
});

// Serve static files (app.js, style.css)
staticRouter.get('/static/*', async (c) => {
  const path = c.req.path.replace('/static/', '');
  
  if (path === 'app.js') {
    try {
      // Use the getAppJS function to serve the index.js file which will import the actual components
      const appJS = await getAppJS();
      console.log('Serving app.js - length:', appJS.length);
      return new Response(appJS, {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'ETag': Date.now().toString()
        }
      });
    } catch (error) {
      console.error('Error serving app.js:', error);
      return c.notFound();
    }
  }
  
  if (path === 'style.css') {
    return new Response(await getStyleCSS(), {
      headers: { 'Content-Type': 'text/css' }
    });
  }
  
  // Handle component files
  if (path.startsWith('components/') && path.endsWith('.js')) {
    try {
      const componentPath = path.replace('components/', '');
      const filePath = `src/client/components/${componentPath}`;
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf8');
      console.log(`Serving component: ${componentPath} - length: ${content.length}`);
      return new Response(content, {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'ETag': Date.now().toString()
        }
      });
    } catch (error) {
      console.error(`Error serving component ${path}:`, error);
      return c.notFound();
    }
  }
  
  // Handle utils.js file
  if (path === 'utils.js') {
    try {
      const fs = await import('fs/promises');
      const filePath = 'src/client/utils.js';
      const content = await fs.readFile(filePath, 'utf8');
      console.log('Serving utils.js');
      return new Response(content, {
        headers: { 'Content-Type': 'application/javascript' }
      });
    } catch (error) {
      console.error('Error serving utils.js:', error);
    }
  }
  
  return c.notFound();
});

// Specific route for App.js to avoid 404 errors
staticRouter.get('/static/components/App.js', async (c) => {
  try {
    const fs = await import('fs/promises');
    const filePath = 'src/client/components/App.js';
    const content = await fs.readFile(filePath, 'utf8');
    return new Response(content, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error serving App.js:', error);
    return c.notFound();
  }
});

// Specific route for AuthModal.js with extra cache busting
staticRouter.get('/static/components/AuthModal.js', async (c) => {
  try {
    const fs = await import('fs/promises');
    const filePath = 'src/client/components/AuthModal.js';
    const content = await fs.readFile(filePath, 'utf8');
    console.log('🔥 Serving AuthModal.js with updated purple theme - content length:', content.length);
    console.log('🔥 AuthModal content preview:', content.substring(2000, 2200));
    return new Response(content, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'ETag': `authmodal-${Date.now()}-${Math.random()}`,
        'X-Component-Version': Date.now().toString()
      }
    });
  } catch (error) {
    console.error('Error serving AuthModal.js:', error);
    return c.notFound();
  }
});

// Serve the small favicon
staticRouter.get('/favicon-16x16.png', async (c) => {
  return new Response(await getFavicon16(), {
    headers: { 
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});

// Serve the large favicon
staticRouter.get('/favicon-32x32.png', async (c) => {
  return new Response(await getFavicon32(), {
    headers: { 
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});

// Serve the logo
staticRouter.get('/logo.png', async (c) => {
  return new Response(await getLogo(), {
    headers: { 
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});

// Fallback for browsers that request favicon.ico
staticRouter.get('/favicon.ico', async (c) => {
  return new Response(await getFavicon32(), {
    headers: { 
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});

// OG Image for social media sharing
staticRouter.get('/og-image.png', async (c) => {
  return new Response(await getOGImage(), {
    headers: { 
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});

// Export the router
export default staticRouter;