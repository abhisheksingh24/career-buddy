import { beforeEach, describe, expect, it, vi } from "vitest";

const { chatCreate, embedCreate } = vi.hoisted(() => ({
  chatCreate: vi.fn(),
  embedCreate: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: chatCreate } };
    embeddings = { create: embedCreate };
  },
}));

import { getSuggestions } from "./ai";
import { detectDomain, extractJobRequirements, extractSkillsFromText } from "./ai-extraction";
import { scoreExperienceRelevance } from "./comprehensive-scoring";
import { isReasoningModel } from "./openai-params";
import { getBatchEmbeddings, getEmbedding } from "./semantic-match";

const reply = (content: string) => ({ choices: [{ message: { content } }] });

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubEnv("MOCK_AI_SUGGESTIONS", "false");
  vi.stubEnv("ENABLE_AI_SUGGESTIONS", "true");
});

describe("getSuggestions", () => {
  const params = { resumeText: "r", jobDescription: "j" };

  it("returns validated suggestions from the model", async () => {
    chatCreate.mockResolvedValue(reply(JSON.stringify({ bullets: ["a", "b"] })));
    expect(await getSuggestions(params)).toEqual({ bullets: ["a", "b"], skills: [] });
    expect(chatCreate).toHaveBeenCalledTimes(1);
    expect(chatCreate.mock.calls[0][0].messages[0].role).toBe("system");
  });

  it("extracts JSON embedded in prose", async () => {
    chatCreate.mockResolvedValue(reply('Here: {"bullets":["x"],"skills":["ts"]} done'));
    expect(await getSuggestions(params)).toEqual({ bullets: ["x"], skills: ["ts"] });
  });

  it("returns empty on schema violation and on API error", async () => {
    chatCreate.mockResolvedValue(reply(JSON.stringify({ bullets: Array(9).fill("a") })));
    expect(await getSuggestions(params)).toEqual({ bullets: [], skills: [] });
    chatCreate.mockRejectedValue(new Error("boom"));
    expect(await getSuggestions(params)).toEqual({ bullets: [], skills: [] });
  });

  it("does not call OpenAI without a key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(await getSuggestions(params)).toEqual({ bullets: [], skills: [] });
    expect(chatCreate).not.toHaveBeenCalled();
  });
});

describe("ai-extraction", () => {
  it("extracts skills and aggregates all_skills", async () => {
    chatCreate.mockResolvedValue(
      reply(
        JSON.stringify({
          technical_skills: ["Python"],
          soft_skills: ["Communication"],
          tools: ["Git"],
          certifications: [],
          domain_keywords: [],
        }),
      ),
    );
    const r = await extractSkillsFromText("text", "resume");
    expect(chatCreate).toHaveBeenCalledTimes(1);
    expect(r.all_skills).toEqual(expect.arrayContaining(["Python", "Communication", "Git"]));
  });

  it("falls back (no throw) when the model returns invalid shape", async () => {
    chatCreate.mockResolvedValue(reply(JSON.stringify({ technical_skills: "nope" })));
    const r = await extractSkillsFromText("text", "resume");
    expect(Array.isArray(r.all_skills)).toBe(true);
  });

  it("extracts job requirements", async () => {
    chatCreate.mockResolvedValue(
      reply(
        JSON.stringify({
          required_skills: ["SQL"],
          preferred_skills: [],
          experience_requirements: ["3 years"],
        }),
      ),
    );
    const r = await extractJobRequirements("jd");
    expect(r.required_skills).toContain("SQL");
  });

  it("detects domain, defaulting to General on error", async () => {
    chatCreate.mockResolvedValue(reply(" Data Science "));
    expect(await detectDomain("jd")).toBe("Data Science");
    chatCreate.mockRejectedValue(new Error("x"));
    expect(await detectDomain("jd")).toBe("General");
  });
});

describe("scoreExperienceRelevance", () => {
  const p = {
    resumeText: "EXPERIENCE\nBuilt things",
    jobDescription: "jd",
    domain: "Software Engineering",
  };
  it("returns the validated score", async () => {
    chatCreate.mockResolvedValue(reply(JSON.stringify({ score: 77, reasoning: "good" })));
    expect(await scoreExperienceRelevance(p)).toBe(77);
  });
  it("falls back to a number on out-of-range score", async () => {
    chatCreate.mockResolvedValue(reply(JSON.stringify({ score: 500, reasoning: "bad" })));
    const s = await scoreExperienceRelevance(p);
    expect(typeof s).toBe("number");
    expect(s).not.toBe(500);
  });
});

describe("embeddings", () => {
  it("returns a single embedding", async () => {
    embedCreate.mockResolvedValue({ data: [{ embedding: [1, 2, 3] }] });
    expect(await getEmbedding("a")).toEqual([1, 2, 3]);
    expect(embedCreate.mock.calls[0][0].input).toBe("a");
  });
  it("returns batch embeddings and skips empty input", async () => {
    embedCreate.mockResolvedValue({ data: [{ embedding: [1] }, { embedding: [2] }] });
    expect(await getBatchEmbeddings(["a", "b"])).toEqual([[1], [2]]);
    expect(await getBatchEmbeddings([])).toEqual([]);
    expect(embedCreate).toHaveBeenCalledTimes(1);
  });
  it("rethrows API errors", async () => {
    embedCreate.mockRejectedValue(new Error("fail"));
    await expect(getEmbedding("a")).rejects.toThrow("fail");
  });
});

describe("isReasoningModel", () => {
  it.each(["o3-mini", "gpt-5", "o1"])("treats %s as a reasoning model", (m) => {
    expect(isReasoningModel(m)).toBe(true);
  });
  it.each([
    "gpt-4o",
    "gpt-4o-mini",
    "omni-moderation-latest",
    "ft:gpt-4o",
    "text-embedding-3-small",
  ])("does not treat %s as a reasoning model", (m) => {
    expect(isReasoningModel(m)).toBe(false);
  });
});

describe("token parameters per model", () => {
  const params = { resumeText: "r", jobDescription: "j" };

  it("uses max_tokens and temperature for default models", async () => {
    vi.stubEnv("OPENAI_MODEL", "gpt-4o-mini");
    chatCreate.mockResolvedValue(reply(JSON.stringify({ bullets: [] })));
    await getSuggestions(params);
    const body = chatCreate.mock.calls[0][0];
    expect(body.max_tokens).toBe(400);
    expect(body.temperature).toBe(0.3);
    expect(body).not.toHaveProperty("max_completion_tokens");
  });

  it.each(["gpt-5", "gpt-5-mini", "o3-mini", "o1"])(
    "uses max_completion_tokens and no temperature for %s",
    async (model) => {
      vi.stubEnv("OPENAI_MODEL", model);
      chatCreate.mockResolvedValue(reply(" Data Science "));
      await detectDomain("jd");
      const body = chatCreate.mock.calls[0][0];
      expect(body.max_completion_tokens).toBeGreaterThan(20);
      expect(body).not.toHaveProperty("max_tokens");
      expect(body).not.toHaveProperty("temperature");
    },
  );
});
