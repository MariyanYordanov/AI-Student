-- This migration resolves the failed enum migration
-- The previous attempt to create an enum failed, so we keep role as STRING

-- If the enum was partially created, drop it
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- Ensure role column is TEXT/STRING (it should be by default)
-- No changes needed as the schema already defines it as String
