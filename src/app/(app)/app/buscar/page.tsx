import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SearchClient } from "./search-client";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { q: query } = await searchParams;
  const userId = session.user.id;

  // Get user role for access control
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // Search results
  let courses: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    level: string;
    category: string;
  }> = [];

  let posts: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
    authorName: string;
    categoryName: string;
    createdAt: string;
  }> = [];

  let resources: Array<{
    id: string;
    title: string;
    fileUrl: string;
    fileType: string | null;
    courseName: string | null;
  }> = [];

  if (query && query.trim().length > 0) {
    const searchTerm = query.trim();

    // Search courses
    const coursesResult = await prisma.course.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        level: true,
        category: true,
      },
      take: 10,
    });
    courses = coursesResult.map((c) => ({
      ...c,
      level: c.level || "BEGINNER",
      category: c.category || "GENERAL",
    }));

    // Search community posts
    const postsResult = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { content: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        author: {
          select: {
            email: true,
            profile: { select: { displayName: true } },
          },
        },
        category: { select: { name: true } },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    posts = postsResult.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content.slice(0, 150) + (p.content.length > 150 ? "..." : ""),
      type: p.type,
      authorName: p.author.profile?.displayName || p.author.email.split("@")[0],
      categoryName: p.category.name,
      createdAt: p.createdAt.toISOString(),
    }));

    // Search resources
    const resourcesResult = await prisma.resource.findMany({
      where: {
        title: { contains: searchTerm, mode: "insensitive" },
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: { select: { title: true } },
              },
            },
          },
        },
      },
      take: 10,
    });
    resources = resourcesResult.map((r) => ({
      id: r.id,
      title: r.title,
      fileUrl: r.fileUrl,
      fileType: r.fileType,
      courseName: r.lesson?.module?.course?.title || null,
    }));
  }

  return (
    <SearchClient
      initialQuery={query || ""}
      courses={courses}
      posts={posts}
      resources={resources}
    />
  );
}
