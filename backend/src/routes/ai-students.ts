import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AILY_CHARACTERS, getCharacterById, getRandomCharacter } from '../data/characters';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/ai-students/characters
 * Get all available Aily character moods/personalities
 */
router.get('/characters', async (_req, res, next) => {
  try {
    res.json(AILY_CHARACTERS);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai-students/user/:userId
 * Get AilyInstance for a user
 */
router.get('/user/:userId', authMiddleware, requireAuth, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own Aily
    if (req.user!.id !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Get user's AilyInstance
    const ailyInstance = await prisma.ailyInstance.findUnique({
      where: { userId },
      include: {
        knowledge: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    // Return as array for backwards compatibility with frontend
    const aiStudents = ailyInstance ? [ailyInstance] : [];

    res.json(
      aiStudents.map((student) => ({
        ...student,
        personalityTraits: JSON.parse(student.personalityTraits),
      }))
    );
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai-students/:id
 * Get AilyInstance details by ID
 */
router.get('/:id', authMiddleware, requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const ailyInstance = await prisma.ailyInstance.findUnique({
      where: { id },
      include: {
        knowledge: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!ailyInstance) {
      res.status(404).json({ error: 'Aily instance not found' });
      return;
    }

    // Verify user owns this Aily instance
    if (req.user!.id !== ailyInstance.userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    res.json({
      ...ailyInstance,
      personalityTraits: JSON.parse(ailyInstance.personalityTraits),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai-students/:id/knowledge
 * Get Aily's knowledge map
 */
router.get('/:id/knowledge', authMiddleware, requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify Aily instance exists and user owns it
    const ailyInstance = await prisma.ailyInstance.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!ailyInstance) {
      res.status(404).json({ error: 'Aily instance not found' });
      return;
    }

    if (req.user!.id !== ailyInstance.userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Get knowledge for this Aily instance
    const knowledge = await prisma.knowledge.findMany({
      where: { ailyInstanceId: id },
      orderBy: { understandingLevel: 'desc' },
    });

    res.json(knowledge);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai-students/:id/change-mood
 * Change Aily's current character mood for the next session
 */
router.post('/:id/change-mood', authMiddleware, requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { characterId } = req.body;

    if (!characterId) {
      res.status(400).json({ error: 'characterId is required' });
      return;
    }

    // Verify character exists
    const character = getCharacterById(characterId);
    if (!character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    // Verify Aily instance exists and user owns it
    const ailyInstance = await prisma.ailyInstance.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!ailyInstance) {
      res.status(404).json({ error: 'Aily instance not found' });
      return;
    }

    if (req.user!.id !== ailyInstance.userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Update Aily's current character
    const updatedAily = await prisma.ailyInstance.update({
      where: { id },
      data: {
        currentCharacterId: characterId,
      },
      include: {
        knowledge: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    res.json({
      ...updatedAily,
      personalityTraits: JSON.parse(updatedAily.personalityTraits),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai-students/random-character
 * Get a random character mood for starting a new session
 */
router.get('/random-character', async (_req, res, next) => {
  try {
    const randomCharacter = getRandomCharacter();
    res.json(randomCharacter);
  } catch (error) {
    next(error);
  }
});

export { router as aiStudentRouter };
