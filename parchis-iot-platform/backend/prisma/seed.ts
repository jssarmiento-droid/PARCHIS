import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.adminUser.upsert({
    where: { username: process.env.ADMIN_USER || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_USER || 'admin',
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10),
    },
  });

  await prisma.systemConfig.upsert({
    where: { id: 'default-config' },
    update: {},
    create: {
      id: 'default-config',
      projectName: 'Parchis Inclusivo Multisensorial',
      playerCount: 4,
      tileCount: 28,
      timeoutSeconds: 20,
      volume: 70,
      websocketPort: 4000,
    },
  });

  const tileTypes = ['START', 'FREE', 'INFORMATIVE', 'QUESTION', 'LOSE_TURN', 'REPEAT_TURN', 'GOAL'] as const;
  for (let index = 1; index <= 28; index += 1) {
    await prisma.boardTile.upsert({
      where: { index },
      update: {},
      create: {
        index,
        type: index === 1 ? 'START' : index === 28 ? 'GOAL' : tileTypes[index % tileTypes.length],
        description: `Casilla ${index}`,
      },
    });
  }

  await prisma.question.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Agricultura de la Costa',
        text: '¿Qué cultivo es representativo de la Costa ecuatoriana?',
        optionA: 'Banano',
        optionB: 'Trigo',
        correctOption: 'A',
        topic: 'Agricultura',
      },
      {
        title: 'Cacao ecuatoriano',
        text: 'El cacao se utiliza principalmente para elaborar:',
        optionA: 'Chocolate',
        optionB: 'Sal',
        correctOption: 'A',
        topic: 'Cultivos',
      },
    ],
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
