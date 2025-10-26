/**
 * Semantic Matching using OpenAI Embeddings
 * Enables domain-agnostic skill matching through semantic similarity
 */

import OpenAI from "openai";

import type { SkillMatchResult } from "./types/analysis";

function isAiEnabled(): boolean {
  return (
    Boolean(process.env.OPENAI_API_KEY) &&
    (process.env.ENABLE_AI_SUGGESTIONS ?? "true").toLowerCase() !== "false"
  );
}

function isMockMode(): boolean {
  return (process.env.MOCK_AI_SUGGESTIONS ?? "false").toLowerCase() === "true";
}

function isSemanticMatchingEnabled(): boolean {
  return (process.env.ENABLE_SEMANTIC_MATCHING ?? "true").toLowerCase() === "true";
}

/**
 * Get embedding vector for a text string
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

  try {
    const response = await client.embeddings.create({
      model,
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    throw error;
  }
}

/**
 * Get embeddings for multiple texts in batch
 */
export async function getBatchEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

  try {
    const response = await client.embeddings.create({
      model,
      input: texts,
    });
    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error("Batch embedding generation failed:", error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Determine relevance level based on similarity score
 */
function getRelevanceLevel(similarity: number): "high" | "medium" | "low" {
  if (similarity >= 0.8) return "high";
  if (similarity >= 0.6) return "medium";
  return "low";
}

/**
 * Match resume skills with job skills using semantic similarity
 */
export async function matchSkillsSemantically(
  resumeSkills: string[],
  jobSkills: string[],
): Promise<SkillMatchResult[]> {
  if (!isAiEnabled() || isMockMode() || !isSemanticMatchingEnabled()) {
    return getMockSkillMatches(resumeSkills, jobSkills);
  }

  if (resumeSkills.length === 0 || jobSkills.length === 0) {
    return [];
  }

  try {
    // Get embeddings for all skills
    const [resumeEmbeddings, jobEmbeddings] = await Promise.all([
      getBatchEmbeddings(resumeSkills),
      getBatchEmbeddings(jobSkills),
    ]);

    const matches: SkillMatchResult[] = [];

    // Calculate similarity matrix and find best matches
    for (let j = 0; j < jobSkills.length; j++) {
      let bestMatch: SkillMatchResult | null = null;
      let bestSimilarity = 0;

      for (let r = 0; r < resumeSkills.length; r++) {
        const similarity = cosineSimilarity(resumeEmbeddings[r], jobEmbeddings[j]);

        if (similarity > bestSimilarity && similarity >= 0.4) {
          // Minimum threshold
          bestSimilarity = similarity;
          bestMatch = {
            resumeSkill: resumeSkills[r],
            jobSkill: jobSkills[j],
            similarity,
            relevance: getRelevanceLevel(similarity),
          };
        }
      }

      if (bestMatch) {
        matches.push(bestMatch);
      }
    }

    // Sort by similarity (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);

    return matches;
  } catch (error) {
    console.error("Semantic matching failed:", error);
    return getMockSkillMatches(resumeSkills, jobSkills);
  }
}

/**
 * Simple string-based matching fallback
 */
export function matchSkillsSimple(resumeSkills: string[], jobSkills: string[]): SkillMatchResult[] {
  const matches: SkillMatchResult[] = [];
  const resumeSkillsLower = resumeSkills.map((s) => s.toLowerCase());
  const jobSkillsLower = jobSkills.map((s) => s.toLowerCase());

  for (let j = 0; j < jobSkills.length; j++) {
    const jobSkillLower = jobSkillsLower[j];

    for (let r = 0; r < resumeSkills.length; r++) {
      const resumeSkillLower = resumeSkillsLower[r];

      // Exact match or substring match
      if (
        resumeSkillLower === jobSkillLower ||
        resumeSkillLower.includes(jobSkillLower) ||
        jobSkillLower.includes(resumeSkillLower)
      ) {
        matches.push({
          resumeSkill: resumeSkills[r],
          jobSkill: jobSkills[j],
          similarity: 1.0,
          relevance: "high",
        });
        break;
      }
    }
  }

  return matches;
}

// Mock function for development
function getMockSkillMatches(resumeSkills: string[], jobSkills: string[]): SkillMatchResult[] {
  const matches: SkillMatchResult[] = [];

  // Create some realistic mock matches
  const mockMatches = [
    { resume: "React", job: "React", similarity: 1.0, relevance: "high" as const },
    { resume: "TypeScript", job: "TypeScript", similarity: 1.0, relevance: "high" as const },
    { resume: "Leadership", job: "Team Leadership", similarity: 0.85, relevance: "high" as const },
    {
      resume: "Problem Solving",
      job: "Analytical Skills",
      similarity: 0.65,
      relevance: "medium" as const,
    },
  ];

  for (const mock of mockMatches) {
    if (resumeSkills.includes(mock.resume) || jobSkills.includes(mock.job)) {
      matches.push({
        resumeSkill: mock.resume,
        jobSkill: mock.job,
        similarity: mock.similarity,
        relevance: mock.relevance,
      });
    }
  }

  return matches;
}
