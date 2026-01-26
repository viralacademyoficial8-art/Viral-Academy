import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch comments for a post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { displayName: true, firstName: true, lastName: true, avatar: true } },
          },
        },
        replies: {
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
          orderBy: { createdAt: "asc" },
        },
        likes: { select: { userId: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Error al obtener comentarios" }, { status: 500 });
  }
}

// POST - Create a comment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: postId } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "El contenido es requerido" }, { status: 400 });
    }

    // Check if post exists and is not locked
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { locked: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }

    if (post.locked) {
      return NextResponse.json({ error: "Esta publicación está bloqueada" }, { status: 403 });
    }

    // If parentId is provided, validate it belongs to this post
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { postId: true },
      });

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json({ error: "Comentario padre no válido" }, { status: 400 });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        authorId: session.user.id,
        postId,
        content: content.trim(),
        parentId: parentId || null,
      },
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
        replies: {
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
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Error al crear comentario" }, { status: 500 });
  }
}
