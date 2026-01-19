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
  BookOpen,
  Video,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MigrationResult {
  success: boolean;
  message: string;
  imported: number;
  details?: {
    courses?: number;
    modules?: number;
    lessons?: number;
  };
  errors: string[];
}

export default function AdminMigracionPage() {
  // Tutor LMS files
  const [coursesFile, setCoursesFile] = useState<File | null>(null);
  const [topicsFile, setTopicsFile] = useState<File | null>(null);
  const [lessonsFile, setLessonsFile] = useState<File | null>(null);

  // Users file
  const [usersFile, setUsersFile] = useState<File | null>(null);

  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, MigrationResult>>({});

  const handleTutorLMSMigration = async () => {
    if (!coursesFile || !topicsFile || !lessonsFile) {
      alert("Debes subir los 3 archivos: Cursos, Topics y Lecciones");
      return;
    }

    setLoading("tutor");
    const formData = new FormData();
    formData.append("courses", coursesFile);
    formData.append("topics", topicsFile);
    formData.append("lessons", lessonsFile);

    try {
      const response = await fetch("/api/admin/migrate/tutor-lms", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setResults((prev) => ({ ...prev, tutor: result }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        tutor: {
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

  const handleUsersMigration = async () => {
    if (!usersFile) return;

    setLoading("users");
    const formData = new FormData();
    formData.append("file", usersFile);

    try {
      const response = await fetch("/api/admin/migrate/users", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setResults((prev) => ({ ...prev, users: result }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        users: {
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

  const FileUploadBox = ({
    id,
    file,
    setFile,
    icon: Icon,
    label,
    description,
  }: {
    id: string;
    file: File | null;
    setFile: (f: File | null) => void;
    icon: typeof GraduationCap;
    label: string;
    description: string;
  }) => (
    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="hidden"
        id={id}
      />
      <label htmlFor={id} className="cursor-pointer flex flex-col items-center gap-2">
        <div className={`p-3 rounded-lg ${file ? "bg-green-500/10" : "bg-muted"}`}>
          {file ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Icon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {file && (
          <span className="text-xs text-green-500 font-medium">{file.name}</span>
        )}
      </label>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Migración desde Tutor LMS</h1>
        <p className="text-muted-foreground">
          Importa cursos y usuarios desde WordPress/Tutor LMS
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-500">
              Paso a paso para exportar desde WordPress
            </h3>
            <div className="text-sm text-muted-foreground space-y-4">
              <div>
                <p className="font-medium text-foreground mb-1">1. Instala WP All Export Pro</p>
                <p>Ve a Plugins → Añadir nuevo → Busca "WP All Export" e instálalo</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">2. Exporta CURSOS</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Ve a All Export → New Export</li>
                  <li>Selecciona <strong>"Cursos"</strong></li>
                  <li>En campos, agrega: ID, Title, Slug (post_name), Content, Featured Image URL</li>
                  <li>Exporta como CSV</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">3. Exporta TOPICS (Módulos)</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Nueva exportación → Selecciona <strong>"Topics"</strong></li>
                  <li>Campos: ID, Title, Parent (post_parent), Menu Order</li>
                  <li>Exporta como CSV</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">4. Exporta LECCIONES</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Nueva exportación → Selecciona <strong>"Lecciones"</strong></li>
                  <li>Campos: ID, Title, Parent (post_parent), Menu Order, Content</li>
                  <li><strong>Importante:</strong> Agrega Custom Field → <code>_video</code> (contiene el URL de YouTube)</li>
                  <li>Exporta como CSV</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutor LMS Migration */}
      <div className="bg-card rounded-xl border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Migrar Cursos de Tutor LMS</h2>
              <p className="text-sm text-muted-foreground">
                Sube los 3 archivos CSV exportados de WordPress
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* File uploads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FileUploadBox
              id="courses-file"
              file={coursesFile}
              setFile={setCoursesFile}
              icon={BookOpen}
              label="1. Cursos"
              description="Export de 'Cursos'"
            />
            <FileUploadBox
              id="topics-file"
              file={topicsFile}
              setFile={setTopicsFile}
              icon={FolderTree}
              label="2. Topics (Módulos)"
              description="Export de 'Topics'"
            />
            <FileUploadBox
              id="lessons-file"
              file={lessonsFile}
              setFile={setLessonsFile}
              icon={Video}
              label="3. Lecciones"
              description="Export de 'Lecciones'"
            />
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className={coursesFile ? "text-green-500" : "text-muted-foreground"}>
              Cursos {coursesFile ? "✓" : "○"}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className={topicsFile ? "text-green-500" : "text-muted-foreground"}>
              Topics {topicsFile ? "✓" : "○"}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className={lessonsFile ? "text-green-500" : "text-muted-foreground"}>
              Lecciones {lessonsFile ? "✓" : "○"}
            </span>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!coursesFile || !topicsFile || !lessonsFile || loading === "tutor"}
            onClick={handleTutorLMSMigration}
          >
            {loading === "tutor" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Migrando cursos...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Iniciar Migración de Cursos
              </>
            )}
          </Button>

          {results.tutor && (
            <div
              className={`p-4 rounded-lg ${
                results.tutor.success
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {results.tutor.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {results.tutor.success ? "Migración completada" : "Error en migración"}
                </span>
              </div>
              <p className="text-sm">{results.tutor.message}</p>
              {results.tutor.details && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>• {results.tutor.details.courses} cursos</p>
                  <p>• {results.tutor.details.modules} módulos</p>
                  <p>• {results.tutor.details.lessons} lecciones</p>
                </div>
              )}
              {results.tutor.errors.length > 0 && (
                <ul className="text-sm text-red-400 mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {results.tutor.errors.map((err, i) => (
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
                Importa usuarios con rol Cliente de WordPress
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Para exportar usuarios:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>En WP All Export → New Export → Selecciona <strong>"Users"</strong></li>
              <li>Filtra por rol: <strong>"Cliente"</strong> o <strong>"Customer"</strong></li>
              <li>Campos: user_email, display_name, first_name, last_name</li>
              <li>Exporta como CSV</li>
            </ol>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setUsersFile(e.target.files?.[0] || null)}
              className="hidden"
              id="users-file"
            />
            <label
              htmlFor="users-file"
              className="cursor-pointer flex flex-col items-center"
            >
              <FileSpreadsheet className="w-10 h-10 text-muted-foreground mb-2" />
              {usersFile ? (
                <span className="text-primary font-medium">{usersFile.name}</span>
              ) : (
                <span className="text-muted-foreground">Seleccionar archivo CSV de usuarios</span>
              )}
            </label>
          </div>

          <Button
            className="w-full"
            disabled={!usersFile || loading === "users"}
            onClick={handleUsersMigration}
          >
            {loading === "users" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Migrando usuarios...
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

      {/* Column mapping reference */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="font-semibold mb-4">Referencia de columnas esperadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-medium text-primary mb-2">Cursos</p>
            <ul className="space-y-1 text-muted-foreground">
              <li><code>ID</code> - ID del curso</li>
              <li><code>Title</code> - Título</li>
              <li><code>Slug</code> - URL amigable</li>
              <li><code>Content</code> - Descripción</li>
              <li><code>Thumbnail</code> - Imagen</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-primary mb-2">Topics</p>
            <ul className="space-y-1 text-muted-foreground">
              <li><code>ID</code> - ID del topic</li>
              <li><code>Title</code> - Título del módulo</li>
              <li><code>Parent</code> - ID del curso padre</li>
              <li><code>Menu Order</code> - Orden</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-primary mb-2">Lecciones</p>
            <ul className="space-y-1 text-muted-foreground">
              <li><code>ID</code> - ID de lección</li>
              <li><code>Title</code> - Título</li>
              <li><code>Parent</code> - ID del topic padre</li>
              <li><code>Menu Order</code> - Orden</li>
              <li><code>_video</code> - URL de YouTube</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
