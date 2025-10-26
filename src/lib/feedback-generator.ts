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

IMPORTANT - Experience Analysis Guidelines:
1. Look for the "Experience", "Work History", or "Employment" section in the resume
2. Find employment date ranges (e.g., "Jan 2018 - Present", "2019-2021", "2020-2022")
3. Calculate the total years of relevant experience from these dates
4. Do NOT treat experience requirements (e.g., "5+ years experience", "3+ years") as missing skills
5. Only flag experience gaps if the calculated years don't meet the requirement
6. If dates are present, use them for analysis; don't rely on keyword matching
7. Focus on QUALITY and RELEVANCE of experience, not just quantity

CRITICAL - Strength Analysis Guidelines:
1. strengthAreas should ONLY include strengths that are RELEVANT to the ${params.domain} role
2. If the resume is from a different domain, focus on TRANSFERABLE skills (leadership, communication, problem-solving)
3. Do NOT highlight domain-specific technical skills that are irrelevant to the job
4. If there's a major domain mismatch, acknowledge it honestly in improvementAreas
5. Example: For an HR role, highlight "team management" not "React development"

Return a JSON object with:
1. strengthAreas: 3-5 specific strengths that are RELEVANT to this ${params.domain} role (focus on transferable skills if domain mismatch)
2. improvementAreas: 3-5 areas where the candidate can improve (be constructive and actionable)
3. experienceGaps: List of relevant experience or qualifications missing from the resume (NOT years of experience)
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
- Experience Requirements from JD: ${params.jobRequirements.experience_requirements.join(", ")}

Domain Context:
- Target Role Domain: ${params.domain}
- Resume appears to be from: [analyze the resume's primary domain]

IMPORTANT: 
- Experience requirements (like "5+ years", "3+ years experience") are NOT skills to be matched
- Analyze the actual work history dates in the resume to validate experience claims
- Only flag experience gaps if the calculated years don't meet the stated requirements
- Focus on missing QUALITY of experience (e.g., "No leadership experience", "No cloud platform experience") rather than quantity
- For strengthAreas, ONLY highlight skills/experiences that are relevant to ${params.domain}
- If there's a domain mismatch, focus on transferable skills in strengthAreas

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
  // Domain-specific mock responses
  const domainResponses = {
    "Human Resources": {
      strengthAreas: [
        "Demonstrated leadership experience managing teams and mentoring interns, which translates well to HR team management responsibilities",
        "Strong stakeholder engagement and communication skills, evidenced by regular collaboration with Product Managers and cross-functional teams",
        "Experience in process improvement and optimization, as shown through CI/CD pipeline implementation, which is valuable for HR process development",
        "Proven ability to manage multiple priorities and deliver projects on time, a critical skill for HR operations",
      ],
      improvementAreas: [
        "Consider gaining direct experience in HR functions such as compensation and benefits administration, employee onboarding, and performance management",
        "Include any relevant HR coursework or certifications to demonstrate commitment to transitioning into HR",
        "Add a summary statement highlighting transferable skills from software development to HR",
        "Expand the skills section to include HR-specific competencies like employee relations and performance management",
      ],
      experienceGaps: [
        "No direct experience in compensation and benefits administration",
        "Limited evidence of experience with employee onboarding processes",
        "Missing specific examples of performance management and review processes",
      ],
      relevantExperiences: [
        "Led two sub-teams and managed multiple interns - demonstrates leadership and team management skills",
        "Engaged with Product Managers and stakeholders - shows communication and collaboration abilities",
        "Conducted code reviews and architecture discussions - indicates attention to detail and process orientation",
      ],
      atsTips: [
        "Add 'Human Resources' and related keywords to the skills section",
        "Include any HR coursework or certifications in a separate section",
        "Use clear headings and bullet points for better ATS readability",
        "Incorporate HR action verbs like 'administered', 'developed', and 'implemented'",
        "Ensure resume is in standard ATS-friendly format",
      ],
      suggestedBullets: [
        "Led cross-functional teams and mentored interns, fostering collaborative environments and improving team productivity",
        "Engaged with stakeholders to gather requirements and align project goals, demonstrating strong communication and relationship-building skills",
        "Implemented process improvements that enhanced efficiency and reduced delivery times, showcasing optimization and problem-solving abilities",
        "Managed multiple concurrent projects while maintaining high quality standards, indicating strong organizational and time management skills",
        "Conducted thorough analysis and documentation of project requirements, highlighting attention to detail and systematic approach to work",
      ],
    },
    "Software Engineering": {
      strengthAreas: [
        "Strong technical foundation with demonstrated hands-on experience in modern web development",
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
        "Use standard section headers: 'Experience', 'Education', 'Skills'",
        "Spell out acronyms on first use (e.g., 'CI/CD')",
        "Include years of experience prominently",
        "Use bullet points instead of paragraphs for better readability",
      ],
      suggestedBullets: [
        "Led a team of 5 developers in migrating a legacy application to React and TypeScript, resulting in 40% faster load times",
        "Architected and implemented microservices using Node.js and Docker, reducing deployment time by 60%",
        "Mentored 3 junior developers through code reviews and pair programming, resulting in 2 promotions within 12 months",
        "Collaborated with product managers to deliver 15+ features, maintaining 98% on-time delivery rate",
        "Implemented testing strategy using Jest, achieving 85% code coverage and reducing production bugs by 50%",
      ],
    },
  };

  // Default response for unknown domains
  const defaultResponse = {
    strengthAreas: [
      "Strong analytical and problem-solving skills demonstrated through project work",
      "Excellent communication and collaboration abilities",
      "Proven track record of delivering results and meeting deadlines",
      "Adaptable and quick learner with diverse experience",
    ],
    improvementAreas: [
      "Consider adding more specific metrics to quantify achievements",
      "Highlight experience relevant to the target role",
      "Expand on transferable skills that align with job requirements",
    ],
    experienceGaps: [
      "Limited direct experience in the target domain",
      "Missing specific skills mentioned in the job description",
    ],
    relevantExperiences: [
      "Demonstrated leadership and team management skills",
      "Strong communication and stakeholder engagement abilities",
      "Proven ability to deliver projects on time and within scope",
    ],
    atsTips: [
      "Add relevant keywords from the job description to your skills section",
      "Use clear headings and bullet points for better readability",
      "Include quantifiable achievements where possible",
      "Ensure resume is in standard ATS-friendly format",
    ],
    suggestedBullets: [
      "Led cross-functional teams to deliver projects on time and within scope",
      "Collaborated with stakeholders to gather requirements and align on project goals",
      "Implemented process improvements that enhanced efficiency and productivity",
      "Managed multiple priorities while maintaining high quality standards",
      "Demonstrated strong problem-solving and analytical skills in complex projects",
    ],
  };

  const response = domainResponses[domain as keyof typeof domainResponses] || defaultResponse;

  return {
    strengthAreas: response.strengthAreas,
    improvementAreas: response.improvementAreas,
    experienceGaps: response.experienceGaps,
    relevantExperiences: response.relevantExperiences,
    atsTips: response.atsTips,
    suggestedBullets: response.suggestedBullets,
  };
}
