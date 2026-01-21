import { prisma } from "@/lib/prisma";

export async function getDashboardData(userId: string) {
  try {
    const [
      userWithProfile,
      stats,
      currentEnrollment,
      upcomingLives,
      recentResources,
      livesThisWeek
    ] = await Promise.all([
      // User profile
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          profile: true,
          subscription: true,
        },
      }),
      // User stats
      getUserDashboardStats(userId),
      // Current enrollment (most recent with progress)
      prisma.enrollment.findFirst({
        where: { userId },
        orderBy: { startedAt: "desc" },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: true,
                },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      }),
      // Upcoming lives
      prisma.liveEvent.findMany({
        where: {
          scheduledAt: { gte: new Date() },
          published: true,
        },
        orderBy: { scheduledAt: "asc" },
        take: 3,
        include: {
          mentor: {
            select: {
              id: true,
              email: true,
              profile: { select: { displayName: true } },
            },
          },
        },
      }),
      // Recent resources (global resources without course/lesson association)
      prisma.resource.findMany({
        where: {
          courseId: null,
          lessonId: null,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      // Lives this week count
      prisma.liveEvent.count({
        where: {
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          published: true,
        },
      }),
    ]);

    // Calculate current lesson for continue learning
    let continueLearning = null;
    if (currentEnrollment) {
      const completedLessons = await prisma.lessonProgress.findMany({
        where: { userId, completed: true },
        select: { lessonId: true },
      });
      const completedIds = new Set(completedLessons.map((l) => l.lessonId));

      // Find next incomplete lesson
      let totalLessons = 0;
      let completedCount = 0;
      let nextLesson = null;
      let nextModule = null;

      for (const module of currentEnrollment.course.modules) {
        for (const lesson of module.lessons) {
          totalLessons++;
          if (completedIds.has(lesson.id)) {
            completedCount++;
          } else if (!nextLesson) {
            nextLesson = lesson;
            nextModule = module;
          }
        }
      }

      const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      continueLearning = {
        course: currentEnrollment.course.title,
        courseSlug: currentEnrollment.course.slug,
        lesson: nextLesson?.title || "Curso completado",
        module: nextModule?.title || "",
        progress,
        thumbnail: currentEnrollment.course.thumbnail,
      };
    }

    return {
      user: userWithProfile,
      stats: {
        ...stats,
        livesThisWeek,
      },
      continueLearning,
      upcomingLives: upcomingLives.map((live) => ({
        id: live.id,
        title: live.title,
        mentor: live.mentor.profile?.displayName || live.mentor.email,
        scheduledAt: live.scheduledAt,
        type: live.type,
      })),
      recentResources: recentResources.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.fileType || "file",
      })),
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      user: null,
      stats: {
        coursesInProgress: 0,
        certificates: 0,
        overallProgress: 0,
        livesThisWeek: 0,
      },
      continueLearning: null,
      upcomingLives: [],
      recentResources: [],
    };
  }
}

async function getUserDashboardStats(userId: string) {
  const [enrollments, certificates, completedLessons, totalLessonsInEnrolled] = await Promise.all([
    prisma.enrollment.count({ where: { userId } }),
    prisma.certificate.count({ where: { userId } }),
    prisma.lessonProgress.count({ where: { userId, completed: true } }),
    prisma.lesson.count({
      where: {
        module: {
          course: {
            enrollments: { some: { userId } },
          },
        },
      },
    }),
  ]);

  const overallProgress =
    totalLessonsInEnrolled > 0
      ? Math.round((completedLessons / totalLessonsInEnrolled) * 100)
      : 0;

  return {
    coursesInProgress: enrollments,
    certificates,
    overallProgress,
  };
}
