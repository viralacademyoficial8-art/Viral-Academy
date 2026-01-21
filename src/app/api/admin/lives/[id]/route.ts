import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const live = await prisma.liveEvent.findUnique({
      where: { id },
      include: {
        mentor: {
          include: { profile: true },
        },
        replays: true,
      },
    });

    if (!live) {
      return NextResponse.json({ error: "Live no encontrado" }, { status: 404 });
    }

    return NextResponse.json(live);
  } catch (error) {
    console.error("Error fetching live:", error);
    return NextResponse.json(
      { error: "Error al obtener el live" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

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

    const live = await prisma.liveEvent.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        mentorId: body.mentorId,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        duration: body.duration !== undefined ? parseInt(body.duration) : undefined,
        meetingUrl: body.meetingUrl,
        thumbnail: body.thumbnail,
        published: body.published,
      },
    });

    return NextResponse.json(live);
  } catch (error) {
    console.error("Error updating live:", error);
    return NextResponse.json(
      { error: "Error al actualizar el live" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.liveEvent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting live:", error);
    return NextResponse.json(
      { error: "Error al eliminar el live" },
      { status: 500 }
    );
  }
}
