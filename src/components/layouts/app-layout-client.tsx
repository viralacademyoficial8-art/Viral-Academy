"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarApp } from "@/components/navigation/sidebar-app";
import { TopbarApp } from "@/components/navigation/topbar-app";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SubscriptionGate } from "@/components/subscription/subscription-gate";
import { studentSidebarNav } from "@/config/navigation";

// Routes that require active subscription
const PROTECTED_ROUTES = [
  "/app/cursos",
  "/app/lives",
  "/app/replays",
  "/app/recursos",
  "/app/certificados",
  "/app/comunidad",
];

// Check if user has active subscription
function hasActiveSubscription(status: string | null | undefined): boolean {
  return status === "ACTIVE" || status === "TRIALING";
}

// Check if route is protected
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

// Get custom message based on route
function getGateMessage(pathname: string): { title: string; description: string } {
  if (pathname.startsWith("/app/cursos")) {
    return {
      title: "Cursos exclusivos para miembros",
      description: "Accede a todos nuestros cursos premium con tu membresía activa."
    };
  }
  if (pathname.startsWith("/app/lives")) {
    return {
      title: "Lives exclusivos para miembros",
      description: "Participa en sesiones en vivo con expertos con tu membresía activa."
    };
  }
  if (pathname.startsWith("/app/replays")) {
    return {
      title: "Replays exclusivos para miembros",
      description: "Accede a todas las grabaciones de sesiones anteriores con tu membresía."
    };
  }
  if (pathname.startsWith("/app/recursos")) {
    return {
      title: "Recursos exclusivos para miembros",
      description: "Descarga plantillas, guías y materiales exclusivos con tu membresía."
    };
  }
  if (pathname.startsWith("/app/certificados")) {
    return {
      title: "Certificados para miembros",
      description: "Obtén certificados al completar cursos con tu membresía activa."
    };
  }
  if (pathname.startsWith("/app/comunidad")) {
    return {
      title: "Comunidad exclusiva para miembros",
      description: "Únete a nuestra comunidad y conecta con otros estudiantes."
    };
  }
  return {
    title: "Contenido exclusivo para miembros",
    description: "Este contenido está disponible solo para miembros con suscripción activa."
  };
}

interface UserData {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  subscriptionStatus?: string | null;
  needsOnboarding?: boolean;
  role?: string | null;
}

interface AppLayoutClientProps {
  children: React.ReactNode;
  user?: UserData | null;
}

export function AppLayoutClient({ children, user }: AppLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Redirect to onboarding if needed (but not if already on onboarding page)
  React.useEffect(() => {
    if (user?.needsOnboarding && !pathname.includes("/onboarding")) {
      router.push("/app/onboarding");
    }
  }, [user?.needsOnboarding, pathname, router]);

  // If on onboarding page, render without sidebar/topbar
  if (pathname.includes("/onboarding")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarApp navigation={studentSidebarNav} user={user || undefined} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[260px]">
          <SidebarApp navigation={studentSidebarNav} user={user || undefined} isMobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={cn("lg:pl-[260px] transition-all duration-300")}>
        <TopbarApp onMenuClick={() => setMobileMenuOpen(true)} user={user || undefined} />
        <main className="p-4 md:p-6 lg:p-8">
          {/* Check if route is protected and user doesn't have active subscription */}
          {/* VIP and ADMIN roles bypass subscription check */}
          {isProtectedRoute(pathname) && !hasActiveSubscription(user?.subscriptionStatus) && user?.role !== "ADMIN" && user?.role !== "VIP" ? (
            <SubscriptionGate {...getGateMessage(pathname)} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
