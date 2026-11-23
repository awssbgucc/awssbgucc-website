-- CreateEnum
CREATE TYPE "CertLevel" AS ENUM ('FOUNDATIONAL', 'ASSOCIATE', 'PROFESSIONAL', 'SPECIALTY');

-- CreateEnum
CREATE TYPE "CertPathway" AS ENUM ('BOOTCAMP_VOUCHER', 'AMALITECH', 'SELF_STUDY', 'OTHER');

-- CreateTable
CREATE TABLE "MemberCertification" (
    "id" TEXT NOT NULL,
    "memberName" TEXT NOT NULL,
    "programme" TEXT,
    "levelOfStudy" TEXT,
    "certName" TEXT NOT NULL,
    "certCode" TEXT,
    "certLevel" "CertLevel" NOT NULL DEFAULT 'FOUNDATIONAL',
    "pathway" "CertPathway",
    "credlyUrl" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberCertification_pkey" PRIMARY KEY ("id")
);
