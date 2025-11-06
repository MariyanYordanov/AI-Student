-- Remove old aiStudentId foreign key constraint from Session
-- This allows sessions to work with only ailyInstanceId

-- Drop the old foreign key constraint
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_aiStudentId_fkey";

-- Make sure aiStudentId is nullable (should already be from previous migration)
ALTER TABLE "Session" ALTER COLUMN "aiStudentId" DROP NOT NULL;

-- Drop the old relation from Knowledge as well
ALTER TABLE "Knowledge" DROP CONSTRAINT IF EXISTS "Knowledge_aiStudentId_fkey";
ALTER TABLE "Knowledge" ALTER COLUMN "aiStudentId" DROP NOT NULL;
