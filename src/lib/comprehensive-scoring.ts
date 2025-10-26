/**
 * Comprehensive Multi-Dimensional Resume Scoring
 *
 * Implements 6-dimensional scoring with dynamic weights based on experience level:
 * 1. Experience Relevance (40% senior, 20% entry) - Quality of past work
 * 2. Skills Match (25% senior, 30% entry) - Technical + soft skills
 * 3. Experience Duration (15%) - Years in relevant domain
 * 4. Education (10% senior, 30% entry) - Degree level and relevance
 * 5. Achievements (5% senior, 10% entry) - Awards, competitions, publications
 * 6. ATS Optimization (5%) - Formatting and keywords
 */

import OpenAI from "openai";
import { z } from "zod";

import { isAiEnabled, isMockMode } from "./ai";
import {
  ScoringWeights,
  SkillMatchResult,
  JobRequirements,
} from "./types/analysis";

// Zod schemas for AI responses
const ExperienceRelevanceSchema = z.object({
  score: z.number().min(0).max(100),
  reasoning: z.string(),
});

const EducationScoreSchema = z.object({
  score: z.number().min(0).max(100),
  reasoning: z.string(),
});

const AchievementsScoreSchema = z.object({
  score: z.number().min(0).max(100),
  reasoning: z.string(),
});

// Dynamic weight calculation based on experience level
export function getWeightsForExperienceLevel(totalYears: number): ScoringWeights {
  if (totalYears < 2) {
    // Entry-level: Education and achievements matter more
    return {
      experienceRelevance: 0.2, // Less experience to evaluate
      skills: 0.3, // Skills matter more
      experienceDuration: 0.05, // Can't have much
      education: 0.3, // MUCH more important
      achievements: 0.1, // Academic achievements matter
      ats: 0.05,
    };
  } else if (totalYears >= 2 && totalYears < 6) {
    // Mid-level: Balanced approach
    return {
      experienceRelevance: 0.35,
      skills: 0.3,
      experienceDuration: 0.15,
      education: 0.15,
      achievements: 0.05,
      ats: 0.05,
    };
  } else {
    // Senior-level: Experience matters most
    return {
      experienceRelevance: 0.4, // Experience quality is primary
      skills: 0.25, // Skills still important
      experienceDuration: 0.15, // Duration matters
      education: 0.1, // Less important for seniors
      achievements: 0.05, // Nice bonus
      ats: 0.05, // Least important
    };
  }
}

// Extract years of experience from resume text
export function extractYearsOfExperience(resumeText: string): number {
  const experienceSection = extractSection(resumeText, [
    "EXPERIENCE",
    "WORK HISTORY",
    "EMPLOYMENT",
    "PROFESSIONAL EXPERIENCE",
  ]);

  if (!experienceSection) {
    console.log("No experience section found");
    return 0;
  }

  console.log("Experience section found:", experienceSection.substring(0, 200) + "...");

  // Look for date patterns - enhanced to handle month names
  const datePatterns = [
    // Month Year - Month Year (e.g., "December 2021 - Present", "July 2020 - November 2021")
    /(\w+\s+\d{4})\s*-\s*(\w+\s+\d{4})/g, // Dec 2021 - Nov 2021
    /(\w+\s+\d{4})\s*-\s*Present/g, // Dec 2021 - Present
    /(\w+\s+\d{4})\s*-\s*Current/g, // Dec 2021 - Current
    // Numeric patterns (fallback)
    /(\d{4})\s*-\s*(\d{4})/g, // 2020-2021
    /(\d{4})\s*-\s*Present/g, // 2020-Present
    /(\d{4})\s*-\s*Current/g, // 2020-Current
  ];

  const years: number[] = [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11

  // Month name to number mapping
  const monthMap: Record<string, number> = {
    january: 0,
    jan: 0,
    february: 1,
    feb: 1,
    march: 2,
    mar: 2,
    april: 3,
    apr: 3,
    may: 4,
    june: 5,
    jun: 5,
    july: 6,
    jul: 6,
    august: 7,
    aug: 7,
    september: 8,
    sep: 8,
    sept: 8,
    october: 9,
    oct: 9,
    november: 10,
    nov: 10,
    december: 11,
    dec: 11,
  };

  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(experienceSection)) !== null) {
      console.log("Date match found:", match[0]);

      if (
        match[2] &&
        match[2].toLowerCase() !== "present" &&
        match[2].toLowerCase() !== "current"
      ) {
        // Two dates provided (month year - month year)
        const startDate = parseMonthYear(match[1], monthMap);
        const endDate = parseMonthYear(match[2], monthMap);

        if (startDate && endDate) {
          const durationYears =
            endDate.year - startDate.year + (endDate.month - startDate.month) / 12;
          years.push(Math.max(0, durationYears));
          console.log(`Duration: ${durationYears.toFixed(2)} years (${match[1]} to ${match[2]})`);
        }
      } else if (match[1]) {
        // One date + Present/Current
        const startDate = parseMonthYear(match[1], monthMap);

        if (startDate) {
          const durationYears =
            currentYear - startDate.year + (currentMonth - startDate.month) / 12;
          years.push(Math.max(0, durationYears));
          console.log(`Duration: ${durationYears.toFixed(2)} years (${match[1]} to Present)`);
        }
      }
    }
  }

  // Sum all years (handles multiple jobs)
  const totalYears = years.reduce((sum, year) => sum + year, 0);

  console.log("Total years calculated:", totalYears);

  // Cap at reasonable maximum (e.g., 20 years)
  return Math.min(totalYears, 20);
}

// Helper function to parse "Month Year" format
function parseMonthYear(
  dateStr: string,
  monthMap: Record<string, number>,
): { year: number; month: number } | null {
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length !== 2) return null;

  const monthName = parts[0].toLowerCase();
  const year = parseInt(parts[1]);

  if (isNaN(year) || !monthMap[monthName]) return null;

  return {
    year,
    month: monthMap[monthName],
  };
}

// Extract specific section from resume text
function extractSection(text: string, sectionNames: string[]): string | null {
  const lines = text.split("\n");
  let inSection = false;
  let sectionContent: string[] = [];

  for (const line of lines) {
    const upperLine = line.toUpperCase().trim();

    // Check if this line starts a new section
    const isNewSection = sectionNames.some((name) => upperLine.includes(name.toUpperCase()));

    if (isNewSection) {
      inSection = true;
      sectionContent = [line];
      continue;
    }

    // Check if we hit another major section (all caps, short)
    if (
      inSection &&
      upperLine.length > 0 &&
      upperLine.length < 50 &&
      upperLine === upperLine &&
      !upperLine.includes(" ") &&
      !sectionNames.some((name) => upperLine.includes(name.toUpperCase()))
    ) {
      break;
    }

    if (inSection) {
      sectionContent.push(line);
    }
  }

  return sectionContent.length > 0 ? sectionContent.join("\n") : null;
}

// 1. Experience Relevance Scoring (40% weight for senior)
export async function scoreExperienceRelevance(params: {
  resumeText: string;
  jobDescription: string;
  domain: string;
}): Promise<number> {
  if (!isAiEnabled() || isMockMode()) {
    return getMockExperienceRelevanceScore(params.domain);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `You are an expert recruiter for ${params.domain} roles. Analyze the QUALITY and RELEVANCE of the candidate's work experience.

Focus on:
1. **Task Complexity** (40 points)
   - Did they work on complex, challenging projects?
   - Did they solve difficult technical/business problems?
   - Did they handle multiple responsibilities?

2. **Impact & Outcomes** (30 points)
   - Did they deliver measurable results?
   - Did they improve processes, performance, or business outcomes?
   - Did they lead initiatives that had significant impact?

3. **Relevance to Target Role** (20 points)
   - How well does their experience align with the job requirements?
   - Do they have experience with similar technologies/processes?
   - Do they understand the domain and challenges?

4. **Leadership & Collaboration** (10 points)
   - Did they lead teams or mentor others?
   - Did they collaborate effectively with stakeholders?
   - Did they drive initiatives or just follow instructions?

IMPORTANT:
- Focus on WHAT they accomplished, not just WHERE they worked
- Look for specific achievements, metrics, and outcomes
- Consider the seniority level - senior roles expect more complex work
- Domain mismatch is OK if they show transferable skills

Return JSON:
{
  "score": 85,
  "reasoning": "Led TypeScript migration and React development with measurable impact..."
}`;

    const userPrompt = `Resume Experience Section:
${extractSection(params.resumeText, ["EXPERIENCE", "WORK HISTORY", "EMPLOYMENT"]) || "No experience section found"}

Job Description:
${params.jobDescription}

Target Role Domain: ${params.domain}

Score the candidate's EXPERIENCE RELEVANCE (0-100) based on task complexity, impact, relevance, and leadership.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const parsed = JSON.parse(content);
    const validated = ExperienceRelevanceSchema.parse(parsed);

    return validated.score;
  } catch (error) {
    console.error("Experience relevance scoring failed:", error);
    return getMockExperienceRelevanceScore(params.domain);
  }
}

// 2. Skills Match Scoring (25% weight for senior)
export function calculateSkillsScore(
  matchedSkills: SkillMatchResult[],
  missingSkills: { skill: string; priority: string }[],
): number {
  if (matchedSkills.length === 0) return 0;

  // Calculate weighted score based on relevance
  const highRelevanceCount = matchedSkills.filter((s) => s.relevance === "high").length;
  const mediumRelevanceCount = matchedSkills.filter((s) => s.relevance === "medium").length;
  const lowRelevanceCount = matchedSkills.filter((s) => s.relevance === "low").length;

  // Weighted score: high=100, medium=70, low=40
  const weightedScore =
    highRelevanceCount * 100 + mediumRelevanceCount * 70 + lowRelevanceCount * 40;
  const totalPossibleScore = matchedSkills.length * 100;

  // Penalty for missing critical skills
  const criticalMissing = missingSkills.filter((s) => s.priority === "critical").length;
  const penalty = criticalMissing * 10; // 10 points per critical missing skill

  const finalScore = Math.max(0, (weightedScore / totalPossibleScore) * 100 - penalty);
  return Math.round(finalScore);
}

// 3. Experience Duration Scoring (15% weight)
export async function scoreExperienceDuration(params: {
  resumeText: string;
  requiredYears: number;
}): Promise<number> {
  const actualYears = extractYearsOfExperience(params.resumeText);

  if (actualYears >= params.requiredYears) {
    return 100; // Meets or exceeds requirement
  } else if (actualYears >= params.requiredYears * 0.8) {
    return 80; // Close to requirement
  } else if (actualYears >= params.requiredYears * 0.6) {
    return 60; // Somewhat below
  } else if (actualYears >= params.requiredYears * 0.4) {
    return 40; // Significantly below
  } else {
    return 20; // Far below requirement
  }
}

// 4. Education Scoring (10% weight for senior, 30% for entry)
export async function scoreEducation(params: {
  resumeText: string;
  jobDescription: string;
  domain: string;
}): Promise<number> {
  if (!isAiEnabled() || isMockMode()) {
    return getMockEducationScore(params.domain);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `You are an expert recruiter for ${params.domain} roles. Score the candidate's EDUCATION (0-100).

Consider:
1. **Degree Level** (40 points)
   - Does degree level match requirements? (Bachelor's, Master's, PhD)
   - Is the degree relevant to the role?
   
2. **Field of Study** (30 points)
   - Is the major/specialization relevant?
   - Does it provide foundational knowledge for the role?
   
3. **Academic Performance** (20 points)
   - GPA, honors, distinctions
   - Academic achievements
   
4. **Institution Reputation** (10 points)
   - Well-known institution in the domain
   - Accreditation and recognition

IMPORTANT:
- For senior roles (6+ years), education matters less (weight down)
- For entry-level roles, education matters more (weight up)
- Relevant certifications can compensate for degree gaps
- Self-taught + strong experience can compensate for formal education

Example Scoring:
- Bachelor's in CS for Software Engineer → 90/100
- Bachelor's in Unrelated + Bootcamp → 70/100
- Master's in CS for Software Engineer → 100/100
- No degree but 10 years experience → 60/100 (experience compensates)

Return JSON:
{
  "score": 85,
  "reasoning": "Bachelor's in Computer Science from NIT is highly relevant..."
}`;

    const userPrompt = `Resume Education Section:
${extractSection(params.resumeText, ["EDUCATION", "ACADEMIC BACKGROUND", "QUALIFICATIONS"]) || "No education section found"}

Job Requirements:
${params.jobDescription}

Target Role Domain: ${params.domain}

Score the candidate's EDUCATION (0-100).`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const parsed = JSON.parse(content);
    const validated = EducationScoreSchema.parse(parsed);

    return validated.score;
  } catch (error) {
    console.error("Education scoring failed:", error);
    return getMockEducationScore(params.domain);
  }
}

// 5. Achievements Scoring (5% weight for senior, 10% for entry)
export async function scoreAchievements(params: {
  resumeText: string;
  jobDescription: string;
  domain: string;
}): Promise<number> {
  if (!isAiEnabled() || isMockMode()) {
    return getMockAchievementsScore(params.domain);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `You are an expert recruiter for ${params.domain} roles. Score the candidate's ACHIEVEMENTS (0-100).

Consider:
1. **Relevance** (40 points)
   - Are achievements related to the target role?
   - Do they demonstrate relevant skills?
   
2. **Prestige/Impact** (30 points)
   - Competitive achievements (top rankings, awards)
   - Recognition from reputable organizations
   
3. **Recency** (20 points)
   - Recent achievements show continued growth
   - Older achievements still valuable but less weighted
   
4. **Quantity** (10 points)
   - Multiple achievements show consistent excellence
   - Diverse achievements show versatility

Examples of Strong Achievements:
- Software: Hackathon wins, open source contributions, tech competitions
- Healthcare: Published research, patient care awards, certifications
- Finance: CFA/CPA certifications, case competition wins
- Marketing: Campaign awards, published articles, speaking engagements

IMPORTANT:
- No achievements is OK (score 50/100 baseline)
- Relevant achievements boost score significantly
- Irrelevant achievements have minimal impact

Return JSON:
{
  "score": 75,
  "reasoning": "1st place in Schrodinger Hackathon and 71st in Google Hashcode..."
}`;

    const userPrompt = `Resume Achievements/Awards Section:
${extractSection(params.resumeText, ["ACHIEVEMENTS", "AWARDS", "HONORS", "CERTIFICATIONS", "COMPETITIONS"]) || "No achievements section found"}

Job Context:
${params.jobDescription}

Target Role Domain: ${params.domain}

Score the candidate's ACHIEVEMENTS (0-100).`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const parsed = JSON.parse(content);
    const validated = AchievementsScoreSchema.parse(parsed);

    return validated.score;
  } catch (error) {
    console.error("Achievements scoring failed:", error);
    return getMockAchievementsScore(params.domain);
  }
}

// 6. ATS Score (5% weight) - Keep existing implementation
export function calculateATSScore(resumeText: string, jobRequirements: JobRequirements): number {
  // Simple ATS scoring based on keyword density and formatting
  const requiredKeywords = jobRequirements.all_required_skills;
  const resumeLower = resumeText.toLowerCase();

  let matchedKeywords = 0;
  for (const keyword of requiredKeywords) {
    if (resumeLower.includes(keyword.toLowerCase())) {
      matchedKeywords++;
    }
  }

  const keywordScore = (matchedKeywords / requiredKeywords.length) * 100;

  // Formatting score (simple heuristics)
  const hasBulletPoints = resumeText.includes("•") || resumeText.includes("-");
  const hasSections = resumeText.includes("EXPERIENCE") && resumeText.includes("EDUCATION");
  const formattingScore = (hasBulletPoints ? 50 : 0) + (hasSections ? 50 : 0);

  return Math.round(keywordScore * 0.7 + formattingScore * 0.3);
}

// Mock functions for development
function getMockExperienceRelevanceScore(domain: string): number {
  const mockScores: Record<string, number> = {
    "Software Engineering": 90,
    "Human Resources": 60,
    Healthcare: 70,
    Finance: 75,
    Marketing: 65,
  };
  return mockScores[domain] || 70;
}

function getMockEducationScore(domain: string): number {
  const mockScores: Record<string, number> = {
    "Software Engineering": 85,
    "Human Resources": 70,
    Healthcare: 90,
    Finance: 80,
    Marketing: 75,
  };
  return mockScores[domain] || 75;
}

function getMockAchievementsScore(domain: string): number {
  const mockScores: Record<string, number> = {
    "Software Engineering": 80,
    "Human Resources": 50,
    Healthcare: 70,
    Finance: 60,
    Marketing: 65,
  };
  return mockScores[domain] || 60;
}
