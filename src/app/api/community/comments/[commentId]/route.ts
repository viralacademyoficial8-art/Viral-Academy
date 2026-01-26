import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ commentId: string }>;
}

// DELETE - Delete a comment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { commentId } = await params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comentario no encontrado" }, { status: 404 });
    }

    // Check authorization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isAdmin = ["ADMIN", "MENTOR"].includes(user?.role || "");
    const isAuthor = comment.authorId === session.user.id;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "No tienes permiso para eliminar este comentario" }, { status: 403 });
    }

    // Delete comment (and its replies via cascade)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Error al eliminar comentario" }, { status: 500 });
  }
}

// PUT - Update a comment
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { commentId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "El contenido es requerido" }, { status: 400 });
    }

    // Check if comment exists and user is author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comentario no encontrado" }, { status: 404 });
    }

    if (comment.authorId !== session.user.id) {
      return NextResponse.json({ error: "Solo puedes editar tus propios comentarios" }, { status: 403 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { displayName: true, firstName: true, lastName: true, avatar: true } },
          },
        },
        likes: { select: { userId: true } },
      },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json({ error: "Error al actualizar comentario" }, { status: 500 });
  }
}
