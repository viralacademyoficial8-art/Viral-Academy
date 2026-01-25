"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console for debugging
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Error de aplicación</h1>
            <p className="text-gray-400">
              Lo sentimos, ocurrió un error crítico. Por favor recarga la página.
            </p>
          </div>

          {/* Error Digest for debugging */}
          {error.digest && (
            <p className="text-xs text-gray-500">
              Código de error: {error.digest}
            </p>
          )}

          {/* Retry Button */}
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4ff00] text-black font-semibold rounded-lg hover:bg-[#c2eb00] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar página
          </button>

          {/* Home Link */}
          <div>
            <a
              href="/"
              className="text-sm text-[#d4ff00] hover:underline"
            >
              Volver al inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
