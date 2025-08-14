import OpenAI from "openai";
import { z } from "zod";

const SuggestionsSchema = z.object({
  bullets: z.array(z.string()).max(5),
  skills: z.array(z.string()).max(20).optional().default([]),
});

export type Suggestions = z.infer<typeof SuggestionsSchema>;

function isAiEnabled(): boolean {
  return (
    Boolean(process.env.OPENAI_API_KEY) &&
    (process.env.ENABLE_AI_SUGGESTIONS ?? "true").toLowerCase() !== "false"
  );
}

export function aiEnabled(): boolean {
  return isAiEnabled();
}

export async function getSuggestions(params: {
  resumeText: string;
  jobDescription: string;
}): Promise<Suggestions> {
  if (!isAiEnabled()) {
    return { bullets: [], skills: [] };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? 10000);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const system = [
    "You are an assistant that rewrites resume bullet points tailored to a provided job description.",
    "Output strictly JSON matching this TypeScript type:",
    "{ bullets: string[]; skills?: string[] }",
    "Constraints:",
    "- Write 2-3 concise, metric-driven bullets (past tense, active voice).",
    "- Use role-relevant keywords from the JD when appropriate.",
    "- Do not fabricate companies, confidential info, or unverifiable metrics.",
  ].join("\n");

  const user = [
    "Job Description:\n\n" + params.jobDescription,
    "\n\nResume Text:\n\n" + params.resumeText,
    "\n\nRespond with JSON only.",
  ].join("");

  try {
    const completion = await client.chat.completions.create(
      {
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.3,
        max_tokens: 400,
      },
      { signal: controller.signal },
    );

    clearTimeout(timeout);

    const content = completion.choices?.[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Best-effort fallback: try to extract JSON blob
      const match = content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { bullets: [] };
    }
    const validated = SuggestionsSchema.safeParse(parsed);
    if (!validated.success) {
      return { bullets: [], skills: [] };
    }
    return validated.data;
  } catch {
    // On timeout or API failure, return empty suggestions
    return { bullets: [], skills: [] };
  } finally {
    clearTimeout(timeout);
  }
}
