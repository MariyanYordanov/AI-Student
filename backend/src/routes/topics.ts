import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { TOPICS_SECTIONS } from '../data/topics';
import { authMiddleware, requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Helper function to get language from request
function getLanguage(req: any): 'bg' | 'en' {
  const acceptLanguage = req.headers['accept-language'] || '';
  return acceptLanguage.toLowerCase().includes('bg') ? 'bg' : 'en';
}

// Helper function to format topic with correct language
function formatTopic(topic: any, language: 'bg' | 'en') {
  return {
    id: topic.id,
    section: topic.section,
    title: language === 'bg' ? topic.titleBg : topic.titleEn,
    description: language === 'bg' ? topic.descriptionBg : topic.descriptionEn,
    difficulty: topic.difficulty,
    estimatedMinutes: topic.estimatedMinutes,
    createdAt: topic.createdAt,
  };
}

/**
 * GET /api/topics
 * Get all topics organized by sections
 */
router.get('/', async (req, res, next) => {
  try {
    const language = getLanguage(req);

    // Get all topics from database
    const allTopics = await prisma.topic.findMany({
      orderBy: [{ section: 'asc' }, { id: 'asc' }],
    });

    // Organize topics by section
    const sections: Record<string, any> = {};

    Object.values(TOPICS_SECTIONS).forEach((section) => {
      const topicsInSection = allTopics.filter((t) => t.section === section);
      sections[section] = {
        name: section,
        topicCount: topicsInSection.length,
        topics: topicsInSection.map((t) => formatTopic(t, language)),
      };
    });

    res.json({
      totalTopics: allTopics.length,
      sections,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/topics/:topicId
 * Get single topic details
 */
router.get('/:topicId', async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const language = getLanguage(req);

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    res.json(formatTopic(topic, language));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/topics/user/:userId/progress
 * Get user's progress on all topics
 */
router.get('/user/:userId/progress', authMiddleware, requireAuth, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own progress
    if (req.user!.id !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Get user's progress for all topics
    const progress = await prisma.topicProgress.findMany({
      where: { userId },
      include: {
        topic: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Organize by section
    interface TopicProgress {
      topicId: string;
      topicTitle: string;
      understandingLevel: number;
      sessionsCount: number;
      lastStudied: Date | null;
    }

    const progressBySection: Record<string, TopicProgress[]> = {};
    Object.values(TOPICS_SECTIONS).forEach((section) => {
      progressBySection[section] = [];
    });

    const language = getLanguage(req);

    progress.forEach((p) => {
      if (p.topic.section in progressBySection) {
        progressBySection[p.topic.section].push({
          topicId: p.topic.id,
          topicTitle: language === 'bg' ? p.topic.titleBg : p.topic.titleEn,
          understandingLevel: p.understandingLevel,
          sessionsCount: p.sessionsCount,
          lastStudied: p.lastStudied,
        });
      }
    });

    // Calculate stats by section
    interface SectionStats {
      totalTopics: number;
      progressedTopics: number;
      completedTopics: number;
      averageUnderstanding: number;
      topics: TopicProgress[];
    }

    // Get total topics count for each section from database
    const allTopics = await prisma.topic.findMany({
      select: { section: true },
    });
    const topicsCountBySection: Record<string, number> = {};
    Object.values(TOPICS_SECTIONS).forEach((section) => {
      topicsCountBySection[section] = allTopics.filter((t) => t.section === section).length;
    });

    const stats: Record<string, SectionStats> = {};
    Object.entries(progressBySection).forEach(([section, items]) => {
      const totalTopicsInSection = topicsCountBySection[section] || 0;
      const completedTopics = items.filter((item) => item.understandingLevel >= 0.7).length;
      const averageUnderstanding =
        items.length > 0
          ? items.reduce((sum, item) => sum + item.understandingLevel, 0) / items.length
          : 0;

      stats[section] = {
        totalTopics: totalTopicsInSection,
        progressedTopics: items.length,
        completedTopics,
        averageUnderstanding,
        topics: items,
      };
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/topics/:topicId/progress
 * Record user progress on a topic
 */
router.post(
  '/:topicId/progress',
  authMiddleware,
  requireAuth,
  async (req, res, next) => {
    try {
      const { topicId } = req.params;
      const { understandingLevel } = req.body;
      const userId = req.user!.id;

      // Validate input
      if (understandingLevel === undefined || understandingLevel < 0 || understandingLevel > 1) {
        res.status(400).json({ error: 'understandingLevel must be between 0 and 1' });
        return;
      }

      // Check if topic exists
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
      });

      if (!topic) {
        res.status(404).json({ error: 'Topic not found' });
        return;
      }

      // Update or create progress
      const progress = await prisma.topicProgress.upsert({
        where: {
          userId_topicId: {
            userId,
            topicId,
          },
        },
        update: {
          understandingLevel,
          sessionsCount: { increment: 1 },
          lastStudied: new Date(),
        },
        create: {
          userId,
          topicId,
          understandingLevel,
          sessionsCount: 1,
        },
      });

      res.json({
        message: 'Progress recorded',
        progress: {
          topicId: progress.topicId,
          understandingLevel: progress.understandingLevel,
          sessionsCount: progress.sessionsCount,
          lastStudied: progress.lastStudied,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/topics/section/:sectionName
 * Get topics for a specific section
 */
router.get('/section/:sectionName', async (req, res, next) => {
  try {
    const { sectionName } = req.params;
    const language = getLanguage(req);

    // Find the section (case-insensitive)
    const section = Object.values(TOPICS_SECTIONS).find(
      (s) => s.toLowerCase() === sectionName.toLowerCase()
    );

    if (!section) {
      res.status(404).json({ error: 'Section not found' });
      return;
    }

    const topics = await prisma.topic.findMany({
      where: { section },
      orderBy: { id: 'asc' },
    });

    res.json({
      section,
      topicCount: topics.length,
      topics: topics.map((t) => formatTopic(t, language)),
    });
  } catch (error) {
    next(error);
  }
});

export { router as topicsRouter };
