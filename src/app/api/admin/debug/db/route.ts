import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Debug endpoint to test database connection and check data
export async function GET() {
  try {
    // Test database connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as connected`;

    // Count users
    const userCount = await prisma.user.count();

    // Count courses
    const courseCount = await prisma.course.count();

    // Count published courses
    const publishedCourseCount = await prisma.course.count({
      where: { published: true }
    });

    // Get recent users (without sensitive data)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true
          }
        }
      }
    });

    // Check database tables
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    return NextResponse.json({
      success: true,
      connection: "OK",
      stats: {
        users: userCount,
        courses: courseCount,
        publishedCourses: publishedCourseCount
      },
      recentUsers,
      tables,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug DB error:", error);
    return NextResponse.json({
      success: false,
      error: String(error),
      errorType: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// POST to test user creation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "test-create-user") {
      // Create a test user to verify registration works
      const testEmail = `test-${Date.now()}@test.com`;

      const user = await prisma.user.create({
        data: {
          email: testEmail,
          password: "test-password-hash",
          role: "STUDENT",
          profile: {
            create: {
              firstName: "Test",
              lastName: "User",
              displayName: "Test User"
            }
          }
        },
        include: { profile: true }
      });

      // Clean up - delete the test user
      await prisma.user.delete({
        where: { id: user.id }
      });

      return NextResponse.json({
        success: true,
        message: "Test user creation successful",
        testUser: {
          id: user.id,
          email: user.email,
          profileCreated: !!user.profile
        }
      });
    }

    if (action === "publish-all-courses") {
      const result = await prisma.course.updateMany({
        where: { published: false },
        data: { published: true }
      });

      return NextResponse.json({
        success: true,
        message: `Published ${result.count} courses`
      });
    }

    return NextResponse.json({
      success: false,
      error: "Unknown action",
      availableActions: ["test-create-user", "publish-all-courses"]
    }, { status: 400 });
  } catch (error) {
    console.error("Debug DB POST error:", error);
    return NextResponse.json({
      success: false,
      error: String(error),
      errorType: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
