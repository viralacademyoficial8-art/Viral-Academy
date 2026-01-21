"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Course {
  id: string;
  title: string;
}

interface Props {
  courses: Course[];
}

const fileTypes = [
  { value: "pdf", label: "PDF" },
  { value: "xlsx", label: "Excel (XLSX)" },
  { value: "xls", label: "Excel (XLS)" },
  { value: "doc", label: "Word (DOC)" },
  { value: "docx", label: "Word (DOCX)" },
  { value: "ppt", label: "PowerPoint (PPT)" },
  { value: "pptx", label: "PowerPoint (PPTX)" },
  { value: "zip", label: "ZIP" },
  { value: "mp3", label: "Audio (MP3)" },
  { value: "mp4", label: "Video (MP4)" },
  { value: "other", label: "Otro" },
];

export function NewResourceClient({ courses }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileType: "pdf",
    fileSize: "",
    courseId: "",
  });

  const handleCreate = async () => {
    if (!formData.title || !formData.fileUrl) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          courseId: formData.courseId || null,
        }),
      });

      if (res.ok) {
        router.push("/admin/recursos");
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating resource:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/recursos">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Recurso</h1>
          <p className="text-muted-foreground">
            Sube un nuevo recurso descargable
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="w-5 h-5" />
              Informacion del Recurso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej: Plantilla de calendario de contenido"
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
                placeholder="Describe el recurso..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileUrl">URL del archivo *</Label>
              <Input
                id="fileUrl"
                value={formData.fileUrl}
                onChange={(e) =>
                  setFormData({ ...formData, fileUrl: e.target.value })
                }
                placeholder="https://drive.google.com/... o URL de Supabase Storage"
              />
              <p className="text-xs text-muted-foreground">
                Sube el archivo a Google Drive, Supabase Storage u otro servicio y pega la URL aqui
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de archivo</Label>
                <Select
                  value={formData.fileType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, fileType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileSize">Tamano (KB)</Label>
                <Input
                  id="fileSize"
                  type="number"
                  value={formData.fileSize}
                  onChange={(e) =>
                    setFormData({ ...formData, fileSize: e.target.value })
                  }
                  placeholder="1024"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Asociar a un curso (opcional)</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) =>
                  setFormData({ ...formData, courseId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguno (recurso general)</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" asChild>
                <Link href="/admin/recursos">Cancelar</Link>
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isLoading || !formData.title || !formData.fileUrl}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Creando..." : "Crear Recurso"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
