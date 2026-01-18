import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppLayoutClient } from "@/components/layouts/app-layout-client";

export const dynamic = "force-dynamic";

export default async function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let userData = null;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        subscription: true,
      },
    });

    if (user) {
      userData = {
        name: user.profile?.displayName || user.profile?.firstName || user.email,
        email: user.email,
        image: user.profile?.avatar,
        subscriptionStatus: user.subscription?.status || null,
      };
    }
  }

  return <AppLayoutClient user={userData}>{children}</AppLayoutClient>;
}
