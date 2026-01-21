"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Filter, GraduationCap, Users, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COURSE_CATEGORIES } from "@/lib/utils";

interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  category: string;
  startedAt: string;
  completedAt: string | null;
}

interface TopCourse {
  id: string;
  title: string;
  enrollments: number;
}

interface Stats {
  total: number;
  completed: number;
  inProgress: number;
  completionRate: number;
  topCourses: TopCourse[];
}

interface EnrollmentsClientProps {
  enrollments: Enrollment[];
  stats: Stats;
}

export function EnrollmentsClient({ enrollments, stats }: EnrollmentsClientProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.userName.toLowerCase().includes(search.toLowerCase()) ||
      enrollment.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      enrollment.courseTitle.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "completed" && enrollment.completedAt) ||
      (statusFilter === "in_progress" && !enrollment.completedAt);

    const matchesCategory = !categoryFilter || enrollment.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inscripciones</h1>
        <p className="text-muted-foreground">
          Gestiona las inscripciones a cursos
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Inscripciones</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En Progreso</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              {stats.inProgress}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completados</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {stats.completed}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasa de Completación</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {stats.completionRate}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Top Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cursos Más Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topCourses.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium">{course.title}</span>
                </div>
                <Badge variant="secondary">{course.enrollments} inscritos</Badge>
              </div>
            ))}
            {stats.topCourses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">No hay cursos con inscripciones</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario o curso..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Estado
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
                    En progreso
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                    Completados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Categoría
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                    Todas
                  </DropdownMenuItem>
                  {Object.entries(COURSE_CATEGORIES).map(([key, label]) => (
                    <DropdownMenuItem key={key} onClick={() => setCategoryFilter(key)}>
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left text-sm font-medium">
                    Usuario
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-medium">
                    Curso
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-medium hidden md:table-cell">
                    Estado
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-medium hidden lg:table-cell">
                    Fecha Inicio
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-medium hidden lg:table-cell">
                    Fecha Fin
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {enrollment.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{enrollment.userName}</p>
                          <p className="text-xs text-muted-foreground">{enrollment.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/cursos/${enrollment.courseId}`}
                        className="font-medium hover:text-primary"
                      >
                        {enrollment.courseTitle}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {COURSE_CATEGORIES[enrollment.category as keyof typeof COURSE_CATEGORIES] || enrollment.category}
                      </p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {enrollment.completedAt ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          En progreso
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(enrollment.startedAt)}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                      {enrollment.completedAt ? formatDate(enrollment.completedAt) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEnrollments.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron inscripciones</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
