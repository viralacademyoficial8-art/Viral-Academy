import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Asunto y mensaje son requeridos" },
        { status: 400 }
      );
    }

    // Get target user with profile
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
        profile: {
          select: {
            displayName: true,
            firstName: true,
          }
        }
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userName = targetUser.profile?.displayName || targetUser.profile?.firstName || "estudiante";

    // Send email with custom template
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a;">
  <div style="background-color: #171717; padding: 32px; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #d4ff00; margin: 0; font-size: 24px;">Viral Academy</h1>
    </div>

    <div style="color: #ffffff;">
      <p style="margin-bottom: 16px;">Hola ${userName},</p>

      <div style="white-space: pre-wrap; color: #a1a1aa;">${message}</div>
    </div>

    <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;">

    <p style="font-size: 12px; color: #52525b; text-align: center; margin: 0;">
      © ${new Date().getFullYear()} Viral Academy. Todos los derechos reservados.
    </p>
  </div>
</body>
</html>
    `;

    await sendEmail({
      to: targetUser.email,
      subject,
      html,
      text: `Hola ${userName},\n\n${message}\n\n© ${new Date().getFullYear()} Viral Academy.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Error al enviar el email" },
      { status: 500 }
    );
  }
}
