"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Download,
  Filter,
  Grid,
  List,
  Image as ImageIcon,
  FileText,
  Film,
  File,
  Loader2,
  X,
  Check,
  FolderOpen,
  HardDrive,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  folder: string;
  alt: string | null;
  createdAt: string;
  uploader: {
    email: string;
    profile: { displayName: string | null } | null;
  };
}

interface FolderStats {
  name: string;
  count: number;
  size: number;
}

interface Props {
  initialData: {
    total: number;
    totalSize: number;
    folders: FolderStats[];
    media: MediaFile[];
  };
}

const folderLabels: Record<string, string> = {
  general: "General",
  courses: "Cursos",
  avatars: "Avatares",
  resources: "Recursos",
  thumbnails: "Miniaturas",
  attachments: "Adjuntos",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Film;
  if (type === "application/pdf") return FileText;
  return File;
}

export function GalleryClient({ initialData }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<MediaFile[]>(initialData.media);
  const [folders] = useState<FolderStats[]>(initialData.folders);
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("general");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(search.toLowerCase()) ||
      item.folder.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === "all" || item.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedFiles: MediaFile[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", uploadFolder);

        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const newMedia = await res.json();
          uploadedFiles.push({
            ...newMedia,
            uploader: { email: "", profile: null },
          });
        } else {
          const data = await res.json();
          toast.error(`Error al subir ${file.name}: ${data.error}`);
        }
      }

      if (uploadedFiles.length > 0) {
        setMedia((prev) => [...uploadedFiles, ...prev]);
        toast.success(`${uploadedFiles.length} archivo(s) subido(s) correctamente`);
        setIsUploadDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error al subir los archivos");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este archivo?")) return;

    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
        toast.success("Archivo eliminado correctamente");
        setIsPreviewOpen(false);
        setSelectedFile(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error al eliminar el archivo");
    }
  };

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success("URL copiada al portapapeles");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Error al copiar la URL");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Galería de Medios</h1>
          <p className="text-muted-foreground">Gestiona todos los archivos subidos a la plataforma</p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Subir Archivos
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Archivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialData.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Espacio Usado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-muted-foreground" />
              {formatBytes(initialData.totalSize)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carpetas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
              {folders.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Imágenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
              {media.filter((m) => m.type.startsWith("image/")).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar archivos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Carpeta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las carpetas</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.name} value={folder.name}>
                {folderLabels[folder.name] || folder.name} ({folder.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Gallery */}
      {filteredMedia.length === 0 ? (
        <Card
          className="border-dashed"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No hay archivos</p>
            <p className="text-muted-foreground text-sm">
              Arrastra archivos aquí o haz clic en &quot;Subir Archivos&quot;
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedia.map((file) => {
            const FileIcon = getFileIcon(file.type);
            const isImage = file.type.startsWith("image/");

            return (
              <Card
                key={file.id}
                className="group overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => {
                  setSelectedFile(file);
                  setIsPreviewOpen(true);
                }}
              >
                <div className="aspect-square relative bg-muted">
                  {isImage ? (
                    <img
                      src={file.url}
                      alt={file.alt || file.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(file.url, file.id);
                      }}
                    >
                      {copiedId === file.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs truncate font-medium">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {filteredMedia.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const isImage = file.type.startsWith("image/");

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    setSelectedFile(file);
                    setIsPreviewOpen(true);
                  }}
                >
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                    {isImage ? (
                      <img
                        src={file.url}
                        alt={file.alt || file.filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <FileIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(file.size)} • {folderLabels[file.folder] || file.folder}
                    </p>
                  </div>
                  <Badge variant="outline">{file.type.split("/")[1]}</Badge>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(file.url, file.id);
                      }}
                    >
                      {copiedId === file.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Subir Archivos</DialogTitle>
            <DialogDescription>
              Selecciona los archivos que deseas subir a la galería.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Carpeta</Label>
              <Select value={uploadFolder} onValueChange={setUploadFolder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="courses">Cursos</SelectItem>
                  <SelectItem value="avatars">Avatares</SelectItem>
                  <SelectItem value="resources">Recursos</SelectItem>
                  <SelectItem value="thumbnails">Miniaturas</SelectItem>
                  <SelectItem value="attachments">Adjuntos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onDrop={(e) => {
                e.preventDefault();
                handleUpload(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm">Subiendo archivos...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm">Arrastra archivos aquí o haz clic para seleccionar</p>
                  <p className="text-xs text-muted-foreground">
                    Imágenes, PDF, ZIP o videos hasta 50MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*,application/pdf,application/zip,video/*"
                onChange={(e) => handleUpload(e.target.files)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          {selectedFile && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate pr-8">{selectedFile.filename}</DialogTitle>
                <DialogDescription>
                  {formatBytes(selectedFile.size)} • {selectedFile.type} •{" "}
                  {folderLabels[selectedFile.folder] || selectedFile.folder}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
                  {selectedFile.type.startsWith("image/") ? (
                    <img
                      src={selectedFile.url}
                      alt={selectedFile.alt || selectedFile.filename}
                      className="max-w-full max-h-[60vh] object-contain"
                    />
                  ) : selectedFile.type.startsWith("video/") ? (
                    <video
                      src={selectedFile.url}
                      controls
                      className="max-w-full max-h-[60vh]"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 py-8">
                      {(() => {
                        const FileIcon = getFileIcon(selectedFile.type);
                        return <FileIcon className="w-16 h-16 text-muted-foreground" />;
                      })()}
                      <p className="text-muted-foreground">Vista previa no disponible</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Input
                    value={selectedFile.url}
                    readOnly
                    className="flex-1 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(selectedFile.url, selectedFile.id)}
                  >
                    {copiedId === selectedFile.id ? (
                      <Check className="w-4 h-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    Copiar URL
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Subido por:{" "}
                    {selectedFile.uploader?.profile?.displayName || selectedFile.uploader?.email || "Desconocido"}
                  </p>
                  <p>
                    Fecha: {new Date(selectedFile.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedFile.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
                <Button asChild>
                  <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" download>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
