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
  Info,
  Database,
  Zap,
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
  // Simplified migration (1 file for all Tutor LMS)
  const [tutorFile, setTutorFile] = useState<File | null>(null);

  // Users file
  const [usersFile, setUsersFile] = useState<File | null>(null);

  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, MigrationResult>>({});

  const handleSimpleMigration = async () => {
    if (!tutorFile) {
      alert("Debes subir el archivo CSV de Tutor LMS");
      return;
    }

    setLoading("tutor");
    const formData = new FormData();
    formData.append("file", tutorFile);

    try {
      const response = await fetch("/api/admin/migrate/tutor-lms-simple", {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Migración desde WordPress</h1>
        <p className="text-muted-foreground">
          Importa cursos y usuarios desde WordPress/Tutor LMS usando phpMyAdmin
        </p>
      </div>

      {/* SQL Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Database className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-4 w-full">
            <h3 className="font-semibold text-blue-500">
              Queries SQL para phpMyAdmin
            </h3>

            <div className="space-y-4 text-sm">
              <div className="bg-black/20 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Query 1: TODO TUTOR LMS (cursos + módulos + lecciones)
                </p>
                <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
{`SELECT
    c.ID as curso_id,
    c.post_title as curso_titulo,
    c.post_name as curso_slug,
    c.post_content as curso_descripcion,
    (SELECT guid FROM wp_posts WHERE ID = (SELECT meta_value FROM wp_postmeta WHERE post_id = c.ID AND meta_key = '_thumbnail_id' LIMIT 1)) as curso_imagen,
    t.ID as modulo_id,
    t.post_title as modulo_titulo,
    t.menu_order as modulo_orden,
    l.ID as leccion_id,
    l.post_title as leccion_titulo,
    l.menu_order as leccion_orden,
    l.post_content as leccion_contenido,
    (SELECT meta_value FROM wp_postmeta WHERE post_id = l.ID AND meta_key = '_video' LIMIT 1) as video_url
FROM wp_posts c
LEFT JOIN wp_posts t ON t.post_parent = c.ID AND t.post_type = 'topics' AND t.post_status = 'publish'
LEFT JOIN wp_posts l ON l.post_parent = t.ID AND l.post_type = 'lesson' AND l.post_status = 'publish'
WHERE c.post_type = 'courses'
AND c.post_status = 'publish'
ORDER BY c.ID, t.menu_order, l.menu_order;`}
                </pre>
                <p className="text-xs text-muted-foreground mt-2">
                  Exportar como: <strong>tutor_lms_completo.csv</strong>
                </p>
              </div>

              <div className="bg-black/20 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  Query 2: USUARIOS (Cliente + Suscriptor)
                </p>
                <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
{`SELECT
    u.ID,
    u.user_email as email,
    um_first.meta_value as firstName,
    um_last.meta_value as lastName,
    u.display_name as name,
    'STUDENT' as role
FROM wp_users u
INNER JOIN wp_usermeta um_role ON u.ID = um_role.user_id
    AND um_role.meta_key = 'wp_capabilities'
LEFT JOIN wp_usermeta um_first ON u.ID = um_first.user_id
    AND um_first.meta_key = 'first_name'
LEFT JOIN wp_usermeta um_last ON u.ID = um_last.user_id
    AND um_last.meta_key = 'last_name'
WHERE um_role.meta_value LIKE '%customer%'
  AND um_role.meta_value LIKE '%subscriber%';`}
                </pre>
                <p className="text-xs text-muted-foreground mt-2">
                  Exportar como: <strong>usuarios.csv</strong>
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-xs">
                  <strong>Pasos en phpMyAdmin:</strong> Click en tu base de datos → Pestaña "SQL" → Pegar query → "Continuar" → "Exportar" → Formato CSV → "Continuar"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutor LMS Migration - Simplified */}
      <div className="bg-card rounded-xl border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Migrar Cursos de Tutor LMS</h2>
              <p className="text-sm text-muted-foreground">
                Un solo archivo con todos los cursos, módulos y lecciones
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setTutorFile(e.target.files?.[0] || null)}
              className="hidden"
              id="tutor-file"
            />
            <label htmlFor="tutor-file" className="cursor-pointer flex flex-col items-center gap-3">
              <div className={`p-4 rounded-lg ${tutorFile ? "bg-green-500/10" : "bg-muted"}`}>
                {tutorFile ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">tutor_lms_completo.csv</p>
                <p className="text-sm text-muted-foreground">
                  Archivo exportado con Query 1
                </p>
              </div>
              {tutorFile && (
                <span className="text-sm text-green-500 font-medium">{tutorFile.name}</span>
              )}
            </label>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!tutorFile || loading === "tutor"}
            onClick={handleSimpleMigration}
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
            <div className="p-3 rounded-lg bg-green-500/10">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Migrar Usuarios</h2>
              <p className="text-sm text-muted-foreground">
                Importa usuarios con rol Cliente + Suscriptor
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-green-500/50 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setUsersFile(e.target.files?.[0] || null)}
              className="hidden"
              id="users-file"
            />
            <label
              htmlFor="users-file"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className={`p-4 rounded-lg ${usersFile ? "bg-green-500/10" : "bg-muted"}`}>
                {usersFile ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">usuarios.csv</p>
                <p className="text-sm text-muted-foreground">
                  Archivo exportado con Query 2
                </p>
              </div>
              {usersFile && (
                <span className="text-sm text-green-500 font-medium">{usersFile.name}</span>
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
                <ul className="text-sm text-red-400 mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {results.users.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                  {results.users.errors.length > 10 && (
                    <li>... y {results.users.errors.length - 10} errores más</li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reference */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="font-semibold mb-4">Resumen del proceso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="font-medium text-primary">1. En phpMyAdmin (Hostinger)</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Click en tu base de datos</li>
              <li>• Ve a la pestaña "SQL"</li>
              <li>• Pega la Query 1, ejecuta y exporta como CSV</li>
              <li>• Pega la Query 2, ejecuta y exporta como CSV</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-primary">2. En esta página</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Sube tutor_lms_completo.csv arriba</li>
              <li>• Click en "Iniciar Migración de Cursos"</li>
              <li>• Sube usuarios.csv</li>
              <li>• Click en "Iniciar Migración de Usuarios"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
