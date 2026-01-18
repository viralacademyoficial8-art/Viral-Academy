import { redirect } from "next/navigation";
import { Bell, BookOpen, Video, MessageCircle, Award, CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { auth } from "@/lib/auth";
import { getUserNotifications } from "@/lib/data";

export const dynamic = "force-dynamic";

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
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const notifications = await getUserNotifications(session.user.id, 50);
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
