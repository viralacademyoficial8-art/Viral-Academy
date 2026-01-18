import { getCourses } from "@/lib/data";
import { CoursesClient } from "./courses-client";

export default async function CursosPage() {
  const courses = await getCourses();

  const formattedCourses = courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    shortDesc: course.shortDesc || course.description.substring(0, 100) + "...",
    level: course.level,
    category: course.category,
    mentor: course.mentor.profile?.displayName || course.mentor.email,
    duration: course.duration || 0,
    enrolled: false, // TODO: Check enrollment when auth is ready
    progress: 0, // TODO: Get progress when auth is ready
    featured: course.featured,
    thumbnail: course.thumbnail,
  }));

  return <CoursesClient courses={formattedCourses} />;
}
