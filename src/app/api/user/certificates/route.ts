import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { put } from "@vercel/blob";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            category: true,
            mentor: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Error al obtener los certificados" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, signatureData } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId es requerido" },
        { status: 400 }
      );
    }

    // Check if user has completed all lessons in the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              where: { published: true },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    // Get all lesson IDs from the course
    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

    if (lessonIds.length === 0) {
      return NextResponse.json(
        { error: "El curso no tiene lecciones" },
        { status: 400 }
      );
    }

    // Check user's progress
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: session.user.id,
        lessonId: { in: lessonIds },
        completed: true,
      },
    });

    const completionPercentage = Math.round((completedLessons / lessonIds.length) * 100);

    if (completionPercentage < 100) {
      return NextResponse.json(
        {
          error: "Debes completar todas las lecciones para obtener el certificado",
          progress: completionPercentage,
          completed: completedLessons,
          total: lessonIds.length,
        },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (existingCertificate) {
      return NextResponse.json(existingCertificate);
    }

    // Get user's profile for student name
    const userProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    const studentName = userProfile?.displayName ||
      (userProfile?.firstName && userProfile?.lastName
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : session.user.email?.split("@")[0] || "Estudiante");

    // Upload signature if provided
    let signatureUrl: string | null = null;
    if (signatureData) {
      try {
        // Convert base64 to buffer
        const base64Data = signatureData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        const filename = `signatures/${session.user.id}-${Date.now()}.png`;
        const blob = await put(filename, buffer, {
          access: "public",
          contentType: "image/png",
        });
        signatureUrl = blob.url;
      } catch (uploadError) {
        console.error("Error uploading signature:", uploadError);
        // Continue without signature if upload fails
      }
    }

    // Generate unique verification code
    const verificationCode = `VA-${nanoid(10).toUpperCase()}`;

    // Create certificate with all required fields
    const certificate = await prisma.certificate.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        verificationCode,
        studentName,
        courseName: course.title,
        signatureUrl,
        completedAt: new Date(),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // Update enrollment as completed
    await prisma.enrollment.updateMany({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
      data: {
        completedAt: new Date(),
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "CERTIFICATE",
        title: "¡Certificado obtenido!",
        message: `¡Felicidades! Has completado el curso "${course.title}" y obtenido tu certificado.`,
        link: `/app/certificados`,
      },
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Error creating certificate:", error);
    return NextResponse.json(
      { error: "Error al generar el certificado" },
      { status: 500 }
    );
  }
}
