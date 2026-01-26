"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Download, Loader2, PartyPopper, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignaturePad } from "./signature-pad";

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  studentName: string;
}

export function CourseCompletionModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  studentName,
}: CourseCompletionModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"congrats" | "signature" | "generating" | "done">("congrats");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<{
    id: string;
    verificationCode: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCertificate = async (withSignature: boolean) => {
    setIsGenerating(true);
    setStep("generating");

    try {
      const res = await fetch("/api/user/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          signatureData: withSignature ? signatureData : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al generar certificado");
      }

      setCertificate(data);
      setStep("done");
      toast.success("¡Certificado generado exitosamente!");
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error(error instanceof Error ? error.message : "Error al generar certificado");
      setStep("congrats");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignatureChange = (dataUrl: string | null) => {
    setSignatureData(dataUrl);
  };

  const handleGoToCertificates = () => {
    onClose();
    router.push("/app/certificados");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "done" ? (
              <>
                <Award className="w-5 h-5 text-[#BFFF00]" />
                ¡Certificado Generado!
              </>
            ) : (
              <>
                <PartyPopper className="w-5 h-5 text-[#BFFF00]" />
                ¡Felicidades!
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === "congrats" && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-[#BFFF00]/20 rounded-full flex items-center justify-center">
                <Award className="w-10 h-10 text-[#BFFF00]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                ¡Has completado el curso!
              </h3>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{courseTitle}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Ahora puedes obtener tu certificado de finalización.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setStep("signature")}
                className="w-full bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
              >
                Agregar mi firma al certificado
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerateCertificate(false)}
                className="w-full"
              >
                Generar sin firma
              </Button>
            </div>
          </div>
        )}

        {step === "signature" && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Agrega tu firma para personalizar tu certificado
              </p>
            </div>

            <SignaturePad onSignatureChange={handleSignatureChange} />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("congrats")}
                className="flex-1"
              >
                Atrás
              </Button>
              <Button
                onClick={() => handleGenerateCertificate(true)}
                disabled={!signatureData}
                className="flex-1 bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
              >
                Generar certificado
              </Button>
            </div>
          </div>
        )}

        {step === "generating" && (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#BFFF00]" />
            <p className="mt-4 text-muted-foreground">
              Generando tu certificado...
            </p>
          </div>
        )}

        {step === "done" && certificate && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <Award className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                ¡Tu certificado está listo!
              </h3>
              <p className="text-sm text-muted-foreground">
                Código de verificación:
              </p>
              <code className="bg-muted px-3 py-1 rounded text-sm font-mono">
                {certificate.verificationCode}
              </code>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Certificado para:
              </p>
              <p className="font-semibold">{studentName}</p>
              <p className="text-sm text-muted-foreground mt-1">{courseTitle}</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleGoToCertificates}
                className="w-full bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Ver y descargar certificado
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Continuar explorando
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
