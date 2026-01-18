"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { studentSidebarNav, type NavSection } from "@/config/navigation";

interface SidebarAppProps {
  navigation?: NavSection[];
}

export function SidebarApp({ navigation = studentSidebarNav }: SidebarAppProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/app/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-hover shadow-lg shadow-primary/25 flex-shrink-0">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-lg whitespace-nowrap"
              >
                Viral<span className="text-primary">Academy</span>
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
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
                {section.title && collapsed && (
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
                          collapsed && "justify-center px-2"
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

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          <Link
            href="/app/perfil"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-sidebar-accent/50 transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium flex-shrink-0">
              VA
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Usuario Demo</p>
                <p className="text-xs text-muted-foreground truncate">
                  Membresía activa
                </p>
              </div>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}
