import { describe, expect, it } from "vitest";

import { SuggestionsSchema } from "./ai";
import { ExtractedSkillsSchema, JobRequirementsSchema } from "./ai-extraction";
import {
  AchievementsScoreSchema,
  EducationScoreSchema,
  ExperienceRelevanceSchema,
} from "./comprehensive-scoring";
import { ActionItemSchema, ComprehensiveFeedbackSchema } from "./feedback-generator";
import { profileSchema } from "./profile-schema";

describe("profileSchema", () => {
  it("accepts an empty object and a full profile", () => {
    expect(profileSchema.safeParse({}).success).toBe(true);
    expect(
      profileSchema.safeParse({
        headline: "Engineer",
        website: "https://example.com",
        linkedin: null,
        github: "https://github.com/x",
        skills: ["ts"],
      }).success,
    ).toBe(true);
  });

  it("rejects invalid urls and non-string skills", () => {
    expect(profileSchema.safeParse({ website: "not a url" }).success).toBe(false);
    expect(profileSchema.safeParse({ skills: [1] }).success).toBe(false);
  });

  it("reports issues with a path (used for 400 responses)", () => {
    const r = profileSchema.safeParse({ github: "nope" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["github"]);
  });
});

describe("SuggestionsSchema", () => {
  it("defaults skills to []", () => {
    expect(SuggestionsSchema.parse({ bullets: ["a"] })).toEqual({ bullets: ["a"], skills: [] });
  });
  it("enforces max lengths", () => {
    expect(SuggestionsSchema.safeParse({ bullets: Array(6).fill("a") }).success).toBe(false);
    expect(SuggestionsSchema.safeParse({ bullets: [], skills: Array(21).fill("a") }).success).toBe(
      false,
    );
  });
});

describe("extraction schemas", () => {
  it("requires all skill arrays", () => {
    expect(ExtractedSkillsSchema.safeParse({ technical_skills: [] }).success).toBe(false);
    expect(
      ExtractedSkillsSchema.safeParse({
        technical_skills: [],
        soft_skills: [],
        tools: [],
        certifications: [],
        domain_keywords: [],
      }).success,
    ).toBe(true);
  });
  it("validates job requirements", () => {
    expect(
      JobRequirementsSchema.safeParse({
        required_skills: [],
        preferred_skills: [],
        experience_requirements: [],
      }).success,
    ).toBe(true);
    expect(JobRequirementsSchema.safeParse({ required_skills: "x" }).success).toBe(false);
  });
});

describe("scoring schemas", () => {
  it.each([ExperienceRelevanceSchema, EducationScoreSchema, AchievementsScoreSchema])(
    "bounds score to 0-100",
    (schema) => {
      expect(schema.safeParse({ score: 85, reasoning: "ok" }).success).toBe(true);
      expect(schema.safeParse({ score: 101, reasoning: "ok" }).success).toBe(false);
      expect(schema.safeParse({ score: -1, reasoning: "ok" }).success).toBe(false);
      expect(schema.safeParse({ score: 50 }).success).toBe(false);
    },
  );
});

describe("ActionItemSchema", () => {
  const base = {
    id: "skills-0",
    category: "requiredSkills",
    title: "Add Python",
    description: "Add Python to your skills section to match the role.",
    priority: "high",
    estimatedImpact: 10,
  };
  it("normalizes long category names to short ones", () => {
    expect(ActionItemSchema.parse(base).category).toBe("skills");
    expect(ActionItemSchema.parse({ ...base, category: "ats" }).category).toBe("ats");
  });
  it("falls back to overview for unknown categories", () => {
    expect(ActionItemSchema.parse({ ...base, category: "bogus" }).category).toBe("overview");
  });
  it("rejects bad priority and short titles", () => {
    expect(ActionItemSchema.safeParse({ ...base, priority: "urgent" }).success).toBe(false);
    expect(ActionItemSchema.safeParse({ ...base, title: "abc" }).success).toBe(false);
  });
});

describe("ComprehensiveFeedbackSchema", () => {
  const legacy = {
    strengthAreas: ["a", "b", "c"],
    improvementAreas: ["a", "b", "c"],
    experienceGaps: [],
    relevantExperiences: [],
    atsTips: ["1", "2", "3", "4", "5"],
    suggestedBullets: ["x", { bullet: "y" }, { text: "z" }, { foo: 1 }, 7],
  };
  it("accepts legacy fields and coerces suggestedBullets to strings", () => {
    const r = ComprehensiveFeedbackSchema.safeParse(legacy);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.suggestedBullets).toEqual(["x", "y", "z", '{"foo":1}', "7"]);
  });
  it("enforces array size bounds", () => {
    expect(ComprehensiveFeedbackSchema.safeParse({ ...legacy, strengthAreas: ["a"] }).success).toBe(
      false,
    );
    expect(ComprehensiveFeedbackSchema.safeParse({ ...legacy, atsTips: ["a"] }).success).toBe(
      false,
    );
  });
});
