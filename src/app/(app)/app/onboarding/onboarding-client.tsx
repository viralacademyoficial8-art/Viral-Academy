"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Target,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface OnboardingClientProps {
  userId: string;
  email: string;
  currentProfile: {
    firstName: string;
    lastName: string;
    displayName: string;
    objective: string;
    level: string;
  } | null;
}

const OBJECTIVES = [
  {
    id: "grow-business",
    label: "Hacer crecer mi negocio",
    description: "Escalar ventas y aumentar clientes",
    icon: "chart",
  },
  {
    id: "learn-marketing",
    label: "Aprender marketing digital",
    description: "Dominar redes sociales y publicidad",
    icon: "target",
  },
  {
    id: "create-content",
    label: "Crear contenido viral",
    description: "Hacer videos y posts que se compartan",
    icon: "video",
  },
  {
    id: "build-brand",
    label: "Construir mi marca personal",
    description: "Posicionarme como experto",
    icon: "user",
  },
  {
    id: "mindset",
    label: "Desarrollar mi mentalidad",
    description: "Confianza y habilidades personales",
    icon: "brain",
  },
];

const LEVELS = [
  {
    id: "beginner",
    label: "Principiante",
    description: "Estoy empezando, quiero aprender desde cero",
  },
  {
    id: "intermediate",
    label: "Intermedio",
    description: "Tengo algo de experiencia pero quiero mejorar",
  },
  {
    id: "advanced",
    label: "Avanzado",
    description: "Tengo experiencia y busco estrategias avanzadas",
  },
];

export function OnboardingClient({
  userId,
  email,
  currentProfile,
}: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    firstName: currentProfile?.firstName || "",
    lastName: currentProfile?.lastName || "",
    objective: currentProfile?.objective || "",
    level: currentProfile?.level || "",
  });

  const totalSteps = 4;

  const canProceed = () => {
    switch (step) {
      case 0:
        return true; // Welcome step
      case 1:
        return formData.firstName.trim().length > 0;
      case 2:
        return formData.objective.length > 0;
      case 3:
        return formData.level.length > 0;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: `${formData.firstName} ${formData.lastName}`.trim(),
          objective: formData.objective,
          level: formData.level,
        }),
      });

      if (response.ok) {
        // Use window.location for a full page reload to ensure session is refreshed
        window.location.href = "/app/dashboard";
      } else {
        alert("Error al guardar. Por favor intenta de nuevo.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar. Por favor intenta de nuevo.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 mx-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Paso {step + 1} de {totalSteps}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 0: Welcome */}
            {step === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-12 pb-8 px-8 text-center">
                  <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Rocket className="w-10 h-10 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4">
                    Bienvenido a Viral Academy
                  </h1>
                  <p className="text-muted-foreground text-lg mb-8">
                    Estamos emocionados de tenerte aquí. Vamos a personalizar tu
                    experiencia para que aproveches al máximo la plataforma.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Esto solo tomará 1 minuto
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 1: Name */}
            {step === 1 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-12 pb-8 px-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">
                      ¿Cómo te llamas?
                    </h2>
                    <p className="text-muted-foreground">
                      Así sabremos cómo dirigirnos a ti
                    </p>
                  </div>

                  <div className="space-y-4 max-w-md mx-auto">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        placeholder="Tu nombre"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido (opcional)</Label>
                      <Input
                        id="lastName"
                        placeholder="Tu apellido"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Objective */}
            {step === 2 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-12 pb-8 px-8">
                  <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      ¿Cuál es tu objetivo principal?
                    </h2>
                    <p className="text-muted-foreground">
                      Esto nos ayuda a recomendarte el contenido más relevante
                    </p>
                  </div>

                  <div className="space-y-3">
                    {OBJECTIVES.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() =>
                          setFormData({ ...formData, objective: obj.id })
                        }
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          formData.objective === obj.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium">{obj.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {obj.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Level */}
            {step === 3 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-12 pb-8 px-8">
                  <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      ¿Cuál es tu nivel de experiencia?
                    </h2>
                    <p className="text-muted-foreground">
                      Te mostraremos contenido adecuado a tu nivel
                    </p>
                  </div>

                  <div className="space-y-3">
                    {LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() =>
                          setFormData({ ...formData, level: level.id })
                        }
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          formData.level === level.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {level.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className={step === 0 ? "invisible" : ""}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>

          <Button onClick={handleNext} disabled={!canProceed() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : step === totalSteps - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Comenzar
              </>
            ) : (
              <>
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
