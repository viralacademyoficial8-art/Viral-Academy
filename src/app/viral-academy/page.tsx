import { PublicLayout } from "@/components/layouts/public-layout";
import { siteConfig } from "@/config/site";
import { Zap, Target, Lightbulb, Users, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PartnerLogo } from "@/components/icons/partner-logos";

export const metadata = {
  title: "Sobre Nosotros | Viral Academy",
  description: "Conoce la historia, misión y visión de Viral Academy. Educación práctica para emprendedores digitales.",
};

const values = [
  {
    icon: Target,
    title: "Educación Práctica",
    description: "No enseñamos teoría vacía. Todo lo que aprenderás está diseñado para ejecutarse y generar resultados reales.",
  },
  {
    icon: Lightbulb,
    title: "Innovación Constante",
    description: "El mundo digital cambia rápido. Actualizamos nuestro contenido al ritmo de la tecnología y las tendencias.",
  },
  {
    icon: Users,
    title: "Comunidad Activa",
    description: "Aprende junto a una comunidad de emprendedores y creadores que comparten tus mismos objetivos.",
  },
  {
    icon: Award,
    title: "Excelencia",
    description: "Nos comprometemos con la calidad en cada curso, live y recurso que creamos para ti.",
  },
  {
    icon: TrendingUp,
    title: "Resultados Medibles",
    description: "Nos enfocamos en métricas y resultados. Si no funciona, no lo enseñamos.",
  },
  {
    icon: Zap,
    title: "Acción Rápida",
    description: "Menos análisis, más ejecución. Te damos las herramientas para implementar desde el día uno.",
  },
];

export default function ViralAcademyPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Sobre Viral Academy
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Transformamos emprendedores en{" "}
              <span className="text-primary">profesionales digitales</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {siteConfig.description}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Nuestra Historia</h2>
            <div className="prose prose-lg prose-invert mx-auto">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Viral Academy nació de una frustración: ver cómo miles de personas invertían tiempo
                y dinero en cursos que prometían resultados pero solo entregaban teoría.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mt-4">
                Fundada por <strong className="text-foreground">{siteConfig.creator.name}</strong>,
                la academia surgió después de años trabajando en marketing digital, creando contenido
                viral y ayudando a empresas a escalar sus negocios online.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mt-4">
                Hoy, con más de <strong className="text-foreground">{siteConfig.stats.students} alumnos formados</strong> y{" "}
                <strong className="text-foreground">{siteConfig.stats.reach} de personas alcanzadas</strong>,
                continuamos con nuestra misión de democratizar la educación digital de calidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="p-8 rounded-2xl bg-surface-1 border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Misión</h3>
              <p className="text-muted-foreground leading-relaxed">
                Empoderar a emprendedores y creadores hispanohablantes con educación práctica,
                herramientas actualizadas y una comunidad de apoyo que les permita construir
                negocios digitales rentables y sostenibles.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-surface-1 border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Visión</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ser la academia digital líder en Latinoamérica, reconocida por formar a la
                próxima generación de profesionales digitales que transforman industrias y
                generan impacto real en sus comunidades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Valores</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Los principios que guían todo lo que hacemos en Viral Academy.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-4">
                  <value.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {siteConfig.stats.students}
              </div>
              <div className="text-muted-foreground">Alumnos formados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {siteConfig.stats.reach}
              </div>
              <div className="text-muted-foreground">Personas alcanzadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {siteConfig.stats.adSpend}
              </div>
              <div className="text-muted-foreground">Gestionados en Ads</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {siteConfig.stats.enterprises}
              </div>
              <div className="text-muted-foreground">Empresas capacitadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Empresas que confían en nosotros</h2>
            <p className="text-muted-foreground">
              Hemos trabajado con equipos de las mejores empresas y universidades.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {siteConfig.partners.map((partner) => (
              <PartnerLogo key={partner} name={partner} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para transformar tu carrera?
            </h2>
            <p className="text-muted-foreground mb-8">
              Únete a nuestra comunidad de emprendedores y empieza a construir tu negocio digital hoy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/registro">Únete a Viral Academy</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/cursos">Ver cursos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
