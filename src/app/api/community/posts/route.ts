import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAllUsers } from "@/lib/notifications";

// GET - Fetch all posts (with optional category filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const limit = searchParams.get("limit");

    const posts = await prisma.post.findMany({
      where: categorySlug ? { category: { slug: categorySlug } } : undefined,
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
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      ...(limit && { take: parseInt(limit) }),
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Error al obtener publicaciones" }, { status: 500 });
  }
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, type, categoryId } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: "Título, contenido y categoría son requeridos" },
        { status: 400 }
      );
    }

    // Validate category exists
    const category = await prisma.communityCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    // Check if user is allowed to post announcements (only ADMIN/MENTOR)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (type === "ANNOUNCEMENT" && !["ADMIN", "MENTOR"].includes(user?.role || "")) {
      return NextResponse.json(
        { error: "Solo administradores y mentores pueden crear anuncios" },
        { status: 403 }
      );
    }

    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        categoryId,
        title,
        content,
        type: type || "GENERAL",
      },
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

    // If it's an announcement, notify all users
    if (type === "ANNOUNCEMENT") {
      const authorName = post.author.profile?.displayName || post.author.email;
      await notifyAllUsers(
        "COMMUNITY",
        "Nuevo anuncio en la comunidad",
        `${authorName} publicó: ${title.substring(0, 50)}${title.length > 50 ? "..." : ""}`,
        `/app/comunidad/${post.id}`,
        session.user.id // Exclude the author from notifications
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Error al crear publicación" }, { status: 500 });
  }
}
