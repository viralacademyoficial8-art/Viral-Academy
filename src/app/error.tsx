"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console for debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Algo salió mal</h1>
          <p className="text-muted-foreground">
            Lo sentimos, ocurrió un error inesperado. Por favor intenta de nuevo.
          </p>
        </div>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="p-4 rounded-lg bg-surface-2 text-left">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Ir al inicio
            </Link>
          </Button>
        </div>

        {/* Support Link */}
        <p className="text-sm text-muted-foreground">
          Si el problema persiste,{" "}
          <a
            href="mailto:soporte@viralacademy.com"
            className="text-primary hover:underline"
          >
            contáctanos
          </a>
        </p>
      </div>
    </div>
  );
}
