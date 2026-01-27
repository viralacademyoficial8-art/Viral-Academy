import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Toggle like on a post
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: postId } = await params;

    // Check if post exists and get author info
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }

    // Check if user already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });

      // Notify the post author (if not the same user)
      if (post.authorId !== session.user.id) {
        const liker = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { profile: { select: { displayName: true } }, email: true },
        });
        const likerName = liker?.profile?.displayName || liker?.email || "Alguien";

        await createNotification({
          userId: post.authorId,
          type: "COMMUNITY",
          title: "Nuevo like en tu publicación",
          message: `A ${likerName} le gustó tu publicación "${post.title.substring(0, 40)}${post.title.length > 40 ? "..." : ""}"`,
          link: `/app/comunidad/${postId}`,
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling post like:", error);
    return NextResponse.json({ error: "Error al dar like" }, { status: 500 });
  }
}
