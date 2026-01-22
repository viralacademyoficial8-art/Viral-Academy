import { prisma } from "@/lib/prisma";

export async function getCommunityCategories() {
  try {
    const categories = await prisma.communityCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    return categories;
  } catch (error) {
    console.error("Error fetching community categories:", error);
    return [];
  }
}

export async function getPosts(categorySlug?: string, limit?: number) {
  try {
    const posts = await prisma.post.findMany({
      where: categorySlug ? { category: { slug: categorySlug } } : undefined,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true, avatar: true } },
          },
        },
        category: true,
        _count: {
          select: { comments: true, likes: true }
        }
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      ...(limit && { take: limit })
    });

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPostById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        include: { profile: true }
      },
      category: true,
      comments: {
        include: {
          author: {
            include: { profile: true }
          },
          replies: {
            include: {
              author: {
                include: { profile: true }
              }
            }
          },
          _count: {
            select: { likes: true }
          }
        },
        where: { parentId: null },
        orderBy: { createdAt: "asc" }
      },
      _count: {
        select: { comments: true, likes: true }
      }
    }
  });

  return post;
}

export async function getUserPosts(userId: string) {
  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    include: {
      category: true,
      _count: {
        select: { comments: true, likes: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return posts;
}
