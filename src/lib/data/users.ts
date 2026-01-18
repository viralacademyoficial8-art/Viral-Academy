import prisma from "@/lib/prisma";

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
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
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      subscription: true
    }
  });

  return user;
}

export async function getUserStats(userId: string) {
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
