import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "./admin-dashboard-client";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  const [
    totalUsers,
    activeSubscriptions,
    totalCourses,
    totalLives,
    recentUsers,
    recentSubscriptions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.course.count({ where: { published: true } }),
    prisma.liveEvent.count({ where: { published: true } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { profile: true, subscription: true },
    }),
    prisma.subscription.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { status: "ACTIVE" },
      include: { user: { include: { profile: true } } },
    }),
  ]);

  // Calculate MRR (Monthly Recurring Revenue)
  const mrr = activeSubscriptions * 597;

  // Get new users this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newUsersThisMonth = await prisma.user.count({
    where: { createdAt: { gte: startOfMonth } },
  });

  const newSubscriptionsThisMonth = await prisma.subscription.count({
    where: {
      status: "ACTIVE",
      createdAt: { gte: startOfMonth },
    },
  });

  return {
    totalUsers,
    activeSubscriptions,
    totalCourses,
    totalLives,
    mrr,
    newUsersThisMonth,
    newSubscriptionsThisMonth,
    recentUsers: recentUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.profile?.displayName || u.profile?.firstName || u.email,
      createdAt: u.createdAt.toISOString(),
      hasSubscription: u.subscription?.status === "ACTIVE",
    })),
    recentSubscriptions: recentSubscriptions.map((s) => ({
      id: s.id,
      userId: s.userId,
      userName: s.user.profile?.displayName || s.user.profile?.firstName || s.user.email,
      userEmail: s.user.email,
      createdAt: s.createdAt.toISOString(),
      status: s.status,
    })),
  };
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return <AdminDashboardClient stats={stats} />;
}
