"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignaturePad } from "@/components/certificate/signature-pad";

interface GenerateCertificateButtonProps {
  courseId: string;
  courseTitle: string;
}

export function GenerateCertificateButton({
  courseId,
  courseTitle,
}: GenerateCertificateButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"options" | "signature" | "generating">("options");
  const [signatureData, setSignatureData] = useState<string | null>(null);
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

      toast.success("¡Certificado generado exitosamente!");
      setIsOpen(false);
      router.refresh();

      // Navigate to the certificate view
      router.push(`/app/certificados/${data.id}`);
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error(error instanceof Error ? error.message : "Error al generar certificado");
      setStep("options");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignatureChange = (dataUrl: string | null) => {
    setSignatureData(dataUrl);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setStep("options");
    setSignatureData(null);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        className="w-full bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
      >
        <Award className="w-4 h-4 mr-2" />
        Generar certificado
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#BFFF00]" />
              Generar Certificado
            </DialogTitle>
          </DialogHeader>

          {step === "options" && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#BFFF00]/20 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-[#BFFF00]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  ¡Felicidades por completar el curso!
                </h3>
                <p className="text-muted-foreground text-sm">
                  {courseTitle}
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
                  onClick={() => setStep("options")}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
