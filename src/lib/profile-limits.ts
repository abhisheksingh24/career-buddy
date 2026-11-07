// Field limits, kept free of any import so client components can use them
// without pulling zod into the browser bundle (zod's eval probe breaks our
// enforced CSP, ADR 0018). Server code gets them via profile-schema.ts.
export const PROFILE_LIMITS = {
  headline: 200,
  bio: 3000,
  location: 200,
  skill: 50,
  skills: 50,
  url: 2048,
} as const;
