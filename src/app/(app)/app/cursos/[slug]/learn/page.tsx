import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCourseBySlug } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { LearnClient } from "./learn-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function LearnPage({ params, searchParams }: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { slug } = await params;
  const { lesson: lessonId } = await searchParams;

  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const userId = session.user.id;

  // Check enrollment - auto-enroll if not enrolled
  let enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  });

  if (!enrollment) {
    // Auto-enroll the user
    enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: course.id,
      },
    });
  }

  // Get all lessons with their progress
  const modules = course.modules || [];
  const allLessons = modules.flatMap((m) =>
    (m.lessons || []).map((l) => ({
      ...l,
      moduleId: m.id,
      moduleTitle: m.title,
    }))
  );

  if (allLessons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Este curso no tiene lecciones</h2>
          <p className="text-muted-foreground">El contenido estará disponible pronto.</p>
        </div>
      </div>
    );
  }

  // Get lesson progress for this user
  const lessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId,
      lesson: {
        module: { courseId: course.id },
      },
    },
  });

  const progressMap = new Map(lessonProgress.map((lp) => [lp.lessonId, lp]));

  // Determine current lesson
  let currentLesson = allLessons[0];
  if (lessonId) {
    const found = allLessons.find((l) => l.id === lessonId);
    if (found) {
      currentLesson = found;
    }
  } else {
    // Find first incomplete lesson or last lesson
    const firstIncomplete = allLessons.find((l) => !progressMap.get(l.id)?.completed);
    if (firstIncomplete) {
      currentLesson = firstIncomplete;
    }
  }

  // Format data for client
  const formattedModules = modules.map((module) => ({
    id: module.id,
    title: module.title,
    lessons: (module.lessons || []).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration || 0,
      videoUrl: lesson.videoUrl,
      completed: progressMap.get(lesson.id)?.completed || false,
    })),
  }));

  const formattedCurrentLesson = {
    id: currentLesson.id,
    title: currentLesson.title,
    description: currentLesson.description || null,
    videoUrl: currentLesson.videoUrl,
    duration: currentLesson.duration || 0,
    notes: currentLesson.notes || null,
    moduleTitle: currentLesson.moduleTitle,
    completed: progressMap.get(currentLesson.id)?.completed || false,
  };

  // Find next and previous lessons
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Calculate progress
  const completedCount = allLessons.filter((l) => progressMap.get(l.id)?.completed).length;
  const progress = Math.round((completedCount / allLessons.length) * 100);

  return (
    <LearnClient
      course={{
        id: course.id,
        slug: course.slug,
        title: course.title,
        modules: formattedModules,
      }}
      currentLesson={formattedCurrentLesson}
      prevLessonId={prevLesson?.id || null}
      nextLessonId={nextLesson?.id || null}
      progress={progress}
      completedCount={completedCount}
      totalLessons={allLessons.length}
    />
  );
}
