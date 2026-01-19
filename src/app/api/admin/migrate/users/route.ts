import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface UserRow {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  password?: string;
}

function generateTempPassword(): string {
  return crypto.randomBytes(12).toString("base64").slice(0, 16);
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
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No se proporcionó archivo", imported: 0, errors: [] },
        { status: 400 }
      );
    }

    const text = await file.text();

    let records: UserRow[];
    try {
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: "Error al parsear el CSV",
        imported: 0,
        errors: [String(parseError)],
      });
    }

    if (records.length === 0) {
      return NextResponse.json({
        success: false,
        message: "El archivo CSV está vacío",
        imported: 0,
        errors: [],
      });
    }

    const errors: string[] = [];
    let importedCount = 0;
    const importedUsers: Array<{ email: string; tempPassword: string }> = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2;

      if (!row.email) {
        errors.push(`Fila ${rowNum}: Falta email del usuario`);
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push(`Fila ${rowNum}: Email inválido (${row.email})`);
        continue;
      }

      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: row.email.toLowerCase() },
        });

        if (existingUser) {
          errors.push(`Usuario "${row.email}" ya existe`);
          continue;
        }

        // Generate temporary password
        const tempPassword = row.password || generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Determine role
        let role: "STUDENT" | "MENTOR" | "ADMIN" = "STUDENT";
        if (row.role) {
          const upperRole = row.role.toUpperCase();
          if (upperRole === "MENTOR") role = "MENTOR";
          else if (upperRole === "ADMIN") role = "ADMIN";
        }

        // Create user with profile
        const displayName = row.name || `${row.firstName || ""} ${row.lastName || ""}`.trim() || row.email.split("@")[0];

        await prisma.user.create({
          data: {
            email: row.email.toLowerCase(),
            password: hashedPassword,
            role,
            profile: {
              create: {
                firstName: row.firstName || null,
                lastName: row.lastName || null,
                displayName,
              },
            },
          },
        });

        importedUsers.push({ email: row.email, tempPassword });
        importedCount++;
      } catch (dbError) {
        errors.push(`Error al crear usuario "${row.email}": ${String(dbError)}`);
      }
    }

    // Note: In production, you'd want to send welcome emails with temp passwords
    // For now, we'll just log them or return them securely

    return NextResponse.json({
      success: importedCount > 0,
      message: importedCount > 0
        ? `Se importaron ${importedCount} usuarios correctamente. Los usuarios deberán usar "Olvidé mi contraseña" para acceder.`
        : "No se pudo importar ningún usuario",
      imported: importedCount,
      errors,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
      imported: 0,
      errors: [String(error)],
    });
  }
}
