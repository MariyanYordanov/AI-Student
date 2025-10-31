import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sessionRouter } from './routes/sessions';
import { aiStudentRouter } from './routes/ai-students';
import { authRouter } from './routes/auth';
import { topicsRouter } from './routes/topics';
import { errorHandler } from './middleware/error-handler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/ai-students', aiStudentRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 AI Teacher-Student API ready`);
});
