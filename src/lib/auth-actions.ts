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
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "Ya existe una cuenta con este correo electrónico" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: "STUDENT",
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            displayName: `${data.firstName} ${data.lastName}`,
          },
        },
      },
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Registration error:", error);
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
