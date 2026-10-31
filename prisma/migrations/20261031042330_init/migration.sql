-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "EventTag" AS ENUM ('BOOTCAMP', 'BUILD', 'TALK', 'NETWORKING', 'COMMUNITY_DAY');

-- CreateEnum
CREATE TYPE "EventFormat" AS ENUM ('IN_PERSON', 'ONLINE');

-- CreateEnum
CREATE TYPE "RoleGroup" AS ENUM ('LEADER', 'TECHNICAL', 'EVENTS', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('CAMPUS', 'SPONSOR', 'COMMUNITY');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tag" "EventTag" NOT NULL,
    "format" "EventFormat" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "meetupUrl" TEXT,
    "coverImage" TEXT,
    "photos" TEXT[],
    "attendance" INTEGER,
    "recapPostId" TEXT,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roleGroup" "RoleGroup" NOT NULL,
    "programme" TEXT,
    "level" TEXT,
    "photoUrl" TEXT,
    "linkedin" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "logoUrl" TEXT,
    "url" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT,
    "externalUrl" TEXT,
    "coverImage" TEXT,
    "author" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "email" TEXT NOT NULL,
    "meetupUrl" TEXT NOT NULL,
    "whatsappUrl" TEXT,
    "builderCenterUrl" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "instagramUrl" TEXT,
    "xUrl" TEXT,
    "membersCount" INTEGER,
    "departmentsCount" INTEGER,
    "announcementText" TEXT,
    "announcementUrl" TEXT,
    "announcementActive" BOOLEAN NOT NULL DEFAULT false,
    "scdPageEnabled" BOOLEAN NOT NULL DEFAULT false,
    "uccCrestApproved" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
