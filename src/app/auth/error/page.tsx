"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const errorMessages: Record<string, string> = {
  Configuration: "Hay un problema con la configuración del servidor.",
  AccessDenied: "No tienes permiso para acceder a este recurso.",
  Verification: "El enlace de verificación ha expirado o es inválido.",
  OAuthSignin: "Error al iniciar el proceso de autenticación con el proveedor.",
  OAuthCallback: "Error al procesar la respuesta del proveedor de autenticación.",
  OAuthCreateAccount: "No se pudo crear la cuenta con el proveedor externo.",
  EmailCreateAccount: "No se pudo crear la cuenta con el email proporcionado.",
  Callback: "Error en la autenticación.",
  OAuthAccountNotLinked: "Este correo ya está registrado con otro método de inicio de sesión.",
  EmailSignin: "Error al enviar el email de inicio de sesión.",
  CredentialsSignin: "Credenciales inválidas. Verifica tu correo y contraseña.",
  SessionRequired: "Debes iniciar sesión para acceder a esta página.",
  Default: "Ocurrió un error durante la autenticación.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center lg:items-start gap-4">
        <div className="p-3 rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-bold tracking-tight">
            Error de autenticación
          </h1>
          <p className="text-muted-foreground mt-2">{errorMessage}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link href="/auth/login">Intentar de nuevo</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>

      {error !== "Default" && (
        <p className="text-xs text-muted-foreground text-center lg:text-left">
          Código de error: {error}
        </p>
      )}
    </div>
  );
}

function AuthErrorFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorFallback />}>
      <AuthErrorContent />
    </Suspense>
  );
}
