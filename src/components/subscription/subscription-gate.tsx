"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, Crown, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

interface SubscriptionGateProps {
  title?: string;
  description?: string;
}

export function SubscriptionGate({
  title = "Contenido exclusivo para miembros",
  description = "Este contenido está disponible solo para miembros con suscripción activa."
}: SubscriptionGateProps) {
  const [isLoading, setIsLoading] = React.useState(false);

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

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-primary" />
              <span className="font-semibold">Viral Master Pack</span>
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-primary">${siteConfig.pricing.monthly.price}</span>
              <span className="text-muted-foreground">{siteConfig.pricing.monthly.currency}/{siteConfig.pricing.monthly.interval}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="text-center font-medium text-foreground">Con tu membresía obtienes:</p>
            <ul className="space-y-1">
              {siteConfig.features.slice(0, 5).map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
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
                Suscribirme ahora
              </>
            )}
          </Button>
          <Link href="/app/membresia" className="w-full">
            <Button variant="outline" className="w-full">
              Ver más detalles
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
