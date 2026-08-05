import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USER || 'admin';
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

  await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: { passwordHash: adminPasswordHash },
    create: {
      username: adminUsername,
      passwordHash: adminPasswordHash,
    },
  });

  await prisma.systemConfig.upsert({
    where: { id: 'default-config' },
    update: {},
    create: {
      id: 'default-config',
      projectName: 'Parchís Inclusivo Multisensorial',
      playerCount: 4,
      tileCount: 28,
      timeoutSeconds: 20,
      volume: 70,
      websocketPort: 4000,
    },
  });

  const tileTypes = [
    'INFORMATIVE', 'FREE', 'QUESTION', 'START', 'INFORMATIVE', 'FREE', 'QUESTION', 'FREE', 'START', 'FREE',
    'QUESTION', 'FREE', 'INFORMATIVE', 'START', 'QUESTION', 'FREE', 'INFORMATIVE', 'QUESTION', 'START', 'INFORMATIVE',
    'ENTRY', 'ENTRY', 'ENTRY', 'ENTRY', 'GOAL', 'GOAL', 'GOAL', 'GOAL',
  ] as const;

  for (let index = 1; index <= 28; index += 1) {
    await prisma.boardTile.upsert({
      where: { index },
      update: { type: tileTypes[index - 1], description: `Casilla ${index}` },
      create: {
        index,
        type: tileTypes[index - 1],
        description: `Casilla ${index}`,
      },
    });
  }

  const questions = [
    {
      title: 'Perla del Pacífico',
      text: '¿Cuál es la ciudad conocida como la "Perla del Pacífico"?',
      optionA: 'Guayaquil',
      optionB: 'Manta',
      correctOption: 'A',
      topic: 'Ciudades',
      region: 'COSTA' as const,
      audioTrack: 201,
    },
    {
      title: 'Cultivo de la Costa',
      text: '¿Cuál es el cultivo más representativo de la Costa ecuatoriana?',
      optionA: 'Papa',
      optionB: 'Banano',
      correctOption: 'B',
      topic: 'Agricultura',
      region: 'COSTA' as const,
      audioTrack: 202,
    },
    {
      title: 'Mitad del Mundo',
      text: '¿En qué ciudad se encuentra la Mitad del Mundo?',
      optionA: 'Cuenca',
      optionB: 'Quito',
      correctOption: 'B',
      topic: 'Geografía',
      region: 'SIERRA' as const,
      audioTrack: 203,
    },
    {
      title: 'Volcán más alto',
      text: '¿Cuál es el volcán más alto del Ecuador?',
      optionA: 'Chimborazo',
      optionB: 'Cotopaxi',
      correctOption: 'A',
      topic: 'Geografía',
      region: 'SIERRA' as const,
      audioTrack: 204,
    },
    {
      title: 'Provincia amazónica',
      text: '¿Cuál de estas provincias pertenece a la Amazonía?',
      optionA: 'Manabí',
      optionB: 'Pastaza',
      correctOption: 'B',
      topic: 'Geografía',
      region: 'AMAZONIA' as const,
      audioTrack: 205,
    },
    {
      title: 'Río amazónico',
      text: '¿Qué río forma parte de la región Amazónica?',
      optionA: 'Guayas',
      optionB: 'Napo',
      correctOption: 'B',
      topic: 'Hidrografía',
      region: 'AMAZONIA' as const,
      audioTrack: 206,
    },
    {
      title: 'Fauna de Galápagos',
      text: '¿Qué animal inspiró la teoría de la evolución de Charles Darwin?',
      optionA: 'Tortuga gigante',
      optionB: 'Cóndor',
      correctOption: 'A',
      topic: 'Biodiversidad',
      region: 'GALAPAGOS' as const,
      audioTrack: 207,
    },
    {
      title: 'Islas Galápagos',
      text: '¿Las Islas Galápagos pertenecen al Ecuador?',
      optionA: 'No',
      optionB: 'Sí',
      correctOption: 'B',
      topic: 'Geografía',
      region: 'GALAPAGOS' as const,
      audioTrack: 208,
    },
    {
      title: 'Regiones naturales',
      text: '¿Cuántas regiones naturales tiene el Ecuador?',
      optionA: 'Cinco',
      optionB: 'Cuatro',
      correctOption: 'B',
      topic: 'Geografía',
      region: 'GENERAL' as const,
      audioTrack: 209,
    },
    {
      title: 'Capital del Ecuador',
      text: '¿Cuál es la capital del Ecuador?',
      optionA: 'Quito',
      optionB: 'Guayaquil',
      correctOption: 'A',
      topic: 'Ciudades',
      region: 'GENERAL' as const,
      audioTrack: 210,
    },
  ];

  for (const question of questions) {
    await prisma.question.upsert({
      where: { audioTrack: question.audioTrack },
      update: { ...question, status: true },
      create: question,
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
