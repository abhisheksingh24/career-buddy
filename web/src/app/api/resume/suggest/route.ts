import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const { resumeText = "", jobDescription = "" } = body as { resumeText?: string; jobDescription?: string };

  // Stubbed AI suggestion: return a templated improvement for the first bullet
  const suggestion = `Revise bullets to be metrics-driven. Example: "Improved ${
    (jobDescription.split(" ")[0] || "project").toLowerCase()
  } delivery by 20% by implementing ${resumeText.includes("react") ? "React performance optimizations" : "targeted improvements"}."`;

  return NextResponse.json({ suggestions: [suggestion] });
}

