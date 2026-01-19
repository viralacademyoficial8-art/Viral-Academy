import { auth } from "@/lib/auth";
import { getAllCoursesWithUserStatus } from "@/lib/data/courses";
import { CoursesClient } from "./courses-client";

export const dynamic = "force-dynamic";

export default async function CursosPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const courses = await getAllCoursesWithUserStatus(userId);

  const formattedCourses = courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    shortDesc: course.shortDesc || course.description.substring(0, 100) + "...",
    level: course.level,
    category: course.category,
    mentor: course.mentor.profile?.displayName || course.mentor.email,
    duration: course.duration || 0,
    enrolled: course.enrolled,
    progress: course.progress,
    featured: course.featured,
    thumbnail: course.thumbnail,
  }));

  return <CoursesClient courses={formattedCourses} />;
}
