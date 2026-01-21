import { prisma } from "@/lib/prisma";
import { NewLiveClient } from "./new-live-client";

export const dynamic = "force-dynamic";

async function getMentors() {
  try {
    const mentors = await prisma.user.findMany({
      where: {
        OR: [{ role: "ADMIN" }, { role: "MENTOR" }],
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: { displayName: true, firstName: true },
        },
      },
    });

    return mentors.map((m) => ({
      id: m.id,
      name: m.profile?.displayName || m.profile?.firstName || m.email,
    }));
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return [];
  }
}

export default async function NewLivePage() {
  const mentors = await getMentors();

  return <NewLiveClient mentors={mentors} />;
}
