"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";

const includedFeatures = [
  "Todos los cursos disponibles",
  "Clases en vivo semanales",
  "Replays de todas las sesiones",
  "Comunidad privada",
  "Recursos descargables",
  "Certificados al completar",
  "Actualizaciones constantes",
  "Soporte de la comunidad",
];

export function PricingSection() {
  return (
    <section className="section-padding">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">Membresía</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Un precio, <span className="gradient-text">acceso total</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sin cursos sueltos, sin pagos adicionales. Una membresía te da acceso a todo.
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <Card className="relative overflow-hidden border-primary/50">
            {/* Glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
            
            <CardHeader className="text-center pb-0 pt-8 relative">
              <Badge className="mx-auto mb-4">Más popular</Badge>
              <h3 className="text-2xl font-bold mb-2">Membresía Viral Academy</h3>
              <p className="text-muted-foreground text-sm">Acceso completo a todo el ecosistema</p>
            </CardHeader>

            <CardContent className="p-8 relative">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">
                    {formatPrice(siteConfig.pricing.monthly.price)}
                  </span>
                  <span className="text-muted-foreground">
                    / {siteConfig.pricing.monthly.interval}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {includedFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button size="xl" variant="glow" className="w-full" asChild>
                <Link href="/auth/registro">
                  <Zap className="w-5 h-5" />
                  Empezar ahora
                </Link>
              </Button>

              {/* Small print */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                Cancela cuando quieras. Sin plazos forzosos.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust elements */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Pago seguro con Stripe
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Acceso inmediato
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Soporte incluido
          </div>
        </motion.div>
      </div>
    </section>
  );
}
