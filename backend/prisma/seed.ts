import { PrismaClient } from '@prisma/client';
import { TOPICS } from '../src/data/topics';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a temporary test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'temp-user-123',
      email: 'test@example.com',
      password: '', // Will be set on first login
      name: 'Тестов Потребител',
      role: 'STUDENT',
    },
  });

  console.log('✅ Created user:', user.name);
  console.log('📧 Email:', user.email);
  console.log('🆔 ID:', user.id);

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
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
