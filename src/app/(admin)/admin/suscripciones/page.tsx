import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CreditCard, TrendingUp, Users, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function AdminSuscripcionesPage() {
  let subscriptions: Awaited<ReturnType<typeof prisma.subscription.findMany>> = [];

  try {
    subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { displayName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error loading subscriptions:", error);
  }

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "ACTIVE");
  const canceledSubscriptions = subscriptions.filter((sub) => sub.status === "CANCELED");
  const trialSubscriptions = subscriptions.filter((sub) => sub.status === "TRIALING");

  const mrr = activeSubscriptions.length * siteConfig.pricing.monthly.price;

  const statusLabels: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    ACTIVE: { label: "Activa", color: "text-green-500 bg-green-500/10", icon: CheckCircle },
    CANCELED: { label: "Cancelada", color: "text-red-500 bg-red-500/10", icon: XCircle },
    TRIALING: { label: "Prueba", color: "text-yellow-500 bg-yellow-500/10", icon: Clock },
    PAST_DUE: { label: "Vencida", color: "text-orange-500 bg-orange-500/10", icon: Clock },
    INCOMPLETE: { label: "Incompleta", color: "text-gray-500 bg-gray-500/10", icon: Clock },
    UNPAID: { label: "Sin Pagar", color: "text-orange-500 bg-orange-500/10", icon: Clock },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Suscripciones</h1>
        <p className="text-muted-foreground">Gestiona las membresías y pagos recurrentes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{subscriptions.length}</p>
              <p className="text-sm text-muted-foreground">Total Suscripciones</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
              <p className="text-sm text-muted-foreground">Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-500/10">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{canceledSubscriptions.length}</p>
              <p className="text-sm text-muted-foreground">Canceladas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">${mrr.toLocaleString()} MXN</p>
              <p className="text-sm text-muted-foreground">MRR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-card rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Todas las Suscripciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">Usuario</th>
                <th className="text-left p-4 font-medium">Plan</th>
                <th className="text-left p-4 font-medium">Estado</th>
                <th className="text-left p-4 font-medium">Inicio</th>
                <th className="text-left p-4 font-medium">Próximo cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay suscripciones registradas</p>
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription) => {
                  const status = statusLabels[subscription.status] || statusLabels.INCOMPLETE;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={subscription.id} className="hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {subscription.user?.profile?.displayName?.[0]?.toUpperCase() ||
                              subscription.user?.email?.[0]?.toUpperCase() ||
                              "U"}
                          </div>
                          <div>
                            <p className="font-medium">
                              {subscription.user?.profile?.displayName || "Usuario"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {subscription.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">
                          ${siteConfig.pricing.monthly.price} MXN/mes
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {format(new Date(subscription.createdAt), "d MMM yyyy", { locale: es })}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {subscription.currentPeriodEnd
                          ? format(new Date(subscription.currentPeriodEnd), "d MMM yyyy", { locale: es })
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
