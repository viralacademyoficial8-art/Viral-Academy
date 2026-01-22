"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function register(data: RegisterData) {
  try {
    // Validate input data
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      return { error: "Todos los campos son requeridos" };
    }

    if (data.password.length < 8) {
      return { error: "La contraseña debe tener al menos 8 caracteres" };
    }

    // Normalize email
    const normalizedEmail = data.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return { error: "Ya existe una cuenta con este correo electrónico" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: "STUDENT",
        profile: {
          create: {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            displayName: `${data.firstName.trim()} ${data.lastName.trim()}`,
          },
        },
      },
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Registration error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes("unique constraint") && message.includes("email")) {
        return { error: "Ya existe una cuenta con este correo electrónico" };
      }

      if (message.includes("connection") || message.includes("database")) {
        return { error: "Error de conexión con la base de datos. Intenta de nuevo." };
      }

      // Log the actual error for debugging
      console.error("Registration error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    return { error: "Error al crear la cuenta. Intenta de nuevo." };
  }
}

export async function loginWithCredentials(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales inválidas" };
        default:
          return { error: "Error al iniciar sesión" };
      }
    }
    throw error;
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/app/dashboard" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
