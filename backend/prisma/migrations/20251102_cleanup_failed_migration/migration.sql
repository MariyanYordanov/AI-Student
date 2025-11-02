-- Delete the failed migration from _prisma_migrations table
-- This allows Prisma to proceed without P3009 error
DELETE FROM _prisma_migrations
WHERE migration_name = '20251102_add_user_role_enum';
