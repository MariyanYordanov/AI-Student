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

    // Validate that AI student exists and fetch with knowledge
    const ailyInstance = await prisma.ailyInstance.findUnique({
      where: { id: aiStudentId },
      include: {
        knowledge: true,
      },
    });

    if (!ailyInstance) {
      console.error(`[ERR] Aily instance not found: ${aiStudentId}`);
      res.status(404).json({
        error: 'AI студентът не е намерен. Моля, избери AI студент от Dashboard.'
      });
      return;
    }

    // Validate that user exists
    const user = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!user) {
      console.error(`[ERR] User not found: ${studentId}`);
      res.status(404).json({ error: 'Потребителят не е намерен.' });
      return;
    }

    const session = await prisma.session.create({
      data: {
        studentId,
        ailyInstanceId: aiStudentId, // Use ailyInstanceId field
        topic,
        transcript: '[]',
      },
    });

    // Generate initial AI student greeting using the fetched ailyInstance
    const personalityTraits = JSON.parse(ailyInstance.personalityTraits);
    const knownConcepts = ailyInstance.knowledge
      .filter((k) => k.understandingLevel > 0.7)
      .map((k) => k.concept);
    const partialConcepts = ailyInstance.knowledge
      .filter((k) => k.understandingLevel > 0.3 && k.understandingLevel <= 0.7)
      .map((k) => k.concept);

    const context: AIStudentContext = {
      aiStudentId: ailyInstance.id,
      name: 'Aily',
      level: ailyInstance.level,
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
      id: session.id,  // Frontend expects 'id', not 'sessionId'
      sessionId: session.id,  // Keep for backwards compatibility
      studentId: session.studentId,
      aiStudentId: session.ailyInstanceId,
      topic: session.topic,
      aiStudent: ailyInstance,
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

    // Get session data
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Get Aily instance with knowledge
    const ailyInstance = await prisma.ailyInstance.findUnique({
      where: { id: session.ailyInstanceId! },
      include: {
        knowledge: true,
      },
    });

    if (!ailyInstance) {
      res.status(404).json({ error: 'Aily instance not found' });
      return;
    }

    // Build AI context with knowledge decay applied
    const personalityTraits = JSON.parse(ailyInstance.personalityTraits);

    // Apply decay to old knowledge and update in database
    const updatedKnowledge = await Promise.all(
      ailyInstance.knowledge.map(async (k) => {
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
      aiStudentId: ailyInstance.id,
      name: 'Aily',
      level: ailyInstance.level,
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
          ailyInstanceId_concept: {
            ailyInstanceId: ailyInstance.id,
            concept: session.topic,
          },
        },
      });

      const currentLevel = currentKnowledge?.understandingLevel || 0;
      const newLevel = Math.max(0, Math.min(1.0, currentLevel + aiResponse.understandingDelta));

      await prisma.knowledge.upsert({
        where: {
          ailyInstanceId_concept: {
            ailyInstanceId: ailyInstance.id,
            concept: session.topic,
          },
        },
        update: {
          understandingLevel: newLevel,
          examplesSeen: { increment: 1 },
          lastReviewed: new Date(),
        },
        create: {
          ailyInstanceId: ailyInstance.id,
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
      await prisma.ailyInstance.update({
        where: { id: ailyInstance.id },
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

    // Add XP to Aily and check for level-up
    const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500];
    const ailyInstance = await prisma.ailyInstance.findUnique({
      where: { id: session.ailyInstanceId! },
    });

    if (!ailyInstance) {
      res.status(404).json({ error: 'Aily instance not found' });
      return;
    }

    const newTotalXP = ailyInstance.totalXP + xpEarned;
    let newLevel = ailyInstance.level;
    let leveledUp = false;

    // Check if reached next level threshold
    if (ailyInstance.level < XP_THRESHOLDS.length - 1) {
      if (newTotalXP >= XP_THRESHOLDS[ailyInstance.level + 1]) {
        newLevel = ailyInstance.level + 1;
        leveledUp = true;
      }
    }

    await prisma.ailyInstance.update({
      where: { id: session.ailyInstanceId! },
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
        ailyInstance: true,
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
      where: { ailyInstanceId: aiStudentId },
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

    // Get the user's AilyInstance
    const ailyInstance = await prisma.ailyInstance.findUnique({
      where: { userId: studentId },
      include: {
        sessions: {
          where: { endedAt: { not: null } },
        },
        knowledge: true,
      },
    });

    if (!ailyInstance) {
      res.json({
        totalSessions: 0,
        totalTeachingMinutes: 0,
        totalXPGiven: 0,
        ailyLevel: 0,
        mostTaughtConcepts: [],
        ailyInstance: null,
      });
      return;
    }

    // Calculate stats
    const totalSessions = ailyInstance.sessions.length;
    const totalTeachingMinutes = ailyInstance.sessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0
    );
    const totalXPGiven = ailyInstance.totalXP;
    const ailyLevel = ailyInstance.level;

    // Concepts taught
    const conceptsMap = new Map<string, number>();
    ailyInstance.knowledge.forEach((k) => {
      conceptsMap.set(k.concept, (conceptsMap.get(k.concept) || 0) + 1);
    });

    const mostTaughtConcepts = Array.from(conceptsMap.entries())
      .map(([concept, count]) => ({ concept, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      totalSessions,
      totalTeachingMinutes,
      totalXPGiven,
      ailyLevel,
      mostTaughtConcepts,
      ailyInstance: {
        id: ailyInstance.id,
        level: ailyInstance.level,
        totalXP: ailyInstance.totalXP,
        sessionCount: ailyInstance.sessions.length,
        knowledgeCount: ailyInstance.knowledge.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as sessionRouter };
