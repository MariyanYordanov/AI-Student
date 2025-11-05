/**
 * Script to create default AilyInstance for existing users that don't have one
 * Run with: npx tsx src/scripts/create-missing-aily-instances.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMissingAilyInstances() {
  try {
    console.log('[START] Checking for users without AilyInstance...');

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        aily: true,
      },
    });

    console.log(`[INFO] Found ${users.length} total users`);

    // Filter users without AilyInstance
    const usersWithoutAily = users.filter(u => !u.aily);

    console.log(`[INFO] Found ${usersWithoutAily.length} users without AilyInstance`);

    if (usersWithoutAily.length === 0) {
      console.log('[OK] All users already have AilyInstance. Nothing to do.');
      return;
    }

    // Create AilyInstance for each user
    const defaultPersonality = {
      curiosity: 0.7,
      confusionRate: 0.5,
      learningSpeed: 0.6,
    };

    for (const user of usersWithoutAily) {
      console.log(`[CREATE] Creating AilyInstance for user: ${user.email} (${user.id})`);

      await prisma.ailyInstance.create({
        data: {
          userId: user.id,
          currentCharacterId: 'curious-explorer',
          level: 0,
          totalXP: 0,
          personalityTraits: JSON.stringify(defaultPersonality),
        },
      });

      console.log(`[OK] AilyInstance created for ${user.email}`);
    }

    console.log(`[SUCCESS] Created ${usersWithoutAily.length} AilyInstances`);
  } catch (error) {
    console.error('[ERROR] Failed to create AilyInstances:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createMissingAilyInstances()
  .then(() => {
    console.log('[DONE] Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[FATAL] Script failed:', error);
    process.exit(1);
  });
