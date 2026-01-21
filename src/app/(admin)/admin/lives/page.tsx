import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Video, Plus, Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

type LiveWithMentor = Awaited<ReturnType<typeof prisma.liveEvent.findMany<{
  include: {
    mentor: { select: { id: true; email: true; profile: { select: { displayName: true } } } };
    replays: true;
  };
}>>>[number];

export default async function AdminLivesPage() {
  let lives: LiveWithMentor[] = [];

  try {
    lives = await prisma.liveEvent.findMany({
      include: {
        mentor: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { displayName: true },
            },
          },
        },
        replays: true,
      },
      orderBy: { scheduledAt: "desc" },
    });
  } catch (error) {
    console.error("Error loading lives:", error);
  }

  const upcomingLives = lives.filter((live) => new Date(live.scheduledAt) > new Date());
  const pastLives = lives.filter((live) => new Date(live.scheduledAt) <= new Date());

  const liveTypeLabels: Record<string, string> = {
    MINDSET: "Mentalidad",
    MARKETING: "Marketing",
    AI: "Inteligencia Artificial",
    CONTENT: "Contenido",
    BUSINESS: "Negocios",
    QA: "Q&A",
    SPECIAL: "Especial",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lives</h1>
          <p className="text-muted-foreground">Gestiona los lives y sesiones en vivo</p>
        </div>
        <Button asChild>
          <Link href="/admin/lives/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Programar Live
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lives.length}</p>
              <p className="text-sm text-muted-foreground">Total de Lives</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingLives.length}</p>
              <p className="text-sm text-muted-foreground">Próximos Lives</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pastLives.length}</p>
              <p className="text-sm text-muted-foreground">Lives Pasados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Lives */}
      <div className="bg-card rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Próximos Lives</h2>
        </div>
        <div className="divide-y">
          {upcomingLives.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay lives programados</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/admin/lives/nuevo">Programar uno</Link>
              </Button>
            </div>
          ) : (
            upcomingLives.map((live) => (
              <div key={live.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{live.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{liveTypeLabels[live.type] || live.type}</span>
                      <span>•</span>
                      <span>{live.mentor?.profile?.displayName || live.mentor?.email}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {format(new Date(live.scheduledAt), "d MMM yyyy", { locale: es })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(live.scheduledAt), "HH:mm")} hrs
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Past Lives */}
      <div className="bg-card rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Lives Pasados</h2>
        </div>
        <div className="divide-y">
          {pastLives.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No hay lives pasados</p>
            </div>
          ) : (
            pastLives.slice(0, 10).map((live) => (
              <div key={live.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <Video className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{live.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{liveTypeLabels[live.type] || live.type}</span>
                      <span>•</span>
                      <span>{live.mentor?.profile?.displayName || live.mentor?.email}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(live.scheduledAt), "d MMM yyyy", { locale: es })}
                  </p>
                  {live.replays && live.replays.length > 0 && (
                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                      Replay disponible
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
