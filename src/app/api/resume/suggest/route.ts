import { aiEnabled, getSuggestions } from "@/lib/ai";
import { AI_RATE_LIMIT, guard, readJson } from "@/lib/api-guard";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await guard({ rateLimit: AI_RATE_LIMIT });
  if ("response" in auth) return auth.response;

  const body = await readJson(req);
  if (body === null) {
    return NextResponse.json({ error: "Invalid or too large request" }, { status: 400 });
  }
  const { resumeText = "", jobDescription = "" } = body as {
    resumeText?: string;
    jobDescription?: string;
  };

  if (!aiEnabled()) {
    return NextResponse.json({ suggestions: [], disabled: true });
  }

  const result = await getSuggestions({ resumeText, jobDescription });
  return NextResponse.json({ suggestions: result.bullets, skills: result.skills });
}
