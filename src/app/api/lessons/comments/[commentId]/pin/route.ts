import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Toggle pin status of a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { commentId } = await params;

    // Check if user is admin or mentor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "ADMIN" && user?.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Solo administradores y mentores pueden fijar comentarios" },
        { status: 403 }
      );
    }

    // Get the comment
    const comment = await prisma.lessonComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comentario no encontrado" },
        { status: 404 }
      );
    }

    // Toggle pinned status
    const updatedComment = await prisma.lessonComment.update({
      where: { id: commentId },
      data: { pinned: !comment.pinned },
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
      },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error toggling pin status:", error);
    return NextResponse.json(
      { error: "Error al fijar/desfijar comentario" },
      { status: 500 }
    );
  }
}
