import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

// Check if user is admin
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

// GET - List all media files
export async function GET(request: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (folder) where.folder = folder;
    if (type) where.type = { startsWith: type };

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          uploader: {
            select: {
              email: true,
              profile: { select: { displayName: true } },
            },
          },
        },
      }),
      prisma.media.count({ where }),
    ]);

    // Get folder stats
    const folderStats = await prisma.media.groupBy({
      by: ["folder"],
      _count: { id: true },
      _sum: { size: true },
    });

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      folders: folderStats.map((f) => ({
        name: f.folder,
        count: f._count.id,
        size: f._sum.size || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: "Error al obtener archivos" }, { status: 500 });
  }
}

// POST - Upload new file
export async function POST(request: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const alt = formData.get("alt") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    // Validate file type (images and common documents)
    const allowedTypes = [
      "image/webp",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "application/pdf",
      "application/zip",
      "video/mp4",
      "video/webm",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usa imágenes (WebP, JPEG, PNG, GIF, SVG), PDF, ZIP o videos (MP4, WebM)." },
        { status: 400 }
      );
    }

    // Max file size: 50MB for videos, 10MB for others
    const maxSize = file.type.startsWith("video/") ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Archivo muy grande. Máximo ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "bin";
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .substring(0, 50);
    const filename = `${folder}/${timestamp}-${sanitizedName}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Save to database
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: blob.url,
        type: file.type,
        size: file.size,
        folder,
        alt,
        uploadedBy: user.id,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}

// DELETE - Delete a file
export async function DELETE(request: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }

    // Delete from Vercel Blob
    try {
      await del(media.url);
    } catch (blobError) {
      console.error("Error deleting from blob:", blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Error al eliminar el archivo" }, { status: 500 });
  }
}
