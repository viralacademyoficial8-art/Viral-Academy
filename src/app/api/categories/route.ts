import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List all active categories (public for authenticated users)
export async function GET() {
  try {
    const categories = await prisma.courseCat.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        order: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 });
  }
}
