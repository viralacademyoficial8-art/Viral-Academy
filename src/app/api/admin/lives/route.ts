import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "MENTOR")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();

    const live = await prisma.liveEvent.create({
      data: {
        title: body.title,
        description: body.description || "",
        type: body.type || "MARKETING",
        mentorId: body.mentorId || session.user.id,
        scheduledAt: new Date(body.scheduledAt),
        duration: body.duration ? parseInt(body.duration) : null,
        meetingUrl: body.meetingUrl || null,
        thumbnail: body.thumbnail || null,
        published: body.published || false,
      },
    });

    return NextResponse.json(live);
  } catch (error) {
    console.error("Error creating live:", error);
    return NextResponse.json(
      { error: "Error al crear el live" },
      { status: 500 }
    );
  }
}
