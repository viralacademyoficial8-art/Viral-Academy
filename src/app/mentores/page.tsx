import { PublicLayout } from "@/components/layouts/public-layout";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { Users, Calendar, Video, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mentores | Viral Academy",
  description: "Conoce a los mentores expertos de Viral Academy. Profesionales activos en el mercado que te guiarán en tu camino.",
};

interface Mentor {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  bio: string;
  image: string | null;
  liveDay: string;
  liveType: string;
}

async function getMentors(): Promise<Mentor[]> {
  try {
    const mentors = await prisma.user.findMany({
      where: { role: "MENTOR" },
      include: { profile: true },
      orderBy: { createdAt: "asc" },
    });

    if (mentors.length === 0) {
      // Fallback to siteConfig if no mentors in database
      return siteConfig.mentors.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        specialties: m.specialties,
        bio: m.bio,
        image: m.image,
        liveDay: m.liveDay,
        liveType: m.liveType,
      }));
    }

    return mentors.map((mentor) => ({
      id: mentor.id,
      name: mentor.profile?.displayName || mentor.profile?.firstName || mentor.email.split("@")[0],
      role: mentor.profile?.title || "Mentor",
      specialties: mentor.profile?.specialties || [],
      bio: mentor.profile?.bio || "",
      image: mentor.profile?.avatar || null,
      liveDay: mentor.profile?.liveDay || "",
      liveType: mentor.profile?.liveType || "MARKETING",
    }));
  } catch (error) {
    console.error("Error fetching mentors:", error);
    // Fallback to siteConfig on error
    return siteConfig.mentors.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      specialties: m.specialties,
      bio: m.bio,
      image: m.image,
      liveDay: m.liveDay,
      liveType: m.liveType,
    }));
  }
}

export default async function MentoresPage() {
  const mentors = await getMentors();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Nuestros Mentores
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Aprende de{" "}
              <span className="text-primary">expertos activos</span>{" "}
              en el mercado
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nuestros mentores no solo enseñan, ejecutan. Cada semana comparten su experiencia
              real en lives exclusivos para miembros.
            </p>
          </div>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="group relative overflow-hidden rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300"
              >
                {/* Image placeholder */}
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-5xl font-bold text-primary">
                        {mentor.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  {/* Live badge */}
                  {mentor.liveDay && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-border">
                      <Video className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium">
                        {mentor.liveDay} - {mentor.liveType === "MINDSET" ? "Mentalidad" : "Marketing"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-1">{mentor.name}</h3>
                  <p className="text-primary font-medium mb-4">{mentor.role}</p>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {mentor.bio}
                  </p>

                  {/* Specialties */}
                  {mentor.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {mentor.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1 rounded-full bg-surface-2 text-xs font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Schedule */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Calendario de Lives</h2>
              <p className="text-muted-foreground">
                Cada semana, nuestros mentores se conectan en vivo con la comunidad.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {mentors.filter(m => m.liveDay).map((mentor) => (
                <div
                  key={mentor.id}
                  className="p-6 rounded-xl bg-surface-1 border border-border"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{mentor.liveDay}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Live de {mentor.liveType === "MINDSET" ? "Mentalidad" : "Marketing"}
                      </p>
                      <p className="text-sm text-primary font-medium">
                        con {mentor.name.split(" ")[0]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Lo que obtienes con nuestros mentores
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-background border border-border">
                <Video className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Lives Semanales</h3>
                <p className="text-sm text-muted-foreground">
                  Sesiones en vivo donde puedes hacer preguntas y recibir feedback directo.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-background border border-border">
                <Users className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Acceso a la Comunidad</h3>
                <p className="text-sm text-muted-foreground">
                  Conecta con otros alumnos y recibe apoyo de la comunidad.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-background border border-border">
                <Award className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Certificaciones</h3>
                <p className="text-sm text-muted-foreground">
                  Obtén certificados verificables al completar los cursos.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-background border border-border">
                <Calendar className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Replays Disponibles</h3>
                <p className="text-sm text-muted-foreground">
                  Todas las sesiones quedan grabadas para que las veas cuando quieras.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Aprende directamente de los expertos
            </h2>
            <p className="text-muted-foreground mb-8">
              Únete a Viral Academy y accede a lives semanales, cursos completos y una comunidad activa.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/registro">Únete ahora</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
