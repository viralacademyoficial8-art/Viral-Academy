import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch comments for a lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: lessonId } = await params;

    // Get top-level comments with replies
    const comments = await prisma.lessonComment.findMany({
      where: {
        lessonId,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    displayName: true,
                    avatar: true,
                  },
                },
              },
            },
            likes: {
              select: { userId: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: {
          select: { userId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Error al obtener comentarios" },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const body = await request.json();
    const { content, parentId, attachments } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "El contenido es requerido" },
        { status: 400 }
      );
    }

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lección no encontrada" },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await prisma.lessonComment.create({
      data: {
        lessonId,
        authorId: session.user.id,
        content: content.trim(),
        parentId: parentId || null,
        attachments: attachments || null,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
        replies: true,
        likes: true,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Error al crear comentario" },
      { status: 500 }
    );
  }
}
