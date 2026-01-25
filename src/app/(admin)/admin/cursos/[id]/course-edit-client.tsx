"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Play,
  Pencil,
  Eye,
  EyeOff,
  Loader2,
  X,
  AlertTriangle,
  Link as LinkIcon,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Lesson {
  id: string;
  title: string;
  order: number;
  videoUrl: string | null;
  duration: number | null;
  published: boolean;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  level: string;
  category: string;
  published: boolean;
  featured: boolean;
  mentorId: string;
  mentorName: string;
  modules: Module[];
}

interface Mentor {
  id: string;
  name: string;
}

interface Props {
  course: Course;
  mentors: Mentor[];
}

const levelLabels: Record<string, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

const categoryLabels: Record<string, string> = {
  MARKETING: "Marketing",
  CONTENT: "Contenido",
  AI: "Inteligencia Artificial",
  AUTOMATION: "Automatización",
  BRAND: "Marca Personal",
  ECOMMERCE: "E-commerce",
  MINDSET: "Mindset",
  BUSINESS: "Negocios",
};

export function CourseEditClient({ course, mentors }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(
    course.modules.map((m) => m.id)
  );
  const [formData, setFormData] = useState({
    title: course.title,
    slug: course.slug,
    description: course.description,
    thumbnail: course.thumbnail || "",
    level: course.level,
    category: course.category,
    mentorId: course.mentorId,
    published: course.published,
    featured: course.featured,
  });
  const [thumbnailMode, setThumbnailMode] = useState<"url" | "upload">("url");
  const [isUploading, setIsUploading] = useState(false);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [thumbnailError, setThumbnailError] = useState("");

  // Lesson edit dialog
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    videoUrl: "",
    published: true,
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Validate image dimensions (must be square 1:1)
  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const isSquare = img.width === img.height;
        if (!isSquare) {
          setThumbnailError(`La imagen debe ser cuadrada (1:1). Tu imagen: ${img.width}x${img.height}px`);
          toast.error(`La imagen debe ser cuadrada (1:1). Tu imagen: ${img.width}x${img.height}px`);
        } else {
          setThumbnailError("");
        }
        resolve(isSquare);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        setThumbnailError("No se pudo cargar la imagen para validar");
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Validate image URL dimensions
  const validateImageUrl = async (url: string): Promise<boolean> => {
    if (!url) return true;

    setIsValidatingUrl(true);
    setThumbnailError("");

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setIsValidatingUrl(false);
        const isSquare = img.width === img.height;
        if (!isSquare) {
          setThumbnailError(`La imagen debe ser cuadrada (1:1). La imagen es: ${img.width}x${img.height}px`);
          toast.error(`La imagen debe ser cuadrada (1:1). La imagen es: ${img.width}x${img.height}px`);
        } else {
          setThumbnailError("");
          toast.success("Imagen válida (dimensiones cuadradas)");
        }
        resolve(isSquare);
      };
      img.onerror = () => {
        setIsValidatingUrl(false);
        setThumbnailError("No se pudo cargar la imagen. Verifica la URL.");
        resolve(false);
      };
      img.src = url;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/webp", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato no permitido. Usa WebP, JPEG o PNG.");
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Archivo muy grande. Máximo 2MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    const isValidDimensions = await validateImageDimensions(file);
    if (!isValidDimensions) {
      return;
    }

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({ ...formData, thumbnail: data.url });
        toast.success("Imagen subida correctamente");
      } else {
        toast.error(data.error || "Error al subir la imagen");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error de conexión al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      videoUrl: lesson.videoUrl || "",
      published: lesson.published,
    });
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;

    try {
      const res = await fetch(`/api/admin/lessons/${editingLesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonFormData),
      });

      if (res.ok) {
        setEditingLesson(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
    }
  };

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/cursos">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">
              {course.modules.length} modulos - {totalLessons} lecciones
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={course.published ? "default" : "secondary"}>
            {course.published ? "Publicado" : "Borrador"}
          </Badge>
          <Button onClick={handleSave} disabled={isLoading || !!thumbnailError}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informacion del Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titulo</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Imagen de Portada</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant={thumbnailMode === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setThumbnailMode("url");
                      setThumbnailError("");
                    }}
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={thumbnailMode === "upload" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setThumbnailMode("upload");
                      setThumbnailError("");
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Subir
                  </Button>
                </div>

                {thumbnailMode === "url" ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://ejemplo.com/imagen.webp"
                        value={formData.thumbnail}
                        onChange={(e) => {
                          setFormData({ ...formData, thumbnail: e.target.value });
                          setThumbnailError("");
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => validateImageUrl(formData.thumbnail)}
                        disabled={!formData.thumbnail || isValidatingUrl}
                      >
                        {isValidatingUrl ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Verificar"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dimensiones requeridas: <strong>Cuadrada (1:1)</strong> | Ej: 1080x1080px
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".webp,.jpg,.jpeg,.png"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
                      />
                      {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formatos: WebP, JPEG, PNG | Máximo: 2MB | <strong>Dimensiones: Cuadrada (1:1)</strong>
                    </p>
                  </div>
                )}

                {thumbnailError && (
                  <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-md">
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {thumbnailError}
                    </p>
                  </div>
                )}

                {formData.thumbnail && (
                  <div className="relative mt-2 w-32">
                    <img
                      src={formData.thumbnail}
                      alt="Vista previa"
                      className="w-32 h-32 object-cover rounded-md border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-course.png";
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => {
                        setFormData({ ...formData, thumbnail: "" });
                        setThumbnailError("");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nivel</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(levelLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, mentorId: value })
                  }
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
            </CardContent>
          </Card>

          {/* Modules & Lessons */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Modulos y Lecciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.modules.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Este curso no tiene modulos
                </p>
              ) : (
                course.modules.map((module) => (
                  <Collapsible
                    key={module.id}
                    open={expandedModules.includes(module.id)}
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            {expandedModules.includes(module.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span className="font-medium">{module.title}</span>
                            <Badge variant="outline" className="ml-2">
                              {module.lessons.length} lecciones
                            </Badge>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t px-4 py-2 space-y-1">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50 group"
                            >
                              <div className="flex items-center gap-3">
                                <Play className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{lesson.title}</span>
                                {!lesson.published && (
                                  <Badge variant="secondary" className="text-xs">
                                    Borrador
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {lesson.videoUrl && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    asChild
                                  >
                                    <a
                                      href={lesson.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditLesson(lesson)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publicacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estado</span>
                <Button
                  variant={formData.published ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFormData({ ...formData, published: !formData.published })
                  }
                >
                  {formData.published ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Publicado
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Borrador
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Destacado</span>
                <Button
                  variant={formData.featured ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFormData({ ...formData, featured: !formData.featured })
                  }
                >
                  {formData.featured ? "Si" : "No"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modulos</span>
                <span className="font-medium">{course.modules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lecciones</span>
                <span className="font-medium">{totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mentor</span>
                <span className="font-medium">{course.mentorName}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lesson Edit Dialog */}
      <Dialog open={!!editingLesson} onOpenChange={() => setEditingLesson(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Leccion</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la leccion
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titulo</Label>
              <Input
                value={lessonFormData.title}
                onChange={(e) =>
                  setLessonFormData({ ...lessonFormData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>URL del Video</Label>
              <Input
                value={lessonFormData.videoUrl}
                onChange={(e) =>
                  setLessonFormData({
                    ...lessonFormData,
                    videoUrl: e.target.value,
                  })
                }
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Publicado</Label>
              <Button
                variant={lessonFormData.published ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setLessonFormData({
                    ...lessonFormData,
                    published: !lessonFormData.published,
                  })
                }
              >
                {lessonFormData.published ? "Si" : "No"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLesson(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLesson}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
