import { prisma } from "@/lib/prisma";
import { CoursesAdminClient } from "./courses-admin-client";

export const dynamic = "force-dynamic";

// Default categories as fallback
const defaultCategories = [
  { id: "MARKETING", slug: "marketing", name: "Marketing Digital" },
  { id: "BOTS", slug: "bots", name: "Bots" },
  { id: "LIVE_CLASSES", slug: "live-classes", name: "Clases En Vivo Grupales" },
  { id: "WEB_PAGES", slug: "web-pages", name: "Crear Páginas Web" },
  { id: "EBOOKS", slug: "ebooks", name: "Ebooks" },
  { id: "VIDEO_EDITING", slug: "video-editing", name: "Edición De Video" },
  { id: "AI", slug: "ai", name: "Inteligencia Artificial" },
  { id: "SOCIAL_VIRAL", slug: "social-viral", name: "Redes Sociales y Viralidad" },
  { id: "CONTENT", slug: "content", name: "Creación de Contenido" },
  { id: "AUTOMATION", slug: "automation", name: "Automatización" },
  { id: "BRAND", slug: "brand", name: "Marca Personal" },
  { id: "ECOMMERCE", slug: "ecommerce", name: "E-commerce" },
  { id: "MINDSET", slug: "mindset", name: "Mentalidad" },
  { id: "BUSINESS", slug: "business", name: "Negocios" },
];

async function getCategories() {
  try {
    const categories = await prisma.courseCat.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { id: true, slug: true, name: true, color: true },
    });
    return categories.length > 0 ? categories : defaultCategories;
  } catch (error) {
    console.log("CourseCategories table not found, using default categories");
    return defaultCategories;
  }
}

export default async function AdminCoursesPage() {
  try {
    const [courses, mentors, categories] = await Promise.all([
      prisma.course.findMany({
        include: {
          mentor: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { displayName: true },
              },
            },
          },
          modules: {
            include: { lessons: true },
          },
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "MENTOR"] },
        },
        select: {
          id: true,
          email: true,
          profile: {
            select: { displayName: true },
          },
        },
      }),
      getCategories(),
    ]);

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

    return <CoursesAdminClient courses={formattedCourses} mentors={formattedMentors} categories={categories} />;
  } catch (error) {
    console.error("Error loading courses:", error);
    return <CoursesAdminClient courses={[]} mentors={[]} categories={defaultCategories} />;
  }
}
