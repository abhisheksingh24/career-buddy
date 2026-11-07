import { MAX_PROFILE_BYTES, PROFILE_RATE_LIMIT, guard, readJson } from "@/lib/api-guard";
import prisma from "@/lib/db";
import { profileSchema } from "@/lib/profile-schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await guard();
  if ("response" in auth) return auth.response;
  const { userId } = auth;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const auth = await guard({ rateLimit: PROFILE_RATE_LIMIT });
  if ("response" in auth) return auth.response;
  const { userId } = auth;

  const body = await readJson(req, MAX_PROFILE_BYTES);
  if (body === null) {
    return NextResponse.json({ error: "Invalid or too large request" }, { status: 400 });
  }

  try {
    const data = profileSchema.parse(body);

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: data,
      create: {
        ...data,
        userId,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
