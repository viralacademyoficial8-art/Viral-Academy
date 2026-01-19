"use client";

import Link from "next/link";
import {
  Users,
  CreditCard,
  GraduationCap,
  Video,
  TrendingUp,
  UserPlus,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminDashboardClientProps {
  stats: {
    totalUsers: number;
    activeSubscriptions: number;
    totalCourses: number;
    totalLives: number;
    mrr: number;
    newUsersThisMonth: number;
    newSubscriptionsThisMonth: number;
    recentUsers: Array<{
      id: string;
      email: string;
      name: string;
      createdAt: string;
      hasSubscription: boolean;
    }>;
    recentSubscriptions: Array<{
      id: string;
      userId: string;
      userName: string;
      userEmail: string;
      createdAt: string;
      status: string;
    }>;
  };
}

export function AdminDashboardClient({ stats }: AdminDashboardClientProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general de Viral Academy
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Totales
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Suscripciones Activas
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newSubscriptionsThisMonth} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.mrr)}</div>
            <p className="text-xs text-muted-foreground">
              Ingresos recurrentes mensuales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenido</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCourses} cursos
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLives} lives programados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Usuarios Recientes</CardTitle>
                <CardDescription>Últimos registros</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/usuarios">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={user.hasSubscription ? "default" : "secondary"}
                    >
                      {user.hasSubscription ? "Activo" : "Free"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))}

              {stats.recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay usuarios recientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Subscriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Suscripciones Recientes</CardTitle>
                <CardDescription>Últimas conversiones</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/suscripciones">
                  Ver todas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{sub.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.userEmail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      +$597 MXN
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(sub.createdAt)}
                    </p>
                  </div>
                </div>
              ))}

              {stats.recentSubscriptions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay suscripciones recientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/admin/cursos/nuevo">
                <div className="text-center">
                  <GraduationCap className="h-6 w-6 mx-auto mb-2" />
                  <span>Crear Curso</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/admin/lives/nuevo">
                <div className="text-center">
                  <Video className="h-6 w-6 mx-auto mb-2" />
                  <span>Programar Live</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/admin/recursos/nuevo">
                <div className="text-center">
                  <GraduationCap className="h-6 w-6 mx-auto mb-2" />
                  <span>Subir Recurso</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/admin/usuarios">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <span>Ver Usuarios</span>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
