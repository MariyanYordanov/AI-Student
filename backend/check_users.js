const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  console.log('\n📊 Потребители в базата:');
  console.log('─'.repeat(80));
  users.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.name}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🆔 ID: ${user.id}`);
    console.log(`   👤 Role: ${user.role}`);
    console.log(`   📅 Създан: ${user.createdAt}`);
    console.log('');
  });

  console.log(`✅ Общо потребители: ${users.length}\n`);
}

main()
  .catch(e => console.error(e))
  .finally(() => process.exit(0));
