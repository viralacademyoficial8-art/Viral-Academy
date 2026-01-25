import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Check if user is admin
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      include: {
        mentor: { include: { profile: true } },
        modules: { include: { lessons: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Error al obtener cursos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Check if slug already exists
    const existing = await prisma.course.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: "El slug ya existe" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        level: data.level,
        category: data.category,
        mentorId: data.mentorId,
        thumbnail: data.thumbnail || null,
        outcomes: data.outcomes || [],
        published: false,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Error al crear curso" }, { status: 500 });
  }
}

// DELETE all courses (dangerous - requires confirmation)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check for confirmation header
    const confirmation = request.headers.get("X-Confirm-Delete-All");
    if (confirmation !== "DELETE_ALL_COURSES") {
      return NextResponse.json(
        { error: "Se requiere confirmación para eliminar todos los cursos" },
        { status: 400 }
      );
    }

    // Delete all related data first due to potential cascade issues
    // Order matters: lessons -> modules -> enrollments -> progress -> courses
    await prisma.lessonProgress.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.module.deleteMany({});
    await prisma.enrollment.deleteMany({});
    await prisma.resource.deleteMany({});
    await prisma.course.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "Todos los cursos han sido eliminados"
    });
  } catch (error) {
    console.error("Error deleting all courses:", error);
    return NextResponse.json(
      { error: "Error al eliminar cursos" },
      { status: 500 }
    );
  }
}
