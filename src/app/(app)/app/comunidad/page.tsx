import { getCommunityCategories, getPosts } from "@/lib/data";
import { ComunidadClient } from "./comunidad-client";

export const dynamic = "force-dynamic";

export default async function ComunidadPage() {
  const [categories, posts] = await Promise.all([
    getCommunityCategories(),
    getPosts(),
  ]);

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
      name: post.author.profile?.displayName || post.author.email,
      avatar: post.author.profile?.avatar,
    },
    category: {
      slug: post.category.slug,
      name: post.category.name,
    },
    commentsCount: post._count.comments,
    likesCount: post._count.likes,
    createdAt: post.createdAt.toISOString(),
  }));

  return (
    <ComunidadClient categories={formattedCategories} posts={formattedPosts} />
  );
}
