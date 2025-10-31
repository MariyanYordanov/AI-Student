# API Documentation

Base URL: `http://localhost:4000/api`

## AI Students

### Create AI Student
```http
POST /ai-students/create
Content-Type: application/json

{
  "ownerId": "user-id",
  "name": "Иван"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Иван",
  "level": 0,
  "totalXP": 0,
  "personalityTraits": "{\"curiosity\":0.6,\"confusionRate\":0.5,\"learningSpeed\":0.4}"
}
```

### Get AI Student
```http
GET /ai-students/:id
```

### Get AI Student Knowledge
```http
GET /ai-students/:id/knowledge
```

## Sessions

### Start Session
```http
POST /sessions/start
Content-Type: application/json

{
  "studentId": "user-id",
  "aiStudentId": "ai-student-id",
  "topic": "променливи в JavaScript"
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "aiStudent": {...},
  "message": "Session started"
}
```

### Send Message
```http
POST /sessions/:sessionId/message
Content-Type: application/json

{
  "message": "let е ключова дума за създаване на променлива"
}
```

**Response:**
```json
{
  "aiResponse": "Ааа! Значи let е за променливи, нали? 😃",
  "emotion": "understanding",
  "understandingDelta": 0.1
}
```

### End Session
```http
POST /sessions/:sessionId/end
```

**Response:**
```json
{
  "message": "Session ended",
  "durationMinutes": 5,
  "xpEarned": 50,
  "messagesExchanged": 12
}
```

### Get Session
```http
GET /sessions/:sessionId
```

## Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-09T..."
}
```
