import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/data";
import { CourseDetailClient } from "./course-detail-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  const formattedCourse = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    mentor: {
      name: course.mentor.profile?.displayName || course.mentor.email,
      avatar: course.mentor.profile?.avatar,
    },
    level: course.level,
    category: course.category,
    duration: course.duration || 0,
    lessonsCount: totalLessons,
    studentsCount: course._count.enrollments,
    progress: 0, // TODO: Get from user enrollment
    enrolled: false, // TODO: Check user enrollment
    outcomes: course.outcomes,
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      duration: module.lessons.reduce((acc, l) => acc + (l.duration || 0), 0),
      lessonsCount: module.lessons.length,
      completedCount: 0, // TODO: Get from user progress
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration || 0,
        completed: false, // TODO: Get from user progress
      })),
    })),
    resources: course.resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      type: resource.fileType,
      fileUrl: resource.fileUrl,
    })),
  };

  return <CourseDetailClient course={formattedCourse} />;
}
