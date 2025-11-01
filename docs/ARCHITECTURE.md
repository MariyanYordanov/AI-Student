# AI Teacher-Student System - Complete Architecture

## Full Process Flow: Registration → Verification → Login → Virtual Students

This document describes the complete technical flow of how the system works from user registration to accessing the virtual students learning interface.

---

## PHASE 1: REGISTRATION

**When user clicks "🚀 Регистрирай се":**

```
Browser (Frontend) → https://studaint.onrender.com
    ↓
Frontend Files:
  - Register.tsx (registration form page)
  - authStore.ts (manages registration logic)
  - api.ts (sends HTTP request to backend)
    ↓
POST request: https://ai-student-r9ay.onrender.com/api/auth/register
{
  "email": "marsrewq@gmail.com",
  "name": "test",
  "password": "password123"
}
```

**On Backend (Render.com):**

```
Backend Files:
  - backend/src/routes/auth.ts (handles POST /api/auth/register)
    ↓
Logic in auth.ts (lines 16-99):
  1. Validates input (email, name, password)
  2. Checks email format (regex validation)
  3. Checks if user already exists in database
  4. Hashes password with bcrypt
  5. Generates verification token (32 random bytes)
  6. Generates JWT token for session
  7. Creates user in PostgreSQL database
  8. Sends verification email (SendGrid)
  9. Returns success response with token
    ↓
Backend Response:
{
  "id": "67537291-7219-4331-9087-980faa72fcac",
  "email": "marsrewq@gmail.com",
  "name": "test",
  "role": "STUDENT",
  "emailVerified": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful..."
}
```

**On Frontend (browser):**

```
authStore.ts:
  1. Receives response
  2. Stores token in localStorage
  3. Stores user information in localStorage
  4. Sets registrationSuccess = true
  5. Register.tsx shows screen: "Потвърди имейла си"
    ↓
User sees:
  ✉️ "Потвърди имейла си"
  📧 "Разпращахме верификационен линк на: marsrewq@gmail.com"
  [Изпрати отново верификационния имейл]
  [Към логин]
```

---

## PHASE 2: SENDGRID SENDS EMAIL

**During registration, backend calls:**

```
backend/src/routes/auth.ts (line 80):
  EmailService.sendVerificationEmail(email, name, verificationToken)
    ↓
backend/src/services/email.service.ts (lines 14-71):
  1. Checks if SENDGRID_API_KEY exists in .env
  2. Generates verification link:
     https://studaint.onrender.com/verify-email?token=1c647efcc0965522ff5eb8964edf11915f9f8b51a43a4d0cd391290c29a4f577
  3. Creates beautiful HTML email template
  4. Calls SendGrid API
```

**SendGrid (Cloud Service):**

```
SendGrid:
  1. Receives request from your backend
  2. Checks that FROM email (marsrewq@gmail.com) is verified ✓
  3. Sends email to marsrewq@gmail.com with:
     - Subject: "LearnMate - Потвърждение на имейл адрес"
     - HTML with blue button "Потвърди имейл адрес"
     - Link with verification token
```

**On your Gmail:**

```
Receives email with:
  Thank you for registering...
  [ПОТВЪРДИ ИМЕЙЛ АДРЕС] ← Click here!
  Or copy: https://studaint.onrender.com/verify-email?token=...
```

---

## PHASE 3: EMAIL VERIFICATION

**When user clicks verification link:**

```
Browser: https://studaint.onrender.com/verify-email?token=1c647efcc...
    ↓
React Router (frontend/src/App.tsx line 28):
  Recognizes /verify-email route
  Loads VerifyEmail.tsx component
    ↓
VerifyEmail.tsx (frontend/src/pages/VerifyEmail.tsx):
  1. Reads token from URL: ?token=1c647efcc...
  2. Shows loading screen: "Проверяваме вашия имейл адрес..."
  3. Sends GET request to backend
```

**On Backend:**

```
GET https://ai-student-r9ay.onrender.com/api/auth/verify-email/1c647efcc...
    ↓
backend/src/routes/auth.ts (lines 197-247):
  1. Reads token from URL parameter
  2. Searches for user in database with this token
  3. Checks if token is expired (24 hours)
  4. If everything OK:
     - Sets emailVerified = true
     - Deletes token from database
     - Sends welcome email (sendWelcomeEmail)
     - Returns success
```

**On Frontend:**

```
VerifyEmail.tsx receives success:
  1. Shows green checkmark ✓
  2. "Email verified successfully!"
  3. Shows "Адресът marsrewq@gmail.com е потвърден"
  4. [Към логин] button
```

**In PostgreSQL database (Render.com):**

```
User table:
  id: 67537291-7219-4331-9087-980faa72fcac
  email: marsrewq@gmail.com
  emailVerified: true ← CHANGED from false to true
  verificationToken: NULL ← DELETED
  verificationTokenExpiry: NULL ← DELETED
```

---

## PHASE 4: LOGIN

**When user clicks [Към логин] or goes to /login:**

```
Browser: https://studaint.onrender.com/login
    ↓
Login.tsx component:
  Shows form with Email and Password
```

**When user fills and clicks "Влез":**

```
POST https://ai-student-r9ay.onrender.com/api/auth/login
{
  "email": "marsrewq@gmail.com",
  "password": "password123"
}
    ↓
backend/src/routes/auth.ts (lines 97-155):
  1. Checks that email exists in database
  2. Compares password with hash in database (bcrypt.compare)
  3. CRITICAL: Checks emailVerified === true ← If false, rejects!
  4. Generates new JWT token
  5. Updates lastActive time
  6. Returns user with JWT token
    ↓
Response:
{
  "id": "67537291-...",
  "email": "marsrewq@gmail.com",
  "name": "test",
  "role": "STUDENT",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**On Frontend:**

```
authStore.ts (lines 39-51):
  1. Receives response with JWT token
  2. Stores token in localStorage
  3. Stores user in localStorage
  4. Redirects to /dashboard
```

---

## PHASE 5: VIRTUAL STUDENTS

**When user goes to /dashboard:**

```
Browser: https://studaint.onrender.com/dashboard
    ↓
Dashboard.tsx component (frontend/src/pages/Dashboard.tsx):
  useEffect hook:
    1. Sees JWT token in localStorage
    2. Checks that emailVerified === true
    3. Sends requests to backend:
       a) GET /api/ai-students/characters ← All characters
       b) GET /api/topics ← All topics
       c) GET /api/topics/user/{userId}/progress ← User progress
```

**On Backend:**

```
GET https://ai-student-r9ay.onrender.com/api/ai-students/characters
    ↓
backend/src/routes/ai-students.ts (lines 13-19):
  1. Reads STUDENT_CHARACTERS from backend/src/data/students.ts
  2. Returns array of 6 characters:
     [
       { id: 'jean', name: 'Жан', personality: {...}, ... },
       { id: 'maria', name: 'Мария', personality: {...}, ... },
       ...
     ]
```

**On Frontend:**

```
Dashboard.tsx receives characters:
  1. Shows screen: "Избери виртуален ученик"
  2. Shows 6 cards with each character
  3. Each card has:
     - Avatar (image)
     - Name (Жан, Мария, etc.)
     - Personality description
     - Learning style
     - [Избери] button
```

---

## SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Frontend)                       │
│  https://studaint.onrender.com                              │
│  ├─ React Components (Register, Login, Dashboard)           │
│  ├─ Zustand Store (authStore)                               │
│  ├─ API Service (api.ts) - HTTP client                      │
│  └─ LocalStorage (token, user data)                         │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│              RENDER.COM BACKEND (Node.js)                   │
│  https://ai-student-r9ay.onrender.com                       │
│  ├─ Express Server (port 4000)                              │
│  ├─ Routes (auth, ai-students, topics, sessions)            │
│  ├─ Middleware (JWT auth, CORS)                             │
│  ├─ Services (EmailService, GeminiService)                  │
│  └─ Database Connection (Prisma ORM)                        │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│           RENDER.COM PostgreSQL (Database)                  │
│  dpg-d42eg3gdl3ps73cccd2g-a.frankfurt-postgres.render.com   │
│  ├─ User table (email, password hash, emailVerified)        │
│  ├─ AIStudent table (characters and sessions)               │
│  ├─ Topic table (40 JavaScript topics)                      │
│  └─ Session table (learning sessions)                       │
└─────────────────────────────────────────────────────────────┘
        ↑ SendGrid         ↑ Gemini API
┌──────────────────┐    ┌──────────────────┐
│   SENDGRID API   │    │  GOOGLE GEMINI   │
│ (Email Service)  │    │  (AI Assistant)  │
└──────────────────┘    └──────────────────┘
```

---

## KEY FILES AND THEIR ROLES

| File | Role |
|------|------|
| `frontend/src/pages/Register.tsx` | Registration form page |
| `frontend/src/pages/Login.tsx` | Login form page |
| `frontend/src/pages/VerifyEmail.tsx` | Email verification page |
| `frontend/src/pages/Dashboard.tsx` | Virtual student selection |
| `frontend/src/stores/authStore.ts` | Authentication state management |
| `frontend/src/services/api.ts` | HTTP client for API requests |
| `backend/src/routes/auth.ts` | API endpoints for registration/login/verification |
| `backend/src/routes/ai-students.ts` | API endpoints for characters |
| `backend/src/services/email.service.ts` | SendGrid integration |
| `backend/src/data/students.ts` | 6 character definitions |
| `backend/src/middleware/auth.ts` | JWT verification |
| `backend/.env` | Configuration (API keys, URLs) |
| `frontend/public/_redirects` | Render SPA routing configuration |

---

## TECHNOLOGY STACK

- **Frontend**: React + TypeScript + Zustand + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL on Render.com
- **ORM**: Prisma
- **Authentication**: JWT tokens + bcrypt password hashing
- **Email**: SendGrid API
- **AI**: Google Gemini 1.5 Flash API
- **Hosting**: Render.com (Backend + Database + Frontend)

---

## IMPORTANT CONCEPTS

### JWT (JSON Web Tokens)
- Signed token containing user ID, email, and role
- Stored in localStorage on client
- Sent in `Authorization: Bearer <token>` header with every request
- Backend verifies token with JWT_SECRET from .env
- Expires in 30 days

### Password Hashing
- User passwords are hashed with bcrypt (salt rounds: 10)
- Never stored in plain text
- Login compares provided password with hash using bcrypt.compare()

### Email Verification
- New users must verify email before login
- Verification token is 32 random hex bytes
- Token expires in 24 hours
- User clicks link in email to verify
- Only after verification can user login

### CORS (Cross-Origin Resource Sharing)
- Frontend on `https://studaint.onrender.com`
- Backend on `https://ai-student-r9ay.onrender.com`
- Different domains require CORS headers
- Backend configured to allow requests from frontend origin

### Environment Variables (.env)
- `PORT`: Backend port (4000 on Render)
- `NODE_ENV`: development or production
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for signing tokens
- `GEMINI_API_KEY`: Google AI API key
- `SENDGRID_API_KEY`: Email service API key
- `FRONTEND_URL`: Production frontend URL
- `FROM_EMAIL`: Sender email for SendGrid
- `VITE_API_URL`: Frontend knows this backend URL

