# IronRoutine - AI-Powered Fitness Tracker

A modern, state-of-the-art fitness generation tool and tracker built with Cloudflare Workers, Supabase, and OpenAI.

## Features

- 🤖 **AI-Generated Workouts**: Custom workouts tailored to your goals and fitness level using OpenAI
- 📊 **Progress Tracking**: Monitor your improvements with detailed analytics
- 🎯 **Goal Achievement**: Set and crush your fitness milestones
- 🔐 **Secure Authentication**: User management with Supabase Auth
- ⚡ **Fast & Scalable**: Built on Cloudflare Workers for global performance
- 📱 **Mobile-First**: Responsive design for all devices

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4
- **Frontend**: Vanilla JS with HTM/Preact
- **Styling**: Tailwind CSS

## Project Structure

```
├── src/
│   ├── index.js              # Main Cloudflare Worker entry point
│   ├── lib/
│   │   └── database.js       # Database utilities and schema
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── workout.js       # Workout generation and management
│   │   ├── user.js          # User profile management
│   │   └── progress.js      # Progress tracking
│   ├── types/
│   │   └── index.js         # Type definitions and constants
│   └── utils/
│       ├── achievements.js   # Achievement system
│       └── workout-generator.js # Workout generation utilities
├── package.json
├── wrangler.toml            # Cloudflare Worker configuration
├── tsconfig.json           # TypeScript configuration
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- Cloudflare account
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fitintel19/IronRoutine.git
   cd IronRoutine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL migrations from `src/lib/database.js`
   - Get your project URL and anon key

4. **Configure environment variables**
   ```bash
   # Set Cloudflare Worker secrets
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_ANON_KEY  
   wrangler secret put OPENAI_API_KEY
   ```

5. **Update wrangler.toml**
   - Replace KV namespace IDs with your own
   - Update the worker name if desired

### Development

```bash
# Development servers (choose one)
npm run dev:local     # Fast Node.js server (recommended for development)
npm run dev:full      # Build CSS + start local server
npm run dev           # Cloudflare Workers dev server

# CSS Development
npm run build:css     # Build Tailwind CSS
npm run dev:css       # Watch and rebuild CSS

# Deployment & Testing
npm run deploy        # Deploy to Cloudflare Workers
npm run build         # Dry run build
npm test              # Run tests
npm run lint          # Check code quality
npm run format        # Format code
```

**Local Development Setup:**
1. Copy environment: `cp .env.example .env`
2. Add your credentials to `.env` 
3. Start development: `npm run dev:full`
4. Access at: http://localhost:3000

### Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run the migration from src/lib/database.js
-- Copy the SQL from sqlMigrations['001_initial_schema']
-- Then run sqlMigrations['002_rls_policies']
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/user` - Get current user
- `POST /api/auth/refresh` - Refresh session

### Workouts
- `POST /api/workouts/generate` - Generate AI workout
- `GET /api/workouts/` - Get user workouts
- `POST /api/workouts/save` - Save workout
- `GET /api/workouts/history` - Get workout history

### Progress
- `POST /api/progress/log` - Log workout progress
- `GET /api/progress/stats` - Get user statistics
- `GET /api/progress/history` - Get progress history
- `GET /api/progress/analytics` - Get analytics data

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/preferences` - Get preferences
- `PUT /api/users/preferences` - Update preferences

## Deployment

### Cloudflare Workers

1. **Configure wrangler.toml**
   ```toml
   name = "iron-routine"
   compatibility_date = "2024-05-30"
   main = "src/index.js"
   ```

2. **Set up secrets**
   ```bash
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_ANON_KEY
   wrangler secret put OPENAI_API_KEY
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Custom Domain

1. Add your domain to Cloudflare
2. Configure DNS to point to your worker
3. Update CORS origins in `src/index.js`

## Features Roadmap

### Phase 1 (Current)
- ✅ Basic workout generation
- ✅ User authentication
- ✅ Progress tracking
- ✅ Achievement system

### Phase 2
- [ ] Exercise video tutorials
- [ ] Social features and sharing
- [ ] Nutrition tracking
- [ ] Wearable device integration

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Premium subscriptions
- [ ] Personal trainer matching
- [ ] Advanced analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📧 Email: support@ironroutine.app
- 🐛 Issues: [GitHub Issues](https://github.com/fitintel19/IronRoutine/issues)
- 📖 Docs: [Documentation](https://docs.ironroutine.app)

---

Built with ❤️ for the fitness community