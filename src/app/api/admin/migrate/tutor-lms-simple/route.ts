import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds timeout

interface TutorLMSRow {
  curso_id: string;
  curso_titulo: string;
  curso_slug: string;
  curso_descripcion: string;
  curso_imagen: string;
  modulo_id: string;
  modulo_titulo: string;
  modulo_orden: string;
  leccion_id: string;
  leccion_titulo: string;
  leccion_orden: string;
  leccion_contenido: string;
  video_url: string;
  video_poster?: string;
  duracion?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractYouTubeUrl(videoField: string | undefined): string | null {
  if (!videoField) return null;

  // Handle PHP serialized format from Tutor LMS
  // Example: a:11:{s:6:"source";s:7:"youtube";...s:14:"source_youtube";s:28:"https://youtu.be/C98EHZwuZNg";...}
  const youtubeSourceMatch = videoField.match(/source_youtube";s:\d+:"([^"]+)"/);
  if (youtubeSourceMatch) {
    return youtubeSourceMatch[1];
  }

  // Also check for source_vimeo
  const vimeoSourceMatch = videoField.match(/source_vimeo";s:\d+:"([^"]+)"/);
  if (vimeoSourceMatch && vimeoSourceMatch[1]) {
    return vimeoSourceMatch[1];
  }

  // Check for external URL
  const externalUrlMatch = videoField.match(/source_external_url";s:\d+:"([^"]+)"/);
  if (externalUrlMatch && externalUrlMatch[1]) {
    return externalUrlMatch[1];
  }

  // Standard YouTube URL patterns
  const youtubePatterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of youtubePatterns) {
    const match = videoField.match(pattern);
    if (match) {
      return `https://www.youtube.com/watch?v=${match[1]}`;
    }
  }

  // If it looks like a URL, return as is
  if (videoField.startsWith("http")) {
    return videoField;
  }

  return null;
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
        {
          success: false,
          message: "Debes subir el archivo CSV de Tutor LMS",
          imported: 0,
          errors: []
        },
        { status: 400 }
      );
    }

    // Parse CSV
    let records: TutorLMSRow[];
    let debugInfo = {
      totalRows: 0,
      columns: [] as string[],
      sampleRow: null as Record<string, string> | null,
      hasRequiredColumns: false,
    };

    try {
      const text = await file.text();
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,
        delimiter: [",", ";", "\t"], // Try multiple delimiters
      });

      debugInfo.totalRows = records.length;
      if (records.length > 0) {
        debugInfo.columns = Object.keys(records[0]);
        debugInfo.sampleRow = records[0] as unknown as Record<string, string>;
        debugInfo.hasRequiredColumns =
          "curso_id" in records[0] ||
          "ID" in records[0] ||
          Object.keys(records[0]).some(k => k.toLowerCase().includes("curso"));
      }
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: "Error al parsear el CSV",
        imported: 0,
        errors: [String(parseError)],
        debug: { parseError: String(parseError) }
      });
    }

    // If no records or columns don't match, return debug info
    if (records.length === 0) {
      return NextResponse.json({
        success: false,
        message: "El archivo CSV está vacío o no tiene el formato correcto",
        imported: 0,
        errors: ["No se encontraron filas en el CSV"],
        debug: debugInfo
      });
    }

    const errors: string[] = [];

    // Check if we have the expected columns
    const firstRow = records[0];
    const hasCorrectColumns = "curso_id" in firstRow && "curso_titulo" in firstRow;

    if (!hasCorrectColumns) {
      // Try to map columns if they have different names
      const columnMapping: Record<string, string> = {};
      const keys = Object.keys(firstRow);

      // Common phpMyAdmin export variations
      for (const key of keys) {
        const lowerKey = key.toLowerCase().trim();
        if (lowerKey === "id" || lowerKey === "curso_id" || lowerKey.includes("c.id")) {
          columnMapping[key] = "curso_id";
        } else if (lowerKey.includes("titulo") || lowerKey.includes("post_title")) {
          if (!columnMapping[key]) columnMapping[key] = "curso_titulo";
        }
      }

      errors.push(`Columnas encontradas: ${keys.join(", ")}`);
      errors.push(`Columnas esperadas: curso_id, curso_titulo, curso_slug, modulo_id, modulo_titulo, etc.`);

      if (!keys.includes("curso_id")) {
        return NextResponse.json({
          success: false,
          message: "El CSV no tiene las columnas correctas. Asegúrate de exportar con los alias de la query.",
          imported: 0,
          errors,
          debug: debugInfo
        });
      }
    }

    // Build courses structure from flat data
    const coursesMap = new Map<string, {
      id: string;
      title: string;
      slug: string;
      description: string;
      thumbnail: string | null;
      modules: Map<string, {
        id: string;
        title: string;
        order: number;
        lessons: Array<{
          id: string;
          title: string;
          order: number;
          content: string | null;
          videoUrl: string | null;
        }>;
      }>;
    }>();

    // Process each row
    for (const row of records) {
      const cursoId = row.curso_id;
      const cursoTitulo = row.curso_titulo;

      if (!cursoId || !cursoTitulo) {
        continue; // Skip rows without course info
      }

      // Get or create course entry
      if (!coursesMap.has(cursoId)) {
        const slug = row.curso_slug || generateSlug(cursoTitulo);
        coursesMap.set(cursoId, {
          id: cursoId,
          title: cursoTitulo,
          slug,
          description: row.curso_descripcion || "",
          thumbnail: row.curso_imagen || null,
          modules: new Map(),
        });
      }

      const course = coursesMap.get(cursoId)!;

      // Process module if present
      const moduloId = row.modulo_id;
      const moduloTitulo = row.modulo_titulo;

      if (moduloId && moduloTitulo) {
        if (!course.modules.has(moduloId)) {
          course.modules.set(moduloId, {
            id: moduloId,
            title: moduloTitulo,
            order: parseInt(row.modulo_orden || "1", 10),
            lessons: [],
          });
        }

        const module = course.modules.get(moduloId)!;

        // Process lesson if present
        const leccionId = row.leccion_id;
        const leccionTitulo = row.leccion_titulo;

        if (leccionId && leccionTitulo) {
          // Check if lesson already added (avoid duplicates)
          const lessonExists = module.lessons.some(l => l.id === leccionId);
          if (!lessonExists) {
            module.lessons.push({
              id: leccionId,
              title: leccionTitulo,
              order: parseInt(row.leccion_orden || String(module.lessons.length + 1), 10),
              content: row.leccion_contenido || null,
              videoUrl: extractYouTubeUrl(row.video_url),
            });
          }
        }
      }
    }

    // Import to database
    let importedCourses = 0;
    let importedModules = 0;
    let importedLessons = 0;

    // Get or create a valid mentor for the courses
    let mentorId = session.user.id;

    // First try to find an existing ADMIN or MENTOR user
    const existingMentor = await prisma.user.findFirst({
      where: {
        OR: [
          { role: "ADMIN" },
          { role: "MENTOR" }
        ]
      }
    });

    if (existingMentor) {
      mentorId = existingMentor.id;
    } else {
      // Use the current user but ensure they exist
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id }
      });

      if (!currentUser) {
        return NextResponse.json({
          success: false,
          message: "No se encontró un usuario válido para asignar como mentor",
          imported: 0,
          errors: ["El usuario actual no existe en la base de datos"]
        });
      }
      mentorId = currentUser.id;
    }

    for (const courseData of coursesMap.values()) {
      try {
        // Check if course already exists
        const existingCourse = await prisma.course.findUnique({
          where: { slug: courseData.slug },
        });

        if (existingCourse) {
          errors.push(`Curso "${courseData.title}" ya existe (slug: ${courseData.slug})`);
          continue;
        }

        // Skip courses without modules
        if (courseData.modules.size === 0) {
          errors.push(`Curso "${courseData.title}" no tiene módulos, se omite`);
          continue;
        }

        // Create course with modules and lessons
        const modulesData = Array.from(courseData.modules.values())
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
                  videoUrl: lesson.videoUrl,
                  notes: lesson.content,
                  published: true,
                })),
            },
          }));

        await prisma.course.create({
          data: {
            title: courseData.title,
            slug: courseData.slug,
            description: courseData.description,
            thumbnail: courseData.thumbnail,
            mentorId: mentorId,
            published: true,
            level: "BEGINNER",
            category: "MARKETING",
            modules: {
              create: modulesData,
            },
          },
        });

        importedCourses++;
        importedModules += courseData.modules.size;
        for (const module of courseData.modules.values()) {
          importedLessons += module.lessons.length;
        }
      } catch (dbError) {
        errors.push(`Error al crear curso "${courseData.title}": ${String(dbError)}`);
      }
    }

    return NextResponse.json({
      success: importedCourses > 0,
      message: importedCourses > 0
        ? `Migración completada: ${importedCourses} cursos, ${importedModules} módulos, ${importedLessons} lecciones`
        : "No se pudo importar ningún curso",
      imported: importedCourses,
      details: {
        courses: importedCourses,
        modules: importedModules,
        lessons: importedLessons,
      },
      errors,
    });
  } catch (error) {
    console.error("Tutor LMS Simple Migration error:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
      imported: 0,
      errors: [String(error)],
    });
  }
}
