import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    const notes = await prisma.lessonNote.findMany({
      where: {
        userId: session.user.id,
        ...(lessonId ? { lessonId } : {}),
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                title: true,
                course: { select: { id: true, title: true, slug: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    // Return empty array if table doesn't exist yet
    if (String(error).includes("does not exist") || String(error).includes("relation")) {
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: "Error al obtener las notas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.lessonId || !body.content) {
      return NextResponse.json(
        { error: "lessonId y content son requeridos" },
        { status: 400 }
      );
    }

    const note = await prisma.lessonNote.create({
      data: {
        userId: session.user.id,
        lessonId: body.lessonId,
        content: body.content,
        timestamp: body.timestamp || null,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    if (String(error).includes("does not exist") || String(error).includes("relation")) {
      return NextResponse.json(
        { error: "La funcionalidad de notas no está disponible aún" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Error al crear la nota" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }

    // Verify ownership
    const existingNote = await prisma.lessonNote.findUnique({
      where: { id: body.id },
    });

    if (!existingNote || existingNote.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const note = await prisma.lessonNote.update({
      where: { id: body.id },
      data: {
        content: body.content,
        timestamp: body.timestamp,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    if (String(error).includes("does not exist") || String(error).includes("relation")) {
      return NextResponse.json(
        { error: "La funcionalidad de notas no está disponible aún" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Error al actualizar la nota" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }

    // Verify ownership
    const existingNote = await prisma.lessonNote.findUnique({
      where: { id },
    });

    if (!existingNote || existingNote.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.lessonNote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    if (String(error).includes("does not exist") || String(error).includes("relation")) {
      return NextResponse.json(
        { error: "La funcionalidad de notas no está disponible aún" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Error al eliminar la nota" },
      { status: 500 }
    );
  }
}
