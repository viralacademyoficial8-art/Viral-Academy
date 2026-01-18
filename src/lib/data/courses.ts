import prisma from "@/lib/prisma";

export async function getCourses() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      mentor: {
        include: { profile: true }
      },
      modules: {
        include: { lessons: true }
      },
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: [{ featured: "desc" }, { order: "asc" }]
  });

  return courses;
}

export async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      mentor: {
        include: { profile: true }
      },
      modules: {
        include: {
          lessons: {
            orderBy: { order: "asc" }
          }
        },
        orderBy: { order: "asc" }
      },
      resources: true,
      quiz: true,
      _count: {
        select: { enrollments: true }
      }
    }
  });

  return course;
}

export async function getCoursesWithProgress(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          mentor: { include: { profile: true } },
          modules: { include: { lessons: true } }
        }
      }
    }
  });

  const coursesWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalLessons = enrollment.course.modules.reduce(
        (acc, mod) => acc + mod.lessons.length,
        0
      );

      const completedLessons = await prisma.lessonProgress.count({
        where: {
          userId,
          completed: true,
          lesson: {
            module: { courseId: enrollment.course.id }
          }
        }
      });

      const progress = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      return {
        ...enrollment.course,
        enrolled: true,
        progress,
        startedAt: enrollment.startedAt,
        completedAt: enrollment.completedAt
      };
    })
  );

  return coursesWithProgress;
}

export async function getUserCourseProgress(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: { lessons: true }
      }
    }
  });

  if (!course) return null;

  const totalLessons = course.modules.reduce(
    (acc, mod) => acc + mod.lessons.length,
    0
  );

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      completed: true,
      lesson: {
        module: { courseId }
      }
    }
  });

  const lastProgress = await prisma.lessonProgress.findFirst({
    where: { userId, lesson: { module: { courseId } } },
    orderBy: { updatedAt: "desc" },
    include: {
      lesson: {
        include: { module: true }
      }
    }
  });

  return {
    totalLessons,
    completedLessons,
    progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    lastLesson: lastProgress?.lesson
  };
}
