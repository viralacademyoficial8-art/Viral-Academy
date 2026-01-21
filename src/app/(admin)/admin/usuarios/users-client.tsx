"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, MoreHorizontal, Mail, UserCog, Shield, ShieldOff, Users, GraduationCap, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  active: boolean;
  createdAt: string;
  subscriptionStatus: string | null;
  subscriptionEnd: string | null;
  enrollmentsCount: number;
  certificatesCount: number;
}

interface Stats {
  total: number;
  admins: number;
  mentors: number;
  students: number;
  withSubscription: number;
}

interface UsersClientProps {
  users: User[];
  stats: Stats;
}

export function UsersClient({ users, stats }: UsersClientProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string | null>(null);
  const [subscriptionFilter, setSubscriptionFilter] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<string | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.name?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesSubscription =
      !subscriptionFilter ||
      (subscriptionFilter === "active" && user.subscriptionStatus === "ACTIVE") ||
      (subscriptionFilter === "inactive" && user.subscriptionStatus !== "ACTIVE");

    return matchesSearch && matchesRole && matchesSubscription;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="destructive">Admin</Badge>;
      case "MENTOR":
        return <Badge variant="default">Mentor</Badge>;
      default:
        return <Badge variant="secondary">Estudiante</Badge>;
    }
  };

  const getSubscriptionBadge = (status: string | null) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Activa</Badge>;
      case "PAST_DUE":
        return <Badge variant="destructive">Pago pendiente</Badge>;
      case "CANCELED":
        return <Badge variant="secondary">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Sin suscripción</Badge>;
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    setLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error toggling active:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona los usuarios de la plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Usuarios</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Con Suscripción</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.withSubscription}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Estudiantes</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              {stats.students}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mentores</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              {stats.mentors}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Administradores</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              {stats.admins}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Rol
                    {roleFilter && `: ${roleFilter}`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setRoleFilter(null)}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("STUDENT")}>
                    Estudiantes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("MENTOR")}>
                    Mentores
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("ADMIN")}>
                    Admins
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Suscripción
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter(null)}>
                    Todas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter("active")}>
                    Activas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter("inactive")}>
                    Sin suscripción
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left text-sm font-medium">
                    Usuario
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-medium hidden md:table-cell">
                    Rol
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-medium hidden md:table-cell">
                    Estado
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-medium hidden lg:table-cell">
                    Suscripción
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-medium hidden lg:table-cell">
                    Registro
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-medium hidden xl:table-cell">
                    Cursos
                  </th>
                  <th className="h-10 px-4 text-right text-sm font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`border-b hover:bg-muted/50 ${!user.active ? "opacity-50" : ""}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.name || "Sin nombre"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {user.active ? (
                        <Badge className="bg-green-500">Activo</Badge>
                      ) : (
                        <Badge variant="destructive">Inactivo</Badge>
                      )}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {getSubscriptionBadge(user.subscriptionStatus)}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-4 hidden xl:table-cell text-sm">
                      {user.enrollmentsCount} inscritos
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={loading === user.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <UserCog className="h-4 w-4 mr-2" />
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Shield className="h-4 w-4 mr-2" />
                              Cambiar rol
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user.id, "STUDENT")}
                                disabled={user.role === "STUDENT"}
                              >
                                Estudiante
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user.id, "MENTOR")}
                                disabled={user.role === "MENTOR"}
                              >
                                Mentor
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(user.id, "ADMIN")}
                                disabled={user.role === "ADMIN"}
                              >
                                Administrador
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(user.id, user.active)}
                            className={user.active ? "text-red-600" : "text-green-600"}
                          >
                            {user.active ? (
                              <>
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Desactivar cuenta
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4 mr-2" />
                                Activar cuenta
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No se encontraron usuarios
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
