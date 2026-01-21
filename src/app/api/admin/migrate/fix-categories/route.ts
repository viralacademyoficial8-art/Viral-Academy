import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Map old categories to new ones
const CATEGORY_MAPPING: Record<string, string> = {
  // Old categories -> New categories
  CONTENT: "SOCIAL_VIRAL",
  AUTOMATION: "BOTS",
  BRAND: "SOCIAL_VIRAL",
  ECOMMERCE: "MARKETING",
  MINDSET: "MARKETING",
  BUSINESS: "MARKETING",
  // Keep these as-is
  MARKETING: "MARKETING",
  AI: "AI",
  // New categories (in case they already exist)
  BOTS: "BOTS",
  LIVE_CLASSES: "LIVE_CLASSES",
  WEB_PAGES: "WEB_PAGES",
  EBOOKS: "EBOOKS",
  VIDEO_EDITING: "VIDEO_EDITING",
  SOCIAL_VIRAL: "SOCIAL_VIRAL",
};

export async function POST() {
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

    // Get all courses with their current categories using raw query
    const courses = await prisma.$queryRaw<Array<{ id: string; category: string }>>`
      SELECT id, category FROM "Course"
    `;

    let updated = 0;
    const errors: string[] = [];

    for (const course of courses) {
      const oldCategory = course.category;
      const newCategory = CATEGORY_MAPPING[oldCategory];

      if (!newCategory) {
        errors.push(`Unknown category "${oldCategory}" for course ${course.id}`);
        continue;
      }

      if (oldCategory !== newCategory) {
        try {
          await prisma.$executeRaw`
            UPDATE "Course" SET category = ${newCategory}::"CourseCategory" WHERE id = ${course.id}
          `;
          updated++;
        } catch (e) {
          errors.push(`Failed to update course ${course.id}: ${String(e)}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} courses`,
      total: courses.length,
      updated,
      errors,
    });
  } catch (error) {
    console.error("Fix categories error:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
      error: String(error),
    });
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Get current category distribution
    const categories = await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
      SELECT category, COUNT(*) as count FROM "Course" GROUP BY category
    `;

    return NextResponse.json({
      success: true,
      categories: categories.map(c => ({
        category: c.category,
        count: Number(c.count),
      })),
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}
