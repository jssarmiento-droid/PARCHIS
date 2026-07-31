-- CreateEnum
CREATE TYPE "PlayerColor" AS ENUM ('BLUE', 'RED', 'GREEN', 'YELLOW');

-- CreateEnum
CREATE TYPE "TileType" AS ENUM ('START', 'FREE', 'INFORMATIVE', 'QUESTION', 'LOSE_TURN', 'REPEAT_TURN', 'GOAL');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('CREATED', 'RUNNING', 'PAUSED', 'FINISHED', 'ABORTED');

-- CreateEnum
CREATE TYPE "AudioRelationType" AS ENUM ('QUESTION', 'INFORMATIVE_TILE', 'GENERAL');

-- CreateEnum
CREATE TYPE "DeviceKind" AS ENUM ('ESP32', 'ARDUINO_NANO');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'CREATED',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "winnerColor" "PlayerColor",
    "bestEducationalColor" "PlayerColor",
    "bestEducationalScore" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "incorrectAnswers" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayer" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "color" "PlayerColor" NOT NULL,
    "name" TEXT NOT NULL,
    "currentTile" INTEGER NOT NULL DEFAULT 0,
    "routeScore" INTEGER NOT NULL DEFAULT 0,
    "educationalScore" INTEGER NOT NULL DEFAULT 0,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardTile" (
    "id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "type" "TileType" NOT NULL,
    "description" TEXT,
    "questionId" TEXT,
    "audioId" TEXT,

    CONSTRAINT "BoardTile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "correctOption" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "audioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioAsset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'audio/mpeg',
    "relationType" "AudioRelationType" NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoveHistory" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT,
    "turnNumber" INTEGER NOT NULL,
    "color" "PlayerColor" NOT NULL,
    "diceValue" INTEGER,
    "fromTile" INTEGER,
    "toTile" INTEGER,
    "tileType" "TileType",
    "questionText" TEXT,
    "selectedAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "educationalScore" INTEGER NOT NULL DEFAULT 0,
    "eventName" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoveHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerHistory" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT,
    "questionId" TEXT,
    "selectedOption" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceStatus" (
    "id" TEXT NOT NULL,
    "kind" "DeviceKind" NOT NULL,
    "name" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "port" INTEGER,
    "firmwareVersion" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "health" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ButtonEvent" (
    "id" TEXT NOT NULL,
    "gameId" TEXT,
    "button" TEXT NOT NULL,
    "pressed" BOOLEAN NOT NULL,
    "source" "DeviceKind" NOT NULL DEFAULT 'ARDUINO_NANO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ButtonEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL DEFAULT 'Parchis Inclusivo Multisensorial',
    "logoUrl" TEXT,
    "playerCount" INTEGER NOT NULL DEFAULT 4,
    "tileCount" INTEGER NOT NULL DEFAULT 28,
    "timeoutSeconds" INTEGER NOT NULL DEFAULT 20,
    "volume" INTEGER NOT NULL DEFAULT 70,
    "esp32Ip" TEXT,
    "websocketPort" INTEGER NOT NULL DEFAULT 4000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalReport" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "winnerColor" "PlayerColor",
    "bestEducationalColor" "PlayerColor",
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "incorrectAnswers" INTEGER NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "summary" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinalReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "GameSession_publicId_key" ON "GameSession"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_gameId_color_key" ON "GamePlayer"("gameId", "color");

-- CreateIndex
CREATE UNIQUE INDEX "BoardTile_index_key" ON "BoardTile"("index");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceStatus_kind_key" ON "DeviceStatus"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "FinalReport_gameId_key" ON "FinalReport"("gameId");

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardTile" ADD CONSTRAINT "BoardTile_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardTile" ADD CONSTRAINT "BoardTile_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "AudioAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "AudioAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveHistory" ADD CONSTRAINT "MoveHistory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveHistory" ADD CONSTRAINT "MoveHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerHistory" ADD CONSTRAINT "AnswerHistory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerHistory" ADD CONSTRAINT "AnswerHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerHistory" ADD CONSTRAINT "AnswerHistory_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalReport" ADD CONSTRAINT "FinalReport_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
