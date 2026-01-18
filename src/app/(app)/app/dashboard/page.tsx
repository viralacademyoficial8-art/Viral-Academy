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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getGreeting } from "@/lib/utils";

// Mock data
const userData = {
  name: "Usuario Demo",
  progress: 35,
  coursesInProgress: 2,
  certificates: 1,
};

const continueLearning = {
  course: "Marketing Digital desde Cero",
  lesson: "Módulo 3: Creación de Campañas",
  progress: 65,
  image: null,
};

const upcomingLives = [
  {
    id: 1,
    title: "Lunes Sublimes: El poder de la comunicación",
    mentor: "Susy Ponce",
    date: "Lunes, 20 Ene",
    time: "7:00 PM",
    type: "MINDSET",
  },
  {
    id: 2,
    title: "Miércoles Virales: IA para crear contenido",
    mentor: "Leonardo Gómez",
    date: "Miércoles, 22 Ene",
    time: "7:00 PM",
    type: "MARKETING",
  },
];

const recentResources = [
  { id: 1, title: "Plantilla de Calendario de Contenidos", type: "xlsx" },
  { id: 2, title: "Guía de Meta Ads 2024", type: "pdf" },
  { id: 3, title: "Prompts para IA", type: "pdf" },
];

export default function DashboardPage() {
  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {greeting}, {userData.name.split(" ")[0]} 👋
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
                <p className="text-2xl font-bold">{userData.coursesInProgress}</p>
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
                <p className="text-2xl font-bold">{userData.certificates}</p>
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
                <p className="text-2xl font-bold">2</p>
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
                <p className="text-2xl font-bold">{userData.progress}%</p>
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
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Course Image */}
                <div className="w-full sm:w-48 h-32 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <Play className="w-12 h-12 text-primary/50" />
                </div>
                {/* Course Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold">{continueLearning.course}</h3>
                    <p className="text-sm text-muted-foreground">
                      {continueLearning.lesson}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{continueLearning.progress}%</span>
                    </div>
                    <Progress value={continueLearning.progress} />
                  </div>
                  <Button asChild>
                    <Link href="/app/cursos/marketing-digital/learn">
                      Continuar curso
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
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
              {upcomingLives.map((live) => (
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
                        {live.date} · {live.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
            <div className="grid sm:grid-cols-3 gap-4">
              {recentResources.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/app/recursos/${resource.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-surface-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center text-xs font-bold uppercase text-muted-foreground">
                    {resource.type}
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{resource.title}</p>
                </Link>
              ))}
            </div>
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
