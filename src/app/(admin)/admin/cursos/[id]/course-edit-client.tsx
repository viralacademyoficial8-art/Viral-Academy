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
  FileText,
  File,
  Download,
  Paperclip,
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

interface Resource {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
}

interface Lesson {
  id: string;
  title: string;
  order: number;
  videoUrl: string | null;
  duration: number | null;
  published: boolean;
  resources?: Resource[];
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

  // Module creation dialog
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [moduleFormData, setModuleFormData] = useState({
    title: "",
    description: "",
  });

  // Lesson creation dialog
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [newLessonFormData, setNewLessonFormData] = useState({
    title: "",
    videoUrl: "",
    published: true,
  });
  const [videoUrlError, setVideoUrlError] = useState("");

  // Attachments state
  const [attachments, setAttachments] = useState<{ file: File; title: string }[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [editAttachments, setEditAttachments] = useState<{ file: File; title: string }[]>([]);
  const [existingResources, setExistingResources] = useState<Resource[]>([]);
  const [resourcesToDelete, setResourcesToDelete] = useState<string[]>([]);

  // Delete states
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

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
    setExistingResources(lesson.resources || []);
    setEditAttachments([]);
    setResourcesToDelete([]);
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;

    // Validate YouTube URL if provided
    if (lessonFormData.videoUrl && !isValidYouTubeUrl(lessonFormData.videoUrl)) {
      toast.error("La URL debe ser de YouTube (youtube.com o youtu.be)");
      return;
    }

    try {
      const res = await fetch(`/api/admin/lessons/${editingLesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonFormData),
      });

      if (res.ok) {
        // Delete removed resources
        for (const resourceId of resourcesToDelete) {
          await fetch(`/api/admin/resources/${resourceId}`, {
            method: "DELETE",
          });
        }

        // Upload new attachments
        if (editAttachments.length > 0) {
          setIsUploadingAttachment(true);
          await uploadAttachments(editingLesson.id, editAttachments);
          setIsUploadingAttachment(false);
        }

        setEditingLesson(null);
        setExistingResources([]);
        setEditAttachments([]);
        setResourcesToDelete([]);
        toast.success("Lección actualizada");
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error("Error al guardar la lección");
    }
  };

  // Validate YouTube URL
  const isValidYouTubeUrl = (url: string): boolean => {
    if (!url) return true; // Empty is allowed
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  // Create module
  const handleCreateModule = async () => {
    if (!moduleFormData.title.trim()) {
      toast.error("El título del módulo es requerido");
      return;
    }

    setIsCreatingModule(true);
    try {
      const res = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          title: moduleFormData.title,
          description: moduleFormData.description || null,
        }),
      });

      if (res.ok) {
        setIsCreateModuleOpen(false);
        setModuleFormData({ title: "", description: "" });
        toast.success("Módulo creado correctamente");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al crear el módulo");
      }
    } catch (error) {
      console.error("Error creating module:", error);
      toast.error("Error de conexión");
    } finally {
      setIsCreatingModule(false);
    }
  };

  // Create lesson
  const handleCreateLesson = async () => {
    if (!newLessonFormData.title.trim()) {
      toast.error("El título de la lección es requerido");
      return;
    }

    if (newLessonFormData.videoUrl && !isValidYouTubeUrl(newLessonFormData.videoUrl)) {
      setVideoUrlError("La URL debe ser de YouTube (youtube.com o youtu.be)");
      return;
    }

    if (!selectedModuleId) {
      toast.error("Selecciona un módulo");
      return;
    }

    setIsCreatingLesson(true);
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          title: newLessonFormData.title,
          videoUrl: newLessonFormData.videoUrl || null,
          published: newLessonFormData.published,
        }),
      });

      if (res.ok) {
        const lesson = await res.json();

        // Upload attachments if any
        if (attachments.length > 0) {
          setIsUploadingAttachment(true);
          await uploadAttachments(lesson.id, attachments);
          setIsUploadingAttachment(false);
        }

        setIsCreateLessonOpen(false);
        setSelectedModuleId(null);
        setNewLessonFormData({ title: "", videoUrl: "", published: true });
        setVideoUrlError("");
        setAttachments([]);
        toast.success("Lección creada correctamente");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al crear la lección");
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("Error de conexión");
    } finally {
      setIsCreatingLesson(false);
    }
  };

  // Delete module
  const handleDeleteModule = async (moduleId: string) => {
    setDeletingModuleId(moduleId);
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Módulo eliminado");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al eliminar el módulo");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("Error de conexión");
    } finally {
      setDeletingModuleId(null);
    }
  };

  // Delete lesson
  const handleDeleteLesson = async (lessonId: string) => {
    setDeletingLessonId(lessonId);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Lección eliminada");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al eliminar la lección");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error("Error de conexión");
    } finally {
      setDeletingLessonId(null);
    }
  };

  // Handle attachment file selection
  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = e.target.files;
    if (!files) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "application/x-zip-compressed",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const maxSize = 50 * 1024 * 1024; // 50MB

    const newAttachments: { file: File; title: string }[] = [];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Formato no permitido: ${file.name}`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`Archivo muy grande (máx 50MB): ${file.name}`);
        return;
      }
      newAttachments.push({
        file,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
      });
    });

    if (isEdit) {
      setEditAttachments([...editAttachments, ...newAttachments]);
    } else {
      setAttachments([...attachments, ...newAttachments]);
    }

    // Reset input
    e.target.value = "";
  };

  // Remove attachment from list
  const removeAttachment = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditAttachments(editAttachments.filter((_, i) => i !== index));
    } else {
      setAttachments(attachments.filter((_, i) => i !== index));
    }
  };

  // Upload attachments and create resources
  const uploadAttachments = async (lessonId: string, files: { file: File; title: string }[]) => {
    for (const { file, title } of files) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!uploadRes.ok) {
          toast.error(`Error al subir: ${file.name}`);
          continue;
        }

        const uploadData = await uploadRes.json();

        // Create resource in database
        await fetch("/api/admin/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            title,
            fileUrl: uploadData.url,
            fileType: file.name.split(".").pop() || "unknown",
            fileSize: file.size,
          }),
        });
      } catch (error) {
        console.error("Error uploading attachment:", error);
        toast.error(`Error al subir: ${file.name}`);
      }
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type === "pdf") return <FileText className="w-4 h-4 text-red-500" />;
    if (["doc", "docx"].includes(type)) return <FileText className="w-4 h-4 text-blue-500" />;
    if (["xls", "xlsx"].includes(type)) return <FileText className="w-4 h-4 text-green-500" />;
    if (["ppt", "pptx"].includes(type)) return <FileText className="w-4 h-4 text-orange-500" />;
    return <File className="w-4 h-4 text-muted-foreground" />;
  };

  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Open lesson creation dialog for specific module
  const openCreateLessonDialog = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setNewLessonFormData({ title: "", videoUrl: "", published: true });
    setVideoUrlError("");
    setAttachments([]);
    setIsCreateLessonOpen(true);
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
              <Button size="sm" onClick={() => setIsCreateModuleOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Nuevo Módulo
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.modules.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Este curso no tiene módulos
                  </p>
                  <Button variant="outline" onClick={() => setIsCreateModuleOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear primer módulo
                  </Button>
                </div>
              ) : (
                course.modules.map((module) => (
                  <Collapsible
                    key={module.id}
                    open={expandedModules.includes(module.id)}
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <div className="border rounded-lg">
                      <div className="flex items-center justify-between p-4 hover:bg-muted/50">
                        <CollapsibleTrigger className="flex items-center gap-3 flex-1">
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
                        </CollapsibleTrigger>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCreateLessonDialog(module.id);
                            }}
                            title="Agregar lección"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`¿Eliminar el módulo "${module.title}" y todas sus lecciones?`)) {
                                handleDeleteModule(module.id);
                              }
                            }}
                            disabled={deletingModuleId === module.id}
                            title="Eliminar módulo"
                          >
                            {deletingModuleId === module.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="border-t px-4 py-2 space-y-1">
                          {module.lessons.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground mb-2">
                                Este módulo no tiene lecciones
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCreateLessonDialog(module.id)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar lección
                              </Button>
                            </div>
                          ) : (
                            <>
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
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => {
                                        if (confirm(`¿Eliminar la lección "${lesson.title}"?`)) {
                                          handleDeleteLesson(lesson.id);
                                        }
                                      }}
                                      disabled={deletingLessonId === lesson.id}
                                    >
                                      {deletingLessonId === lesson.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => openCreateLessonDialog(module.id)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar lección
                              </Button>
                            </>
                          )}
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
            <DialogTitle>Editar Lección</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la lección
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={lessonFormData.title}
                onChange={(e) =>
                  setLessonFormData({ ...lessonFormData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>URL del Video (YouTube)</Label>
              <Input
                value={lessonFormData.videoUrl}
                onChange={(e) =>
                  setLessonFormData({
                    ...lessonFormData,
                    videoUrl: e.target.value,
                  })
                }
                placeholder="https://youtube.com/watch?v=... o https://youtu.be/..."
              />
              <p className="text-xs text-muted-foreground">
                Solo URLs de YouTube (youtube.com o youtu.be)
              </p>
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
                {lessonFormData.published ? "Sí" : "No"}
              </Button>
            </div>

            {/* Existing Resources */}
            {existingResources.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Archivos Existentes
                </Label>
                <div className="space-y-2">
                  {existingResources
                    .filter((r) => !resourcesToDelete.includes(r.id))
                    .map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {getFileIcon(resource.fileType)}
                          <div>
                            <p className="text-sm font-medium">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {resource.fileType.toUpperCase()} {formatFileSize(resource.fileSize)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setResourcesToDelete([...resourcesToDelete, resource.id])}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Add new attachments */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Agregar Archivos
              </Label>
              <Input
                type="file"
                multiple
                onChange={(e) => handleAttachmentSelect(e, true)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.jpg,.jpeg,.png,.webp"
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
              />
              <p className="text-xs text-muted-foreground">
                PDF, Word, Excel, PowerPoint, ZIP, imágenes (máx 50MB)
              </p>

              {/* New attachments list */}
              {editAttachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  {editAttachments.map((att, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {getFileIcon(att.file.name.split(".").pop() || "")}
                        <div>
                          <Input
                            value={att.title}
                            onChange={(e) => {
                              const newAttachments = [...editAttachments];
                              newAttachments[index].title = e.target.value;
                              setEditAttachments(newAttachments);
                            }}
                            className="h-7 text-sm"
                            placeholder="Título del archivo"
                          />
                          <p className="text-xs text-muted-foreground">
                            {att.file.name} ({formatFileSize(att.file.size)})
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeAttachment(index, true)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingLesson(null);
              setExistingResources([]);
              setEditAttachments([]);
              setResourcesToDelete([]);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLesson} disabled={isUploadingAttachment}>
              {isUploadingAttachment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Module Dialog */}
      <Dialog open={isCreateModuleOpen} onOpenChange={setIsCreateModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Módulo</DialogTitle>
            <DialogDescription>
              Agrega un nuevo módulo al curso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título del Módulo *</Label>
              <Input
                value={moduleFormData.title}
                onChange={(e) =>
                  setModuleFormData({ ...moduleFormData, title: e.target.value })
                }
                placeholder="Ej: Introducción al Marketing Digital"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={moduleFormData.description}
                onChange={(e) =>
                  setModuleFormData({ ...moduleFormData, description: e.target.value })
                }
                placeholder="Describe brevemente el contenido del módulo..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModuleOpen(false);
                setModuleFormData({ title: "", description: "" });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateModule}
              disabled={isCreatingModule || !moduleFormData.title.trim()}
            >
              {isCreatingModule ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Módulo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Lesson Dialog */}
      <Dialog open={isCreateLessonOpen} onOpenChange={(open) => {
        setIsCreateLessonOpen(open);
        if (!open) {
          setSelectedModuleId(null);
          setNewLessonFormData({ title: "", videoUrl: "", published: true });
          setVideoUrlError("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Lección</DialogTitle>
            <DialogDescription>
              Agrega una nueva lección al módulo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título de la Lección *</Label>
              <Input
                value={newLessonFormData.title}
                onChange={(e) =>
                  setNewLessonFormData({ ...newLessonFormData, title: e.target.value })
                }
                placeholder="Ej: ¿Qué es el Marketing Digital?"
              />
            </div>
            <div className="space-y-2">
              <Label>URL del Video (YouTube)</Label>
              <Input
                value={newLessonFormData.videoUrl}
                onChange={(e) => {
                  setNewLessonFormData({ ...newLessonFormData, videoUrl: e.target.value });
                  setVideoUrlError("");
                }}
                placeholder="https://youtube.com/watch?v=... o https://youtu.be/..."
                className={videoUrlError ? "border-red-500" : ""}
              />
              {videoUrlError ? (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {videoUrlError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Solo URLs de YouTube (youtube.com o youtu.be)
                </p>
              )}
            </div>
            {/* Attachments Section */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Archivos Adjuntos (opcional)
              </Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  multiple
                  onChange={(e) => handleAttachmentSelect(e, false)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.jpg,.jpeg,.png,.webp"
                  className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  PDF, Word, Excel, PowerPoint, ZIP, imágenes (máx 50MB por archivo)
                </p>
              </div>

              {/* Attachments list */}
              {attachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  {attachments.map((att, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {getFileIcon(att.file.name.split(".").pop() || "")}
                        <div>
                          <Input
                            value={att.title}
                            onChange={(e) => {
                              const newAttachments = [...attachments];
                              newAttachments[index].title = e.target.value;
                              setAttachments(newAttachments);
                            }}
                            className="h-7 text-sm"
                            placeholder="Título del archivo"
                          />
                          <p className="text-xs text-muted-foreground">
                            {att.file.name} ({formatFileSize(att.file.size)})
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeAttachment(index, false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label>Publicar inmediatamente</Label>
              <Button
                variant={newLessonFormData.published ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setNewLessonFormData({
                    ...newLessonFormData,
                    published: !newLessonFormData.published,
                  })
                }
              >
                {newLessonFormData.published ? "Sí" : "No"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateLessonOpen(false);
                setSelectedModuleId(null);
                setNewLessonFormData({ title: "", videoUrl: "", published: true });
                setVideoUrlError("");
                setAttachments([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateLesson}
              disabled={isCreatingLesson || isUploadingAttachment || !newLessonFormData.title.trim()}
            >
              {isCreatingLesson || isUploadingAttachment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploadingAttachment ? "Subiendo archivos..." : "Creando..."}
                </>
              ) : (
                "Crear Lección"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
