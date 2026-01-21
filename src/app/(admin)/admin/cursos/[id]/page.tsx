import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseEditClient } from "./course-edit-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

async function getCourse(id: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { displayName: true, firstName: true },
            },
          },
        },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    return course;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}

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

export default async function CourseEditPage({ params }: Props) {
  const { id } = await params;
  const [course, mentors] = await Promise.all([getCourse(id), getMentors()]);

  if (!course) {
    notFound();
  }

  const courseData = {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    thumbnail: course.thumbnail,
    level: course.level,
    category: course.category,
    published: course.published,
    featured: course.featured,
    mentorId: course.mentorId,
    mentorName: course.mentor.profile?.displayName || course.mentor.profile?.firstName || course.mentor.email,
    modules: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
        videoUrl: l.videoUrl,
        duration: l.duration,
        published: l.published,
      })),
    })),
  };

  return <CourseEditClient course={courseData} mentors={mentors} />;
}
