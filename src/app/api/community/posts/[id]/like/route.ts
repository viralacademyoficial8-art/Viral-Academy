import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
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
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling post like:", error);
    return NextResponse.json({ error: "Error al dar like" }, { status: 500 });
  }
}
