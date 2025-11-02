-- Create UserRole enum type
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'STUDENT');

-- Alter User table to use the enum instead of TEXT
ALTER TABLE "User"
ALTER COLUMN "role" SET DEFAULT 'STUDENT'::"UserRole",
ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";

-- Update frontend types to include new role values
-- This is just for documentation - frontend is already updated
