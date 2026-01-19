import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingClient } from "./onboarding-client";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  // If user already completed onboarding, redirect to dashboard
  if (user?.profile?.onboardingDone) {
    redirect("/app/dashboard");
  }

  return (
    <OnboardingClient
      userId={session.user.id}
      email={session.user.email || ""}
      currentProfile={
        user?.profile
          ? {
              firstName: user.profile.firstName || "",
              lastName: user.profile.lastName || "",
              displayName: user.profile.displayName || "",
              objective: user.profile.objective || "",
              level: user.profile.level || "",
            }
          : null
      }
    />
  );
}
