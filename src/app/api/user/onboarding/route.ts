import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, displayName, objective, level } = body;

    // Validate required fields
    if (!firstName) {
      return new NextResponse("First name is required", { status: 400 });
    }

    // Update or create profile
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        firstName,
        lastName: lastName || null,
        displayName: displayName || firstName,
        objective: objective || null,
        level: level || null,
        onboardingDone: true,
      },
      update: {
        firstName,
        lastName: lastName || null,
        displayName: displayName || firstName,
        objective: objective || null,
        level: level || null,
        onboardingDone: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return new NextResponse("Error saving profile", { status: 500 });
  }
}
