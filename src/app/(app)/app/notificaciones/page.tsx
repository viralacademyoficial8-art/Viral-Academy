import { Bell, BookOpen, Video, MessageCircle, Award, CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// TODO: Get user notifications when auth is ready
// import { getUserNotifications } from "@/lib/data";

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  SYSTEM: <Bell className="w-5 h-5" />,
  COURSE: <BookOpen className="w-5 h-5" />,
  LIVE: <Video className="w-5 h-5" />,
  COMMUNITY: <MessageCircle className="w-5 h-5" />,
  CERTIFICATE: <Award className="w-5 h-5" />,
  BILLING: <CreditCard className="w-5 h-5" />,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  SYSTEM: "bg-blue-500/10 text-blue-500",
  COURSE: "bg-primary/10 text-primary",
  LIVE: "bg-green-500/10 text-green-500",
  COMMUNITY: "bg-purple-500/10 text-purple-500",
  CERTIFICATE: "bg-accent/10 text-accent",
  BILLING: "bg-yellow-500/10 text-yellow-500",
};

export default async function NotificacionesPage() {
  // Mock data until auth is ready
  const notifications: {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: string;
  }[] = [
    {
      id: "1",
      type: "LIVE",
      title: "Lunes Sublimes en 1 hora",
      message: "La sesión de mentalidad con Susy Ponce comienza pronto.",
      link: "/app/lives",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "2",
      type: "COURSE",
      title: "Nuevo módulo disponible",
      message: "Se ha añadido el módulo 'Google Ads Avanzado' al curso de Marketing Digital.",
      link: "/app/cursos/marketing-digital-desde-cero",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "3",
      type: "COMMUNITY",
      title: "Respuesta a tu pregunta",
      message: "Leonardo respondió a tu publicación en la comunidad.",
      link: "/app/comunidad",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? "es" : ""} sin leer`
              : "Estás al día"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No tienes notificaciones.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.SYSTEM;
            const color = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.SYSTEM;
            const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: es,
            });

            return (
              <Card
                key={notification.id}
                className={`transition-colors ${
                  !notification.read ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <Badge variant="default" className="flex-shrink-0">
                            Nueva
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
