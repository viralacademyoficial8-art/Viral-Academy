import prisma from "@/lib/prisma";

export async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        mentor: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true } },
          },
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
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
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

export async function getAllCoursesWithUserStatus(userId?: string) {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        mentor: {
          select: {
            id: true,
            email: true,
            profile: { select: { displayName: true } },
          },
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

    if (!userId) {
      return courses.map(course => ({
        ...course,
        enrolled: false,
        progress: 0
      }));
    }

    // Get user's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true }
    });
    const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));

    // Get progress for each enrolled course
    const coursesWithStatus = await Promise.all(
      courses.map(async (course) => {
        const isEnrolled = enrolledCourseIds.has(course.id);

        if (!isEnrolled) {
          return { ...course, enrolled: false, progress: 0 };
        }

        const totalLessons = course.modules.reduce(
          (acc, mod) => acc + mod.lessons.length,
          0
        );

        const completedLessons = await prisma.lessonProgress.count({
          where: {
            userId,
            completed: true,
            lesson: {
              module: { courseId: course.id }
            }
          }
        });

        const progress = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

        return { ...course, enrolled: true, progress };
      })
    );

    return coursesWithStatus;
  } catch (error) {
    console.error("Error fetching courses with user status:", error);
    return [];
  }
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
