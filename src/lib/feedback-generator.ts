/**
 * Comprehensive Feedback Generation
 * Uses AI to generate structured, actionable feedback for resume improvement
 */

import OpenAI from "openai";
import { z } from "zod";

import type { ComprehensiveFeedback, SkillMatchResult, JobRequirements } from "./types/analysis";

const ComprehensiveFeedbackSchema = z.object({
  strengthAreas: z.array(z.string()).min(3).max(5),
  improvementAreas: z.array(z.string()).min(3).max(5),
  experienceGaps: z.array(z.string()),
  relevantExperiences: z.array(z.string()),
  atsTips: z.array(z.string()).min(5).max(7),
  suggestedBullets: z.array(z.string()).min(5).max(8),
});

function isAiEnabled(): boolean {
  return (
    Boolean(process.env.OPENAI_API_KEY) &&
    (process.env.ENABLE_AI_SUGGESTIONS ?? "true").toLowerCase() !== "false"
  );
}

function isMockMode(): boolean {
  return (process.env.MOCK_AI_SUGGESTIONS ?? "false").toLowerCase() === "true";
}

/**
 * Generate comprehensive feedback for resume improvement
 */
export async function generateComprehensiveFeedback(params: {
  resumeText: string;
  jobDescription: string;
  domain: string;
  skillMatches: SkillMatchResult[];
  jobRequirements: JobRequirements;
}): Promise<ComprehensiveFeedback> {
  if (!isAiEnabled() || isMockMode()) {
    return getMockComprehensiveFeedback(params.domain);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  // Prepare skill analysis summary
  const matchedSkills = params.skillMatches
    .filter((m) => m.relevance === "high")
    .map((m) => m.resumeSkill)
    .slice(0, 10);

  const missingSkills = params.jobRequirements.required_skills
    .filter(
      (skill) =>
        !params.skillMatches.some(
          (m) => m.jobSkill.toLowerCase().includes(skill.toLowerCase()) && m.relevance !== "low",
        ),
    )
    .slice(0, 10);

  const systemPrompt = `You are an expert career advisor specializing in ${params.domain}. Analyze this resume against the job description and provide comprehensive, actionable feedback.

Your goal is to help the candidate improve their resume to better match the job requirements while being honest and encouraging.

Return a JSON object with:
1. strengthAreas: 3-5 specific strengths this candidate has (be specific, reference actual experiences)
2. improvementAreas: 3-5 areas where the candidate can improve (be constructive and actionable)
3. experienceGaps: List of relevant experience or qualifications missing from the resume
4. relevantExperiences: Which specific resume experiences or achievements align well with the role
5. atsTips: 5-7 specific ATS (Applicant Tracking System) optimization recommendations
6. suggestedBullets: 5-8 rewritten bullet points that better match the JD (use STAR method, include metrics)

Guidelines:
- Be specific and reference actual content from the resume
- Be encouraging but honest about gaps
- Focus on immediate, actionable improvements
- For suggestedBullets, rewrite existing experiences to better align with the job
- Use industry-standard terminology for ${params.domain}
- ATS tips should be concrete (e.g., "Add 'Python' to skills section" not "improve keywords")
- Return only valid JSON, no additional text`;

  const userPrompt = `Resume:
${params.resumeText}

Job Description:
${params.jobDescription}

Skill Analysis:
- Matched Skills (High Relevance): ${matchedSkills.join(", ") || "None"}
- Missing Required Skills: ${missingSkills.join(", ") || "None"}
- Experience Requirements: ${params.jobRequirements.experience_requirements.join(", ")}

Provide comprehensive feedback in JSON format.`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);
    const validated = ComprehensiveFeedbackSchema.safeParse(parsed);

    if (!validated.success) {
      console.error("Feedback generation validation failed:", validated.error);
      return getMockComprehensiveFeedback(params.domain);
    }

    return validated.data;
  } catch (error) {
    console.error("Feedback generation failed:", error);
    return getMockComprehensiveFeedback(params.domain);
  }
}

// Mock function for development
function getMockComprehensiveFeedback(domain: string): ComprehensiveFeedback {
  return {
    strengthAreas: [
      `Strong technical foundation in ${domain} with demonstrated hands-on experience`,
      "Excellent track record of leading teams and mentoring junior developers",
      "Clear evidence of problem-solving skills with quantifiable impact",
      "Good balance of technical and soft skills relevant to the role",
    ],
    improvementAreas: [
      "Consider adding more specific metrics to quantify achievements (e.g., performance improvements, team size)",
      "Highlight experience with modern tools and frameworks mentioned in the job description",
      "Expand on leadership experiences to better align with senior-level expectations",
    ],
    experienceGaps: [
      "No explicit mention of cloud platform experience (AWS/Azure/GCP)",
      "Limited evidence of experience with CI/CD pipelines and DevOps practices",
      "Missing specific examples of cross-functional collaboration",
    ],
    relevantExperiences: [
      "Led TypeScript migration project - directly relevant to role requirements",
      "Experience with React and modern web development aligns well",
      "Demonstrated leadership through team management and mentorship",
      "Strong track record of delivering projects on time",
    ],
    atsTips: [
      "Add a 'Technical Skills' section with explicit keywords: React, TypeScript, Node.js, etc.",
      "Include the exact job title or similar variations in your resume",
      "Use standard section headers: 'Experience', 'Education', 'Skills' for better ATS parsing",
      "Spell out acronyms on first use (e.g., 'Continuous Integration/Continuous Deployment (CI/CD)')",
      "Include years of experience prominently (e.g., '5+ years of React development')",
      "Use bullet points instead of paragraphs for better ATS readability",
    ],
    suggestedBullets: [
      "Led a team of 5 developers in migrating a legacy application to React and TypeScript, resulting in 40% faster load times and improved developer productivity",
      "Architected and implemented a microservices-based solution using Node.js and Docker, reducing deployment time by 60% and improving system scalability",
      "Mentored 3 junior developers, conducting weekly code reviews and pair programming sessions, resulting in 2 promotions within 12 months",
      "Collaborated with product managers and designers to deliver 15+ user-facing features, maintaining 98% on-time delivery rate",
      "Implemented comprehensive testing strategy using Jest and React Testing Library, achieving 85% code coverage and reducing production bugs by 50%",
    ],
  };
}
