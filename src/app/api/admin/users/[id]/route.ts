import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        subscription: true,
        enrollments: {
          include: {
            course: { select: { id: true, title: true, slug: true } },
          },
        },
        certificates: {
          include: {
            course: { select: { id: true, title: true } },
          },
        },
        _count: {
          select: {
            lessonProgress: true,
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Error al obtener el usuario" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Validate role if provided
    if (body.role && !["GUEST", "STUDENT", "MENTOR", "ADMIN"].includes(body.role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    // Prevent admin from changing their own role
    if (body.role && id === session.user.id) {
      return NextResponse.json(
        { error: "No puedes cambiar tu propio rol" },
        { status: 400 }
      );
    }

    const updateData: {
      role?: "GUEST" | "STUDENT" | "MENTOR" | "ADMIN";
      active?: boolean;
    } = {};

    if (body.role !== undefined) {
      updateData.role = body.role;
    }

    // Only update active if the column exists (graceful handling for pre-migration)
    if (body.active !== undefined) {
      updateData.active = body.active;
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json(user);
    } catch (updateError) {
      // If active column doesn't exist, retry without it
      if (String(updateError).includes("active") || String(updateError).includes("Unknown arg")) {
        delete updateData.active;
        if (Object.keys(updateData).length === 0) {
          return NextResponse.json(
            { error: "El campo 'active' no está disponible aún" },
            { status: 503 }
          );
        }
        const user = await prisma.user.update({
          where: { id },
          data: updateData,
        });
        return NextResponse.json(user);
      }
      throw updateError;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}
