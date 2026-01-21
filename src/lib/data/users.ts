import prisma from "@/lib/prisma";

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
        subscription: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true
          }
        }
      }
    });

    return user;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
        subscription: true,
      }
    });

    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function getUserStats(userId: string) {
  try {
    const [
      enrollments,
      certificates,
      completedLessons,
      totalLessonsInEnrolledCourses
    ] = await Promise.all([
      prisma.enrollment.count({ where: { userId } }),
      prisma.certificate.count({ where: { userId } }),
      prisma.lessonProgress.count({ where: { userId, completed: true } }),
      prisma.lesson.count({
        where: {
          module: {
            course: {
              enrollments: { some: { userId } }
            }
          }
        }
      })
    ]);

    const overallProgress = totalLessonsInEnrolledCourses > 0
      ? Math.round((completedLessons / totalLessonsInEnrolledCourses) * 100)
      : 0;

    return {
      coursesInProgress: enrollments,
      certificates,
      completedLessons,
      overallProgress
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      coursesInProgress: 0,
      certificates: 0,
      completedLessons: 0,
      overallProgress: 0
    };
  }
}

export async function getUserNotifications(userId: string, limit = 10) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit
  });

  return notifications;
}

export async function getUnreadNotificationCount(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, read: false }
  });

  return count;
}
