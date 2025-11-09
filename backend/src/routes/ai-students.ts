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
 * POST /api/ai-students/select-character
 * Select or create AI student with a character
 * Each user can have only ONE AI student per character
 */
router.post('/select-character', authMiddleware, requireAuth, async (req, res, next) => {
  try {
    const { characterId } = req.body;
    const userId = req.user!.id;

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

    // Check if user already has this character
    let aiStudent = await prisma.aIStudent.findUnique({
      where: {
        ownerId_characterId: {
          ownerId: userId,
          characterId,
        },
      },
      include: {
        knowledge: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    // Create if doesn't exist
    if (!aiStudent) {
      aiStudent = await prisma.aIStudent.create({
        data: {
          ownerId: userId,
          characterId,
          name: character.name,
          personalityTraits: JSON.stringify(character.personality),
        },
        include: {
          knowledge: true,
          sessions: true,
        },
      });
    }

    res.json({
      ...aiStudent,
      personalityTraits: JSON.parse(aiStudent.personalityTraits),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai-students/user/:userId
 * Get AilyInstance for a user (returns as array for backwards compatibility)
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
 * POST /api/ai-students/create
 * DEPRECATED - Use /select-character instead
 * Kept for backward compatibility
 */
router.post('/create', async (req, res, next) => {
  try {
    const { ownerId, name } = req.body;

    if (!ownerId || !name) {
      res.status(400).json({ error: 'ownerId and name are required' });
      return;
    }

    const aiStudent = await prisma.aIStudent.create({
      data: {
        ownerId,
        characterId: 'jean', // Default to Jean
        name,
        personalityTraits: JSON.stringify({
          curiosity: 0.5 + Math.random() * 0.3,
          confusionRate: 0.4 + Math.random() * 0.3,
          learningSpeed: 0.3 + Math.random() * 0.4,
        }),
      },
    });

    res.json(aiStudent);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai-students/:id
 * Get AI student details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const aiStudent = await prisma.aIStudent.findUnique({
      where: { id },
      include: {
        knowledge: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!aiStudent) {
      res.status(404).json({ error: 'AI student not found' });
      return;
    }

    res.json({
      ...aiStudent,
      personalityTraits: JSON.parse(aiStudent.personalityTraits),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai-students/:id/knowledge
 * Get AI student's knowledge map
 */
router.get('/:id/knowledge', async (req, res, next) => {
  try {
    const { id } = req.params;

    const knowledge = await prisma.knowledge.findMany({
      where: { aiStudentId: id },
      orderBy: { understandingLevel: 'desc' },
    });

    res.json(knowledge);
  } catch (error) {
    next(error);
  }
});

export { router as aiStudentRouter };
