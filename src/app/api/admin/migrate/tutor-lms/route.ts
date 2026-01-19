import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

export const dynamic = "force-dynamic";

interface CourseRow {
  ID: string;
  Title: string;
  Slug?: string;
  Content?: string;
  Thumbnail?: string;
  "Featured Image URL"?: string;
}

interface TopicRow {
  ID: string;
  Title: string;
  Parent: string;
  "Menu Order"?: string;
}

interface LessonRow {
  ID: string;
  Title: string;
  Parent: string;
  "Menu Order"?: string;
  Content?: string;
  _video?: string;
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

  // The _video field might contain just the URL or a serialized object
  // Try to extract YouTube URL patterns
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
    const coursesFile = formData.get("courses") as File;
    const topicsFile = formData.get("topics") as File;
    const lessonsFile = formData.get("lessons") as File;

    if (!coursesFile || !topicsFile || !lessonsFile) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes subir los 3 archivos: Cursos, Topics y Lecciones",
          imported: 0,
          errors: []
        },
        { status: 400 }
      );
    }

    // Parse all CSV files
    let coursesRecords: CourseRow[];
    let topicsRecords: TopicRow[];
    let lessonsRecords: LessonRow[];

    try {
      const coursesText = await coursesFile.text();
      coursesRecords = parse(coursesText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: "Error al parsear el CSV de Cursos",
        imported: 0,
        errors: [String(parseError)],
      });
    }

    try {
      const topicsText = await topicsFile.text();
      topicsRecords = parse(topicsText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: "Error al parsear el CSV de Topics",
        imported: 0,
        errors: [String(parseError)],
      });
    }

    try {
      const lessonsText = await lessonsFile.text();
      lessonsRecords = parse(lessonsText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: "Error al parsear el CSV de Lecciones",
        imported: 0,
        errors: [String(parseError)],
      });
    }

    const errors: string[] = [];

    // Build courses map with WordPress ID as key
    const coursesMap = new Map<string, {
      wpId: string;
      title: string;
      slug: string;
      description: string;
      thumbnail: string | null;
      modules: Map<string, {
        wpId: string;
        title: string;
        order: number;
        lessons: Array<{
          wpId: string;
          title: string;
          order: number;
          content: string | null;
          videoUrl: string | null;
        }>;
      }>;
    }>();

    // Process courses
    for (const course of coursesRecords) {
      if (!course.ID || !course.Title) {
        errors.push(`Curso sin ID o Título: ${JSON.stringify(course)}`);
        continue;
      }

      const slug = course.Slug || generateSlug(course.Title);
      coursesMap.set(course.ID, {
        wpId: course.ID,
        title: course.Title,
        slug,
        description: course.Content || "",
        thumbnail: course.Thumbnail || course["Featured Image URL"] || null,
        modules: new Map(),
      });
    }

    // Process topics (modules) - they have Parent pointing to Course ID
    for (const topic of topicsRecords) {
      if (!topic.ID || !topic.Title || !topic.Parent) {
        errors.push(`Topic sin ID, Título o Parent: ${JSON.stringify(topic)}`);
        continue;
      }

      const course = coursesMap.get(topic.Parent);
      if (!course) {
        errors.push(`Topic "${topic.Title}" (ID: ${topic.ID}) tiene Parent ${topic.Parent} que no corresponde a ningún curso`);
        continue;
      }

      course.modules.set(topic.ID, {
        wpId: topic.ID,
        title: topic.Title,
        order: parseInt(topic["Menu Order"] || "1", 10),
        lessons: [],
      });
    }

    // Process lessons - they have Parent pointing to Topic ID
    for (const lesson of lessonsRecords) {
      if (!lesson.ID || !lesson.Title || !lesson.Parent) {
        errors.push(`Lección sin ID, Título o Parent: ${JSON.stringify(lesson)}`);
        continue;
      }

      // Find which course contains this topic
      let foundModule = false;
      for (const course of coursesMap.values()) {
        const module = course.modules.get(lesson.Parent);
        if (module) {
          module.lessons.push({
            wpId: lesson.ID,
            title: lesson.Title,
            order: parseInt(lesson["Menu Order"] || String(module.lessons.length + 1), 10),
            content: lesson.Content || null,
            videoUrl: extractYouTubeUrl(lesson._video),
          });
          foundModule = true;
          break;
        }
      }

      if (!foundModule) {
        errors.push(`Lección "${lesson.Title}" (ID: ${lesson.ID}) tiene Parent ${lesson.Parent} que no corresponde a ningún Topic`);
      }
    }

    // Import to database
    let importedCourses = 0;
    let importedModules = 0;
    let importedLessons = 0;

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
                  content: lesson.content,
                  published: false,
                })),
            },
          }));

        await prisma.course.create({
          data: {
            title: courseData.title,
            slug: courseData.slug,
            description: courseData.description,
            thumbnail: courseData.thumbnail,
            mentorId: session.user.id,
            published: false,
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
        ? `Migración completada exitosamente`
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
    console.error("Tutor LMS Migration error:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
      imported: 0,
      errors: [String(error)],
    });
  }
}
