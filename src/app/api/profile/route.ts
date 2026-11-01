import { guard } from "@/lib/api-guard";
import prisma from "@/lib/db";
import { EMPTY_PROFILE, profileSchema } from "@/lib/profile-schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await guard();
  if ("response" in auth) return auth.response;
  const { userId } = auth;

  const profile = await prisma.profile.findUnique({ where: { userId } });

  // A new user has no profile row yet: that is a normal state, not an error.
  return NextResponse.json(profile ?? EMPTY_PROFILE);
}

export async function PUT(req: NextRequest) {
  const auth = await guard();
  if ("response" in auth) return auth.response;
  const { userId } = auth;

  try {
    const body = await req.json();
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
