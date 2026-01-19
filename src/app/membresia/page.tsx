import { PublicLayout } from "@/components/layouts/public-layout";
import { siteConfig } from "@/config/site";
import { CreditCard, Check, Zap, Users, Video, GraduationCap, FolderOpen, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Membresía | Viral Academy",
  description: "Únete a Viral Academy con una membresía que incluye todos los cursos, lives semanales y acceso a la comunidad.",
};

const includedFeatures = [
  {
    icon: GraduationCap,
    title: "Todos los cursos",
    description: "Acceso ilimitado a toda la biblioteca de cursos actuales y futuros.",
  },
  {
    icon: Video,
    title: "Lives semanales",
    description: "Sesiones en vivo cada semana con nuestros mentores expertos.",
  },
  {
    icon: Users,
    title: "Comunidad privada",
    description: "Conecta con otros emprendedores y recibe apoyo de la comunidad.",
  },
  {
    icon: FolderOpen,
    title: "Recursos descargables",
    description: "Plantillas, guías y herramientas listas para usar.",
  },
  {
    icon: Award,
    title: "Certificados",
    description: "Obtén certificados verificables al completar cada curso.",
  },
  {
    icon: Zap,
    title: "Actualizaciones constantes",
    description: "Contenido nuevo cada mes siguiendo las últimas tendencias.",
  },
];

export default function MembresiaPublicPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <CreditCard className="w-4 h-4" />
              Membresía
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Una inversión que{" "}
              <span className="text-primary">se paga sola</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Acceso completo a toda la plataforma por menos de lo que cuesta un café al día.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
        <div className="container-wide">
          <div className="max-w-lg mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-background border-2 border-primary shadow-xl shadow-primary/10">
              {/* Header */}
              <div className="p-8 text-center border-b border-border">
                <h2 className="text-2xl font-bold mb-2">Membresía Viral Academy</h2>
                <p className="text-muted-foreground mb-6">Todo incluido, sin límites</p>

                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl md:text-6xl font-bold">
                    ${siteConfig.pricing.monthly.price}
                  </span>
                  <div className="text-left">
                    <div className="text-muted-foreground text-sm">{siteConfig.pricing.monthly.currency}</div>
                    <div className="text-muted-foreground text-sm">/{siteConfig.pricing.monthly.interval}</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-8">
                <ul className="space-y-4">
                  {siteConfig.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full mt-8" size="lg" asChild>
                  <Link href="/auth/registro">
                    Empezar ahora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Cancela cuando quieras. Sin compromisos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que incluye tu membresía
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Una sola membresía te da acceso a todo lo que necesitas para crecer.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {includedFeatures.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-surface-1 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Preguntas frecuentes</h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-background border border-border">
                <h3 className="font-semibold mb-2">¿Puedo cancelar en cualquier momento?</h3>
                <p className="text-sm text-muted-foreground">
                  Sí, puedes cancelar tu membresía cuando quieras. No hay contratos ni penalizaciones.
                  Mantendrás acceso hasta el final de tu período de facturación.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-background border border-border">
                <h3 className="font-semibold mb-2">¿Qué métodos de pago aceptan?</h3>
                <p className="text-sm text-muted-foreground">
                  Aceptamos todas las tarjetas de crédito y débito principales a través de Stripe,
                  la plataforma de pagos más segura del mundo.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-background border border-border">
                <h3 className="font-semibold mb-2">¿Hay algún costo adicional?</h3>
                <p className="text-sm text-muted-foreground">
                  No. Tu membresía incluye acceso a todos los cursos, lives, recursos y la comunidad.
                  Sin costos ocultos ni ventas adicionales.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-background border border-border">
                <h3 className="font-semibold mb-2">¿Puedo ver los cursos a mi ritmo?</h3>
                <p className="text-sm text-muted-foreground">
                  Absolutamente. Todos los cursos y replays están disponibles 24/7 para que aprendas
                  cuando y donde quieras.
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/faq" className="text-primary hover:underline text-sm font-medium">
                Ver todas las preguntas frecuentes →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-muted-foreground mb-8">
              Únete a más de {siteConfig.stats.students} alumnos que ya están transformando sus carreras.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/registro">
                Únete a Viral Academy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
