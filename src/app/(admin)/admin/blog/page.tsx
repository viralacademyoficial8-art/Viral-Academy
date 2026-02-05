import { prisma } from "@/lib/prisma";
import { BlogAdminClient } from "./blog-admin-client";
import { getBlogStats } from "@/lib/actions/blog";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  try {
    const [posts, stats] = await Promise.all([
      prisma.blogPost.findMany({
        include: {
          author: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { displayName: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      getBlogStats(),
    ]);

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      published: post.published,
      featured: post.featured,
      readTime: post.readTime,
      author: post.author.profile?.displayName || post.author.email,
      authorId: post.authorId,
      publishedAt: post.publishedAt?.toISOString() || null,
      createdAt: post.createdAt.toISOString(),
    }));

    return <BlogAdminClient posts={formattedPosts} stats={stats} />;
  } catch (error) {
    console.error("Error loading blog posts:", error);
    return (
      <BlogAdminClient
        posts={[]}
        stats={{ total: 0, published: 0, drafts: 0, featured: 0 }}
      />
    );
  }
}
