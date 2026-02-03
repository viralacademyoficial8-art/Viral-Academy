import { prisma } from "@/lib/prisma";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        profile: {
          select: {
            displayName: true,
            firstName: true,
            avatar: true,
          },
        },
        subscription: {
          select: {
            status: true,
            currentPeriodEnd: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            certificates: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.profile?.displayName || user.profile?.firstName || null,
      avatar: user.profile?.avatar || null,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt.toISOString(),
      subscriptionStatus: user.subscription?.status || null,
      subscriptionEnd: user.subscription?.currentPeriodEnd?.toISOString() || null,
      enrollmentsCount: user._count.enrollments,
      certificatesCount: user._count.certificates,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

async function getStats() {
  try {
    const [total, admins, mentors, vips, students, withSubscription] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "MENTOR" } }),
      prisma.user.count({ where: { role: "VIP" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
    ]);

    return { total, admins, mentors, vips, students, withSubscription };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { total: 0, admins: 0, mentors: 0, vips: 0, students: 0, withSubscription: 0 };
  }
}

export default async function UsersPage() {
  const [users, stats] = await Promise.all([getUsers(), getStats()]);

  return <UsersClient users={users} stats={stats} />;
}
