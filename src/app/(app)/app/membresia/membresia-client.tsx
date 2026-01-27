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
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

interface MembresiaClientProps {
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    currentPeriodStart: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export function MembresiaClient({ subscription }: MembresiaClientProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPortalLoading, setIsPortalLoading] = React.useState(false);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const isActive = subscription?.status === "ACTIVE";
  const isPastDue = subscription?.status === "PAST_DUE";
  const isCanceled = subscription?.status === "CANCELED";
  const isTrialing = subscription?.status === "TRIALING";
  const isIncomplete = subscription?.status === "INCOMPLETE";

  const hasActiveSubscription = subscription && (isActive || isTrialing);
  const needsSubscription = !subscription || isCanceled || isIncomplete;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return 0;
    const endDate = new Date(dateString);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = subscription?.currentPeriodEnd
    ? getDaysRemaining(subscription.currentPeriodEnd)
    : 0;

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

  const getStatusBadge = () => {
    if (isActive && !subscription?.cancelAtPeriodEnd) {
      return <Badge className="bg-green-500 hover:bg-green-500">Activa</Badge>;
    }
    if (isActive && subscription?.cancelAtPeriodEnd) {
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Se cancela pronto</Badge>;
    }
    if (isTrialing) {
      return <Badge className="bg-blue-500 hover:bg-blue-500">Período de prueba</Badge>;
    }
    if (isPastDue) {
      return <Badge variant="destructive">Pago pendiente</Badge>;
    }
    if (isCanceled) {
      return <Badge variant="secondary">Cancelada</Badge>;
    }
    if (isIncomplete) {
      return <Badge variant="secondary">Incompleta</Badge>;
    }
    return null;
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
            <strong>¡Pago exitoso!</strong> Tu membresía ha sido activada.
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

      {/* Current Subscription Status - Always show if subscription exists */}
      {subscription && (
        <Card className={`${
          isActive && !subscription.cancelAtPeriodEnd ? "border-green-500/50 bg-green-500/5" :
          isPastDue ? "border-destructive/50 bg-destructive/5" :
          subscription.cancelAtPeriodEnd ? "border-yellow-500/50 bg-yellow-500/5" :
          "border-muted"
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  isActive ? "bg-green-500/10" :
                  isPastDue ? "bg-destructive/10" :
                  "bg-muted"
                }`}>
                  {isActive ? (
                    <Crown className="h-6 w-6 text-green-500" />
                  ) : isPastDue ? (
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  ) : (
                    <XCircle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <CardTitle>Viral Master Pack</CardTitle>
                  <CardDescription>
                    {isActive && !subscription.cancelAtPeriodEnd && "Tu membresía está activa"}
                    {isActive && subscription.cancelAtPeriodEnd && "Membresía programada para cancelarse"}
                    {isPastDue && "Hay un problema con tu pago"}
                    {isCanceled && "Tu membresía fue cancelada"}
                    {isTrialing && "Estás en período de prueba"}
                    {isIncomplete && "Completa tu suscripción"}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subscription details */}
            <div className="grid gap-4 sm:grid-cols-2">
              {subscription.currentPeriodStart && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Inicio del período:</span>
                  <span className="font-medium">{formatDate(subscription.currentPeriodStart)}</span>
                </div>
              )}

              {subscription.currentPeriodEnd && (
                <div className="flex items-center gap-2 text-sm">
                  {subscription.cancelAtPeriodEnd ? (
                    <XCircle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-muted-foreground">
                    {subscription.cancelAtPeriodEnd ? "Acceso hasta:" : "Próxima renovación:"}
                  </span>
                  <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                </div>
              )}
            </div>

            {/* Days remaining indicator */}
            {hasActiveSubscription && subscription.currentPeriodEnd && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {daysRemaining > 0 ? (
                    <>
                      <span className="font-medium">{daysRemaining} días</span>
                      <span className="text-muted-foreground">
                        {subscription.cancelAtPeriodEnd
                          ? " restantes de acceso"
                          : " hasta la próxima renovación automática"}
                      </span>
                    </>
                  ) : (
                    <span className="text-yellow-600">Tu suscripción se renueva hoy</span>
                  )}
                </span>
              </div>
            )}

            {/* Warnings */}
            {subscription.cancelAtPeriodEnd && isActive && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm">
                <strong>Cancelación programada:</strong> Tu membresía no se renovará automáticamente.
                Tendrás acceso a todo el contenido hasta el {formatDate(subscription.currentPeriodEnd)}.
              </div>
            )}

            {isPastDue && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <strong>Pago fallido:</strong> Tu último pago no pudo procesarse.
                Por favor actualiza tu método de pago para mantener tu acceso.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button
              variant={isPastDue ? "default" : "outline"}
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
                  {isPastDue ? "Actualizar método de pago" : "Gestionar suscripción"}
                </>
              )}
            </Button>
            {subscription.cancelAtPeriodEnd && (
              <Button
                onClick={handleManageSubscription}
                disabled={isPortalLoading}
              >
                Reactivar membresía
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Pricing Card - Always show the plan */}
      <Card className={`border-2 ${hasActiveSubscription ? "border-muted" : "border-primary/30"}`}>
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
              <span className="text-4xl font-bold text-primary">${siteConfig.pricing.monthly.price}</span>
              <span className="text-muted-foreground">{siteConfig.pricing.monthly.currency}/{siteConfig.pricing.monthly.interval}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Cancela cuando quieras • Renovación automática
            </p>
          </div>

          <div className="space-y-3">
            {siteConfig.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-primary/10 mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
        {needsSubscription && (
          <CardFooter>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
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
                  {isCanceled ? "Reactivar membresía" : "Suscribirme ahora"}
                </>
              )}
            </Button>
          </CardFooter>
        )}
        {hasActiveSubscription && (
          <CardFooter>
            <p className="text-sm text-center w-full text-muted-foreground">
              Ya tienes este plan activo
            </p>
          </CardFooter>
        )}
      </Card>

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
          <div className="space-y-2">
            <h3 className="font-medium">¿La renovación es automática?</h3>
            <p className="text-sm text-muted-foreground">
              Sí, tu membresía se renueva automáticamente cada mes. Puedes
              desactivar la renovación automática en cualquier momento desde
              la gestión de tu suscripción.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
