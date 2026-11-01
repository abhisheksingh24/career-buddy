import { z } from "zod";

// Zod's JIT compiler probes for eval with `new Function("")`, which raises a
// script-src CSP violation on every page load (we forbid unsafe-eval, ADR
// 0018). Parsing without the JIT is equally correct and fast enough here.
z.config({ jitless: true });

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
