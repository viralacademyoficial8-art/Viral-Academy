import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "./analytics-client";

export const dynamic = "force-dynamic";

async function getAnalyticsData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get daily user registrations for the last 30 days
  const usersByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM "User"
    WHERE created_at >= ${thirtyDaysAgo}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  // Get daily new subscriptions for the last 30 days
  const subscriptionsByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM "Subscription"
    WHERE created_at >= ${thirtyDaysAgo} AND status = 'ACTIVE'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  // Get course enrollments
  const enrollmentsByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE(started_at) as date, COUNT(*) as count
    FROM "Enrollment"
    WHERE started_at >= ${thirtyDaysAgo}
    GROUP BY DATE(started_at)
    ORDER BY date ASC
  `;

  // Get top courses by enrollment
  const topCourses = await prisma.course.findMany({
    where: { published: true },
    include: {
      _count: { select: { enrollments: true } },
      mentor: { include: { profile: true } },
    },
    orderBy: { enrollments: { _count: "desc" } },
    take: 5,
  });

  // Get completion rates
  const completedLessons = await prisma.lessonProgress.count({
    where: { completed: true },
  });
  const totalLessonsStarted = await prisma.lessonProgress.count();

  // Current period stats
  const currentUsers = await prisma.user.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });
  const previousUsers = await prisma.user.count({
    where: {
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
    },
  });

  const currentSubscriptions = await prisma.subscription.count({
    where: { createdAt: { gte: thirtyDaysAgo }, status: "ACTIVE" },
  });
  const previousSubscriptions = await prisma.subscription.count({
    where: {
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      status: "ACTIVE",
    },
  });

  // Active subscriptions for MRR
  const activeSubscriptions = await prisma.subscription.count({
    where: { status: "ACTIVE" },
  });

  // Churn - subscriptions that were canceled
  const churnedSubscriptions = await prisma.subscription.count({
    where: {
      status: "CANCELED",
      updatedAt: { gte: thirtyDaysAgo },
    },
  });

  return {
    usersByDay: usersByDay.map((d) => ({
      date: d.date.toISOString().split("T")[0],
      count: Number(d.count),
    })),
    subscriptionsByDay: subscriptionsByDay.map((d) => ({
      date: d.date.toISOString().split("T")[0],
      count: Number(d.count),
    })),
    enrollmentsByDay: enrollmentsByDay.map((d) => ({
      date: d.date.toISOString().split("T")[0],
      count: Number(d.count),
    })),
    topCourses: topCourses.map((c) => ({
      id: c.id,
      title: c.title,
      enrollments: c._count.enrollments,
      mentor: c.mentor.profile?.displayName || c.mentor.email,
    })),
    metrics: {
      currentUsers,
      previousUsers,
      userGrowth:
        previousUsers > 0
          ? ((currentUsers - previousUsers) / previousUsers) * 100
          : 100,
      currentSubscriptions,
      previousSubscriptions,
      subscriptionGrowth:
        previousSubscriptions > 0
          ? ((currentSubscriptions - previousSubscriptions) /
              previousSubscriptions) *
            100
          : 100,
      mrr: activeSubscriptions * 597,
      completionRate:
        totalLessonsStarted > 0
          ? (completedLessons / totalLessonsStarted) * 100
          : 0,
      churnedSubscriptions,
      churnRate:
        activeSubscriptions > 0
          ? (churnedSubscriptions / activeSubscriptions) * 100
          : 0,
    },
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return <AnalyticsClient data={data} />;
}
