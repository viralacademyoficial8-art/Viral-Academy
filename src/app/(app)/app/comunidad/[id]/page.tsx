import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostDetailClient } from "./post-detail-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const session = await auth();
  const userId = session?.user?.id;

  const { id } = await params;

  // Get user role
  let userRole: string | undefined;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    userRole = user?.role;
  }

  // Fetch post with all details
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          role: true,
          profile: {
            select: {
              displayName: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
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
              profile: {
                select: {
                  displayName: true,
                  firstName: true,
                  lastName: true,
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
                      displayName: true,
                      firstName: true,
                      lastName: true,
                      avatar: true,
                    },
                  },
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
    notFound();
  }

  const getAuthorName = (author: typeof post.author) => {
    return (
      author.profile?.displayName ||
      (author.profile?.firstName && author.profile?.lastName
        ? `${author.profile.firstName} ${author.profile.lastName}`
        : author.email.split("@")[0])
    );
  };

  const formattedPost = {
    id: post.id,
    title: post.title,
    content: post.content,
    type: post.type,
    pinned: post.pinned,
    locked: post.locked,
    createdAt: post.createdAt.toISOString(),
    author: {
      id: post.author.id,
      name: getAuthorName(post.author),
      avatar: post.author.profile?.avatar ?? null,
      role: post.author.role,
    },
    category: {
      id: post.category.id,
      slug: post.category.slug,
      name: post.category.name,
    },
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    isLiked: userId ? post.likes.some((l) => l.userId === userId) : false,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.author.id,
        name: getAuthorName(comment.author),
        avatar: comment.author.profile?.avatar ?? null,
        role: comment.author.role,
      },
      likesCount: comment.likes.length,
      isLiked: userId ? comment.likes.some((l) => l.userId === userId) : false,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        author: {
          id: reply.author.id,
          name: getAuthorName(reply.author),
          avatar: reply.author.profile?.avatar ?? null,
          role: reply.author.role,
        },
        likesCount: reply.likes.length,
        isLiked: userId ? reply.likes.some((l) => l.userId === userId) : false,
      })),
    })),
  };

  return (
    <PostDetailClient
      post={formattedPost}
      userId={userId}
      userRole={userRole}
    />
  );
}
