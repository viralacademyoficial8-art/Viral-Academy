import { auth } from "@/lib/auth";
import { getAllCoursesWithUserStatus } from "@/lib/data/courses";
import { CoursesClient } from "./courses-client";
import { stripHtml } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper to safely fetch categories (handles case where table doesn't exist)
async function getCategories() {
  try {
    return await prisma.courseCat.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        color: true,
      },
    });
  } catch (error) {
    // Table might not exist yet, return empty array to use legacy categories
    console.log("CourseCategories table not found, using legacy categories");
    return [];
  }
}

export default async function CursosPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch courses and categories in parallel
  const [courses, dbCategories] = await Promise.all([
    getAllCoursesWithUserStatus(userId),
    getCategories(),
  ]);

  const formattedCourses = courses.map((course) => {
    const rawShortDesc = course.shortDesc || course.description.substring(0, 150);
    const cleanDesc = stripHtml(rawShortDesc);

    // Calculate total duration from all lessons (in seconds)
    const totalDurationSeconds = course.modules.reduce((courseTotal, mod) => {
      return courseTotal + mod.lessons.reduce((modTotal, lesson) => {
        return modTotal + (lesson.duration || 0);
      }, 0);
    }, 0);

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      shortDesc: cleanDesc.length > 100 ? cleanDesc.substring(0, 100) + "..." : cleanDesc,
      level: course.level,
      category: course.category,
      categoryId: course.categoryId,
      mentor: course.mentor.profile?.displayName || course.mentor.email,
      duration: totalDurationSeconds,
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
