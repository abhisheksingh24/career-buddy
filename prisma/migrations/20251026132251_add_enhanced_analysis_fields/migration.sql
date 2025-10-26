-- AlterTable
ALTER TABLE "public"."ResumeAnalysis" ADD COLUMN     "atsScore" DOUBLE PRECISION,
ADD COLUMN     "atsTips" TEXT[],
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "experienceGaps" TEXT[],
ADD COLUMN     "improvementAreas" TEXT[],
ADD COLUMN     "matchedSkills" JSONB,
ADD COLUMN     "strengthAreas" TEXT[];
