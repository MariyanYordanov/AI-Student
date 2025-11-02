-- Add user preferences
ALTER TABLE "User" ADD COLUMN "preferredTheme" TEXT NOT NULL DEFAULT 'light';
ALTER TABLE "User" ADD COLUMN "preferredLanguage" TEXT NOT NULL DEFAULT 'en';

-- Create AilyInstance table
CREATE TABLE "AilyInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "currentCharacterId" TEXT NOT NULL DEFAULT 'curious-explorer',
    "level" INTEGER NOT NULL DEFAULT 0,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AilyInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Update Knowledge table to support both AilyInstance and AIStudent
ALTER TABLE "Knowledge" ADD COLUMN "ailyInstanceId" TEXT;

-- Add foreign key for AilyInstance
ALTER TABLE "Knowledge" ADD CONSTRAINT "Knowledge_ailyInstanceId_fkey" FOREIGN KEY ("ailyInstanceId") REFERENCES "AilyInstance" ("id") ON DELETE CASCADE;

-- Make aiStudentId nullable
ALTER TABLE "Knowledge" ALTER COLUMN "aiStudentId" DROP NOT NULL;

-- Add new unique constraint for AilyInstance
ALTER TABLE "Knowledge" ADD CONSTRAINT "Knowledge_ailyInstanceId_concept_key" UNIQUE("ailyInstanceId", "concept");

-- Update Session table to support both AilyInstance and AIStudent
ALTER TABLE "Session" ADD COLUMN "ailyInstanceId" TEXT;

-- Add foreign key for AilyInstance
ALTER TABLE "Session" ADD CONSTRAINT "Session_ailyInstanceId_fkey" FOREIGN KEY ("ailyInstanceId") REFERENCES "AilyInstance" ("id") ON DELETE CASCADE;

-- Make aiStudentId nullable
ALTER TABLE "Session" ALTER COLUMN "aiStudentId" DROP NOT NULL;
