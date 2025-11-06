import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sessionRouter } from './routes/sessions';
import { aiStudentRouter } from './routes/ai-students';
import { authRouter } from './routes/auth';
import { topicsRouter } from './routes/topics';
import adminRouter from './routes/admin';
import { errorHandler } from './middleware/error-handler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
const allowedOrigins = [
  'https://aily.onrender.com',
  'https://ai-student-28c8.onrender.com',
  'https://studaint.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/ai-students', aiStudentRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[START] Server running on http://localhost:${PORT}`);
  console.log(`[READY] Aily API ready`);
});
