"use client";

import * as React from "react";
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
}

interface AppLayoutClientProps {
  children: React.ReactNode;
  user?: UserData | null;
}

export function AppLayoutClient({ children, user }: AppLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarApp navigation={studentSidebarNav} user={user || undefined} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[260px]">
          <SidebarApp navigation={studentSidebarNav} user={user || undefined} />
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
