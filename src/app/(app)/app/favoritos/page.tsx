import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FavoritosClient } from "./favoritos-client";

export const dynamic = "force-dynamic";

async function getBookmarks(userId: string) {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            category: true,
            level: true,
            shortDesc: true,
            mentor: {
              include: { profile: true },
            },
            _count: { select: { modules: true } },
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true,
            module: {
              select: {
                title: true,
                course: {
                  select: { id: true, title: true, slug: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      courses: bookmarks
        .filter((b) => b.course)
        .map((b) => ({
          bookmarkId: b.id,
          id: b.course!.id,
          title: b.course!.title,
          slug: b.course!.slug,
          thumbnail: b.course!.thumbnail,
          category: b.course!.category,
          level: b.course!.level,
          shortDesc: b.course!.shortDesc,
          mentor: b.course!.mentor.profile?.displayName || b.course!.mentor.email,
          modulesCount: b.course!._count.modules,
          createdAt: b.createdAt.toISOString(),
        })),
      lessons: bookmarks
        .filter((b) => b.lesson)
        .map((b) => ({
          bookmarkId: b.id,
          id: b.lesson!.id,
          title: b.lesson!.title,
          duration: b.lesson!.duration,
          moduleName: b.lesson!.module.title,
          courseId: b.lesson!.module.course.id,
          courseTitle: b.lesson!.module.course.title,
          courseSlug: b.lesson!.module.course.slug,
          createdAt: b.createdAt.toISOString(),
        })),
    };
  } catch (error) {
    // Bookmark table may not exist yet if migration hasn't run
    console.error("Error fetching bookmarks:", error);
    return { courses: [], lessons: [] };
  }
}

export default async function FavoritosPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const bookmarks = await getBookmarks(session.user.id);

  return <FavoritosClient bookmarks={bookmarks} />;
}
