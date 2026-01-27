import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Allowed image formats for optimization
const ALLOWED_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

// Max file size: 2MB (optimized for web)
const MAX_SIZE = 2 * 1024 * 1024;

// Check if user is admin or mentor
async function checkAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !["ADMIN", "MENTOR"].includes(user.role)) {
    return null;
  }

  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Formato no permitido. Usa WebP, JPEG o PNG para mejor rendimiento.",
          allowedTypes: ["WebP", "JPEG", "PNG"]
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: `El archivo es muy grande. Máximo ${MAX_SIZE / 1024 / 1024}MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          maxSize: MAX_SIZE,
          fileSize: file.size
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "webp";
    const filename = `courses/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Save to Media table for gallery tracking (optional - don't fail if table doesn't exist)
    try {
      await prisma.media.create({
        data: {
          filename: file.name,
          url: blob.url,
          type: file.type,
          size: file.size,
          folder: "courses",
          uploadedBy: user.id,
        },
      });
    } catch (dbError) {
      // Media table might not exist yet - that's OK, continue without saving
      console.log("Could not save to Media table:", dbError);
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    );
  }
}
