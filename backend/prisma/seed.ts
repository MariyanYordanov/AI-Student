import { PrismaClient } from '@prisma/client';
import { TOPICS } from '../src/data/topics';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Skip creating test user - users should register via the app
  console.log('ℹ️  Skipping test user creation (users should register via app)');

  // Seed all topics into database
  console.log('\n📚 Seeding topics...');

  for (const topic of TOPICS) {
    await prisma.topic.upsert({
      where: { id: topic.id },
      update: {}, // Don't update if exists
      create: {
        id: topic.id,
        section: topic.section,
        title: topic.title,
        description: topic.description,
        difficulty: topic.difficulty,
        estimatedMinutes: topic.estimatedMinutes,
      },
    });
  }

  console.log(`✅ Created ${TOPICS.length} topics in database`);

  // Count topics by section
  const sections = new Map<string, number>();
  TOPICS.forEach((topic) => {
    sections.set(topic.section, (sections.get(topic.section) || 0) + 1);
  });

  console.log('\n📖 Topics by section:');
  sections.forEach((count, section) => {
    console.log(`   ${section}: ${count} topics`);
  });
}

main()
  .then(async () => {
    console.log('\n✅ Seeding completed successfully');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    // Exit with error code to indicate failure
    // @ts-ignore - process is available in Node.js runtime
    if (typeof process !== 'undefined') {
      // @ts-ignore
      process.exit(1);
    }
  });
