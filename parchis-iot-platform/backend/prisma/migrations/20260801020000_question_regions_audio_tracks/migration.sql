CREATE TYPE "QuestionRegion" AS ENUM ('COSTA', 'SIERRA', 'AMAZONIA');

ALTER TABLE "Question"
ADD COLUMN "region" "QuestionRegion" NOT NULL DEFAULT 'COSTA',
ADD COLUMN "audioTrack" INTEGER;

WITH numbered_questions AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS number
  FROM "Question"
)
UPDATE "Question" AS question
SET "audioTrack" = 200 + numbered_questions.number
FROM numbered_questions
WHERE question."id" = numbered_questions."id";

ALTER TABLE "Question" ALTER COLUMN "audioTrack" SET NOT NULL;
CREATE UNIQUE INDEX "Question_audioTrack_key" ON "Question"("audioTrack");
