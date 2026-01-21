import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCourseBySlug } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { CourseDetailClient } from "./course-detail-client";
import { stripHtml } from "@/lib/utils";

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

  const session = await auth();
  const userId = session?.user?.id;

  // Check enrollment and get progress
  let isEnrolled = false;
  let completedLessonIds = new Set<string>();

  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!enrollment;

    if (isEnrolled) {
      // Get completed lessons
      const lessonProgress = await prisma.lessonProgress.findMany({
        where: {
          userId,
          completed: true,
          lesson: {
            module: { courseId: course.id },
          },
        },
        select: { lessonId: true },
      });
      completedLessonIds = new Set(lessonProgress.map((lp) => lp.lessonId));
    }
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = completedLessonIds.size;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const formattedCourse = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: stripHtml(course.description),
    mentor: {
      name: course.mentor.profile?.displayName || course.mentor.email,
      avatar: course.mentor.profile?.avatar,
    },
    level: course.level,
    category: course.category,
    duration: course.duration || 0,
    lessonsCount: totalLessons,
    studentsCount: course._count.enrollments,
    progress,
    enrolled: isEnrolled,
    outcomes: course.outcomes.map((outcome) => stripHtml(outcome)),
    modules: course.modules.map((module) => {
      const moduleLessonIds = module.lessons.map((l) => l.id);
      const moduleCompletedCount = moduleLessonIds.filter((id) => completedLessonIds.has(id)).length;

      return {
        id: module.id,
        title: module.title,
        description: module.description ? stripHtml(module.description) : null,
        duration: module.lessons.reduce((acc, l) => acc + (l.duration || 0), 0),
        lessonsCount: module.lessons.length,
        completedCount: moduleCompletedCount,
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration || 0,
          completed: completedLessonIds.has(lesson.id),
        })),
      };
    }),
    resources: course.resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      type: resource.fileType,
      fileUrl: resource.fileUrl,
    })),
  };

  return <CourseDetailClient course={formattedCourse} />;
}
