import { auth } from "@/lib/auth";
import { getAllCoursesWithUserStatus } from "@/lib/data/courses";
import { CoursesClient } from "./courses-client";
import { stripHtml } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CursosPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch courses and categories in parallel
  const [courses, dbCategories] = await Promise.all([
    getAllCoursesWithUserStatus(userId),
    prisma.courseCat.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        color: true,
      },
    }),
  ]);

  const formattedCourses = courses.map((course) => {
    const rawShortDesc = course.shortDesc || course.description.substring(0, 150);
    const cleanDesc = stripHtml(rawShortDesc);

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      shortDesc: cleanDesc.length > 100 ? cleanDesc.substring(0, 100) + "..." : cleanDesc,
      level: course.level,
      category: course.category,
      categoryId: course.categoryId,
      mentor: course.mentor.profile?.displayName || course.mentor.email,
      duration: course.duration || 0,
      enrolled: course.enrolled,
      progress: course.progress,
      featured: course.featured,
      thumbnail: course.thumbnail,
    };
  });

  // Create categories map for display - combine database categories with legacy
  const categories = dbCategories.map((cat) => ({
    key: cat.slug,
    label: cat.name,
    color: cat.color,
  }));

  return <CoursesClient courses={formattedCourses} categories={categories} />;
}
