"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Video,
  Wrench,
  Users,
  Target,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: GraduationCap,
    title: "Aprende desde cero",
    description: "Marketing digital, contenido, IA y negocios. Sin experiencia previa necesaria.",
  },
  {
    icon: Video,
    title: "Clases en vivo semanales",
    description: "Lunes de mentalidad con Susy. Miércoles de marketing con Leo.",
  },
  {
    icon: Wrench,
    title: "Sistemas prácticos",
    description: "Plantillas, prompts, recursos descargables y casos aplicados.",
  },
  {
    icon: Users,
    title: "Comunidad privada",
    description: "Conecta con emprendedores y creadores que también ejecutan.",
  },
  {
    icon: Target,
    title: "Mentoría directa",
    description: "Acceso a expertos activos en el mercado, no solo teoría.",
  },
  {
    icon: RefreshCw,
    title: "Contenido actualizado",
    description: "Todo se renueva al ritmo de la tecnología y el mercado.",
  },
];

export function FeaturesSection() {
  return (
    <section className="section-padding bg-surface-1/30">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">Beneficios</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Todo lo que necesitas para{" "}
            <span className="gradient-text">escalar</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Una membresía, acceso completo. Sin cursos sueltos, sin pagos adicionales.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card hover className="h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-2xl bg-surface-2 border border-border"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold">Acceso mientras mantengas tu membresía</h4>
                <p className="text-sm text-muted-foreground">
                  Cancela cuando quieras. Sin contratos, sin compromisos.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Sin plazos forzosos</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
