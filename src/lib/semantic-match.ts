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
 * Match resume skills with job skills using multi-level approach
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
    // Level 1: Exact string matching (case-insensitive)
    const exactMatches = findExactMatches(resumeSkills, jobSkills);

    // Level 2: Fuzzy string matching (for typos and minor variations)
    const fuzzyMatches = findFuzzyMatches(resumeSkills, jobSkills, exactMatches);

    // Level 3: Semantic matching with embeddings (for synonyms)
    const semanticMatches = await findSemanticMatches(resumeSkills, jobSkills, [
      ...exactMatches,
      ...fuzzyMatches,
    ]);

    // Combine all matches and sort by relevance
    const allMatches = [...exactMatches, ...fuzzyMatches, ...semanticMatches];
    allMatches.sort((a, b) => b.similarity - a.similarity);

    return allMatches;
  } catch (error) {
    console.error("Multi-level matching failed:", error);
    return getMockSkillMatches(resumeSkills, jobSkills);
  }
}

// Level 1: Exact matching (domain-agnostic)
function findExactMatches(resumeSkills: string[], jobSkills: string[]): SkillMatchResult[] {
  const matches: SkillMatchResult[] = [];
  const resumeSkillsLower = resumeSkills.map((s) => s.toLowerCase().trim());
  const jobSkillsLower = jobSkills.map((s) => s.toLowerCase().trim());

  for (let j = 0; j < jobSkills.length; j++) {
    const jobSkillLower = jobSkillsLower[j];

    for (let r = 0; r < resumeSkills.length; r++) {
      const resumeSkillLower = resumeSkillsLower[r];

      if (resumeSkillLower === jobSkillLower) {
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

// Level 2: Fuzzy matching using Levenshtein distance (domain-agnostic)
function findFuzzyMatches(
  resumeSkills: string[],
  jobSkills: string[],
  existingMatches: SkillMatchResult[],
): SkillMatchResult[] {
  const matches: SkillMatchResult[] = [];
  const matchedJobSkills = new Set(existingMatches.map((m) => m.jobSkill.toLowerCase()));
  const matchedResumeSkills = new Set(existingMatches.map((m) => m.resumeSkill.toLowerCase()));

  for (const jobSkill of jobSkills) {
    if (matchedJobSkills.has(jobSkill.toLowerCase())) continue;

    for (const resumeSkill of resumeSkills) {
      if (matchedResumeSkills.has(resumeSkill.toLowerCase())) continue;

      const similarity = calculateLevenshteinSimilarity(
        resumeSkill.toLowerCase(),
        jobSkill.toLowerCase(),
      );

      // Threshold: 0.8 = 80% similarity (catches typos and minor variations)
      if (similarity >= 0.8) {
        matches.push({
          resumeSkill,
          jobSkill,
          similarity,
          relevance: similarity >= 0.9 ? "high" : "medium",
        });
        matchedJobSkills.add(jobSkill.toLowerCase());
        matchedResumeSkills.add(resumeSkill.toLowerCase());
        break;
      }
    }
  }

  return matches;
}

// Level 3: Semantic matching with lowered threshold
async function findSemanticMatches(
  resumeSkills: string[],
  jobSkills: string[],
  existingMatches: SkillMatchResult[],
): Promise<SkillMatchResult[]> {
  const matchedJobSkills = new Set(existingMatches.map((m) => m.jobSkill.toLowerCase()));
  const matchedResumeSkills = new Set(existingMatches.map((m) => m.resumeSkill.toLowerCase()));

  const unmatchedResumeSkills = resumeSkills.filter(
    (s) => !matchedResumeSkills.has(s.toLowerCase()),
  );
  const unmatchedJobSkills = jobSkills.filter((s) => !matchedJobSkills.has(s.toLowerCase()));

  if (unmatchedResumeSkills.length === 0 || unmatchedJobSkills.length === 0) {
    return [];
  }

  // Get embeddings for unmatched skills only
  const [resumeEmbeddings, jobEmbeddings] = await Promise.all([
    getBatchEmbeddings(unmatchedResumeSkills),
    getBatchEmbeddings(unmatchedJobSkills),
  ]);

  const matches: SkillMatchResult[] = [];

  for (let j = 0; j < unmatchedJobSkills.length; j++) {
    let bestMatch: SkillMatchResult | null = null;
    let bestSimilarity = 0;

    for (let r = 0; r < unmatchedResumeSkills.length; r++) {
      const similarity = cosineSimilarity(resumeEmbeddings[r], jobEmbeddings[j]);

      // Lowered threshold from 0.4 to 0.3 for better coverage
      if (similarity > bestSimilarity && similarity >= 0.3) {
        bestSimilarity = similarity;
        bestMatch = {
          resumeSkill: unmatchedResumeSkills[r],
          jobSkill: unmatchedJobSkills[j],
          similarity,
          relevance: getRelevanceLevel(similarity),
        };
      }
    }

    if (bestMatch) {
      matches.push(bestMatch);
    }
  }

  return matches;
}

// Levenshtein distance-based similarity (domain-agnostic)
function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calculate Levenshtein distance
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
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
