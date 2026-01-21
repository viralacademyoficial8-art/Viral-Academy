import { auth } from "@/lib/auth";
import { getAllCoursesWithUserStatus } from "@/lib/data/courses";
import { CoursesClient } from "./courses-client";
import { stripHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CursosPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const courses = await getAllCoursesWithUserStatus(userId);

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
      mentor: course.mentor.profile?.displayName || course.mentor.email,
      duration: course.duration || 0,
      enrolled: course.enrolled,
      progress: course.progress,
      featured: course.featured,
      thumbnail: course.thumbnail,
    };
  });

  return <CoursesClient courses={formattedCourses} />;
}
