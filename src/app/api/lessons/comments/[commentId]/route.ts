import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { commentId } = await params;

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

    // Check if user is the author or admin/mentor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (
      comment.authorId !== session.user.id &&
      user?.role !== "ADMIN" &&
      user?.role !== "MENTOR"
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este comentario" },
        { status: 403 }
      );
    }

    // Delete comment (cascade will delete replies)
    await prisma.lessonComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Error al eliminar comentario" },
      { status: 500 }
    );
  }
}

// PATCH - Update a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { commentId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "El contenido es requerido" },
        { status: 400 }
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

    // Check if user is the author
    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para editar este comentario" },
        { status: 403 }
      );
    }

    // Update comment
    const updatedComment = await prisma.lessonComment.update({
      where: { id: commentId },
      data: { content: content.trim() },
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
      },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Error al actualizar comentario" },
      { status: 500 }
    );
  }
}
