import { prisma } from "@/lib/prisma";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: true,
      subscription: true,
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
}

async function getStats() {
  const [total, admins, mentors, students, withSubscription] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "MENTOR" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  return { total, admins, mentors, students, withSubscription };
}

export default async function UsersPage() {
  const [users, stats] = await Promise.all([getUsers(), getStats()]);

  return <UsersClient users={users} stats={stats} />;
}
