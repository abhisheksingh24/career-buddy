/**
 * AI-Powered Skill Extraction Service
 * Domain-agnostic skill and requirement extraction using OpenAI
 */

import OpenAI from "openai";
import { z } from "zod";

import type { ExtractedSkills, JobRequirements } from "./types/analysis";

const ExtractedSkillsSchema = z.object({
  technical_skills: z.array(z.string()),
  soft_skills: z.array(z.string()),
  tools: z.array(z.string()),
  certifications: z.array(z.string()),
  domain_keywords: z.array(z.string()),
});

const JobRequirementsSchema = z.object({
  required_skills: z.array(z.string()),
  preferred_skills: z.array(z.string()),
  experience_requirements: z.array(z.string()),
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
 * Extract skills from resume or job description text
 */
export async function extractSkillsFromText(
  text: string,
  context: "resume" | "job_description",
  domain?: string,
): Promise<ExtractedSkills> {
  if (!isAiEnabled() || isMockMode()) {
    return getMockExtractedSkills(context, domain);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const domainContext = domain ? ` for a ${domain} position` : "";

  const systemPrompt = `You are an expert career advisor. Extract all relevant skills, qualifications, and keywords from the provided text.

Context: This is a ${context}${domainContext}.

Return a JSON object with EXACTLY this structure:
{
  "technical_skills": ["skill1", "skill2", "skill3"],
  "soft_skills": ["skill1", "skill2", "skill3"], 
  "tools": ["tool1", "tool2", "tool3"],
  "certifications": ["cert1", "cert2", "cert3"],
  "domain_keywords": ["keyword1", "keyword2", "keyword3"]
}

CRITICAL REQUIREMENTS:
- Each field must be an ARRAY of strings, not an object
- Do NOT nest skills in categories or subcategories
- Put all skills directly in the arrays
- Normalize variations (e.g., "React.js" → "React", "JavaScript" and "JS" → "JavaScript")
- Include both explicit mentions and implied skills
- For ${context === "resume" ? "resumes" : "job descriptions"}, focus on ${context === "resume" ? "demonstrated capabilities" : "required qualifications"}
- Return ONLY the JSON object, no additional text`;

  const userPrompt = `Extract skills from this ${context}:\n\n${text}`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content ?? "{}";
    console.log("AI Response:", content); // Add this line

    const parsed = JSON.parse(content);
    console.log("Parsed JSON:", parsed); // Add this line

    const validated = ExtractedSkillsSchema.safeParse(parsed);

    if (!validated.success) {
      console.error("Skill extraction validation failed:", validated.error);
      console.error("AI returned:", parsed); // Add this line
      return getMockExtractedSkills(context, domain);
    }

    const skills = validated.data;
    return {
      ...skills,
      all_skills: [
        ...skills.technical_skills,
        ...skills.soft_skills,
        ...skills.tools,
        ...skills.certifications,
        ...skills.domain_keywords,
      ],
    };
  } catch (error) {
    console.error("Skill extraction failed:", error);
    return getMockExtractedSkills(context, domain);
  }
}

/**
 * Extract structured requirements from job description
 */
export async function extractJobRequirements(
  jobDescription: string,
  domain?: string,
): Promise<JobRequirements> {
  if (!isAiEnabled() || isMockMode()) {
    return getMockJobRequirements(domain);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const domainContext = domain ? ` in ${domain}` : "";

  const systemPrompt = `You are an expert career advisor. Extract and categorize job requirements from the job description.

Context: This is a job description${domainContext}.

Return a JSON object with EXACTLY this structure:
{
  "required_skills": ["skill1", "skill2", "skill3"],
  "preferred_skills": ["skill1", "skill2", "skill3"],
  "experience_requirements": ["requirement1", "requirement2", "requirement3"]
}

CRITICAL REQUIREMENTS:
- Each field must be an ARRAY of strings, not an object
- Do NOT nest requirements in categories
- Put all requirements directly in the arrays
- Distinguish between "required" and "preferred" carefully
- Look for keywords like "must have", "required", "essential" vs "nice to have", "preferred", "bonus"
- Normalize skill names (e.g., "React.js" → "React")
- Include both technical and soft skills in appropriate categories
- Extract experience requirements separately (e.g., "5+ years", "Bachelor's degree", "3+ years experience")
- DO NOT put experience requirements (like "5+ years experience") in the skills arrays
- Skills should be actual abilities, tools, or knowledge areas
- Return ONLY the JSON object, no additional text`;

  const userPrompt = `Extract requirements from this job description:\n\n${jobDescription}`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content ?? "{}";
    console.log("Job Requirements AI Response:", content); // Add this line

    const parsed = JSON.parse(content);
    console.log("Job Requirements Parsed JSON:", parsed); // Add this line

    const validated = JobRequirementsSchema.safeParse(parsed);

    if (!validated.success) {
      console.error("Job requirements extraction validation failed:", validated.error);
      console.error("AI returned:", parsed); // Add this line
      return getMockJobRequirements(domain);
    }

    const requirements = validated.data;
    return {
      ...requirements,
      all_required_skills: [...requirements.required_skills, ...requirements.preferred_skills],
    };
  } catch (error) {
    console.error("Job requirements extraction failed:", error);
    return getMockJobRequirements(domain);
  }
}

/**
 * Detect job domain from job description
 */
export async function detectDomain(jobDescription: string): Promise<string> {
  if (!isAiEnabled() || isMockMode()) {
    return "General";
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const systemPrompt = `You are an expert at categorizing job postings. Identify the primary industry or job domain from the job description.

Return a single, concise domain name (2-4 words maximum).

Examples:
- "Software Engineering"
- "Healthcare"
- "Financial Services"
- "Digital Marketing"
- "Legal Services"
- "Data Science"
- "Product Management"

Return only the domain name, nothing else.`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Identify the domain:\n\n${jobDescription.substring(0, 1000)}` },
      ],
      temperature: 0.1,
      max_tokens: 20,
    });

    const domain = completion.choices?.[0]?.message?.content?.trim() ?? "General";
    return domain;
  } catch (error) {
    console.error("Domain detection failed:", error);
    return "General";
  }
}

// Mock functions for development

function getMockExtractedSkills(
  _context: "resume" | "job_description",
  _domain?: string,
): ExtractedSkills {
  const mockData = {
    technical_skills: ["React", "TypeScript", "Node.js", "Python", "SQL"],
    soft_skills: ["Leadership", "Communication", "Problem Solving", "Teamwork"],
    tools: ["Git", "Docker", "VS Code", "Jira"],
    certifications: ["Bachelor's in Computer Science", "AWS Certified"],
    domain_keywords: ["Agile", "CI/CD", "Microservices"],
  };

  return {
    ...mockData,
    all_skills: [
      ...mockData.technical_skills,
      ...mockData.soft_skills,
      ...mockData.tools,
      ...mockData.certifications,
      ...mockData.domain_keywords,
    ],
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getMockJobRequirements(_domain?: string): JobRequirements {
  return {
    required_skills: ["React", "TypeScript", "3+ years experience"],
    preferred_skills: ["AWS", "Docker", "GraphQL"],
    experience_requirements: ["Bachelor's degree", "5+ years in software development"],
    all_required_skills: ["React", "TypeScript", "3+ years experience", "AWS", "Docker", "GraphQL"],
  };
}
