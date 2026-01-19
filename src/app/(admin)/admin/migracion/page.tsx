"use client";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Users,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MigrationResult {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
}

export default function AdminMigracionPage() {
  const [coursesFile, setCoursesFile] = useState<File | null>(null);
  const [usersFile, setUsersFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, MigrationResult>>({});

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "courses" | "users"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "courses") setCoursesFile(file);
      else setUsersFile(file);
    }
  };

  const handleMigration = async (type: "courses" | "users") => {
    const file = type === "courses" ? coursesFile : usersFile;
    if (!file) return;

    setLoading(type);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/admin/migrate/${type}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setResults((prev) => ({ ...prev, [type]: result }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [type]: {
          success: false,
          message: "Error al procesar la migración",
          imported: 0,
          errors: [String(error)],
        },
      }));
    } finally {
      setLoading(null);
    }
  };

  const downloadTemplate = (type: "courses" | "users") => {
    let csv = "";
    let filename = "";

    if (type === "courses") {
      csv = `title,slug,description,shortDesc,level,category,thumbnail,module_title,module_order,lesson_title,lesson_order,lesson_videoUrl,lesson_duration,lesson_content
"Marketing Digital 101","marketing-digital-101","Aprende los fundamentos del marketing digital","Curso completo de marketing","BEGINNER","MARKETING","https://example.com/thumb.jpg","Módulo 1: Introducción",1,"Qué es el marketing digital",1,"https://youtube.com/watch?v=xxx",15,"Contenido de la lección..."
"Marketing Digital 101","marketing-digital-101","","","","","","Módulo 1: Introducción",1,"Herramientas esenciales",2,"https://youtube.com/watch?v=yyy",20,"Más contenido..."
"Marketing Digital 101","marketing-digital-101","","","","","","Módulo 2: Estrategias",2,"Facebook Ads básico",1,"https://youtube.com/watch?v=zzz",25,""`;
      filename = "plantilla_cursos.csv";
    } else {
      csv = `email,name,firstName,lastName,role
"estudiante@email.com","Juan Pérez","Juan","Pérez","STUDENT"
"mentor@email.com","María García","María","García","MENTOR"`;
      filename = "plantilla_usuarios.csv";
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Migración de Datos</h1>
        <p className="text-muted-foreground">
          Importa cursos y usuarios desde WordPress/Tutor LMS
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-500">
              Instrucciones para exportar desde WordPress
            </h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>
                Instala el plugin <strong>WP All Export</strong> en WordPress
              </li>
              <li>Ve a All Export → New Export</li>
              <li>
                Para cursos: selecciona post type "Courses" (Tutor LMS)
              </li>
              <li>Para usuarios: selecciona "Users" con rol "Cliente"</li>
              <li>Exporta en formato CSV con las columnas indicadas</li>
              <li>Descarga las plantillas de ejemplo abajo</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses Migration */}
        <div className="bg-card rounded-xl border">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Migrar Cursos</h2>
                <p className="text-sm text-muted-foreground">
                  Importa cursos con módulos y lecciones
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => downloadTemplate("courses")}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar plantilla CSV
            </Button>

            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e, "courses")}
                className="hidden"
                id="courses-file"
              />
              <label
                htmlFor="courses-file"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileSpreadsheet className="w-10 h-10 text-muted-foreground mb-2" />
                {coursesFile ? (
                  <span className="text-primary font-medium">
                    {coursesFile.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Seleccionar archivo CSV
                  </span>
                )}
              </label>
            </div>

            <Button
              className="w-full"
              disabled={!coursesFile || loading === "courses"}
              onClick={() => handleMigration("courses")}
            >
              {loading === "courses" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Migrando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Iniciar Migración de Cursos
                </>
              )}
            </Button>

            {results.courses && (
              <div
                className={`p-4 rounded-lg ${
                  results.courses.success
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {results.courses.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {results.courses.success ? "Éxito" : "Error"}
                  </span>
                </div>
                <p className="text-sm">{results.courses.message}</p>
                {results.courses.imported > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {results.courses.imported} cursos importados
                  </p>
                )}
                {results.courses.errors.length > 0 && (
                  <ul className="text-sm text-red-400 mt-2 space-y-1">
                    {results.courses.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Users Migration */}
        <div className="bg-card rounded-xl border">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Migrar Usuarios</h2>
                <p className="text-sm text-muted-foreground">
                  Importa usuarios con rol de estudiante
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => downloadTemplate("users")}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar plantilla CSV
            </Button>

            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e, "users")}
                className="hidden"
                id="users-file"
              />
              <label
                htmlFor="users-file"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileSpreadsheet className="w-10 h-10 text-muted-foreground mb-2" />
                {usersFile ? (
                  <span className="text-primary font-medium">
                    {usersFile.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Seleccionar archivo CSV
                  </span>
                )}
              </label>
            </div>

            <Button
              className="w-full"
              disabled={!usersFile || loading === "users"}
              onClick={() => handleMigration("users")}
            >
              {loading === "users" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Migrando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Iniciar Migración de Usuarios
                </>
              )}
            </Button>

            {results.users && (
              <div
                className={`p-4 rounded-lg ${
                  results.users.success
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {results.users.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {results.users.success ? "Éxito" : "Error"}
                  </span>
                </div>
                <p className="text-sm">{results.users.message}</p>
                {results.users.imported > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {results.users.imported} usuarios importados
                  </p>
                )}
                {results.users.errors.length > 0 && (
                  <ul className="text-sm text-red-400 mt-2 space-y-1">
                    {results.users.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Format Info */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="font-semibold mb-4">Formato del CSV de Cursos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Columna</th>
                <th className="text-left p-2">Descripción</th>
                <th className="text-left p-2">Requerido</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2 font-mono text-xs">title</td>
                <td className="p-2">Título del curso</td>
                <td className="p-2 text-green-500">Sí</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">slug</td>
                <td className="p-2">URL amigable (se genera si no existe)</td>
                <td className="p-2 text-muted-foreground">No</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">description</td>
                <td className="p-2">Descripción completa</td>
                <td className="p-2 text-muted-foreground">No</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">level</td>
                <td className="p-2">BEGINNER, INTERMEDIATE, ADVANCED</td>
                <td className="p-2 text-muted-foreground">No</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">category</td>
                <td className="p-2">MARKETING, CONTENT, AI, MINDSET, etc.</td>
                <td className="p-2 text-muted-foreground">No</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">module_title</td>
                <td className="p-2">Título del módulo/tema</td>
                <td className="p-2 text-green-500">Sí</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">lesson_title</td>
                <td className="p-2">Título de la lección</td>
                <td className="p-2 text-green-500">Sí</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">lesson_videoUrl</td>
                <td className="p-2">URL del video (YouTube, Vimeo, etc.)</td>
                <td className="p-2 text-muted-foreground">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
