import { prisma } from "@/lib/prisma";
import { CoursesAdminClient } from "./courses-admin-client";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      mentor: {
        include: { profile: true },
      },
      modules: {
        include: { lessons: true },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mentors = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "MENTOR"] },
    },
    include: { profile: true },
  });

  const formattedCourses = courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    level: course.level,
    category: course.category,
    published: course.published,
    featured: course.featured,
    mentor: course.mentor.profile?.displayName || course.mentor.email,
    mentorId: course.mentorId,
    modulesCount: course.modules.length,
    lessonsCount: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
    studentsCount: course._count.enrollments,
    createdAt: course.createdAt.toISOString(),
  }));

  const formattedMentors = mentors.map((m) => ({
    id: m.id,
    name: m.profile?.displayName || m.email,
  }));

  return <CoursesAdminClient courses={formattedCourses} mentors={formattedMentors} />;
}
