import { prisma } from "@/lib/prisma";

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
  try {
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
  } catch (error) {
    console.error("Error fetching course by slug:", error);
    return null;
  }
}

export async function getCoursesWithProgress(userId: string) {
  // Get enrollments with courses in one query
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

  if (enrollments.length === 0) {
    return [];
  }

  // Get all course IDs the user is enrolled in
  const courseIds = enrollments.map(e => e.course.id);

  // Get all completed lessons for user in enrolled courses - ONE query instead of N
  const completedLessonsData = await prisma.lessonProgress.groupBy({
    by: ["lessonId"],
    where: {
      userId,
      completed: true,
      lesson: {
        module: {
          courseId: { in: courseIds }
        }
      }
    },
    _count: true
  });

  // Get lesson to course mapping
  const lessonToCourse = new Map<string, string>();
  enrollments.forEach(enrollment => {
    enrollment.course.modules.forEach(mod => {
      mod.lessons.forEach(lesson => {
        lessonToCourse.set(lesson.id, enrollment.course.id);
      });
    });
  });

  // Count completed lessons per course
  const completedPerCourse = new Map<string, number>();
  completedLessonsData.forEach(item => {
    const courseId = lessonToCourse.get(item.lessonId);
    if (courseId) {
      completedPerCourse.set(courseId, (completedPerCourse.get(courseId) || 0) + 1);
    }
  });

  // Build the result
  const coursesWithProgress = enrollments.map((enrollment) => {
    const totalLessons = enrollment.course.modules.reduce(
      (acc, mod) => acc + mod.lessons.length,
      0
    );

    const completedLessons = completedPerCourse.get(enrollment.course.id) || 0;

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
  });

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

    // Get user's enrollments - ONE query
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true }
    });
    const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));

    // If user has no enrollments, return early
    if (enrolledCourseIds.size === 0) {
      return courses.map(course => ({
        ...course,
        enrolled: false,
        progress: 0
      }));
    }

    // Build lesson to course mapping for enrolled courses only
    const lessonToCourse = new Map<string, string>();
    courses.forEach(course => {
      if (enrolledCourseIds.has(course.id)) {
        course.modules.forEach(mod => {
          mod.lessons.forEach(lesson => {
            lessonToCourse.set(lesson.id, course.id);
          });
        });
      }
    });

    // Get ALL completed lessons for user in enrolled courses - ONE query instead of N
    const completedLessonsData = await prisma.lessonProgress.findMany({
      where: {
        userId,
        completed: true,
        lesson: {
          module: {
            courseId: { in: Array.from(enrolledCourseIds) }
          }
        }
      },
      select: { lessonId: true }
    });

    // Count completed lessons per course
    const completedPerCourse = new Map<string, number>();
    completedLessonsData.forEach(item => {
      const courseId = lessonToCourse.get(item.lessonId);
      if (courseId) {
        completedPerCourse.set(courseId, (completedPerCourse.get(courseId) || 0) + 1);
      }
    });

    // Build the result - NO additional queries
    const coursesWithStatus = courses.map((course) => {
      const isEnrolled = enrolledCourseIds.has(course.id);

      if (!isEnrolled) {
        return { ...course, enrolled: false, progress: 0 };
      }

      const totalLessons = course.modules.reduce(
        (acc, mod) => acc + mod.lessons.length,
        0
      );

      const completedLessons = completedPerCourse.get(course.id) || 0;

      const progress = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      return { ...course, enrolled: true, progress };
    });

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
