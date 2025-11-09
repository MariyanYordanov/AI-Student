-- AlterTable - Add new translation columns
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "titleEn" TEXT;
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "titleBg" TEXT;
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT;
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "descriptionBg" TEXT;

-- Drop old unique constraint
ALTER TABLE "Topic" DROP CONSTRAINT IF EXISTS "Topic_section_title_key";

-- Drop old columns (make them nullable first if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Topic' AND column_name = 'title') THEN
    ALTER TABLE "Topic" ALTER COLUMN "title" DROP NOT NULL;
    ALTER TABLE "Topic" DROP COLUMN "title";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Topic' AND column_name = 'description') THEN
    ALTER TABLE "Topic" ALTER COLUMN "description" DROP NOT NULL;
    ALTER TABLE "Topic" DROP COLUMN "description";
  END IF;
END $$;

-- Make new columns NOT NULL
ALTER TABLE "Topic" ALTER COLUMN "titleEn" SET NOT NULL;
ALTER TABLE "Topic" ALTER COLUMN "titleBg" SET NOT NULL;
ALTER TABLE "Topic" ALTER COLUMN "descriptionEn" SET NOT NULL;
ALTER TABLE "Topic" ALTER COLUMN "descriptionBg" SET NOT NULL;

-- Create new unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "Topic_section_titleEn_key" ON "Topic"("section", "titleEn");
