"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  Calendar,
  Award,
  FolderOpen,
  ArrowRight,
  Video,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getGreeting } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardData {
  user: {
    profile?: {
      displayName?: string | null;
      firstName?: string | null;
    } | null;
    email: string;
  } | null;
  stats: {
    coursesInProgress: number;
    certificates: number;
    overallProgress: number;
    livesThisWeek: number;
  };
  continueLearning: {
    course: string;
    courseSlug: string;
    lesson: string;
    module: string;
    progress: number;
    thumbnail: string | null;
  } | null;
  upcomingLives: {
    id: string;
    title: string;
    mentor: string;
    scheduledAt: Date;
    type: string;
  }[];
  recentResources: {
    id: string;
    title: string;
    type: string;
  }[];
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const greeting = getGreeting();
  const userName = data.user?.profile?.firstName ||
                   data.user?.profile?.displayName?.split(" ")[0] ||
                   data.user?.email.split("@")[0] ||
                   "Usuario";

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {greeting}, {userName} 👋
        </h1>
        <p className="text-muted-foreground">
          Tu progreso se construye paso a paso. Hoy es un buen día para avanzar.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.coursesInProgress}</p>
                <p className="text-xs text-muted-foreground">Cursos en progreso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.certificates}</p>
                <p className="text-xs text-muted-foreground">Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.livesThisWeek}</p>
                <p className="text-xs text-muted-foreground">Lives esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.overallProgress}%</p>
                <p className="text-xs text-muted-foreground">Progreso general</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Continuar donde lo dejaste</CardTitle>
            </CardHeader>
            <CardContent>
              {data.continueLearning ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Course Image */}
                  <div className="w-full sm:w-48 h-32 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {data.continueLearning.thumbnail ? (
                      <img
                        src={data.continueLearning.thumbnail}
                        alt={data.continueLearning.course}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play className="w-12 h-12 text-primary/50" />
                    )}
                  </div>
                  {/* Course Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold">{data.continueLearning.course}</h3>
                      <p className="text-sm text-muted-foreground">
                        {data.continueLearning.module && `${data.continueLearning.module}: `}
                        {data.continueLearning.lesson}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{data.continueLearning.progress}%</span>
                      </div>
                      <Progress value={data.continueLearning.progress} />
                    </div>
                    <Button asChild>
                      <Link href={`/app/cursos/${data.continueLearning.courseSlug}`}>
                        Continuar curso
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Play className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">No tienes cursos en progreso</p>
                  <Button asChild>
                    <Link href="/app/cursos">Explorar cursos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Lives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Próximas sesiones</CardTitle>
                <Link
                  href="/app/lives"
                  className="text-sm text-primary hover:underline"
                >
                  Ver todas
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.upcomingLives.length > 0 ? (
                data.upcomingLives.map((live) => (
                  <div
                    key={live.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 border border-border"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{live.title}</p>
                      <p className="text-xs text-muted-foreground">{live.mentor}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={live.type === "MINDSET" ? "secondary" : "default"}
                          className="text-[10px] px-2 py-0"
                        >
                          {live.type === "MINDSET" ? "Mentalidad" : "Marketing"}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(live.scheduledAt), "EEEE d, h:mm a", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Video className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No hay sesiones programadas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recursos recientes</CardTitle>
              <Link
                href="/app/recursos"
                className="text-sm text-primary hover:underline"
              >
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentResources.length > 0 ? (
              <div className="grid sm:grid-cols-3 gap-4">
                {data.recentResources.map((resource) => (
                  <Link
                    key={resource.id}
                    href={`/app/recursos`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-surface-2 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center text-xs font-bold uppercase text-muted-foreground">
                      {resource.type.slice(0, 4)}
                    </div>
                    <p className="text-sm font-medium line-clamp-2">{resource.title}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No hay recursos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Motivation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center py-8"
      >
        <p className="text-muted-foreground italic">
          &quot;No avances rápido. Avanza constante.&quot;
        </p>
      </motion.div>
    </div>
  );
}
