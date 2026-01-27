import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MembresiaClient } from "./membresia-client";

export const dynamic = "force-dynamic";

async function getSubscriptionData(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return subscription;
}

export default async function MembresiaPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const subscription = await getSubscriptionData(session.user.id);

  return (
    <MembresiaClient
      subscription={
        subscription
          ? {
              status: subscription.status,
              currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
              currentPeriodStart: subscription.currentPeriodStart?.toISOString() || null,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            }
          : null
      }
    />
  );
}
