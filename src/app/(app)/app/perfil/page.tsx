import { redirect } from "next/navigation";
import { User, Mail, Calendar, Award, BookOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserById, getUserStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const [user, stats] = await Promise.all([
    getUserById(session.user.id),
    getUserStats(session.user.id),
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  const subscriptionStatus = user.subscription?.status;
  const isActive = subscriptionStatus === "ACTIVE";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Mi Perfil</h1>
        <Button variant="outline" asChild>
          <Link href="/app/perfil/editar">
            <Settings className="w-4 h-4 mr-2" />
            Editar perfil
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                {user.profile?.avatar && (
                  <AvatarImage src={user.profile.avatar} alt={user.profile.displayName || ""} />
                )}
                <AvatarFallback className="text-2xl">
                  {user.profile?.displayName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {user.profile?.displayName || user.email}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Membresía Activa" : "Sin membresía"}
              </Badge>
              {user.profile?.bio && (
                <p className="text-sm text-muted-foreground">{user.profile.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{stats.coursesInProgress}</p>
                <p className="text-xs text-muted-foreground">Cursos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="w-8 h-8 mx-auto text-accent mb-2" />
                <p className="text-2xl font-bold">{stats.certificates}</p>
                <p className="text-xs text-muted-foreground">Certificados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-8 h-8 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                  <span className="text-green-500 font-bold">{stats.completedLessons}</span>
                </div>
                <p className="text-2xl font-bold">{stats.completedLessons}</p>
                <p className="text-xs text-muted-foreground">Lecciones</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-8 h-8 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                  <span className="text-blue-500 font-bold text-sm">{stats.overallProgress}%</span>
                </div>
                <p className="text-2xl font-bold">{stats.overallProgress}%</p>
                <p className="text-xs text-muted-foreground">Progreso</p>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progreso General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completado</span>
                  <span className="font-medium">{stats.overallProgress}%</span>
                </div>
                <Progress value={stats.overallProgress} />
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de la cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Rol</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user.role.toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Miembro desde</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {user.subscription?.currentPeriodEnd && (
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Membresía válida hasta</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.subscription.currentPeriodEnd).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
