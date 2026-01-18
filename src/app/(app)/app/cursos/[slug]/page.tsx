"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Play,
  Clock,
  User,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { COURSE_LEVELS, COURSE_CATEGORIES } from "@/lib/utils";

// Mock course data
const courseData = {
  slug: "marketing-digital-desde-cero",
  title: "Marketing Digital desde Cero",
  description: "Aprende los fundamentos del marketing digital, desde la estrategia hasta la ejecución. Incluye Meta Ads, Google Ads, funnels de conversión y análisis de métricas.",
  mentor: {
    name: "Leonardo Gómez",
    avatar: null,
  },
  level: "BEGINNER",
  category: "MARKETING",
  duration: 480,
  lessonsCount: 24,
  studentsCount: 523,
  progress: 65,
  enrolled: true,
  outcomes: [
    "Crear campañas de publicidad en Meta (Facebook e Instagram)",
    "Diseñar funnels de conversión efectivos",
    "Analizar métricas y optimizar campañas",
    "Entender el customer journey digital",
  ],
  modules: [
    {
      id: "1",
      title: "Introducción al Marketing Digital",
      description: "Fundamentos y conceptos clave",
      duration: 53,
      lessonsCount: 3,
      completedCount: 3,
      lessons: [
        { id: "1", title: "¿Qué es el Marketing Digital?", duration: 15, completed: true },
        { id: "2", title: "El Ecosistema Digital", duration: 20, completed: true },
        { id: "3", title: "Estrategia vs Táctica", duration: 18, completed: true },
      ],
    },
    {
      id: "2",
      title: "Meta Ads: Facebook e Instagram",
      description: "Domina la publicidad en Meta",
      duration: 130,
      lessonsCount: 4,
      completedCount: 2,
      lessons: [
        { id: "4", title: "Configuración del Business Manager", duration: 25, completed: true },
        { id: "5", title: "Estructura de Campañas", duration: 30, completed: true },
        { id: "6", title: "Segmentación de Audiencias", duration: 35, completed: false },
        { id: "7", title: "Creativos que Convierten", duration: 40, completed: false },
      ],
    },
    {
      id: "3",
      title: "Funnels de Conversión",
      description: "Diseña sistemas de venta automatizados",
      duration: 85,
      lessonsCount: 3,
      completedCount: 0,
      lessons: [
        { id: "8", title: "¿Qué es un Funnel?", duration: 20, completed: false },
        { id: "9", title: "Landing Pages que Convierten", duration: 35, completed: false },
        { id: "10", title: "Email Marketing Automatizado", duration: 30, completed: false },
      ],
    },
  ],
  resources: [
    { id: "1", title: "Guía de Meta Ads 2024", type: "pdf" },
    { id: "2", title: "Plantilla de Calendario de Campañas", type: "xlsx" },
  ],
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export default function CourseDetailPage() {
  const params = useParams();
  const [openModules, setOpenModules] = React.useState<string[]>(["1", "2"]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const totalLessons = courseData.modules.reduce((acc, m) => acc + m.lessonsCount, 0);
  const completedLessons = courseData.modules.reduce((acc, m) => acc + m.completedCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {COURSE_CATEGORIES[courseData.category as keyof typeof COURSE_CATEGORIES]}
          </Badge>
          <Badge variant="secondary">
            {COURSE_LEVELS[courseData.level as keyof typeof COURSE_LEVELS]}
          </Badge>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold">{courseData.title}</h1>
        <p className="text-muted-foreground max-w-3xl">{courseData.description}</p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {courseData.mentor.name}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatDuration(courseData.duration)}
          </span>
          <span className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            {courseData.lessonsCount} lecciones
          </span>
          <span className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {courseData.studentsCount} alumnos
          </span>
        </div>

        {/* Progress & CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {courseData.enrolled ? (
            <>
              <div className="flex-1 max-w-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tu progreso</span>
                  <span className="font-medium">{completedLessons} de {totalLessons} lecciones</span>
                </div>
                <Progress value={(completedLessons / totalLessons) * 100} />
              </div>
              <Button size="lg" asChild>
                <Link href={`/app/cursos/${courseData.slug}/learn`}>
                  <Play className="w-5 h-5" />
                  Continuar curso
                </Link>
              </Button>
            </>
          ) : (
            <Button size="lg" asChild>
              <Link href={`/app/cursos/${courseData.slug}/learn`}>
                <Play className="w-5 h-5" />
                Comenzar curso
              </Link>
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* What you'll learn */}
          <Card>
            <CardHeader>
              <CardTitle>Lo que aprenderás</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid sm:grid-cols-2 gap-3">
                {courseData.outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Contenido del curso</CardTitle>
              <p className="text-sm text-muted-foreground">
                {courseData.modules.length} módulos · {totalLessons} lecciones · {formatDuration(courseData.duration)}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {courseData.modules.map((module) => (
                <Collapsible
                  key={module.id}
                  open={openModules.includes(module.id)}
                  onOpenChange={() => toggleModule(module.id)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-xl bg-surface-2 hover:bg-surface-2/80 transition-colors">
                    <div className="flex items-center gap-3">
                      {openModules.includes(module.id) ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div className="text-left">
                        <h4 className="font-medium">{module.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {module.completedCount}/{module.lessonsCount} lecciones · {formatDuration(module.duration)}
                        </p>
                      </div>
                    </div>
                    {module.completedCount === module.lessonsCount && (
                      <Badge variant="success" className="text-xs">Completado</Badge>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pl-8 py-2 space-y-1">
                      {module.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/app/cursos/${courseData.slug}/learn?lesson=${lesson.id}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-2 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              lesson.completed ? "bg-primary text-white" : "bg-surface-2 border border-border"
                            }`}>
                              {lesson.completed ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                            </div>
                            <span className="text-sm">{lesson.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{lesson.duration} min</span>
                        </Link>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mentor Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Impartido por</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                  {courseData.mentor.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{courseData.mentor.name}</p>
                  <p className="text-xs text-muted-foreground">Lead Mentor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          {courseData.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recursos del curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {courseData.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-2"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">{resource.title}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
