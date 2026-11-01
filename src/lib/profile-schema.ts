import { z } from "zod";

export const PROFILE_LIMITS = {
  headline: 200,
  bio: 3000,
  location: 200,
  skill: 50,
  skills: 50,
  url: 2048,
} as const;

const FIELD_LABELS: Record<string, string> = {
  headline: "Headline",
  bio: "Bio",
  location: "Location",
  website: "Website",
  linkedin: "LinkedIn",
  github: "GitHub",
  skills: "Skills",
};

/** One readable sentence per problem, e.g. "Bio is too long (max 3000 characters)". */
export function describeProfileIssues(issues: z.ZodIssue[]): string {
  const messages = issues.map((i) => {
    const key = String(i.path[0] ?? "");
    const label = FIELD_LABELS[key] ?? "Profile";
    if (i.code === "too_big") {
      const max = Number(i.maximum);
      if (key === "skills" && i.path.length === 1) return `Too many skills (max ${max})`;
      if (key === "skills") return `A skill is too long (max ${max} characters)`;
      return `${label} is too long (max ${max} characters)`;
    }
    if (["website", "linkedin", "github"].includes(key)) return `${label} must be a valid link`;
    return `${label} is not valid`;
  });
  return [...new Set(messages)].join(". ");
}

// The form submits empty inputs as "". Treat blank as "not set" so a user
// who leaves optional links empty can still save.
const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.string().max(PROFILE_LIMITS.url).url().optional().nullable(),
);

export const profileSchema = z.object({
  headline: z.string().max(PROFILE_LIMITS.headline).optional(),
  bio: z.string().max(PROFILE_LIMITS.bio).optional(),
  location: z.string().max(PROFILE_LIMITS.location).optional(),
  website: optionalUrl,
  linkedin: optionalUrl,
  github: optionalUrl,
  skills: z
    .array(z.string().max(PROFILE_LIMITS.skill))
    .max(PROFILE_LIMITS.skills)
    .optional()
    .transform((s) => s?.map((x) => x.trim()).filter(Boolean)),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/** What GET /api/profile returns for a user who has not saved a profile yet. */
export const EMPTY_PROFILE = {
  headline: null,
  bio: null,
  location: null,
  website: null,
  linkedin: null,
  github: null,
  skills: [] as string[],
};
