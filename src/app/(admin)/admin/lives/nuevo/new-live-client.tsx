"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Calendar } from "lucide-react";
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

interface Mentor {
  id: string;
  name: string;
}

interface Props {
  mentors: Mentor[];
}

const liveTypes: Record<string, string> = {
  MINDSET: "Lunes Sublimes (Mindset)",
  MARKETING: "Miercoles Virales (Marketing)",
  SPECIAL: "Evento Especial",
};

export function NewLiveClient({ mentors }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "MARKETING",
    mentorId: mentors[0]?.id || "",
    scheduledAt: "",
    duration: "60",
    meetingUrl: "",
    thumbnail: "",
    published: false,
  });

  const handleCreate = async () => {
    if (!formData.title || !formData.scheduledAt || !formData.mentorId) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/lives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/admin/lives");
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating live:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/lives">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Programar Live</h1>
          <p className="text-muted-foreground">
            Programa un nuevo evento en vivo
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Informacion del Live
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
                placeholder="Ej: Como crear contenido viral en 2024"
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
                placeholder="Describe el tema del live..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Live</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(liveTypes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mentor *</Label>
                <Select
                  value={formData.mentorId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, mentorId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un mentor" />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Fecha y Hora *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledAt: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duracion (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingUrl">URL de la reunion (Zoom/YouTube)</Label>
              <Input
                id="meetingUrl"
                value={formData.meetingUrl}
                onChange={(e) =>
                  setFormData({ ...formData, meetingUrl: e.target.value })
                }
                placeholder="https://zoom.us/j/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Imagen de portada (URL)</Label>
              <Input
                id="thumbnail"
                value={formData.thumbnail}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label>Publicar inmediatamente</Label>
              <Button
                type="button"
                variant={formData.published ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setFormData({ ...formData, published: !formData.published })
                }
              >
                {formData.published ? "Si" : "No"}
              </Button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" asChild>
                <Link href="/admin/lives">Cancelar</Link>
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  isLoading ||
                  !formData.title ||
                  !formData.scheduledAt ||
                  !formData.mentorId
                }
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Creando..." : "Programar Live"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
