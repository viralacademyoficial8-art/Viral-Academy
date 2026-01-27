import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

interface RouteParams {
  params: Promise<{ commentId: string }>;
}

// POST - Toggle like on a comment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { commentId } = await params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: { select: { id: true, title: true } },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comentario no encontrado" }, { status: 404 });
    }

    // Check if user already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
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
          commentId,
        },
      });

      // Notify comment author (if not liking own comment)
      if (comment.authorId !== session.user.id) {
        const liker = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { profile: { select: { displayName: true } }, email: true },
        });
        const likerName = liker?.profile?.displayName || liker?.email || "Alguien";
        const postTitle = comment.post.title.substring(0, 40) + (comment.post.title.length > 40 ? "..." : "");

        await createNotification({
          userId: comment.authorId,
          type: "COMMUNITY",
          title: "Nuevo like en tu comentario",
          message: `A ${likerName} le gustó tu comentario en "${postTitle}"`,
          link: `/app/comunidad/${comment.post.id}`,
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json({ error: "Error al dar like" }, { status: 500 });
  }
}
