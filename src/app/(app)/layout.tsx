import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppLayoutClient } from "@/components/layouts/app-layout-client";

export const dynamic = "force-dynamic";

export default async function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userData = null;

  try {
    const session = await auth();

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              displayName: true,
              firstName: true,
              avatar: true,
              onboardingDone: true,
            },
          },
          subscription: {
            select: {
              status: true,
            },
          },
        },
      });

      if (user) {
        const needsOnboarding = !user.profile?.onboardingDone;

        userData = {
          name: user.profile?.displayName || user.profile?.firstName || user.email,
          email: user.email,
          image: user.profile?.avatar,
          subscriptionStatus: user.subscription?.status || null,
          needsOnboarding,
        };
      }
    }
  } catch (error) {
    console.error("Error in app layout:", error);
    // Continue with null userData - the layout will still render
  }

  return <AppLayoutClient user={userData}>{children}</AppLayoutClient>;
}
