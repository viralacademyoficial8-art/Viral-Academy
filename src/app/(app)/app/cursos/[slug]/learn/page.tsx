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

// Helper to check if a lesson is file-only (no video, only resources)
function isFileOnlyLesson(lesson: { videoUrl: string | null; resources?: { id: string }[] }): boolean {
  return !lesson.videoUrl && (lesson.resources?.length || 0) > 0;
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

  // Get all lessons with their resources
  const modules = course.modules || [];

  // Get all resources for lessons in this course
  const allLessonIds = modules.flatMap((m) => (m.lessons || []).map((l) => l.id));
  const allResources = await prisma.resource.findMany({
    where: { lessonId: { in: allLessonIds } },
    select: { id: true, lessonId: true },
  });

  const resourcesByLesson = new Map<string, { id: string }[]>();
  allResources.forEach((r) => {
    if (r.lessonId) {
      const existing = resourcesByLesson.get(r.lessonId) || [];
      existing.push({ id: r.id });
      resourcesByLesson.set(r.lessonId, existing);
    }
  });

  const allLessons = modules.flatMap((m) =>
    (m.lessons || []).map((l) => ({
      ...l,
      moduleId: m.id,
      moduleTitle: m.title,
      resources: resourcesByLesson.get(l.id) || [],
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

  // Build module completion map - a module is complete when all video lessons are completed
  const moduleCompletionMap = new Map<string, boolean>();
  modules.forEach((module) => {
    const moduleLessons = module.lessons || [];
    const videoLessons = moduleLessons.filter((l) => l.videoUrl); // Only count video lessons
    const completedVideoLessons = videoLessons.filter((l) => progressMap.get(l.id)?.completed);
    // Module is complete if all video lessons are done (or if there are no video lessons)
    moduleCompletionMap.set(module.id, videoLessons.length === 0 || completedVideoLessons.length === videoLessons.length);
  });

  // Determine which lessons are locked
  // A lesson is locked if any previous module is not complete (except file-only lessons which are always accessible)
  const lessonLockMap = new Map<string, boolean>();
  let allPreviousModulesComplete = true;

  modules.forEach((module, moduleIndex) => {
    const moduleLessons = module.lessons || [];

    moduleLessons.forEach((lesson) => {
      const lessonWithResources = {
        videoUrl: lesson.videoUrl,
        resources: resourcesByLesson.get(lesson.id) || []
      };

      // File-only lessons are never locked
      if (isFileOnlyLesson(lessonWithResources)) {
        lessonLockMap.set(lesson.id, false);
      } else {
        // Video lessons are locked if previous modules are not complete
        lessonLockMap.set(lesson.id, !allPreviousModulesComplete);
      }
    });

    // Update for next module - check if this module is complete
    if (!moduleCompletionMap.get(module.id)) {
      allPreviousModulesComplete = false;
    }
  });

  // Determine current lesson
  let currentLesson = allLessons[0];
  if (lessonId) {
    const found = allLessons.find((l) => l.id === lessonId);
    if (found) {
      // Check if this lesson is locked
      const isLocked = lessonLockMap.get(found.id);
      if (isLocked) {
        // Redirect to first unlocked lesson
        const firstUnlocked = allLessons.find((l) => !lessonLockMap.get(l.id));
        if (firstUnlocked) {
          currentLesson = firstUnlocked;
        }
      } else {
        currentLesson = found;
      }
    }
  } else {
    // Find first incomplete and unlocked lesson
    const firstIncompleteUnlocked = allLessons.find(
      (l) => !progressMap.get(l.id)?.completed && !lessonLockMap.get(l.id)
    );
    if (firstIncompleteUnlocked) {
      currentLesson = firstIncompleteUnlocked;
    }
  }

  // Format data for client with lock status
  const formattedModules = modules.map((module) => ({
    id: module.id,
    title: module.title,
    isComplete: moduleCompletionMap.get(module.id) || false,
    lessons: (module.lessons || []).map((lesson) => {
      const lessonResources = resourcesByLesson.get(lesson.id) || [];
      return {
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration || 0,
        videoUrl: lesson.videoUrl,
        completed: progressMap.get(lesson.id)?.completed || false,
        isLocked: lessonLockMap.get(lesson.id) || false,
        isFileOnly: isFileOnlyLesson({ videoUrl: lesson.videoUrl, resources: lessonResources }),
        hasResources: lessonResources.length > 0,
      };
    }),
  }));

  // Get resources/attachments for the current lesson
  const lessonResources = await prisma.resource.findMany({
    where: { lessonId: currentLesson.id },
    orderBy: { createdAt: "asc" },
  });

  const currentLessonWithResources = {
    videoUrl: currentLesson.videoUrl,
    resources: lessonResources,
  };

  const formattedCurrentLesson = {
    id: currentLesson.id,
    title: currentLesson.title,
    description: currentLesson.description || null,
    videoUrl: currentLesson.videoUrl,
    duration: currentLesson.duration || 0,
    notes: currentLesson.notes || null,
    moduleTitle: currentLesson.moduleTitle,
    completed: progressMap.get(currentLesson.id)?.completed || false,
    isFileOnly: isFileOnlyLesson(currentLessonWithResources),
    resources: lessonResources.map((r) => ({
      id: r.id,
      title: r.title,
      fileUrl: r.fileUrl,
      fileType: r.fileType,
      fileSize: r.fileSize,
    })),
  };

  // Find next and previous lessons (only unlocked ones)
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Check if next lesson is locked
  const nextLessonLocked = nextLesson ? lessonLockMap.get(nextLesson.id) : false;

  // Calculate progress
  const completedCount = allLessons.filter((l) => progressMap.get(l.id)?.completed).length;
  const progress = Math.round((completedCount / allLessons.length) * 100);

  // Get user profile for student name
  const userProfile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      displayName: true,
      firstName: true,
      lastName: true,
    },
  });

  const studentName = userProfile?.displayName ||
    (userProfile?.firstName && userProfile?.lastName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : session.user.email?.split("@")[0] || "Estudiante");

  // Check if user already has certificate for this course
  const existingCertificate = await prisma.certificate.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
    select: { id: true },
  });

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
      nextLessonLocked={nextLessonLocked || false}
      progress={progress}
      completedCount={completedCount}
      totalLessons={allLessons.length}
      userId={userId}
      studentName={studentName}
      hasCertificate={!!existingCertificate}
    />
  );
}
