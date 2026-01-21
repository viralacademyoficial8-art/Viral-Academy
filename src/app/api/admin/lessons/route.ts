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
    const moduleId = searchParams.get("moduleId");

    const lessons = await prisma.lesson.findMany({
      where: moduleId ? { moduleId } : undefined,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: { select: { id: true, title: true } },
          },
        },
        resources: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Error al obtener las lecciones" },
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "MENTOR")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.moduleId) {
      return NextResponse.json(
        { error: "moduleId es requerido" },
        { status: 400 }
      );
    }

    // Get the highest order number for this module
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId: body.moduleId },
      orderBy: { order: "desc" },
    });

    const lesson = await prisma.lesson.create({
      data: {
        moduleId: body.moduleId,
        title: body.title,
        description: body.description || null,
        videoUrl: body.videoUrl || null,
        duration: body.duration ? parseInt(body.duration) : null,
        notes: body.notes || null,
        order: body.order ?? (lastLesson ? lastLesson.order + 1 : 0),
        published: body.published ?? true,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Error al crear la lección" },
      { status: 500 }
    );
  }
}
