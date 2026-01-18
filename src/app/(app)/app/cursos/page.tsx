"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { COURSE_LEVELS, COURSE_CATEGORIES, formatDuration } from "@/lib/utils";

const courses = [
  { id: "1", slug: "marketing-digital-desde-cero", title: "Marketing Digital desde Cero", shortDesc: "Domina el marketing digital desde los fundamentos.", level: "BEGINNER", category: "MARKETING", mentor: "Leonardo Gómez", duration: 480, enrolled: true, progress: 65, featured: true },
  { id: "2", slug: "creacion-contenido-viral", title: "Creación de Contenido Viral", shortDesc: "Crea contenido que la gente quiera compartir.", level: "INTERMEDIATE", category: "CONTENT", mentor: "Leonardo Gómez", duration: 360, enrolled: true, progress: 20, featured: true },
  { id: "3", slug: "ia-para-negocios", title: "Inteligencia Artificial para Negocios", shortDesc: "Usa IA como tu asistente de negocios 24/7.", level: "BEGINNER", category: "AI", mentor: "Leonardo Gómez", duration: 300, enrolled: false, progress: 0, featured: false },
  { id: "4", slug: "mentalidad-emprendedora", title: "Mentalidad Emprendedora", shortDesc: "La base mental que sostiene tu éxito.", level: "BEGINNER", category: "MINDSET", mentor: "Susy Ponce", duration: 240, enrolled: false, progress: 0, featured: false },
];

export default function CursosPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold">Cursos</h1>
        <p className="text-muted-foreground">Formación práctica, sin teoría innecesaria.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cursos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)}>Todos</Button>
          {Object.entries(COURSE_CATEGORIES).map(([key, label]) => (
            <Button key={key} variant={selectedCategory === key ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}>{label}</Button>
          ))}
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
            <Link href={`/app/cursos/${course.slug}`}>
              <Card hover className="h-full overflow-hidden group">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative">
                  {course.featured && <Badge className="absolute top-3 left-3">Destacado</Badge>}
                  {course.enrolled && course.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-2">
                      <div className="h-full bg-primary" style={{ width: `${course.progress}%` }} />
                    </div>
                  )}
                </div>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{COURSE_CATEGORIES[course.category as keyof typeof COURSE_CATEGORIES]}</Badge>
                    <Badge variant="outline" className="text-xs">{COURSE_LEVELS[course.level as keyof typeof COURSE_LEVELS]}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.shortDesc}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><User className="h-4 w-4" /><span>{course.mentor}</span></div>
                    <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>{formatDuration(course.duration)}</span></div>
                  </div>
                  {course.enrolled && course.progress > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Progreso</span><span className="font-medium">{course.progress}%</span></div>
                      <Progress value={course.progress} />
                    </div>
                  ) : <Badge variant="accent" className="text-xs">Incluido en tu membresía</Badge>}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
