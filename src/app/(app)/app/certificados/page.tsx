import { motion } from "framer-motion";
import { Award, Download, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// TODO: Get user certificates when auth is ready
// import { getUserCertificates } from "@/lib/data";

export default async function CertificadosPage() {
  // Mock data until auth is ready
  const certificates: {
    id: string;
    verificationCode: string;
    issuedAt: string;
    course: {
      title: string;
      slug: string;
      mentor: { name: string };
    };
  }[] = [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Mis Certificados</h1>
        <p className="text-muted-foreground">
          Certificados obtenidos al completar cursos.
        </p>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aún no tienes certificados</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Completa un curso al 100% y aprueba el quiz final para obtener tu certificado verificable.
            </p>
            <Button asChild>
              <Link href="/app/cursos">Explorar cursos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 relative flex items-center justify-center">
                <Award className="w-20 h-20 text-primary/40" />
                <Badge className="absolute top-3 right-3 bg-green-500">Verificado</Badge>
              </div>
              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="font-semibold line-clamp-2">{cert.course.title}</h3>
                  <p className="text-sm text-muted-foreground">{cert.course.mentor.name}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Emitido el {new Date(cert.issuedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Código:</span>
                  <code className="bg-surface-2 px-2 py-0.5 rounded">{cert.verificationCode}</code>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Verificar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
