import { prisma } from "@/lib/prisma";
import { EnrollmentsClient } from "./enrollments-client";

export const dynamic = "force-dynamic";

async function getEnrollments() {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                displayName: true,
                firstName: true,
                avatar: true,
              },
            },
          },
        },
        course: {
          select: { id: true, title: true, slug: true, category: true },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      userId: enrollment.userId,
      userName: enrollment.user.profile?.displayName || enrollment.user.profile?.firstName || enrollment.user.email,
      userEmail: enrollment.user.email,
      userAvatar: enrollment.user.profile?.avatar || null,
      courseId: enrollment.courseId,
      courseTitle: enrollment.course.title,
      courseSlug: enrollment.course.slug,
      category: enrollment.course.category,
      startedAt: enrollment.startedAt.toISOString(),
      completedAt: enrollment.completedAt?.toISOString() || null,
    }));
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return [];
  }
}

async function getStats() {
  try {
    const [total, completed, inProgress, courseStats] = await Promise.all([
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { completedAt: { not: null } } }),
      prisma.enrollment.count({ where: { completedAt: null } }),
      prisma.course.findMany({
        where: { published: true },
        select: {
          id: true,
          title: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { enrollments: { _count: "desc" } },
        take: 5,
      }),
    ]);

    return {
      total,
      completed,
      inProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      topCourses: courseStats.map((c) => ({
        id: c.id,
        title: c.title,
        enrollments: c._count.enrollments,
      })),
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      completionRate: 0,
      topCourses: [],
    };
  }
}

export default async function EnrollmentsPage() {
  const [enrollments, stats] = await Promise.all([getEnrollments(), getStats()]);

  return <EnrollmentsClient enrollments={enrollments} stats={stats} />;
}
