import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { GeminiService } from '../services/gemini.service';
import { AIStudentContext, SessionMessage } from '../types';
import { calculateDecay, shouldApplyDecay } from '../utils/knowledge-decay';

const router = Router();
const prisma = new PrismaClient();
const gemini = new GeminiService();

/**
 * POST /api/sessions/start
 * Start a new teaching session with initial AI greeting
 */
router.post('/start', async (req, res, next) => {
  try {
    const { studentId, aiStudentId, topic } = req.body;

    if (!studentId || !aiStudentId || !topic) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const session = await prisma.session.create({
      data: {
        studentId,
        aiStudentId,
        topic,
        transcript: '[]',
      },
      include: {
        aiStudent: {
          include: {
            knowledge: true,
          },
        },
      },
    });

    // Generate initial AI student greeting
    const personalityTraits = JSON.parse(session.aiStudent.personalityTraits);
    const knownConcepts = session.aiStudent.knowledge
      .filter((k) => k.understandingLevel > 0.7)
      .map((k) => k.concept);
    const partialConcepts = session.aiStudent.knowledge
      .filter((k) => k.understandingLevel > 0.3 && k.understandingLevel <= 0.7)
      .map((k) => k.concept);

    const context: AIStudentContext = {
      aiStudentId: session.aiStudent.id,
      name: session.aiStudent.name,
      level: session.aiStudent.level,
      grade: 8,
      knownConcepts,
      partialConcepts,
      commonMistakes: ['забравяне на ;', 'бъркане на = с ==', 'главни букви в keywords'],
      currentTopic: topic,
      personalityTraits,
    };

    // Generate greeting message with timeout handling
    const greetingPrompt = `Здравей! Днес ще те науча за ${topic}. Готов ли си?`;
    let aiGreeting;
    let geminiAvailable = true;

    try {
      aiGreeting = await gemini.generateResponse(greetingPrompt, context, []);
    } catch (aiError) {
      console.error('[ERR] Failed to generate AI greeting:', aiError);
      geminiAvailable = false;

      // Check if it's a timeout or API key issue
      const errorMsg = aiError instanceof Error ? aiError.message : '';
      const isTimeout = errorMsg.includes('timeout');
      const isApiKey = errorMsg.includes('API_KEY') || errorMsg.includes('API error');

      // Provide specific fallback message
      let fallbackMessage = `Здравей! Днес ще те науча за ${topic}. Готов ли си?`;
      if (isTimeout) {
        fallbackMessage = `Здравей! (AI асистентът отговаря бавно, но можем да започнем). Днес ще те науча за ${topic}. Готов ли си?`;
      } else if (isApiKey) {
        fallbackMessage = `Здравей! (AI асистентът е недостъпен, но можем да започнем). Днес ще те науча за ${topic}. Готов ли си?`;
      }

      aiGreeting = {
        message: fallbackMessage,
        emotion: 'curious',
      };
    }

    // Add initial exchange to transcript
    const transcript: SessionMessage[] = [
      {
        role: 'ai_student',
        message: aiGreeting.message,
        timestamp: new Date().toISOString(),
        emotion: aiGreeting.emotion,
      },
    ];

    // Update session with initial greeting
    await prisma.session.update({
      where: { id: session.id },
      data: {
        transcript: JSON.stringify(transcript),
      },
    });

    res.json({
      sessionId: session.id,
      aiStudent: session.aiStudent,
      initialMessage: aiGreeting.message,
      initialEmotion: aiGreeting.emotion,
      message: 'Session started',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sessions/:id/message
 * Send a teaching message to the AI student
 */
router.post('/:id/message', async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;
    const { message: userMessage } = req.body;

    if (!userMessage) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Get session and AI student data
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        aiStudent: {
          include: {
            knowledge: true,
          },
        },
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Build AI context with knowledge decay applied
    const personalityTraits = JSON.parse(session.aiStudent.personalityTraits);

    // Apply decay to old knowledge and update in database
    const updatedKnowledge = await Promise.all(
      session.aiStudent.knowledge.map(async (k) => {
        if (shouldApplyDecay(k.lastReviewed)) {
          const decayedLevel = calculateDecay(k.lastReviewed, k.understandingLevel);

          if (decayedLevel !== k.understandingLevel) {
            // Update with decayed value
            await prisma.knowledge.update({
              where: { id: k.id },
              data: { understandingLevel: decayedLevel },
            });
            return { ...k, understandingLevel: decayedLevel };
          }
        }
        return k;
      })
    );

    const knownConcepts = updatedKnowledge
      .filter((k) => k.understandingLevel > 0.7)
      .map((k) => k.concept);
    const partialConcepts = updatedKnowledge
      .filter((k) => k.understandingLevel > 0.3 && k.understandingLevel <= 0.7)
      .map((k) => k.concept);

    const context: AIStudentContext = {
      aiStudentId: session.aiStudent.id,
      name: session.aiStudent.name,
      level: session.aiStudent.level,
      grade: 8, // Default
      knownConcepts,
      partialConcepts,
      commonMistakes: ['забравяне на ;', 'бъркане на = с ==', 'главни букви в keywords'],
      currentTopic: session.topic,
      personalityTraits,
    };

    // Get conversation history
    const transcript: SessionMessage[] = JSON.parse(session.transcript);

    // Get AI response WITH conversation history and fallback handling
    let aiResponse;
    try {
      aiResponse = await gemini.generateResponse(userMessage, context, transcript);
    } catch (aiError) {
      console.error('[ERR] Failed to generate AI response:', aiError);

      // Fallback response when Gemini is unavailable
      aiResponse = {
        message: 'Хм... малко се замислих. Можеш ли да преформулираш това, което каза?',
        emotion: 'confused' as const,
        understandingDelta: 0,
        shouldAskQuestion: true,
      };
    }

    transcript.push(
      {
        role: 'student',
        message: userMessage,
        timestamp: new Date().toISOString(),
      },
      {
        role: 'ai_student',
        message: aiResponse.message,
        timestamp: new Date().toISOString(),
        emotion: aiResponse.emotion,
      }
    );

    // Update session
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        transcript: JSON.stringify(transcript),
      },
    });

    // Calculate XP earned during this interaction
    let xpGained = 0;
    if (aiResponse.emotion === 'excited') {
      xpGained = 10; // Big "Aha!" moment
    } else if (aiResponse.emotion === 'understanding') {
      xpGained = 5; // Regular understanding
    } else if (aiResponse.emotion === 'neutral') {
      xpGained = 2; // Participated in conversation
    }
    // confused gives 0 XP

    // Update knowledge if understanding changed (can be positive or negative)
    if (aiResponse.understandingDelta && aiResponse.understandingDelta !== 0) {
      // Get current knowledge to calculate new level with cap
      const currentKnowledge = await prisma.knowledge.findUnique({
        where: {
          aiStudentId_concept: {
            aiStudentId: session.aiStudent.id,
            concept: session.topic,
          },
        },
      });

      const currentLevel = currentKnowledge?.understandingLevel || 0;
      const newLevel = Math.max(0, Math.min(1.0, currentLevel + aiResponse.understandingDelta));

      await prisma.knowledge.upsert({
        where: {
          aiStudentId_concept: {
            aiStudentId: session.aiStudent.id,
            concept: session.topic,
          },
        },
        update: {
          understandingLevel: newLevel,
          examplesSeen: { increment: 1 },
          lastReviewed: new Date(),
        },
        create: {
          aiStudentId: session.aiStudent.id,
          concept: session.topic,
          understandingLevel: Math.max(0, Math.min(1.0, aiResponse.understandingDelta)),
          examplesSeen: 1,
        },
      });

      // Bonus XP if concept mastered (reached 0.7)
      if (currentLevel < 0.7 && newLevel >= 0.7) {
        xpGained += 50; // Concept mastery bonus!
      }
    }

    // Add XP to AI student (real-time)
    if (xpGained > 0) {
      await prisma.aIStudent.update({
        where: { id: session.aiStudent.id },
        data: {
          totalXP: { increment: xpGained },
        },
      });
    }

    res.json({
      aiResponse: aiResponse.message,
      emotion: aiResponse.emotion,
      understandingDelta: aiResponse.understandingDelta,
      xpGained,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sessions/:id/end
 * End a teaching session
 */
router.post('/:id/end', async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const transcript: SessionMessage[] = JSON.parse(session.transcript);
    const durationMinutes = Math.max(1, Math.floor(transcript.length / 4)); // Rough estimate
    const xpEarned = durationMinutes * 10;

    // Update session
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        durationMinutes,
        xpEarned,
      },
    });

    // Add XP to AI student and check for level-up
    const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500];
    const aiStudent = await prisma.aIStudent.findUnique({
      where: { id: session.aiStudentId },
    });

    if (!aiStudent) {
      res.status(404).json({ error: 'AI student not found' });
      return;
    }

    const newTotalXP = aiStudent.totalXP + xpEarned;
    let newLevel = aiStudent.level;
    let leveledUp = false;

    // Check if reached next level threshold
    if (aiStudent.level < XP_THRESHOLDS.length - 1) {
      if (newTotalXP >= XP_THRESHOLDS[aiStudent.level + 1]) {
        newLevel = aiStudent.level + 1;
        leveledUp = true;
      }
    }

    await prisma.aIStudent.update({
      where: { id: session.aiStudentId },
      data: {
        totalXP: newTotalXP,
        level: newLevel,
      },
    });

    res.json({
      message: 'Session ended',
      durationMinutes,
      xpEarned,
      messagesExchanged: transcript.length,
      leveledUp,
      newLevel,
      totalXP: newTotalXP,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions/:id
 * Get session details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        student: true,
        aiStudent: true,
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({
      ...session,
      transcript: JSON.parse(session.transcript),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions/ai-student/:aiStudentId/history
 * Get all sessions for an AI student
 */
router.get('/ai-student/:aiStudentId/history', async (req, res, next) => {
  try {
    const { aiStudentId } = req.params;
    const { limit = 20 } = req.query;

    const sessions = await prisma.session.findMany({
      where: { aiStudentId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Parse transcripts
    const sessionsWithTranscripts = sessions.map((session) => ({
      ...session,
      transcript: JSON.parse(session.transcript),
    }));

    res.json(sessionsWithTranscripts);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions/student/:studentId/stats
 * Get teaching stats for a real student
 */
router.get('/student/:studentId/stats', async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Get all AI students created by this student
    const aiStudents = await prisma.aIStudent.findMany({
      where: { ownerId: studentId },
      include: {
        sessions: {
          where: { endedAt: { not: null } },
        },
        knowledge: true,
      },
    });

    // Calculate stats
    const totalAIStudents = aiStudents.length;
    const totalSessions = aiStudents.reduce((sum, ai) => sum + ai.sessions.length, 0);
    const totalTeachingMinutes = aiStudents.reduce(
      (sum, ai) =>
        sum + ai.sessions.reduce((s, session) => s + session.durationMinutes, 0),
      0
    );
    const totalXPGiven = aiStudents.reduce((sum, ai) => sum + ai.totalXP, 0);
    const averageAILevel =
      totalAIStudents > 0
        ? aiStudents.reduce((sum, ai) => sum + ai.level, 0) / totalAIStudents
        : 0;

    // Concepts taught
    const conceptsMap = new Map<string, number>();
    aiStudents.forEach((ai) => {
      ai.knowledge.forEach((k) => {
        conceptsMap.set(k.concept, (conceptsMap.get(k.concept) || 0) + 1);
      });
    });

    const mostTaughtConcepts = Array.from(conceptsMap.entries())
      .map(([concept, count]) => ({ concept, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      totalAIStudents,
      totalSessions,
      totalTeachingMinutes,
      totalXPGiven,
      averageAILevel: Math.round(averageAILevel * 10) / 10,
      mostTaughtConcepts,
      aiStudents: aiStudents.map((ai) => ({
        id: ai.id,
        name: ai.name,
        level: ai.level,
        totalXP: ai.totalXP,
        sessionCount: ai.sessions.length,
        knowledgeCount: ai.knowledge.length,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export { router as sessionRouter };
