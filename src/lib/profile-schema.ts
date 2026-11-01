import { z } from "zod";

// The form submits empty inputs as "". Treat blank as "not set" so a user
// who leaves optional links empty can still save.
const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.string().url().optional().nullable(),
);

export const profileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: optionalUrl,
  linkedin: optionalUrl,
  github: optionalUrl,
  skills: z
    .array(z.string())
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
