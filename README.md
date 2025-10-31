# AI Teacher-Student System

Система за обучение по JavaScript, където:
- 🧑‍🏫 **Реални учители** преподават урока
- 🤖 **AI Помощник-учител** отговаря на въпроси на учениците
- 👨‍🎓 **Реални ученици** обучават виртуален AI-ученик
- 🎓 **AI-ученик** се учи от обясненията на ученика

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite + Prisma ORM
- **AI**: Google Gemini 1.5 Flash API

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Gemini API Key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Add your GEMINI_API_KEY to backend/.env

# Set up database
cd backend
npx prisma migrate dev
cd ..

# Start development servers
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Project Structure

```
ai-teacher-student/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── types/
│   ├── prisma/
│   └── package.json
└── package.json       # Root workspace config
```

## Development Roadmap

- [x] Project setup
- [ ] Basic chat interface
- [ ] Gemini AI integration
- [ ] Session management
- [ ] Progress tracking
- [ ] Teacher dashboard

## License

MIT
