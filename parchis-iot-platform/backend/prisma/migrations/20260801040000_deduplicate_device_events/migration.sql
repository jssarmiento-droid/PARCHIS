ALTER TABLE "MoveHistory" ADD COLUMN "eventId" TEXT;
CREATE UNIQUE INDEX "MoveHistory_eventId_key" ON "MoveHistory"("eventId");
