import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Check if user is admin
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

interface LessonInput {
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  notes?: string;
  order?: number;
}

interface ModuleInput {
  title: string;
  description?: string;
  order?: number;
  lessons?: LessonInput[];
}

interface CourseInput {
  title: string;
  slug: string;
  description: string;
  shortDesc?: string;
  thumbnail?: string;
  coverImage?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category?: string;
  published?: boolean;
  featured?: boolean;
  order?: number;
  duration?: number;
  outcomes?: string[];
  modules?: ModuleInput[];
}

// Generate a unique slug if conflict exists
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// POST - Import one or more courses
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const courses: CourseInput[] = Array.isArray(body) ? body : [body];

    const results = [];
    const errors = [];

    for (const courseData of courses) {
      try {
        // Validate required fields
        if (!courseData.title || !courseData.slug || !courseData.description) {
          errors.push({
            title: courseData.title || "Sin título",
            error: "Faltan campos requeridos: title, slug, description",
          });
          continue;
        }

        // Generate unique slug if exists
        const slug = await generateUniqueSlug(courseData.slug);

        // Create course with modules and lessons
        const course = await prisma.course.create({
          data: {
            title: courseData.title,
            slug,
            description: courseData.description,
            shortDesc: courseData.shortDesc,
            thumbnail: courseData.thumbnail,
            coverImage: courseData.coverImage,
            level: courseData.level || "BEGINNER",
            category: courseData.category || "MARKETING",
            mentorId: admin.id, // Assign to admin creating it
            published: courseData.published ?? false,
            featured: courseData.featured ?? false,
            order: courseData.order ?? 0,
            duration: courseData.duration,
            outcomes: courseData.outcomes || [],
            modules: courseData.modules
              ? {
                  create: courseData.modules.map((module, moduleIndex) => ({
                    title: module.title,
                    description: module.description,
                    order: module.order ?? moduleIndex,
                    lessons: module.lessons
                      ? {
                          create: module.lessons.map((lesson, lessonIndex) => ({
                            title: lesson.title,
                            description: lesson.description,
                            videoUrl: lesson.videoUrl,
                            duration: lesson.duration,
                            notes: lesson.notes,
                            order: lesson.order ?? lessonIndex,
                            published: true,
                          })),
                        }
                      : undefined,
                  })),
                }
              : undefined,
          },
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        });

        results.push({
          id: course.id,
          title: course.title,
          slug: course.slug,
          modulesCount: course.modules.length,
          lessonsCount: course.modules.reduce(
            (acc, m) => acc + m.lessons.length,
            0
          ),
        });
      } catch (error) {
        console.error(`Error importing course "${courseData.title}":`, error);
        errors.push({
          title: courseData.title,
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error importing courses:", error);
    return NextResponse.json(
      { error: "Error al importar cursos" },
      { status: 500 }
    );
  }
}

// GET - Get import template/example
export async function GET() {
  const template: CourseInput = {
    title: "Nombre del Curso",
    slug: "nombre-del-curso",
    description: "Descripción completa del curso. Puede incluir múltiples párrafos.",
    shortDesc: "Descripción corta para las tarjetas de curso.",
    thumbnail: "https://example.com/thumbnail.jpg",
    level: "BEGINNER",
    category: "MARKETING",
    published: false,
    featured: false,
    duration: 120,
    outcomes: [
      "Lo que aprenderás punto 1",
      "Lo que aprenderás punto 2",
      "Lo que aprenderás punto 3",
    ],
    modules: [
      {
        title: "Módulo 1: Introducción",
        description: "Descripción del módulo",
        order: 0,
        lessons: [
          {
            title: "Lección 1.1: Bienvenida",
            description: "Descripción de la lección",
            videoUrl: "https://www.youtube.com/watch?v=XXXXX",
            duration: 10,
            order: 0,
          },
          {
            title: "Lección 1.2: Conceptos básicos",
            videoUrl: "https://vimeo.com/XXXXX",
            duration: 15,
            order: 1,
          },
        ],
      },
      {
        title: "Módulo 2: Contenido Principal",
        order: 1,
        lessons: [
          {
            title: "Lección 2.1: Tema principal",
            videoUrl: "https://www.youtube.com/watch?v=XXXXX",
            duration: 20,
            order: 0,
          },
        ],
      },
    ],
  };

  return NextResponse.json({
    message: "Template de importación de cursos",
    instructions: {
      single: "Envía un objeto JSON con la estructura del curso",
      multiple: "Envía un array de objetos para importar múltiples cursos",
      categories: [
        "BOTS", "LIVE_CLASSES", "WEB_PAGES", "EBOOKS", "VIDEO_EDITING",
        "AI", "MARKETING", "SOCIAL_VIRAL", "CONTENT", "AUTOMATION",
        "BRAND", "ECOMMERCE", "MINDSET", "BUSINESS"
      ],
      levels: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    },
    template,
  });
}
