"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  X,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateBlogPost, deleteBlogPost } from "@/lib/actions/blog";
import { generateSlug, BLOG_CATEGORIES } from "@/lib/blog-utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  readTime: number;
  author: string;
  authorId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  post: BlogPost;
}

export function EditPostClient({ post }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [thumbnailMode, setThumbnailMode] = useState<"url" | "upload">("url");
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    thumbnail: post.thumbnail,
    category: post.category,
    tags: post.tags,
    published: post.published,
    featured: post.featured,
    readTime: post.readTime,
  });

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tag],
        });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
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
      toast.error("Archivo muy grande. Máximo 2MB.");
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
    } catch {
      toast.error("Error de conexión al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const handleContentChange = (content: string) => {
    setFormData({
      ...formData,
      content,
      readTime: calculateReadTime(content),
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("El título es requerido");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("El contenido es requerido");
      return;
    }

    setIsLoading(true);
    try {
      await updateBlogPost(post.id, formData);
      toast.success("Artículo actualizado");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar el artículo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsLoading(true);
    try {
      await updateBlogPost(post.id, { published: !formData.published });
      setFormData({ ...formData, published: !formData.published });
      toast.success(formData.published ? "Artículo despublicado" : "Artículo publicado");
      router.refresh();
    } catch (error) {
      toast.error("Error al cambiar el estado de publicación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBlogPost(post.id);
      toast.success("Artículo eliminado");
      router.push("/admin/blog");
    } catch (error) {
      toast.error("Error al eliminar el artículo");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Artículo</h1>
            <p className="text-muted-foreground">
              Creado el {format(new Date(post.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {post.published && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/blog/${post.slug}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleTogglePublish}
            disabled={isLoading}
          >
            {formData.published ? (
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
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar cambios
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ej: Cómo crear contenido viral en Instagram"
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
                  placeholder="como-crear-contenido-viral-instagram"
                />
                <p className="text-xs text-muted-foreground">
                  URL: /blog/{formData.slug || "slug-del-articulo"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Extracto</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Un breve resumen del artículo (aparece en las tarjetas y vista previa)"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Escribe el contenido del artículo... (Soporta Markdown)"
                  rows={20}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Tiempo de lectura estimado: {formData.readTime} min | Soporta
                  Markdown
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estado actual</span>
                <Badge variant={formData.published ? "default" : "secondary"}>
                  {formData.published ? "Publicado" : "Borrador"}
                </Badge>
              </div>
              {post.publishedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Publicado</span>
                  <span>
                    {format(new Date(post.publishedAt), "d MMM yyyy", { locale: es })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Destacado</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Categoría</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {Object.entries(BLOG_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Etiquetas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Escribe y presiona Enter"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle>Imagen de Portada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={thumbnailMode === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setThumbnailMode("url")}
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  URL
                </Button>
                <Button
                  type="button"
                  variant={thumbnailMode === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setThumbnailMode("upload")}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Subir
                </Button>
              </div>

              {thumbnailMode === "url" ? (
                <Input
                  placeholder="https://ejemplo.com/imagen.webp"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail: e.target.value })
                  }
                />
              ) : (
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".webp,.jpg,.jpeg,.png"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
                  />
                  {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subiendo...
                    </div>
                  )}
                </div>
              )}

              {formData.thumbnail && (
                <div className="relative">
                  <img
                    src={formData.thumbnail}
                    alt="Vista previa"
                    className="w-full aspect-video object-cover rounded-md border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() =>
                      setFormData({ ...formData, thumbnail: "" })
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {!formData.thumbnail && (
                <div className="flex items-center justify-center aspect-video rounded-md border border-dashed">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar artículo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar artículo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el artículo &quot;{post.title}
              &quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
