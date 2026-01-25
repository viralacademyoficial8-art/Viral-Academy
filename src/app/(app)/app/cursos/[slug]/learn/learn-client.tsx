"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  List,
  Play,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  videoUrl: string | null;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CurrentLesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  duration: number;
  notes: string | null;
  moduleTitle: string;
  completed: boolean;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  modules: Module[];
}

interface Props {
  course: Course;
  currentLesson: CurrentLesson;
  prevLessonId: string | null;
  nextLessonId: string | null;
  progress: number;
  completedCount: number;
  totalLessons: number;
}

// Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function LearnClient({
  course,
  currentLesson,
  prevLessonId,
  nextLessonId,
  progress,
  completedCount,
  totalLessons,
}: Props) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(
    course.modules.map((m) => m.id)
  );

  const videoId = currentLesson.videoUrl
    ? getYouTubeVideoId(currentLesson.videoUrl)
    : null;

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      const res = await fetch("/api/lessons/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          completed: !currentLesson.completed,
        }),
      });

      if (res.ok) {
        toast.success(
          currentLesson.completed
            ? "Lección marcada como pendiente"
            : "Lección completada"
        );
        router.refresh();
      } else {
        toast.error("Error al actualizar progreso");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Error de conexión");
    } finally {
      setIsCompleting(false);
    }
  };

  const navigateToLesson = (lessonId: string) => {
    router.push(`/app/cursos/${course.slug}/learn?lesson=${lessonId}`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -mx-4 md:-mx-6 lg:-mx-8 -my-6">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/app/cursos/${course.slug}`}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">{course.title}</p>
              <h1 className="font-semibold">{currentLesson.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
              title={currentLesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="text-center text-white">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No hay video disponible para esta lección</p>
              <p className="text-sm text-gray-400 mt-2">
                El video será agregado próximamente
              </p>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                disabled={!prevLessonId}
                onClick={() => prevLessonId && navigateToLesson(prevLessonId)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              <Button
                variant={currentLesson.completed ? "secondary" : "default"}
                onClick={handleMarkComplete}
                disabled={isCompleting}
              >
                <Check className="w-4 h-4 mr-2" />
                {currentLesson.completed ? "Completada" : "Marcar completada"}
              </Button>
            </div>
            <Button
              disabled={!nextLessonId}
              onClick={() => nextLessonId && navigateToLesson(nextLessonId)}
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "w-80 border-l bg-background flex flex-col transition-all duration-300",
          "fixed md:relative right-0 top-0 h-full z-50 md:z-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0 md:w-0 md:border-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Contenido del curso</h2>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tu progreso</span>
              <span>{completedCount} de {totalLessons}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Lessons List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {course.modules.map((module) => (
              <Collapsible
                key={module.id}
                open={expandedModules.includes(module.id)}
                onOpenChange={() => toggleModule(module.id)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 text-left">
                  <div className="flex items-center gap-2">
                    {expandedModules.includes(module.id) ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-medium text-sm">{module.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {module.lessons.filter((l) => l.completed).length}/
                    {module.lessons.length}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-4 space-y-1">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => navigateToLesson(lesson.id)}
                        className={cn(
                          "flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors",
                          lesson.id === currentLesson.id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                            lesson.completed
                              ? "bg-primary text-white"
                              : "bg-muted border border-border"
                          )}
                        >
                          {lesson.completed ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm truncate",
                              lesson.id === currentLesson.id && "font-medium"
                            )}
                          >
                            {lesson.title}
                          </p>
                          {lesson.duration > 0 && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration} min
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
