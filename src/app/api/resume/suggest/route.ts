import { aiEnabled, getSuggestions } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
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
