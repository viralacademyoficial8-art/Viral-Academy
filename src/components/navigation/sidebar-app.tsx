"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { studentSidebarNav, type NavSection } from "@/config/navigation";

interface UserData {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  subscriptionStatus?: string | null;
  role?: string | null;
}

interface SidebarAppProps {
  navigation?: NavSection[];
  user?: UserData;
  isMobile?: boolean;
}

export function SidebarApp({ navigation = studentSidebarNav, user, isMobile = false }: SidebarAppProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  const displayName = user?.name || user?.email?.split("@")[0] || "Usuario";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // For mobile, don't use collapsed state and don't use fixed positioning
  const isCollapsed = isMobile ? false : collapsed;

  return (
    <aside
      className={cn(
        "h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isMobile ? "w-full" : "fixed left-0 top-0 z-40",
        !isMobile && (isCollapsed ? "w-[70px]" : "w-[260px]")
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/app/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-hover shadow-lg shadow-primary/25 flex-shrink-0">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-lg whitespace-nowrap"
              >
                Viral<span className="text-primary">Academy</span>
              </motion.span>
            )}
          </Link>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hidden lg:flex"
              onClick={() => setCollapsed(!collapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-6 px-3">
            {navigation.map((section, index) => (
              <div key={index}>
                {section.title && !collapsed && (
                  <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                    {section.title}
                  </h4>
                )}
                {section.title && isCollapsed && (
                  <Separator className="my-2" />
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                          isCollapsed && "justify-center px-2"
                        )}
                      >
                        {Icon && (
                          <Icon
                            className={cn(
                              "h-5 w-5 flex-shrink-0",
                              isActive && "text-primary"
                            )}
                          />
                        )}
                        {!collapsed && <span>{item.title}</span>}
                        {item.badge && !collapsed && (
                          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Admin Link for Admins */}
        {user?.role === "ADMIN" && (
          <div className="border-t border-sidebar-border p-4">
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                "bg-gradient-to-r from-primary/10 to-primary/5 text-primary hover:from-primary/20 hover:to-primary/10",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Shield className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Panel Admin</span>}
            </Link>
          </div>
        )}

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4 space-y-2">
          <Link
            href="/app/perfil"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-sidebar-accent/50 transition-colors",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Avatar className="h-9 w-9 flex-shrink-0">
              {user?.image && <AvatarImage src={user.image} alt={displayName} />}
              <AvatarFallback className="text-sm">{initials}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role === "ADMIN"
                    ? "Administrador"
                    : user?.subscriptionStatus === "ACTIVE"
                      ? "Membresía activa"
                      : "Sin membresía"}
                </p>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              "w-full text-muted-foreground hover:text-foreground",
              isCollapsed && "px-2"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Cerrar sesión</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
