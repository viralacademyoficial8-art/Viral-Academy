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
    const courseId = searchParams.get("courseId");

    const modules = await prisma.module.findMany({
      where: courseId ? { courseId } : undefined,
      include: {
        course: { select: { id: true, title: true } },
        lessons: {
          select: { id: true, title: true, order: true, published: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Error al obtener los módulos" },
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

    if (!body.courseId) {
      return NextResponse.json(
        { error: "courseId es requerido" },
        { status: 400 }
      );
    }

    // Get the highest order number for this course
    const lastModule = await prisma.module.findFirst({
      where: { courseId: body.courseId },
      orderBy: { order: "desc" },
    });

    const module = await prisma.module.create({
      data: {
        courseId: body.courseId,
        title: body.title,
        description: body.description || null,
        order: body.order ?? (lastModule ? lastModule.order + 1 : 0),
      },
      include: {
        lessons: true,
      },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { error: "Error al crear el módulo" },
      { status: 500 }
    );
  }
}
