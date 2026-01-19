import { PublicLayout } from "@/components/layouts/public-layout";
import { prisma } from "@/lib/prisma";
import { GraduationCap, Clock, BarChart, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Cursos | Viral Academy",
  description: "Explora nuestros cursos de marketing digital, IA, contenido y negocios. Educación práctica para emprendedores.",
};

const categoryLabels: Record<string, string> = {
  MARKETING: "Marketing Digital",
  CONTENT: "Creación de Contenido",
  AI: "Inteligencia Artificial",
  AUTOMATION: "Automatización",
  BRAND: "Marca Personal",
  ECOMMERCE: "E-commerce",
  MINDSET: "Mentalidad",
  BUSINESS: "Negocios",
};

const levelLabels: Record<string, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

async function getCourses() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      mentor: {
        include: { profile: true },
      },
      modules: {
        include: { lessons: true },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
  });

  return courses;
}

export default async function CursosPublicPage() {
  const courses = await getCourses();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              Nuestros Cursos
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Educación práctica para{" "}
              <span className="text-primary">emprendedores digitales</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cursos diseñados para ejecutarse. Aprende marketing, IA, contenido y negocios
              con sistemas probados y resultados medibles.
            </p>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
        <div className="container-wide">
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Próximamente</h2>
              <p className="text-muted-foreground mb-8">
                Estamos preparando cursos increíbles para ti. ¡Únete para ser el primero en acceder!
              </p>
              <Button asChild>
                <Link href="/auth/registro">Únete a la lista de espera</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const totalLessons = course.modules.reduce(
                  (acc, module) => acc + module.lessons.length,
                  0
                );
                const mentorName =
                  course.mentor.profile?.displayName ||
                  `${course.mentor.profile?.firstName || ""} ${course.mentor.profile?.lastName || ""}`.trim() ||
                  course.mentor.email;

                return (
                  <div
                    key={course.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative">
                      {course.featured && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          Destacado
                        </div>
                      )}
                      <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium">
                        {categoryLabels[course.category] || course.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <span className="px-2 py-0.5 rounded bg-surface-2">
                          {levelLabels[course.level] || course.level}
                        </span>
                        {course.duration && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.round(course.duration / 60)}h
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>{totalLessons} lecciones</span>
                      </div>

                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                        {course.shortDesc || course.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {mentorName.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {mentorName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {course._count.enrollments}
                        </div>
                      </div>
                    </div>

                    {/* Overlay link */}
                    <Link
                      href={`/auth/registro`}
                      className="absolute inset-0"
                      aria-label={`Ver curso: ${course.title}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* What you learn */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Lo que aprenderás
              </h2>
              <p className="text-muted-foreground">
                Nuestros cursos cubren todas las áreas del emprendimiento digital.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(categoryLabels).slice(0, 8).map(([key, label]) => (
                <div
                  key={key}
                  className="p-4 rounded-xl bg-surface-1 border border-border text-center"
                >
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-t border-border">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Accede a todos los cursos con tu membresía
            </h2>
            <p className="text-muted-foreground mb-8">
              Una sola membresía te da acceso ilimitado a todos los cursos, lives y recursos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/registro">
                  Empieza hoy
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/membresia">Ver membresía</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
