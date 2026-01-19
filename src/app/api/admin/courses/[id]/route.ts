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

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        mentor: { include: { profile: true } },
        modules: {
          include: { lessons: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        resources: true,
        quiz: true,
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json({ error: "Error al obtener curso" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Check if course exists
    const existing = await prisma.course.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // If updating slug, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.course.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        return NextResponse.json({ error: "El slug ya existe" }, { status: 400 });
      }
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description && { description: data.description }),
        ...(data.shortDesc && { shortDesc: data.shortDesc }),
        ...(data.level && { level: data.level }),
        ...(data.category && { category: data.category }),
        ...(data.mentorId && { mentorId: data.mentorId }),
        ...(data.thumbnail && { thumbnail: data.thumbnail }),
        ...(data.coverImage && { coverImage: data.coverImage }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.outcomes && { outcomes: data.outcomes }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: "Error al actualizar curso" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Check if course exists
    const existing = await prisma.course.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // Delete course (cascade will handle related records)
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: "Error al eliminar curso" }, { status: 500 });
  }
}
