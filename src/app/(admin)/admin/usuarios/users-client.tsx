"use client";

import * as React from "react";
import { Search, Filter, MoreHorizontal, Mail, UserCog } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  subscriptionStatus: string | null;
  subscriptionEnd: string | null;
  enrollmentsCount: number;
  certificatesCount: number;
}

interface UsersClientProps {
  users: User[];
}

export function UsersClient({ users }: UsersClientProps) {
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string | null>(null);
  const [subscriptionFilter, setSubscriptionFilter] = React.useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona los usuarios de la plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Usuarios</CardDescription>
            <CardTitle className="text-2xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Con Suscripción Activa</CardDescription>
            <CardTitle className="text-2xl">
              {users.filter((u) => u.subscriptionStatus === "ACTIVE").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mentores</CardDescription>
            <CardTitle className="text-2xl">
              {users.filter((u) => u.role === "MENTOR").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Administradores</CardDescription>
            <CardTitle className="text-2xl">
              {users.filter((u) => u.role === "ADMIN").length}
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
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          {user.name || "Sin nombre"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {getRoleBadge(user.role)}
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
                          <Button variant="ghost" size="icon">
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
