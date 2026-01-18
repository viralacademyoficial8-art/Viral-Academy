"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Download, FileText, FileSpreadsheet, FileImage, File, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  course: { title: string; slug: string } | null;
  createdAt: string;
}

interface RecursosClientProps {
  resources: Resource[];
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-6 h-6 text-red-500" />,
  xlsx: <FileSpreadsheet className="w-6 h-6 text-green-500" />,
  xls: <FileSpreadsheet className="w-6 h-6 text-green-500" />,
  doc: <FileText className="w-6 h-6 text-blue-500" />,
  docx: <FileText className="w-6 h-6 text-blue-500" />,
  png: <FileImage className="w-6 h-6 text-purple-500" />,
  jpg: <FileImage className="w-6 h-6 text-purple-500" />,
  jpeg: <FileImage className="w-6 h-6 text-purple-500" />,
  zip: <FolderOpen className="w-6 h-6 text-yellow-500" />,
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function RecursosClient({ resources }: RecursosClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string | null>(null);

  const fileTypes = Array.from(new Set(resources.map((r) => r.fileType)));

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || resource.fileType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold">Recursos</h1>
        <p className="text-muted-foreground">
          Plantillas, guías y materiales descargables para tu negocio.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(null)}
          >
            Todos
          </Button>
          {fileTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(selectedType === type ? null : type)}
            >
              {type.toUpperCase()}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No se encontraron recursos.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource, index) => {
            const icon = FILE_ICONS[resource.fileType] || <File className="w-6 h-6" />;
            const date = new Date(resource.createdAt);

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <h3 className="font-medium line-clamp-2">{resource.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">
                            {resource.fileType.toUpperCase()}
                          </Badge>
                          {resource.fileSize && (
                            <span>{formatFileSize(resource.fileSize)}</span>
                          )}
                          <span>·</span>
                          <span>{format(date, "d MMM yyyy", { locale: es })}</span>
                        </div>
                        {resource.course && (
                          <Link
                            href={`/app/cursos/${resource.course.slug}`}
                            className="text-xs text-primary hover:underline"
                          >
                            {resource.course.title}
                          </Link>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={resource.fileUrl} download>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
