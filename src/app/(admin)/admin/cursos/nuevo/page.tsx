import { prisma } from "@/lib/prisma";
import { NewCourseClient } from "./new-course-client";

export const dynamic = "force-dynamic";

async function getMentors() {
  const mentors = await prisma.user.findMany({
    where: {
      OR: [{ role: "ADMIN" }, { role: "MENTOR" }],
    },
    include: {
      profile: true,
    },
  });

  return mentors.map((m) => ({
    id: m.id,
    name: m.profile?.displayName || m.profile?.firstName || m.email,
  }));
}

export default async function NewCoursePage() {
  const mentors = await getMentors();

  return <NewCourseClient mentors={mentors} />;
}
