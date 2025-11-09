-- AlterTable - Add new translation columns
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "titleEn" TEXT;
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "titleBg" TEXT;
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT;
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "descriptionBg" TEXT;

-- Drop old unique constraint
ALTER TABLE "Topic" DROP CONSTRAINT IF EXISTS "Topic_section_title_key";

-- Create new unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "Topic_section_titleEn_key" ON "Topic"("section", "titleEn");
