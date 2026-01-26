import Link from "next/link";
import { XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CertificateNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-2xl py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold">
              Viral<span className="text-[#BFFF00]">Academy</span>
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Verificación de Certificado</h1>
        </div>

        {/* Not Found Card */}
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Certificado no encontrado</h2>
              <p className="text-muted-foreground">
                El código de verificación proporcionado no corresponde a ningún certificado válido en nuestro sistema.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Si crees que esto es un error, verifica que el código esté escrito correctamente.
              </p>
              <Button asChild variant="outline">
                <Link href="/">
                  <Search className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
