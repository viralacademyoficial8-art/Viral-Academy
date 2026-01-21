import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

export const dynamic = "force-dynamic";

interface CourseRow {
  title: string;
  slug?: string;
  description?: string;
  shortDesc?: string;
  level?: string;
  category?: string;
  thumbnail?: string;
  module_title: string;
  module_order?: string;
  lesson_title: string;
  lesson_order?: string;
  lesson_videoUrl?: string;
  lesson_duration?: string;
  lesson_content?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No se proporcionó archivo", imported: 0, errors: [] },
        { status: 400 }
      );
    }

    const text = await file.text();

    let records: CourseRow[];
    try {
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: "Error al parsear el CSV",
        imported: 0,
        errors: [String(parseError)],
      });
    }

    if (records.length === 0) {
      return NextResponse.json({
        success: false,
        message: "El archivo CSV está vacío",
        imported: 0,
        errors: [],
      });
    }

    const errors: string[] = [];
    const coursesMap = new Map<string, {
      data: Partial<CourseRow>;
      modules: Map<string, {
        title: string;
        order: number;
        lessons: Array<{
          title: string;
          order: number;
          videoUrl?: string;
          duration?: number;
          content?: string;
        }>;
      }>;
    }>();

    // Group data by course
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // +2 because of header and 0-index

      if (!row.title) {
        errors.push(`Fila ${rowNum}: Falta título del curso`);
        continue;
      }

      if (!row.module_title) {
        errors.push(`Fila ${rowNum}: Falta título del módulo`);
        continue;
      }

      if (!row.lesson_title) {
        errors.push(`Fila ${rowNum}: Falta título de la lección`);
        continue;
      }

      const courseKey = row.slug || generateSlug(row.title);

      if (!coursesMap.has(courseKey)) {
        coursesMap.set(courseKey, {
          data: {
            title: row.title,
            slug: courseKey,
            description: row.description || "",
            shortDesc: row.shortDesc || "",
            level: row.level || "BEGINNER",
            category: row.category || "MARKETING",
            thumbnail: row.thumbnail || "",
          },
          modules: new Map(),
        });
      }

      const course = coursesMap.get(courseKey)!;
      const moduleKey = `${row.module_title}-${row.module_order || "1"}`;

      if (!course.modules.has(moduleKey)) {
        course.modules.set(moduleKey, {
          title: row.module_title,
          order: parseInt(row.module_order || "1", 10),
          lessons: [],
        });
      }

      const module = course.modules.get(moduleKey)!;
      module.lessons.push({
        title: row.lesson_title,
        order: parseInt(row.lesson_order || String(module.lessons.length + 1), 10),
        videoUrl: row.lesson_videoUrl || undefined,
        duration: row.lesson_duration ? parseInt(row.lesson_duration, 10) : undefined,
        content: row.lesson_content || undefined,
      });
    }

    // Import courses to database
    let importedCount = 0;

    for (const [slug, courseData] of coursesMap) {
      try {
        // Check if course already exists
        const existingCourse = await prisma.course.findUnique({
          where: { slug },
        });

        if (existingCourse) {
          errors.push(`Curso "${courseData.data.title}" ya existe (slug: ${slug})`);
          continue;
        }

        // Create course with modules and lessons
        // Use the admin user as the default mentor
        const course = await prisma.course.create({
          data: {
            title: courseData.data.title!,
            slug,
            description: courseData.data.description || "",
            shortDesc: courseData.data.shortDesc || null,
            level: (courseData.data.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED") || "BEGINNER",
            category: courseData.data.category || "MARKETING",
            thumbnail: courseData.data.thumbnail || null,
            mentorId: session.user.id, // Assign to current admin
            published: false, // Start as unpublished
            modules: {
              create: Array.from(courseData.modules.values())
                .sort((a, b) => a.order - b.order)
                .map((module, moduleIndex) => ({
                  title: module.title,
                  order: moduleIndex + 1,
                  lessons: {
                    create: module.lessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson, lessonIndex) => ({
                        title: lesson.title,
                        order: lessonIndex + 1,
                        videoUrl: lesson.videoUrl || null,
                        duration: lesson.duration || null,
                        content: lesson.content || null,
                        published: false,
                      })),
                  },
                })),
            },
          },
        });

        importedCount++;
      } catch (dbError) {
        errors.push(`Error al crear curso "${courseData.data.title}": ${String(dbError)}`);
      }
    }

    return NextResponse.json({
      success: importedCount > 0,
      message: importedCount > 0
        ? `Se importaron ${importedCount} cursos correctamente`
        : "No se pudo importar ningún curso",
      imported: importedCount,
      errors,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
      imported: 0,
      errors: [String(error)],
    });
  }
}
