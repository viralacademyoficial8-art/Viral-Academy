"use client";

import * as React from "react";
import Link from "next/link";
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
import { COURSE_LEVELS, COURSE_CATEGORIES, formatDuration } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  lessonsCount: number;
  completedCount: number;
  lessons: Lesson[];
}

interface Resource {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  mentor: {
    name: string;
    avatar: string | null | undefined;
  };
  level: string;
  category: string;
  duration: number;
  lessonsCount: number;
  studentsCount: number;
  progress: number;
  enrolled: boolean;
  outcomes: string[];
  modules: Module[];
  resources: Resource[];
}

interface CourseDetailClientProps {
  course: Course;
}

export function CourseDetailClient({ course }: CourseDetailClientProps) {
  const [openModules, setOpenModules] = React.useState<string[]>(
    course.modules.slice(0, 2).map((m) => m.id)
  );

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessonsCount, 0);
  const completedLessons = course.modules.reduce((acc, m) => acc + m.completedCount, 0);

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
            {COURSE_CATEGORIES[course.category as keyof typeof COURSE_CATEGORIES] || course.category}
          </Badge>
          <Badge variant="secondary">
            {COURSE_LEVELS[course.level as keyof typeof COURSE_LEVELS] || course.level}
          </Badge>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground max-w-3xl">{course.description}</p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {course.mentor.name}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatDuration(course.duration)}
          </span>
          <span className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            {course.lessonsCount} lecciones
          </span>
          <span className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {course.studentsCount} alumnos
          </span>
        </div>

        {/* Progress & CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {course.enrolled && completedLessons > 0 ? (
            <>
              <div className="flex-1 max-w-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tu progreso</span>
                  <span className="font-medium">{completedLessons} de {totalLessons} lecciones</span>
                </div>
                <Progress value={(completedLessons / totalLessons) * 100} />
              </div>
              <Button size="lg" asChild>
                <Link href={`/app/cursos/${course.slug}/learn`}>
                  <Play className="w-5 h-5 mr-2" />
                  Continuar curso
                </Link>
              </Button>
            </>
          ) : (
            <Button size="lg" asChild>
              <Link href={`/app/cursos/${course.slug}/learn`}>
                <Play className="w-5 h-5 mr-2" />
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
          {course.outcomes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lo que aprenderás</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {course.outcomes.map((outcome, index) => (
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
          )}

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Contenido del curso</CardTitle>
              <p className="text-sm text-muted-foreground">
                {course.modules.length} módulos · {totalLessons} lecciones · {formatDuration(course.duration)}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {course.modules.map((module) => (
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
                    {module.completedCount === module.lessonsCount && module.lessonsCount > 0 && (
                      <Badge variant="success" className="text-xs">Completado</Badge>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pl-8 py-2 space-y-1">
                      {module.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/app/cursos/${course.slug}/learn?lesson=${lesson.id}`}
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
                  {course.mentor.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{course.mentor.name}</p>
                  <p className="text-xs text-muted-foreground">Lead Mentor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          {course.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recursos del curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-2"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <span className="text-sm">{resource.title}</span>
                        <p className="text-xs text-muted-foreground uppercase">{resource.type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={resource.fileUrl} download>
                        <Download className="w-4 h-4" />
                      </a>
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
