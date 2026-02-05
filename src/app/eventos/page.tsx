import { PublicLayout } from "@/components/layouts/public-layout";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { Calendar, Clock, Video, Users, ArrowRight, CalendarDays, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Eventos | Viral Academy",
  description: "Descubre los próximos eventos, lives y sesiones especiales de Viral Academy.",
};

const liveTypeLabels: Record<string, string> = {
  MINDSET: "Mentalidad",
  MARKETING: "Marketing",
  SPECIAL: "Evento Especial",
};

async function getUpcomingEvents() {
  const events = await prisma.liveEvent.findMany({
    where: {
      published: true,
      scheduledAt: {
        gte: new Date(),
      },
    },
    include: {
      mentor: {
        include: { profile: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
    take: 10,
  });

  return events;
}

async function getPastEvents() {
  const events = await prisma.liveEvent.findMany({
    where: {
      published: true,
      scheduledAt: {
        lt: new Date(),
      },
    },
    include: {
      mentor: {
        include: { profile: true },
      },
    },
    orderBy: { scheduledAt: "desc" },
    take: 6,
  });

  return events;
}

export default async function EventosPage() {
  const [upcomingEvents, pastEvents] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
  ]);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              Eventos
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Aprende en vivo con{" "}
              <span className="text-primary">nuestros expertos</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sesiones semanales, workshops y eventos especiales diseñados para
              acelerar tu crecimiento.
            </p>
          </div>
        </div>
      </section>

      {/* Weekly Schedule */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Calendario semanal</h2>
              <p className="text-muted-foreground">
                Cada semana, nuestros mentores se conectan en vivo con la comunidad.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {siteConfig.mentors
                .slice()
                .sort((a, b) => (a.liveDay === "Lunes" ? -1 : 1))
                .map((mentor) => (
                <div
                  key={mentor.id}
                  className="p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CalendarDays className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">
                          {mentor.liveDay === "Lunes" ? "Lunes Sublimes" : "Miércoles Virales"}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {mentor.liveType}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        Live de {mentor.liveType === "MINDSET" ? "Mentalidad y Poder Personal" : "Marketing Digital"}
                      </p>
                      <p className="text-sm">
                        con <span className="text-primary font-medium">{mentor.name}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Próximos eventos</h2>
            <p className="text-muted-foreground">
              Eventos especiales y sesiones en vivo programadas.
            </p>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="max-w-lg mx-auto text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No hay eventos programados</h3>
              <p className="text-muted-foreground mb-6">
                Únete a la membresía para acceder a los lives semanales y ser notificado de eventos especiales.
              </p>
              <Button asChild>
                <Link href="/auth/registro">Únete ahora</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {upcomingEvents.map((event) => {
                const mentorName =
                  event.mentor.profile?.displayName ||
                  `${event.mentor.profile?.firstName || ""} ${event.mentor.profile?.lastName || ""}`.trim() ||
                  event.mentor.email;

                return (
                  <div
                    key={event.id}
                    className="group overflow-hidden rounded-xl bg-surface-1 border border-border hover:border-primary/50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative">
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {liveTypeLabels[event.type] || event.type}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(event.scheduledAt), "d MMM yyyy", { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(event.scheduledAt), "HH:mm")}
                        </span>
                      </div>

                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary">
                            {mentorName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{mentorName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Eventos pasados</h2>
              <p className="text-muted-foreground">
                Los replays están disponibles para miembros.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
              {pastEvents.map((event) => {
                // Use full mentor names based on event type
                const mentorName = event.type === "MINDSET"
                  ? "Susy Ponce"
                  : "Leonardo Gómez Ortiz";

                // Determine mentor image based on event type
                const mentorImage = event.type === "MINDSET"
                  ? "/images/mentors/susy.png"
                  : "/images/mentors/leo.jpg";

                return (
                  <Link
                    key={event.id}
                    href="/membresia"
                    className="group overflow-hidden rounded-xl bg-background border border-border hover:border-primary/30 transition-all w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] cursor-pointer"
                  >
                    {/* Thumbnail with mentor image background */}
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={mentorImage}
                        alt={mentorName}
                        fill
                        className="object-cover object-top opacity-60 group-hover:opacity-80 transition-opacity"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <PlayCircle className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium border border-border">
                        Replay disponible
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(event.scheduledAt), "d MMM yyyy", { locale: es })}
                        </span>
                      </div>

                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{mentorName}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              No te pierdas ningún evento
            </h2>
            <p className="text-muted-foreground mb-8">
              Únete a Viral Academy y accede a todos los lives, replays y eventos especiales.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/registro">
                Únete ahora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
