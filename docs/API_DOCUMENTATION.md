# Aily API Documentation

Base URL: `https://ai-student-28c8.onrender.com/api` (Production) or `http://localhost:4000/api` (Development)

## Table of Contents

1. Authentication Endpoints
2. Session Endpoints
3. AI Student Endpoints
4. Topics Endpoints
5. Admin Endpoints
6. Error Handling
7. Authentication & Headers

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

Request:
```json
{
  "email": "student@example.com",
  "name": "John Student",
  "password": "securePassword123"
}
```

Response (201 Created):
```json
{
  "id": "user-uuid-here",
  "email": "student@example.com",
  "name": "John Student",
  "role": "STUDENT",
  "emailVerified": false,
  "message": "User registered successfully. Please verify your email."
}
```

Error Response (400 Bad Request):
```json
{
  "error": "User already exists"
}
```

---

### POST /auth/login

Login with email and password.

Request:
```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

Response (200 OK):
```json
{
  "id": "user-uuid-here",
  "email": "student@example.com",
  "name": "John Student",
  "role": "STUDENT",
  "emailVerified": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Error Response (401 Unauthorized):
```json
{
  "error": "Invalid credentials"
}
```

Error Response (403 Forbidden - Email not verified):
```json
{
  "error": "Please verify your email first",
  "verified": false
}
```

---

### POST /auth/verify-email

Verify email with verification token (from email link).

Request:
```json
{
  "token": "verification-token-from-email"
}
```

Response (200 OK):
```json
{
  "message": "Email verified successfully",
  "id": "user-uuid-here",
  "email": "student@example.com",
  "name": "John Student",
  "role": "STUDENT",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Error Response (400 Bad Request):
```json
{
  "error": "Invalid or expired verification token"
}
```

---

### GET /auth/verify-email/:token

Legacy endpoint to verify email via URL redirect.

Response: Redirects to login page or shows verification success.

---

### POST /auth/change-unverified-email

Change email for unverified accounts.

Request:
```json
{
  "currentEmail": "old@example.com",
  "newEmail": "new@example.com"
}
```

Response (200 OK):
```json
{
  "message": "Email updated. New verification email sent.",
  "newEmail": "new@example.com"
}
```

---

### POST /auth/resend-verification-email

Resend verification email (with rate limiting).

Request:
```json
{
  "email": "student@example.com"
}
```

Response (200 OK):
```json
{
  "message": "Verification email sent to student@example.com"
}
```

Error Response (429 Too Many Requests):
```json
{
  "error": "Too many requests. Please wait before resending."
}
```

---

### GET /auth/me

Get current authenticated user information.

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "id": "user-uuid-here",
  "email": "student@example.com",
  "name": "John Student",
  "role": "STUDENT",
  "emailVerified": true,
  "createdAt": "2025-11-14T10:00:00Z",
  "preferredTheme": "dark",
  "preferredLanguage": "bg"
}
```

Error Response (401 Unauthorized):
```json
{
  "error": "No token provided"
}
```

---

### PATCH /auth/preferences

Update user preferences (theme and language).

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "preferredTheme": "dark",
  "preferredLanguage": "bg"
}
```

Response (200 OK):
```json
{
  "message": "Preferences updated",
  "user": {
    "id": "user-uuid-here",
    "preferredTheme": "dark",
    "preferredLanguage": "bg"
  }
}
```

---

## Session Endpoints

### POST /sessions/start

Start a new teaching session with Aily.

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "studentId": "user-uuid-here",
  "aiStudentId": "aily-uuid-here",
  "topic": "Variables"
}
```

Response (200 OK):
```json
{
  "id": "session-uuid-here",
  "sessionId": "session-uuid-here",
  "studentId": "user-uuid-here",
  "aiStudentId": "aily-uuid-here",
  "topic": "Variables",
  "aiStudent": {
    "id": "aily-uuid-here",
    "currentCharacterId": "jean",
    "level": 2,
    "totalXP": 350
  },
  "initialMessage": "Hi! I'm ready to learn about Variables. Can you explain what they are?",
  "initialEmotion": "excited",
  "message": "Teaching session started successfully"
}
```

---

### POST /sessions/:sessionId/message

Send a teaching message and get AI response.

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "message": "A variable is like a container that holds data. For example, let x = 10; creates a variable x with the value 10."
}
```

Response (200 OK):
```json
{
  "aiResponse": "Oh, I see! So x is like a named box that stores the number 10? What if I want to put a different number in it later?",
  "emotion": "understanding",
  "understandingDelta": 0.12,
  "xpGained": 10,
  "totalXP": 360,
  "newLevel": 2,
  "leveledUp": false
}
```

Response Details:
- aiResponse: The AI student's reply
- emotion: One of [confused, understanding, excited, neutral]
- understandingDelta: How much the AI learned (0.0 to 0.15, or negative for confusion)
- xpGained: XP earned (0-50+ depending on understanding)
- totalXP: Total accumulated XP after this message
- newLevel: Current level (0-5+)
- leveledUp: Boolean indicating if AI leveled up

XP Calculation:
- 15%+ learning: 10 XP + 50 XP bonus if concept reaches 70% mastery
- 8-15% learning: 5 XP
- 1-7% learning: 2 XP
- Confusion: 0 XP

---

### POST /sessions/:sessionId/end

End teaching session and get summary.

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{}
```

Response (200 OK):
```json
{
  "message": "Session ended",
  "durationMinutes": 12,
  "xpEarned": 35,
  "messagesExchanged": 7,
  "leveledUp": true,
  "newLevel": 3,
  "totalXP": 400,
  "nextLevelXP": 600
}
```

Level Thresholds:
- Level 0: 0 XP
- Level 1: 100 XP
- Level 2: 300 XP
- Level 3: 600 XP
- Level 4: 1000 XP
- Level 5: 1500 XP

---

### GET /sessions/:sessionId

Get session details including transcript.

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "id": "session-uuid-here",
  "studentId": "user-uuid-here",
  "aiStudentId": "aily-uuid-here",
  "topic": "Variables",
  "durationMinutes": 12,
  "xpEarned": 35,
  "createdAt": "2025-11-14T10:00:00Z",
  "endedAt": "2025-11-14T10:12:00Z",
  "transcript": [
    {
      "role": "ai",
      "content": "Hi! I'm ready to learn about Variables.",
      "emotion": "excited"
    },
    {
      "role": "student",
      "content": "A variable is like a container..."
    },
    {
      "role": "ai",
      "content": "Oh, I see! So x is like a named box..."
    }
  ]
}
```

---

### GET /sessions/ai-student/:aiStudentId/history

Get session history for an AI student.

Headers:
```
Authorization: Bearer <token>
```

Query Parameters:
- limit: Number of sessions to return (default: 20)

Response (200 OK):
```json
[
  {
    "id": "session-uuid-1",
    "topic": "Variables",
    "durationMinutes": 12,
    "xpEarned": 35,
    "createdAt": "2025-11-14T10:00:00Z",
    "transcript": [...]
  },
  {
    "id": "session-uuid-2",
    "topic": "Functions",
    "durationMinutes": 15,
    "xpEarned": 45,
    "createdAt": "2025-11-13T14:30:00Z",
    "transcript": [...]
  }
]
```

---

### GET /sessions/student/:studentId/stats

Get teaching statistics for a student.

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "totalSessions": 8,
  "totalTeachingMinutes": 120,
  "totalXPGiven": 280,
  "ailyLevel": 3,
  "mostTaughtConcepts": [
    "Variables",
    "Functions",
    "Arrays"
  ],
  "ailyInstance": {
    "id": "aily-uuid-here",
    "level": 3,
    "totalXP": 400,
    "currentCharacterId": "jean"
  }
}
```

---

## AI Student Endpoints

### GET /ai-students/user/:userId

Get all Aily instances for a user.

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
[
  {
    "id": "aily-uuid-here",
    "userId": "user-uuid-here",
    "currentCharacterId": "jean",
    "level": 3,
    "totalXP": 400,
    "personalityTraits": {
      "curiosity": 0.8,
      "confusionRate": 0.6,
      "learningSpeed": 0.5
    }
  }
]
```

---

### GET /ai-students/:id

Get specific Aily instance details.

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "id": "aily-uuid-here",
  "userId": "user-uuid-here",
  "currentCharacterId": "jean",
  "level": 3,
  "totalXP": 400,
  "personalityTraits": {
    "curiosity": 0.8,
    "confusionRate": 0.6,
    "learningSpeed": 0.5
  }
}
```

---

### GET /ai-students/:id/knowledge

Get all learned concepts for an AI student.

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
[
  {
    "concept": "Variables",
    "understandingLevel": 0.75,
    "examplesSeen": 5,
    "lastReviewed": "2025-11-14T10:00:00Z"
  },
  {
    "concept": "Functions",
    "understandingLevel": 0.45,
    "examplesSeen": 3,
    "lastReviewed": "2025-11-12T14:30:00Z"
  }
]
```

Understanding Level Decay (Forgetting Curve):
- Days 1-3: No decay (grace period)
- Days 4-7: 5% per day
- Days 8-14: 10% per day
- Days 15+: 15% per day
- Floor: Never below 0.1 (minimum memory retention)
- Cap: Maximum decay of 80% from peak

---

### GET /ai-students/characters

Get available character profiles.

Response (200 OK):
```json
[
  {
    "id": "jean",
    "name": "Curious Explorer",
    "description": "Loves asking questions and exploring new ideas",
    "personality": {
      "curiosity": 0.8,
      "confusionRate": 0.6,
      "learningSpeed": 0.5
    },
    "learningStyle": "Diverger",
    "commonQuestions": [
      "Why does this work this way?",
      "What happens if I...?"
    ]
  },
  {
    "id": "quick",
    "name": "Quick Learner",
    "description": "Fast, independent learner who gets frustrated easily",
    "personality": {
      "curiosity": 0.5,
      "confusionRate": 0.3,
      "learningSpeed": 0.9
    },
    "learningStyle": "Accommodator",
    "commonQuestions": [
      "Can we move on?",
      "Is there a shortcut?"
    ]
  },
  {
    "id": "logic",
    "name": "Logical Thinker",
    "description": "Wants deep understanding and questions edge cases",
    "personality": {
      "curiosity": 0.9,
      "confusionRate": 0.2,
      "learningSpeed": 0.7
    },
    "learningStyle": "Converger",
    "commonQuestions": [
      "What about edge cases?",
      "How does this scale?"
    ]
  },
  {
    "id": "perfect",
    "name": "Perfectionist",
    "description": "Detail-oriented, wants correct answers",
    "personality": {
      "curiosity": 0.7,
      "confusionRate": 0.7,
      "learningSpeed": 0.6
    },
    "learningStyle": "Assimilator",
    "commonQuestions": [
      "Is this correct?",
      "What else should I know?"
    ]
  },
  {
    "id": "social",
    "name": "Social Learner",
    "description": "Collaborative learner who prefers explanations",
    "personality": {
      "curiosity": 0.8,
      "confusionRate": 0.4,
      "learningSpeed": 0.8
    },
    "learningStyle": "Pragmatist",
    "commonQuestions": [
      "Can you give an example?",
      "How would you use this?"
    ]
  }
]
```

---

### POST /ai-students/:id/change-mood

Change AI student's character/mood for upcoming sessions.

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "characterId": "logic"
}
```

Response (200 OK):
```json
{
  "id": "aily-uuid-here",
  "currentCharacterId": "logic",
  "level": 3,
  "totalXP": 400,
  "personalityTraits": {
    "curiosity": 0.9,
    "confusionRate": 0.2,
    "learningSpeed": 0.7
  },
  "message": "Character changed to Logical Thinker"
}
```

---

## Topics Endpoints

### GET /topics

Get all topics organized by section.

Response (200 OK):
```json
{
  "totalTopics": 27,
  "sections": {
    "basics": {
      "name": "Basics",
      "topicCount": 8,
      "topics": [
        {
          "id": "variables",
          "section": "basics",
          "titleEn": "Variables",
          "titleBg": "Променливи",
          "descriptionEn": "Learn about variables and data storage",
          "descriptionBg": "Научи за променливи и съхранение на данни",
          "difficulty": "beginner",
          "estimatedMinutes": 20
        },
        {
          "id": "data-types",
          "section": "basics",
          "titleEn": "Data Types",
          "titleBg": "Типове данни",
          "descriptionEn": "Understanding JavaScript data types",
          "descriptionBg": "Разбиране на типовете данни",
          "difficulty": "beginner",
          "estimatedMinutes": 20
        }
      ]
    },
    "intermediate": { ... },
    "advanced": { ... },
    "oop": { ... },
    "applications": { ... },
    "web": { ... }
  }
}
```

---

### GET /topics/:topicId

Get single topic details.

Response (200 OK):
```json
{
  "id": "variables",
  "section": "basics",
  "titleEn": "Variables",
  "titleBg": "Променливи",
  "descriptionEn": "Learn about variables and data storage",
  "descriptionBg": "Научи за променливи и съхранение на данни",
  "difficulty": "beginner",
  "estimatedMinutes": 20
}
```

---

### GET /topics/user/:userId/progress

Get user's learning progress on all topics.

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "totalTopics": 27,
  "userTopics": 8,
  "progress": {
    "variables": {
      "understandingLevel": 0.85,
      "sessionsCount": 3,
      "lastStudied": "2025-11-14T10:00:00Z"
    },
    "functions": {
      "understandingLevel": 0.65,
      "sessionsCount": 2,
      "lastStudied": "2025-11-12T14:30:00Z"
    }
  }
}
```

---

## Admin Endpoints

All admin endpoints require ADMIN or SUPERADMIN role.

### GET /admin/users

List all system users.

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
[
  {
    "id": "user-uuid-1",
    "email": "student1@example.com",
    "name": "Student One",
    "role": "STUDENT",
    "emailVerified": true,
    "createdAt": "2025-11-10T10:00:00Z",
    "lastActive": "2025-11-14T11:00:00Z"
  },
  {
    "id": "user-uuid-2",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN",
    "emailVerified": true,
    "createdAt": "2025-11-01T10:00:00Z",
    "lastActive": "2025-11-14T09:30:00Z"
  }
]
```

---

### PATCH /admin/users/:userId/role

Change user role (SUPERADMIN only).

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "role": "ADMIN"
}
```

Response (200 OK):
```json
{
  "id": "user-uuid-here",
  "email": "user@example.com",
  "name": "User Name",
  "role": "ADMIN"
}
```

---

### DELETE /admin/users/:userId

Delete a user account.

Headers:
```
Authorization: Bearer <token>
```

Response (200 OK):
```json
{
  "message": "User deleted",
  "user": {
    "id": "user-uuid-here",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

### POST /admin/send-email

Send custom email to a user.

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "userId": "user-uuid-here",
  "subject": "System Announcement",
  "message": "This is a custom message from the admin."
}
```

Response (200 OK):
```json
{
  "message": "Email sent successfully"
}
```

---

## Health Check

### GET /health

System health check endpoint.

Response (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T11:30:45.123Z"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:

- 200 OK: Request successful
- 201 Created: Resource created successfully
- 400 Bad Request: Invalid request parameters
- 401 Unauthorized: Missing or invalid authentication token
- 403 Forbidden: User lacks required permissions
- 404 Not Found: Resource not found
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server error

---

## Authentication & Headers

### JWT Token

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

Token Expiration: 30 days from issue

### CORS

The API supports CORS from:
- https://ai-student-28c8.onrender.com (Production)
- http://localhost:3000 (Development)
- http://localhost:5173 (Development - Vite)

### Content-Type

All request bodies must include:
```
Content-Type: application/json
```

---

## Rate Limiting

Certain endpoints have rate limiting:

- POST /auth/resend-verification-email: Max 3 requests per hour per email

Rate limit response:
```
HTTP 429 Too Many Requests
{
  "error": "Too many requests. Please wait before resending."
}
```

---

## API Usage Examples

### Example: Complete Teaching Flow

1. Register User:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "name": "John Student",
    "password": "securePass123"
  }'
```

2. Verify Email (after clicking email link):
```bash
curl -X POST http://localhost:4000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "token-from-email"}'
```

3. Start Teaching Session:
```bash
curl -X POST http://localhost:4000/api/sessions/start \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "<USER_ID>",
    "aiStudentId": "<AILY_ID>",
    "topic": "Variables"
  }'
```

4. Send Teaching Message:
```bash
curl -X POST http://localhost:4000/api/sessions/<SESSION_ID>/message \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"message": "A variable is a container for data..."}'
```

5. End Session:
```bash
curl -X POST http://localhost:4000/api/sessions/<SESSION_ID>/end \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Version

API Version: 1.0.0
Last Updated: 2025-11-14
