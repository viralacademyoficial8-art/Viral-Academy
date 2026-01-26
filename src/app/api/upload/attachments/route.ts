import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Allowed file types for attachments
const ALLOWED_TYPES = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Spreadsheets
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Presentations
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  // Images
  "image/webp",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

// Max file size: 50MB
const MAX_SIZE = 50 * 1024 * 1024;

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
          error: "Formato no permitido. Usa PDF, Word, Excel, PowerPoint, ZIP o imágenes.",
          allowedTypes: ["PDF", "Word", "Excel", "PowerPoint", "ZIP", "Imágenes"]
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

    // Generate unique filename preserving original extension
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "file";
    const filename = `attachments/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    );
  }
}
