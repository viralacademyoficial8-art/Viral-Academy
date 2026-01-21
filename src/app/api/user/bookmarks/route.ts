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
    const type = searchParams.get("type"); // "course" or "lesson"

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
        ...(type === "course" ? { courseId: { not: null } } : {}),
        ...(type === "lesson" ? { lessonId: { not: null } } : {}),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            category: true,
            level: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true,
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

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Error al obtener los favoritos" },
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

    if (!body.courseId && !body.lessonId) {
      return NextResponse.json(
        { error: "courseId o lessonId es requerido" },
        { status: 400 }
      );
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        ...(body.courseId ? { courseId: body.courseId } : {}),
        ...(body.lessonId ? { lessonId: body.lessonId } : {}),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya está en favoritos", bookmark: existing },
        { status: 400 }
      );
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        courseId: body.courseId || null,
        lessonId: body.lessonId || null,
      },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        lesson: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json(
      { error: "Error al agregar a favoritos" },
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
    const courseId = searchParams.get("courseId");
    const lessonId = searchParams.get("lessonId");
    const id = searchParams.get("id");

    if (!id && !courseId && !lessonId) {
      return NextResponse.json(
        { error: "id, courseId o lessonId es requerido" },
        { status: 400 }
      );
    }

    if (id) {
      // Delete by bookmark ID
      const bookmark = await prisma.bookmark.findUnique({
        where: { id },
      });

      if (!bookmark || bookmark.userId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }

      await prisma.bookmark.delete({ where: { id } });
    } else {
      // Delete by courseId or lessonId
      await prisma.bookmark.deleteMany({
        where: {
          userId: session.user.id,
          ...(courseId ? { courseId } : {}),
          ...(lessonId ? { lessonId } : {}),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json(
      { error: "Error al eliminar de favoritos" },
      { status: 500 }
    );
  }
}
