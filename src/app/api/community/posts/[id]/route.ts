import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single post with comments
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { displayName: true, firstName: true, lastName: true, avatar: true } },
          },
        },
        category: true,
        comments: {
          where: { parentId: null },
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
        },
        likes: { select: { userId: true } },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Error al obtener publicación" }, { status: 500 });
  }
}

// PUT - Update a post
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content, type, pinned, locked } = body;

    // Check if post exists and user is authorized
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }

    // Check authorization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isAdmin = ["ADMIN", "MENTOR"].includes(user?.role || "");
    const isAuthor = post.authorId === session.user.id;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "No tienes permiso para editar esta publicación" }, { status: 403 });
    }

    // Only admins can pin/lock posts
    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (type) updateData.type = type;

    if (isAdmin) {
      if (typeof pinned === "boolean") updateData.pinned = pinned;
      if (typeof locked === "boolean") updateData.locked = locked;
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: { select: { displayName: true, avatar: true } },
          },
        },
        category: true,
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Error al actualizar publicación" }, { status: 500 });
  }
}

// DELETE - Delete a post
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Check if post exists and user is authorized
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }

    // Check authorization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isAdmin = ["ADMIN", "MENTOR"].includes(user?.role || "");
    const isAuthor = post.authorId === session.user.id;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "No tienes permiso para eliminar esta publicación" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Error al eliminar publicación" }, { status: 500 });
  }
}
