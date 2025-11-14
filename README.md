# Aily - AI Teacher-Student System

A JavaScript training system where real students teach a virtual AI student (Aily) JavaScript concepts. The AI student learns and retains knowledge across sessions using realistic forgetting curves.

## Features

- Real-time teaching sessions with AI student
- Knowledge decay simulation (realistic forgetting)
- 5 different AI personalities with distinct learning styles
- 27 JavaScript topics across 6 difficulty levels
- XP and leveling system for gamification
- Email verification and secure authentication
- Multi-language support (English and Bulgarian)
- Responsive design with dark/light mode

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite + Zustand
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL
- **AI**: Google Gemini 2.5 Flash API
- **Email**: SendGrid API
- **Hosting**: Render.com (unified service)
- **Testing**: Jest + React Testing Library + Supertest

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL (for local development, or use remote)
- Google Gemini API Key
- SendGrid API Key (optional for development)

### Installation

```bash
# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys

cp frontend/.env.example frontend/.env
# Edit frontend/.env and set API URL

# Set up database
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..

# Start development servers (both frontend and backend)
npm run dev
```

Development servers will be available at:
- Frontend (Vite): http://localhost:5173
- Backend (Express): http://localhost:4000

### Environment Variables

See `.env.example` files in both backend and frontend directories for required configuration.

## Project Structure

```
ai-teacher-student/
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components (Login, Register, Dashboard, etc)
│   │   ├── stores/            # Zustand state management
│   │   ├── services/          # API client
│   │   ├── hooks/             # Custom React hooks
│   │   ├── i18n/              # Internationalization
│   │   ├── types/             # TypeScript interfaces
│   │   ├── __tests__/         # Jest tests
│   │   └── setupTests.ts      # Test configuration
│   ├── jest.config.js         # Jest configuration
│   ├── vite.config.ts         # Vite build config
│   ├── tailwind.config.js     # Tailwind CSS config
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth, error handling, rate limiting
│   │   ├── services/          # Business logic (Gemini, Email)
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Utility functions
│   │   ├── data/              # Static data (characters)
│   │   ├── __tests__/         # Jest tests
│   │   └── index.ts           # Express server entry
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed-topics.ts     # Topic data seeding
│   │   └── migrations/        # Database migrations
│   ├── jest.config.js         # Jest configuration
│   └── package.json
├── docs/
│   ├── API_DOCUMENTATION.md   # Complete API reference
│   ├── ARCHITECTURE.md        # System design and flow
│   ├── TESTING.md             # Testing guide
│   └── PERFORMANCE_OPTIMIZATION.md
├── server.js                  # Static file server (production)
├── render.yaml                # Render.com deployment config
└── package.json               # Root workspace config
```

## Core Concepts

### Knowledge Decay (Forgetting Curve)
Aily's understanding of concepts decreases over time if not reviewed:
- Days 1-3: No decay (grace period)
- Days 4-7: 5% per day
- Days 8-14: 10% per day
- Days 15+: 15% per day
- Floor: Never below 0.1 (minimum retention)

### XP System
Students earn XP by teaching Aily:
- 15%+ learning: 10 XP + 50 XP bonus if concept mastery reached
- 8-15% learning: 5 XP
- 1-7% learning: 2 XP
- Concept mastery (70%+ understanding): 50 XP bonus

### Leveling Thresholds
- Level 0: 0 XP
- Level 1: 100 XP
- Level 2: 300 XP
- Level 3: 600 XP
- Level 4: 1000 XP
- Level 5: 1500 XP

## Scripts

### Development
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend    # Start only frontend (Vite)
npm run dev:backend     # Start only backend (Express)
```

### Production
```bash
npm run build           # Build frontend for production
npm start               # Start production server
```

### Testing
```bash
npm run test            # Run all tests with coverage
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage reports
```

### Database
```bash
cd backend
npx prisma migrate dev  # Run migrations
npx prisma db seed      # Seed initial data
npx prisma studio      # Open Prisma Studio GUI
```

## Documentation

- [API Documentation](docs/API_DOCUMENTATION.md) - Complete REST API reference
- [Architecture](docs/ARCHITECTURE.md) - System design and data flow
- [Testing Guide](docs/TESTING.md) - How to write and run tests
- [Performance Optimization](docs/PERFORMANCE_OPTIMIZATION.md) - Optimization strategies

## Deployment

The application is deployed on Render.com:
- **Frontend**: Served from Node.js server at https://ai-student-28c8.onrender.com
- **Backend API**: Available at https://ai-student-28c8.onrender.com/api
- **Database**: PostgreSQL on Render.com

See `render.yaml` for deployment configuration.

## License

MIT
