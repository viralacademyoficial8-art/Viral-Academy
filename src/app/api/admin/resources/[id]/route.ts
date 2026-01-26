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

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
    });

    if (!resource) {
      return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json(
      { error: "Error al obtener el recurso" },
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

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        fileUrl: body.fileUrl,
        fileType: body.fileType,
        fileSize: body.fileSize !== undefined ? parseInt(body.fileSize) : undefined,
        courseId: body.courseId,
        lessonId: body.lessonId,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Error al actualizar el recurso" },
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

    if (!user || (user.role !== "ADMIN" && user.role !== "MENTOR")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Error al eliminar el recurso" },
      { status: 500 }
    );
  }
}
