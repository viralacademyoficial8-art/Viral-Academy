"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, BookOpen, Play, Clock, Trash2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/lib/utils";

interface BookmarkedCourse {
  bookmarkId: string;
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  category: string;
  level: string;
  shortDesc: string | null;
  mentor: string;
  modulesCount: number;
  createdAt: string;
}

interface BookmarkedLesson {
  bookmarkId: string;
  id: string;
  title: string;
  duration: number | null;
  moduleName: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  createdAt: string;
}

interface FavoritosClientProps {
  bookmarks: {
    courses: BookmarkedCourse[];
    lessons: BookmarkedLesson[];
  };
}

export function FavoritosClient({ bookmarks }: FavoritosClientProps) {
  const router = useRouter();
  const [removing, setRemoving] = React.useState<string | null>(null);

  const handleRemove = async (bookmarkId: string, type: "course" | "lesson") => {
    setRemoving(bookmarkId);
    try {
      await fetch(`/api/user/bookmarks?id=${bookmarkId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Error removing bookmark:", error);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500" />
          Mis Favoritos
        </h1>
        <p className="text-muted-foreground">
          Tu colección de cursos y lecciones guardadas
        </p>
      </motion.div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">
            Cursos ({bookmarks.courses.length})
          </TabsTrigger>
          <TabsTrigger value="lessons">
            Lecciones ({bookmarks.lessons.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          {bookmarks.courses.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No tienes cursos guardados</p>
              <Button asChild>
                <Link href="/app/cursos">Explorar cursos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.courses.map((course, index) => (
                <motion.div
                  key={course.bookmarkId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden group">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => handleRemove(course.bookmarkId, "course")}
                        disabled={removing === course.bookmarkId}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {COURSE_CATEGORIES[course.category as keyof typeof COURSE_CATEGORIES] || course.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {COURSE_LEVELS[course.level as keyof typeof COURSE_LEVELS] || course.level}
                        </Badge>
                      </div>
                      <Link
                        href={`/app/cursos/${course.slug}`}
                        className="font-semibold hover:text-primary line-clamp-2 block"
                      >
                        {course.title}
                      </Link>
                      {course.shortDesc && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.shortDesc}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{course.mentor}</span>
                        <span>{course.modulesCount} módulos</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lessons">
          {bookmarks.lessons.length === 0 ? (
            <div className="text-center py-12">
              <Play className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No tienes lecciones guardadas</p>
              <Button asChild>
                <Link href="/app/cursos">Explorar cursos</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.bookmarkId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Play className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/app/cursos/${lesson.courseSlug}`}
                          className="font-medium hover:text-primary block truncate"
                        >
                          {lesson.title}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          {lesson.courseTitle} • {lesson.moduleName}
                        </p>
                        {lesson.duration && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            {lesson.duration} min
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleRemove(lesson.bookmarkId, "lesson")}
                        disabled={removing === lesson.bookmarkId}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
