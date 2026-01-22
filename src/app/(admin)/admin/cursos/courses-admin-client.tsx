"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  BookOpen,
  Users,
  AlertTriangle,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  category: string;
  published: boolean;
  featured: boolean;
  mentor: string;
  mentorId: string;
  modulesCount: number;
  lessonsCount: number;
  studentsCount: number;
  createdAt: string;
}

interface Mentor {
  id: string;
  name: string;
}

interface Props {
  courses: Course[];
  mentors: Mentor[];
}

const levelLabels: Record<string, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

const categoryLabels: Record<string, string> = {
  BOTS: "Bots",
  LIVE_CLASSES: "Clases En Vivo Grupales",
  WEB_PAGES: "Crear Páginas Web",
  EBOOKS: "Ebooks",
  VIDEO_EDITING: "Edición De Video",
  AI: "Inteligencia Artificial",
  MARKETING: "Marketing Digital",
  SOCIAL_VIRAL: "Redes Sociales y Viralidad",
  CONTENT: "Creación de Contenido",
  AUTOMATION: "Automatización",
  BRAND: "Marca Personal",
  ECOMMERCE: "E-commerce",
  MINDSET: "Mentalidad",
  BUSINESS: "Negocios",
};

export function CoursesAdminClient({ courses, mentors }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [importJson, setImportJson] = useState("");
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    failed: number;
    errors?: Array<{ title: string; error: string }>;
  } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    level: "BEGINNER",
    category: "MARKETING",
    mentorId: mentors[0]?.id || "",
  });

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.mentor.toLowerCase().includes(search.toLowerCase())
  );

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({
          title: "",
          slug: "",
          description: "",
          level: "BEGINNER",
          category: "MARKETING",
          mentorId: mentors[0]?.id || "",
        });
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (courseId: string, published: boolean) => {
    try {
      await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  const handleToggleFeatured = async (courseId: string, featured: boolean) => {
    try {
      await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !featured }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("¿Estás seguro de eliminar este curso?")) return;

    try {
      await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleDeleteAll = async () => {
    if (deleteConfirmText !== "ELIMINAR TODO") return;

    setIsDeletingAll(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "DELETE",
        headers: {
          "X-Confirm-Delete-All": "DELETE_ALL_COURSES",
        },
      });

      if (res.ok) {
        setIsDeleteAllOpen(false);
        setDeleteConfirmText("");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar cursos");
      }
    } catch (error) {
      console.error("Error deleting all courses:", error);
      alert("Error al eliminar cursos");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const parsed = JSON.parse(importJson);
      const res = await fetch("/api/admin/courses/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();

      if (res.ok) {
        setImportResult(data);
        if (data.imported > 0) {
          router.refresh();
        }
      } else {
        setImportResult({
          success: false,
          imported: 0,
          failed: 1,
          errors: [{ title: "Error", error: data.error || "Error desconocido" }],
        });
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        setImportResult({
          success: false,
          imported: 0,
          failed: 1,
          errors: [{ title: "JSON inválido", error: "El formato JSON no es válido. Verifica la sintaxis." }],
        });
      } else {
        setImportResult({
          success: false,
          imported: 0,
          failed: 1,
          errors: [{ title: "Error", error: error instanceof Error ? error.message : "Error desconocido" }],
        });
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportJson(content);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = async () => {
    const res = await fetch("/api/admin/courses/import");
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data.template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "course-template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">Gestiona los cursos de la plataforma</p>
        </div>
        <div className="flex gap-2">
          {courses.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteAllOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Todo
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Curso
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Publicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {courses.filter((c) => c.published).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Lecciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((acc, c) => acc + c.lessonsCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inscripciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((acc, c) => acc + c.studentsCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cursos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead className="text-center">Módulos</TableHead>
              <TableHead className="text-center">Alumnos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">/{course.slug}</p>
                    </div>
                    {course.featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{levelLabels[course.level]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{categoryLabels[course.category]}</Badge>
                </TableCell>
                <TableCell>{course.mentor}</TableCell>
                <TableCell className="text-center">
                  {course.modulesCount} / {course.lessonsCount}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    {course.studentsCount}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={course.published ? "default" : "secondary"}>
                    {course.published ? "Publicado" : "Borrador"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/cursos/${course.id}`)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTogglePublish(course.id, course.published)}
                      >
                        {course.published ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Despublicar
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Publicar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleFeatured(course.id, course.featured)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {course.featured ? "Quitar destacado" : "Destacar"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Curso</DialogTitle>
            <DialogDescription>
              Completa la información básica del curso. Podrás agregar módulos y lecciones después.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ej: Marketing Digital para Principiantes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="marketing-digital-principiantes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el contenido del curso..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nivel</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Principiante</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                    <SelectItem value="ADVANCED">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mentor</Label>
              <Select
                value={formData.mentorId}
                onValueChange={(value) => setFormData({ ...formData, mentorId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mentors.map((mentor) => (
                    <SelectItem key={mentor.id} value={mentor.id}>
                      {mentor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isLoading || !formData.title}>
              {isLoading ? "Creando..." : "Crear Curso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Dialog */}
      <Dialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Eliminar Todos los Cursos
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                Esta acción eliminará <strong>{courses.length} cursos</strong> y
                todos sus datos relacionados:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Todos los módulos y lecciones</li>
                <li>Todo el progreso de los estudiantes</li>
                <li>Todas las inscripciones</li>
                <li>Todos los recursos asociados</li>
              </ul>
              <p className="text-destructive font-medium">
                Esta acción NO se puede deshacer.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Escribe <strong>ELIMINAR TODO</strong> para confirmar:
            </Label>
            <Input
              id="confirm-delete"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINAR TODO"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteAllOpen(false);
                setDeleteConfirmText("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={isDeletingAll || deleteConfirmText !== "ELIMINAR TODO"}
            >
              {isDeletingAll ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Todo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={(open) => {
        setIsImportOpen(open);
        if (!open) {
          setImportJson("");
          setImportResult(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importar Cursos
            </DialogTitle>
            <DialogDescription>
              Importa cursos desde un archivo JSON con módulos y lecciones incluidos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Template Download */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="text-sm">
                <p className="font-medium">Descargar plantilla</p>
                <p className="text-muted-foreground">
                  Descarga un ejemplo de la estructura JSON
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                Descargar
              </Button>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Subir archivo JSON</Label>
              <Input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>

            {/* JSON Input */}
            <div className="space-y-2">
              <Label>O pega el JSON directamente</Label>
              <Textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder={`{
  "title": "Nombre del Curso",
  "slug": "nombre-del-curso",
  "description": "Descripción del curso",
  "level": "BEGINNER",
  "category": "MARKETING",
  "modules": [
    {
      "title": "Módulo 1",
      "lessons": [
        {
          "title": "Lección 1",
          "videoUrl": "https://youtube.com/watch?v=..."
        }
      ]
    }
  ]
}`}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Import Result */}
            {importResult && (
              <div
                className={`p-4 rounded-lg ${
                  importResult.imported > 0
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                <p className="font-medium">
                  {importResult.imported > 0
                    ? `Se importaron ${importResult.imported} curso(s) correctamente`
                    : "No se pudo importar ningún curso"}
                </p>
                {importResult.failed > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {importResult.failed} curso(s) fallaron
                  </p>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-sm text-red-500">
                        {err.title}: {err.error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportOpen(false);
                setImportJson("");
                setImportResult(null);
              }}
            >
              Cerrar
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting || !importJson.trim()}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
