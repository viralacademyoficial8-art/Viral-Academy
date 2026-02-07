"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, Sun, Moon, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { publicNavItems } from "@/config/navigation";
import { UserMenu } from "./user-menu";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

export function NavbarPublic() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="container-wide">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - switches based on theme */}
          <Link href="/" className="flex items-center">
            <Image
              src={mounted && theme === "dark" ? "/images/logo-dark.png" : "/images/logo.png"}
              alt="Viral Academy"
              width={280}
              height={75}
              className="h-16 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                )}
              >
                {item.title}
              </Link>
            ))}

            {/* Admin Panel Link - Only for admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5",
                  pathname.startsWith("/admin")
                    ? "text-red-400 bg-red-500/10"
                    : "text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Theme Toggle & CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Cambiar tema</span>
            </Button>

            {status === "loading" ? (
              <div className="h-9 w-24 rounded-lg bg-surface-2 animate-pulse" />
            ) : isLoggedIn ? (
              <>
                <NotificationDropdown />
                <UserMenu />
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Iniciar sesión</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/registro">Únete ahora</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile: Notifications, Theme Toggle & Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn && <NotificationDropdown />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <button
              className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg"
          >
            <div className="container-wide py-4 space-y-2">
              {publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  )}
                >
                  {item.title}
                </Link>
              ))}

              {/* Admin Panel Link - Mobile */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    pathname.startsWith("/admin")
                      ? "text-red-400 bg-red-500/10"
                      : "text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}

              <div className="pt-4 space-y-2 border-t border-border mt-4">
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-3">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "Avatar"}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-medium">
                          {session.user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/app/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        Mi Panel
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/app/perfil" onClick={() => setIsMobileMenuOpen(false)}>
                        Mi Perfil
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/auth/login">Iniciar sesión</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/auth/registro">Únete ahora</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
