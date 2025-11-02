-- Mark the failed migration as rolled back in _prisma_migrations table
-- This allows Prisma to continue with new migrations
UPDATE _prisma_migrations
SET finished_at = NOW(), success = true
WHERE migration_name = '20251102_add_user_role_enum' AND success = false;
