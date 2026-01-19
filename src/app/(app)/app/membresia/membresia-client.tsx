"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Check,
  Loader2,
  Crown,
  Calendar,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MembresiaClientProps {
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

const BENEFITS = [
  "Acceso a todos los cursos premium",
  "Lives semanales con Leo y Susy",
  "Replays de todas las sesiones",
  "Comunidad exclusiva de alumnos",
  "Recursos y plantillas descargables",
  "Certificados de finalización",
  "Soporte prioritario",
  "Nuevos cursos cada mes",
];

export function MembresiaClient({ subscription }: MembresiaClientProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPortalLoading, setIsPortalLoading] = React.useState(false);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const isActive = subscription?.status === "ACTIVE";
  const isPastDue = subscription?.status === "PAST_DUE";
  const isCanceled = subscription?.status === "CANCELED";

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error al crear la sesión de pago");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar la solicitud");
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error al acceder al portal");
        setIsPortalLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar la solicitud");
      setIsPortalLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Membresía</h1>
        <p className="text-muted-foreground">
          Gestiona tu suscripción a Viral Academy
        </p>
      </div>

      {/* Success/Cancel Messages */}
      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 flex items-center gap-3">
          <Check className="h-5 w-5 flex-shrink-0" />
          <p>
            <strong>Pago exitoso.</strong> Tu membresía ha sido activada.
            Bienvenido a Viral Academy.
          </p>
        </div>
      )}

      {canceled && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>
            El pago fue cancelado. Si tuviste algún problema, intenta de nuevo o
            contáctanos.
          </p>
        </div>
      )}

      {/* Current Subscription Status */}
      {isActive && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Viral Master Pack</CardTitle>
                  <CardDescription>Membresía activa</CardDescription>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500">
                Activa
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {subscription.cancelAtPeriodEnd
                  ? `Tu membresía se cancelará el ${formatDate(subscription.currentPeriodEnd)}`
                  : `Próxima renovación: ${formatDate(subscription.currentPeriodEnd)}`}
              </span>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm">
                Tu membresía está programada para cancelarse. Tendrás acceso
                hasta la fecha indicada.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isPortalLoading}
            >
              {isPortalLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cargando...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gestionar suscripción
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {isPastDue && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle>Pago pendiente</CardTitle>
                  <CardDescription>
                    Hay un problema con tu método de pago
                  </CardDescription>
                </div>
              </div>
              <Badge variant="destructive">Pago pendiente</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tu último pago no pudo procesarse. Por favor, actualiza tu método
              de pago para mantener tu acceso.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleManageSubscription} disabled={isPortalLoading}>
              {isPortalLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cargando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Actualizar método de pago
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Pricing Card - Show when no active subscription */}
      {(!subscription || isCanceled) && (
        <Card className="border-2">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Viral Master Pack</CardTitle>
            <CardDescription>
              Acceso completo a todo el contenido de Viral Academy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">$597</span>
                <span className="text-muted-foreground">MXN/mes</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Cancela cuando quieras
              </p>
            </div>

            <div className="space-y-3">
              {BENEFITS.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Suscribirme ahora
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Preguntas frecuentes</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">¿Puedo cancelar cuando quiera?</h3>
            <p className="text-sm text-muted-foreground">
              Sí, puedes cancelar tu suscripción en cualquier momento. Tendrás
              acceso hasta el final del período de facturación actual.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">¿Qué métodos de pago aceptan?</h3>
            <p className="text-sm text-muted-foreground">
              Aceptamos todas las tarjetas de crédito y débito principales
              (Visa, Mastercard, American Express).
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">¿Cómo accedo a los cursos?</h3>
            <p className="text-sm text-muted-foreground">
              Una vez suscrito, tendrás acceso inmediato a todos los cursos,
              lives y recursos desde tu dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
