"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Blog categories
export const BLOG_CATEGORIES = {
  marketing: "Marketing Digital",
  ia: "Inteligencia Artificial",
  mindset: "Mentalidad",
  negocios: "Negocios",
  contenido: "Creación de Contenido",
  general: "General",
} as const;

export type BlogCategory = keyof typeof BLOG_CATEGORIES;

// Get all blog posts (admin)
export async function getAllBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    include: {
      author: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return posts;
}

// Get published blog posts (public)
export async function getPublishedBlogPosts(limit?: number) {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    include: {
      author: {
        include: { profile: true },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return posts;
}

// Get blog post by slug (public)
export async function getBlogPostBySlug(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        include: { profile: true },
      },
    },
  });

  return post;
}

// Get blog post by ID (admin)
export async function getBlogPostById(id: string) {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: {
        include: { profile: true },
      },
    },
  });

  return post;
}

// Create blog post
export async function createBlogPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
  category: string;
  tags?: string[];
  published: boolean;
  featured: boolean;
  readTime?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  // Check if user is admin or mentor
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || !["ADMIN", "MENTOR"].includes(user.role)) {
    throw new Error("No tienes permisos para crear artículos");
  }

  // Check if slug already exists
  const existingPost = await prisma.blogPost.findUnique({
    where: { slug: data.slug },
  });

  if (existingPost) {
    throw new Error("Ya existe un artículo con este slug");
  }

  const post = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      thumbnail: data.thumbnail,
      category: data.category,
      tags: data.tags || [],
      published: data.published,
      featured: data.featured,
      readTime: data.readTime || 5,
      publishedAt: data.published ? new Date() : null,
      authorId: session.user.id,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");

  return post;
}

// Update blog post
export async function updateBlogPost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string;
    category?: string;
    tags?: string[];
    published?: boolean;
    featured?: boolean;
    readTime?: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  // Check if user is admin or mentor
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || !["ADMIN", "MENTOR"].includes(user.role)) {
    throw new Error("No tienes permisos para editar artículos");
  }

  // Check if slug already exists (if changing slug)
  if (data.slug) {
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        slug: data.slug,
        NOT: { id },
      },
    });

    if (existingPost) {
      throw new Error("Ya existe un artículo con este slug");
    }
  }

  // Get current post to check if publishing for first time
  const currentPost = await prisma.blogPost.findUnique({
    where: { id },
    select: { published: true, publishedAt: true },
  });

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...data,
      // Set publishedAt if publishing for first time
      publishedAt:
        data.published && !currentPost?.publishedAt
          ? new Date()
          : currentPost?.publishedAt,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);

  return post;
}

// Delete blog post
export async function deleteBlogPost(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Solo los administradores pueden eliminar artículos");
  }

  await prisma.blogPost.delete({
    where: { id },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

// Toggle publish status
export async function toggleBlogPostPublished(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: { published: true, publishedAt: true },
  });

  if (!post) {
    throw new Error("Artículo no encontrado");
  }

  const updatedPost = await prisma.blogPost.update({
    where: { id },
    data: {
      published: !post.published,
      publishedAt: !post.published && !post.publishedAt ? new Date() : post.publishedAt,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");

  return updatedPost;
}

// Toggle featured status
export async function toggleBlogPostFeatured(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: { featured: true },
  });

  if (!post) {
    throw new Error("Artículo no encontrado");
  }

  const updatedPost = await prisma.blogPost.update({
    where: { id },
    data: {
      featured: !post.featured,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");

  return updatedPost;
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .replace(/^-|-$/g, ""); // Remove leading/trailing -
}

// Get blog stats (admin)
export async function getBlogStats() {
  const [total, published, drafts, featured] = await Promise.all([
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.blogPost.count({ where: { published: false } }),
    prisma.blogPost.count({ where: { featured: true } }),
  ]);

  return { total, published, drafts, featured };
}
