"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EditProfileClientProps {
  initialData: {
    firstName: string;
    lastName: string;
    displayName: string;
    bio: string;
    avatar: string;
    email: string;
  };
}

export function EditProfileClient({ initialData }: EditProfileClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    displayName: initialData.displayName,
    bio: initialData.bio,
    avatar: initialData.avatar,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/app/perfil");
          router.refresh();
        }, 1000);
      } else {
        setError("Error al guardar los cambios");
      }
    } catch (err) {
      setError("Error al guardar los cambios");
    } finally {
      setIsLoading(false);
    }
  };

  const displayNamePreview =
    formData.displayName ||
    `${formData.firstName} ${formData.lastName}`.trim() ||
    initialData.email.split("@")[0];

  const initials = displayNamePreview
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/perfil">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
          <p className="text-muted-foreground">Actualiza tu información personal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Foto de perfil</CardTitle>
            <CardDescription>Tu foto se mostrará en tu perfil y comentarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                {formData.avatar && <AvatarImage src={formData.avatar} alt={displayNamePreview} />}
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatar">URL de la imagen</Label>
                <Input
                  id="avatar"
                  type="url"
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Pega la URL de una imagen de tu perfil
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informacion personal</CardTitle>
            <CardDescription>Esta informacion sera visible en tu perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre a mostrar</Label>
              <Input
                id="displayName"
                placeholder={`${formData.firstName} ${formData.lastName}`.trim() || "Tu nombre publico"}
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Este es el nombre que veran otros usuarios. Si lo dejas vacio, se usara tu nombre completo.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                placeholder="Cuentanos un poco sobre ti..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Maximo 500 caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email (read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cuenta</CardTitle>
            <CardDescription>Informacion de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={initialData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/app/perfil">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
            Perfil actualizado correctamente. Redirigiendo...
          </div>
        )}
      </form>
    </div>
  );
}
