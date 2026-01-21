import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  FileText,
  Plus,
  Download,
  File,
  FileImage,
  FileVideo,
  Link as LinkIcon,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

type ResourceWithCourse = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  courseId: string | null;
  lessonId: string | null;
  createdAt: Date;
  updatedAt: Date;
  course: { id: string; title: string } | null;
};

export default async function AdminRecursosPage() {
  let resources: ResourceWithCourse[] = [];

  try {
    resources = await prisma.resource.findMany({
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error loading resources:", error);
  }

  const resourceTypeIcons: Record<string, typeof File> = {
    pdf: FileText,
    video: FileVideo,
    mp4: FileVideo,
    jpg: FileImage,
    png: FileImage,
    image: FileImage,
    link: LinkIcon,
    zip: File,
    xlsx: File,
  };

  const resourcesByType = resources.reduce((acc, resource) => {
    const type = resource.fileType?.toLowerCase() || "file";
    if (!acc[type]) acc[type] = [];
    acc[type].push(resource);
    return acc;
  }, {} as Record<string, typeof resources>);

  const typeLabels: Record<string, string> = {
    pdf: "PDFs",
    video: "Videos",
    mp4: "Videos",
    jpg: "Imágenes",
    png: "Imágenes",
    image: "Imágenes",
    link: "Enlaces",
    zip: "Archivos ZIP",
    xlsx: "Excel",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recursos</h1>
          <p className="text-muted-foreground">Gestiona los recursos descargables de la plataforma</p>
        </div>
        <Button asChild>
          <Link href="/admin/recursos/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Subir Recurso
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Folder className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{resources.length}</p>
              <p className="text-sm text-muted-foreground">Total Recursos</p>
            </div>
          </div>
        </div>
        {Object.entries(resourcesByType).slice(0, 3).map(([type, items]) => {
          const Icon = resourceTypeIcons[type] || File;
          return (
            <div key={type} className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Icon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{items.length}</p>
                  <p className="text-sm text-muted-foreground">{typeLabels[type] || type}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resources List */}
      <div className="bg-card rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Todos los Recursos</h2>
        </div>
        <div className="divide-y">
          {resources.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay recursos subidos</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/admin/recursos/nuevo">Subir uno</Link>
              </Button>
            </div>
          ) : (
            resources.map((resource) => {
              const Icon = resourceTypeIcons[resource.fileType?.toLowerCase() || "file"] || File;
              return (
                <div key={resource.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{resource.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{resource.fileType || "Archivo"}</span>
                        {resource.course && (
                          <>
                            <span>•</span>
                            <span>{resource.course.title}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(resource.createdAt), "d MMM yyyy", { locale: es })}
                    </span>
                    {resource.fileUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
