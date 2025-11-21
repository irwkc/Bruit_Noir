-- AlterTable
ALTER TABLE "User" ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "siteLocked" BOOLEAN NOT NULL DEFAULT false,
    "siteLockPassword" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- Set existing admin as super admin
UPDATE "User" SET "isSuperAdmin" = true WHERE "role" = 'admin' LIMIT 1;

