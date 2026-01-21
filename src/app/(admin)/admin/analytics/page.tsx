import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { AnalyticsClient } from "./analytics-client";

export const dynamic = "force-dynamic";

async function getAnalyticsData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  try {
    // Get daily user registrations for the last 30 days
    const usersByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `.catch(() => []);

    // Get daily new subscriptions for the last 30 days
    const subscriptionsByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "Subscription"
      WHERE "createdAt" >= ${thirtyDaysAgo} AND status = 'ACTIVE'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `.catch(() => []);

    // Get course enrollments
    const enrollmentsByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("startedAt") as date, COUNT(*) as count
      FROM "Enrollment"
      WHERE "startedAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("startedAt")
      ORDER BY date ASC
    `.catch(() => []);

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
      usersByDay: (usersByDay || []).map((d) => ({
        date: d.date ? new Date(d.date).toISOString().split("T")[0] : "",
        count: Number(d.count || 0),
      })).filter(d => d.date),
      subscriptionsByDay: (subscriptionsByDay || []).map((d) => ({
        date: d.date ? new Date(d.date).toISOString().split("T")[0] : "",
        count: Number(d.count || 0),
      })).filter(d => d.date),
      enrollmentsByDay: (enrollmentsByDay || []).map((d) => ({
        date: d.date ? new Date(d.date).toISOString().split("T")[0] : "",
        count: Number(d.count || 0),
      })).filter(d => d.date),
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
            : currentUsers > 0 ? 100 : 0,
        currentSubscriptions,
        previousSubscriptions,
        subscriptionGrowth:
          previousSubscriptions > 0
            ? ((currentSubscriptions - previousSubscriptions) /
                previousSubscriptions) *
              100
            : currentSubscriptions > 0 ? 100 : 0,
        mrr: activeSubscriptions * siteConfig.pricing.monthly.price,
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
  } catch (error) {
    console.error("Error fetching analytics:", error);
    // Return empty data on error
    return {
      usersByDay: [],
      subscriptionsByDay: [],
      enrollmentsByDay: [],
      topCourses: [],
      metrics: {
        currentUsers: 0,
        previousUsers: 0,
        userGrowth: 0,
        currentSubscriptions: 0,
        previousSubscriptions: 0,
        subscriptionGrowth: 0,
        mrr: 0,
        completionRate: 0,
        churnedSubscriptions: 0,
        churnRate: 0,
      },
    };
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return <AnalyticsClient data={data} />;
}
