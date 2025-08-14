export type MatchResult = {
  score: number;
  missingKeywords: string[];
};

export function tokenize(input: string): string[] {
  if (!input) return [];
  return (input.toLowerCase().match(/[a-z0-9+#.]+/g) ?? []);
}

export function scoreMatch(resumeText: string, jobDescription: string): MatchResult {
  const jdTokens = tokenize(jobDescription);
  const resumeTokens = tokenize(resumeText);
  const jdSet = new Set(jdTokens);
  const resumeSet = new Set(resumeTokens);
  const missing: string[] = [];
  jdSet.forEach((w) => {
    if (!resumeSet.has(w)) missing.push(w);
  });
  const score = Math.max(0, Math.round(((jdSet.size - missing.length) / Math.max(1, jdSet.size)) * 100));
  return { score, missingKeywords: missing.slice(0, 50) };
}


