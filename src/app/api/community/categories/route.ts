import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all community categories
export async function GET() {
  try {
    const categories = await prisma.communityCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 });
  }
}
