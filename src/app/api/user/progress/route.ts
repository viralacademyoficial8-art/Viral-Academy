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
    const lessonId = searchParams.get("lessonId");

    if (lessonId) {
      // Get specific lesson progress
      const progress = await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId,
          },
        },
      });

      return NextResponse.json(progress || { completed: false, watchTime: 0 });
    }

    if (courseId) {
      // Get all progress for a course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            include: {
              lessons: {
                where: { published: true },
                select: { id: true },
              },
            },
          },
        },
      });

      if (!course) {
        return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
      }

      const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

      const progress = await prisma.lessonProgress.findMany({
        where: {
          userId: session.user.id,
          lessonId: { in: lessonIds },
        },
      });

      const completedCount = progress.filter((p) => p.completed).length;
      const totalLessons = lessonIds.length;
      const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      return NextResponse.json({
        lessons: progress,
        completed: completedCount,
        total: totalLessons,
        percentage,
      });
    }

    // Get all user progress
    const allProgress = await prisma.lessonProgress.findMany({
      where: { userId: session.user.id },
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
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(allProgress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Error al obtener el progreso" },
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

    if (!body.lessonId) {
      return NextResponse.json(
        { error: "lessonId es requerido" },
        { status: 400 }
      );
    }

    // Verify the lesson exists and get course info
    const lesson = await prisma.lesson.findUnique({
      where: { id: body.lessonId },
      include: {
        module: {
          select: { courseId: true },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 });
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: lesson.module.courseId,
        },
      },
    });

    // Create enrollment if it doesn't exist
    if (!enrollment) {
      await prisma.enrollment.create({
        data: {
          userId: session.user.id,
          courseId: lesson.module.courseId,
        },
      });
    }

    // Upsert progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: body.lessonId,
        },
      },
      update: {
        completed: body.completed ?? undefined,
        completedAt: body.completed ? new Date() : undefined,
        watchTime: body.watchTime ?? undefined,
      },
      create: {
        userId: session.user.id,
        lessonId: body.lessonId,
        completed: body.completed ?? false,
        completedAt: body.completed ? new Date() : null,
        watchTime: body.watchTime ?? 0,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Error al actualizar el progreso" },
      { status: 500 }
    );
  }
}
