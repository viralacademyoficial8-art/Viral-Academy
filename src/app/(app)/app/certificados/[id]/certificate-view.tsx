"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CertificateTemplate } from "@/components/certificate/certificate-template";

interface CertificateViewProps {
  certificate: {
    id: string;
    verificationCode: string;
    studentName: string;
    courseName: string;
    signatureUrl: string | null;
    completedAt: string;
    issuedAt: string;
    mentorName: string;
  };
}

export function CertificateView({ certificate }: CertificateViewProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    setIsDownloading(true);
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Error al generar la imagen");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificado-${certificate.verificationCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Certificado descargado");
      }, "image/png");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Error al descargar el certificado");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const verifyUrl = `${window.location.origin}/certificados/verificar/${certificate.verificationCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado de ${certificate.courseName}`,
          text: `He completado el curso "${certificate.courseName}" en Viral Academy`,
          url: verifyUrl,
        });
      } catch (error) {
        // User cancelled or share failed, copy to clipboard instead
        await copyToClipboard(verifyUrl);
      }
    } else {
      await copyToClipboard(verifyUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Enlace copiado al portapapeles");
    } catch {
      toast.error("Error al copiar el enlace");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/certificados">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Mi Certificado</h1>
            <p className="text-muted-foreground text-sm">
              Código: {certificate.verificationCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Descargar
          </Button>
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="bg-muted/30 rounded-xl p-4 md:p-8 flex justify-center overflow-x-auto">
        <div ref={certificateRef} className="flex-shrink-0">
          <CertificateTemplate
            studentName={certificate.studentName}
            courseName={certificate.courseName}
            completedAt={new Date(certificate.completedAt)}
            verificationCode={certificate.verificationCode}
            mentorName={certificate.mentorName}
            signatureUrl={certificate.signatureUrl || undefined}
          />
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-muted/30 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold">Detalles del certificado</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Estudiante</p>
            <p className="font-medium">{certificate.studentName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Curso</p>
            <p className="font-medium">{certificate.courseName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fecha de completación</p>
            <p className="font-medium">
              {new Date(certificate.completedAt).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Fecha de emisión</p>
            <p className="font-medium">
              {new Date(certificate.issuedAt).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground">Código de verificación</p>
            <code className="bg-muted px-3 py-1 rounded font-mono text-sm">
              {certificate.verificationCode}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
