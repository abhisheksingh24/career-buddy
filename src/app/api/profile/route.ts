import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

const profileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  github: z.string().url().optional().nullable(),
  skills: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = profileSchema.parse(body);

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        ...data,
        userId: session.user.id,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
