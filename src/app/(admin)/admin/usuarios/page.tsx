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
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    subscriptionStatus: user.subscription?.status || null,
    subscriptionEnd: user.subscription?.currentPeriodEnd?.toISOString() || null,
    enrollmentsCount: user._count.enrollments,
    certificatesCount: user._count.certificates,
  }));
}

export default async function UsersPage() {
  const users = await getUsers();

  return <UsersClient users={users} />;
}
