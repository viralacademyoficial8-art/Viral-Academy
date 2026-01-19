import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { lessonId, completed, watchTime } = await request.json();

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId es requerido" }, { status: 400 });
    }

    // Check if lesson exists and get course info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: { course: true },
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

    if (!enrollment) {
      return NextResponse.json(
        { error: "No estás inscrito en este curso" },
        { status: 403 }
      );
    }

    // Upsert lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
      update: {
        completed: completed ?? undefined,
        completedAt: completed ? new Date() : null,
        watchTime: watchTime ?? undefined,
      },
      create: {
        userId: session.user.id,
        lessonId,
        completed: completed ?? false,
        completedAt: completed ? new Date() : null,
        watchTime: watchTime ?? 0,
      },
    });

    // Check if course is completed
    const totalLessons = await prisma.lesson.count({
      where: {
        module: { courseId: lesson.module.courseId },
      },
    });

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: session.user.id,
        completed: true,
        lesson: {
          module: { courseId: lesson.module.courseId },
        },
      },
    });

    const courseCompleted = completedLessons === totalLessons;

    // If course is completed, update enrollment
    if (courseCompleted) {
      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: lesson.module.courseId,
          },
        },
        data: {
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      progress,
      courseProgress: {
        total: totalLessons,
        completed: completedLessons,
        percentage: Math.round((completedLessons / totalLessons) * 100),
        courseCompleted,
      },
    });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return NextResponse.json({ error: "Error al actualizar progreso" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "courseId es requerido" }, { status: 400 });
    }

    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId: session.user.id,
        lesson: {
          module: { courseId },
        },
      },
      include: {
        lesson: true,
      },
    });

    const totalLessons = await prisma.lesson.count({
      where: {
        module: { courseId },
      },
    });

    const completedLessons = progress.filter((p) => p.completed).length;

    return NextResponse.json({
      progress,
      summary: {
        total: totalLessons,
        completed: completedLessons,
        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Error getting lesson progress:", error);
    return NextResponse.json({ error: "Error al obtener progreso" }, { status: 500 });
  }
}
