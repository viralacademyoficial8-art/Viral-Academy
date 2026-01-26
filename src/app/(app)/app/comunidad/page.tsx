import { getCommunityCategories, getPosts } from "@/lib/data";
import { ComunidadClient } from "./comunidad-client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ComunidadPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Get user role
  let userRole: string | undefined;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    userRole = user?.role;
  }

  const [categories, posts] = await Promise.all([
    getCommunityCategories(),
    getPosts(),
  ]);

  // Get user's likes if logged in
  let userLikes: Set<string> = new Set();
  if (userId) {
    const likes = await prisma.like.findMany({
      where: {
        userId,
        postId: { not: null },
      },
      select: { postId: true },
    });
    userLikes = new Set(likes.map((l) => l.postId).filter(Boolean) as string[]);
  }

  const formattedCategories = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    postsCount: cat._count.posts,
  }));

  const formattedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    type: post.type,
    pinned: post.pinned,
    author: {
      id: post.author.id,
      name: post.author.profile?.displayName || post.author.email,
      avatar: post.author.profile?.avatar,
      role: post.author.role,
    },
    category: {
      slug: post.category.slug,
      name: post.category.name,
    },
    commentsCount: post._count.comments,
    likesCount: post._count.likes,
    createdAt: post.createdAt.toISOString(),
    isLiked: userLikes.has(post.id),
  }));

  return (
    <ComunidadClient
      categories={formattedCategories}
      posts={formattedPosts}
      userId={userId}
      userRole={userRole}
    />
  );
}
