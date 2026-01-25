"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarApp } from "@/components/navigation/sidebar-app";
import { TopbarApp } from "@/components/navigation/topbar-app";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { studentSidebarNav } from "@/config/navigation";

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
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
