import { z } from "zod";

export const profileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  github: z.string().url().optional().nullable(),
  skills: z.array(z.string()).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
