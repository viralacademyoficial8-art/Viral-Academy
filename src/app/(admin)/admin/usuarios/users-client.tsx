"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Filter, MoreHorizontal, Mail, UserCog, Shield, ShieldOff, Users, GraduationCap, Crown, Loader2, Calendar, BookOpen, Award, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

  // Modal states
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [profileModalOpen, setProfileModalOpen] = React.useState(false);
  const [emailModalOpen, setEmailModalOpen] = React.useState(false);
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailMessage, setEmailMessage] = React.useState("");
  const [sendingEmail, setSendingEmail] = React.useState(false);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

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
      case "VIP":
        return <Badge className="bg-amber-500 hover:bg-amber-500">VIP</Badge>;
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

      const data = await res.json();

      if (res.ok) {
        toast.success("Rol actualizado correctamente");
        router.refresh();
      } else {
        toast.error(data.error || "Error al cambiar el rol");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error de conexión al servidor");
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

      const data = await res.json();

      if (res.ok) {
        toast.success(currentActive ? "Cuenta desactivada" : "Cuenta activada");
        router.refresh();
      } else {
        toast.error(data.error || "Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error toggling active:", error);
      toast.error("Error de conexión al servidor");
    } finally {
      setLoading(null);
    }
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setProfileModalOpen(true);
  };

  const handleOpenEmailModal = (user: User) => {
    setSelectedUser(user);
    setEmailSubject("");
    setEmailMessage("");
    setEmailModalOpen(true);
  };

  const handleSendEmail = async () => {
    if (!selectedUser || !emailSubject.trim() || !emailMessage.trim()) return;

    setSendingEmail(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      if (res.ok) {
        toast.success("Email enviado correctamente");
        setEmailModalOpen(false);
        setEmailSubject("");
        setEmailMessage("");
        setSelectedUser(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al enviar el email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Error de conexión al servidor");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setDeleteConfirmation("");
    setDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const expectedConfirmation = selectedUser.email;
    if (deleteConfirmation !== expectedConfirmation) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Usuario eliminado correctamente");
        setDeleteModalOpen(false);
        setDeleteConfirmation("");
        setSelectedUser(null);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al eliminar el usuario");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error de conexión al servidor");
    } finally {
      setDeleting(false);
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
                          <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                            <UserCog className="h-4 w-4 mr-2" />
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEmailModal(user)}>
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
                                onClick={() => handleRoleChange(user.id, "VIP")}
                                disabled={user.role === "VIP"}
                              >
                                VIP (Acceso gratuito)
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
                            onSelect={() => handleToggleActive(user.id, user.active)}
                            className={user.active ? "text-orange-600 focus:text-orange-600" : "text-green-600 focus:text-green-600"}
                            disabled={loading === user.id}
                          >
                            {loading === user.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Procesando...
                              </>
                            ) : user.active ? (
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
                          <DropdownMenuItem
                            onSelect={() => handleOpenDeleteModal(user)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar cuenta
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

      {/* Profile Modal */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil de Usuario</DialogTitle>
            <DialogDescription>
              Información detallada del usuario
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-medium">
                  {selectedUser.name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.name || "Sin nombre"}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Rol</p>
                  <div>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  {selectedUser.active ? (
                    <Badge className="bg-green-500">Activo</Badge>
                  ) : (
                    <Badge variant="destructive">Inactivo</Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Suscripción</p>
                  <div>{getSubscriptionBadge(selectedUser.subscriptionStatus)}</div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Registro
                  </p>
                  <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{selectedUser.enrollmentsCount}</p>
                      <p className="text-xs text-muted-foreground">Cursos inscritos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{selectedUser.certificatesCount}</p>
                      <p className="text-xs text-muted-foreground">Certificados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar Email</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>Enviar un correo a <strong>{selectedUser.name || selectedUser.email}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Asunto</Label>
              <Input
                id="email-subject"
                placeholder="Asunto del correo"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Mensaje</Label>
              <Textarea
                id="email-message"
                placeholder="Escribe tu mensaje aquí..."
                rows={6}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)} disabled={sendingEmail}>
              Cancelar
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendingEmail || !emailSubject.trim() || !emailMessage.trim()}
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Eliminar cuenta permanentemente
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la cuenta y todos sus datos asociados.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm font-medium">Usuario a eliminar:</p>
                <p className="text-sm text-muted-foreground">{selectedUser.name || "Sin nombre"}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {selectedUser.id}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delete-confirmation">
                  Para confirmar, escribe el email del usuario: <strong className="text-red-600">{selectedUser.email}</strong>
                </Label>
                <Input
                  id="delete-confirmation"
                  placeholder="Escribe el email para confirmar"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="border-red-500/50 focus:border-red-500"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleting || deleteConfirmation !== selectedUser?.email}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar permanentemente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
