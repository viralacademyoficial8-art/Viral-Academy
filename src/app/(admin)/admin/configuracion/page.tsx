import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Settings, Globe, CreditCard, Bell, Shield, Database, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracionPage() {
  let user = null;
  let userCount = 0;
  let courseCount = 0;
  let subscriptionCount = 0;

  try {
    const session = await auth();

    user = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: { displayName: true },
        },
      },
    });

    // Get some system stats
    [userCount, courseCount, subscriptionCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
    ]);
  } catch (error) {
    console.error("Error loading config page:", error);
  }

  const configSections = [
    {
      title: "Sitio Web",
      icon: Globe,
      items: [
        { label: "Nombre del sitio", value: siteConfig.name },
        { label: "URL", value: siteConfig.url },
        { label: "Descripción", value: siteConfig.description.slice(0, 50) + "..." },
      ],
    },
    {
      title: "Precios",
      icon: CreditCard,
      items: [
        { label: "Plan Mensual", value: `$${siteConfig.pricing.monthly.price} ${siteConfig.pricing.monthly.currency}` },
        { label: "Plan Anual", value: `$${siteConfig.pricing.yearly.price} ${siteConfig.pricing.yearly.currency}` },
        { label: "Moneda", value: siteConfig.pricing.monthly.currency },
      ],
    },
    {
      title: "Redes Sociales",
      icon: Mail,
      items: [
        { label: "WhatsApp", value: siteConfig.links.whatsapp.replace("https://wa.me/", "") },
        { label: "Instagram", value: siteConfig.links.instagram.replace("https://instagram.com/", "@") },
        { label: "YouTube", value: siteConfig.links.youtube.replace("https://youtube.com/", "") },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Ajustes generales de la plataforma</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userCount}</p>
              <p className="text-sm text-muted-foreground">Usuarios en DB</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{courseCount}</p>
              <p className="text-sm text-muted-foreground">Cursos en DB</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <CreditCard className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{subscriptionCount}</p>
              <p className="text-sm text-muted-foreground">Suscripciones Activas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Config Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configSections.map((section) => (
          <div key={section.title} className="bg-card rounded-xl border">
            <div className="p-4 border-b flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <section.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <h2 className="font-semibold">{section.title}</h2>
            </div>
            <div className="p-4 space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium truncate max-w-[60%] text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Info */}
      <div className="bg-card rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Información del Administrador</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {user?.profile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-xl font-semibold">{user?.profile?.displayName || "Administrador"}</p>
              <p className="text-muted-foreground">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                <Shield className="w-3.5 h-3.5" />
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="bg-card rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Información del Sistema</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Entorno</span>
            <span className="font-mono text-sm">{process.env.NODE_ENV}</span>
          </div>
          <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Stripe</span>
            <span className="font-mono text-sm">
              {process.env.STRIPE_SECRET_KEY ? "Configurado ✓" : "No configurado"}
            </span>
          </div>
          <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Base de Datos</span>
            <span className="font-mono text-sm">PostgreSQL (Supabase)</span>
          </div>
          <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Auth</span>
            <span className="font-mono text-sm">NextAuth v5</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Para modificar la configuración, edita el archivo <code className="bg-muted px-1.5 py-0.5 rounded">src/config/site.ts</code>
      </p>
    </div>
  );
}
