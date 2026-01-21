import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
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

    // Get all courses (including unpublished) with raw query to avoid enum issues
    let coursesRaw;
    try {
      coursesRaw = await prisma.$queryRaw`
        SELECT id, slug, title, category, published, "mentorId"
        FROM "Course"
        LIMIT 50
      `;
    } catch (rawError) {
      return NextResponse.json({
        success: false,
        error: "Raw query failed",
        details: String(rawError),
      });
    }

    // Try standard Prisma query
    let coursesPrisma;
    let prismaError = null;
    try {
      coursesPrisma = await prisma.course.findMany({
        take: 10,
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          published: true,
        },
      });
    } catch (e) {
      prismaError = String(e);
    }

    // Count courses by published status
    const stats = await prisma.$queryRaw`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE published = true) as published_count,
        COUNT(*) FILTER (WHERE published = false) as unpublished_count
      FROM "Course"
    `;

    return NextResponse.json({
      success: true,
      stats,
      coursesRaw,
      coursesPrisma,
      prismaError,
    });
  } catch (error) {
    console.error("Debug courses error:", error);
    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}

// POST to fix courses (publish all, fix categories)
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Publish all courses
    const publishResult = await prisma.$executeRaw`
      UPDATE "Course" SET published = true WHERE published = false
    `;

    return NextResponse.json({
      success: true,
      message: `Published ${publishResult} courses`,
      publishedCount: publishResult,
    });
  } catch (error) {
    console.error("Fix courses error:", error);
    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}
