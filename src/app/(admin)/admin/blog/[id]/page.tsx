import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditPostClient } from "./edit-post-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
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
  });

  if (!post) {
    notFound();
  }

  const formattedPost = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content,
    thumbnail: post.thumbnail || "",
    category: post.category,
    tags: post.tags,
    published: post.published,
    featured: post.featured,
    readTime: post.readTime,
    author: post.author.profile?.displayName || post.author.email,
    authorId: post.authorId,
    publishedAt: post.publishedAt?.toISOString() || null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };

  return <EditPostClient post={formattedPost} />;
}
