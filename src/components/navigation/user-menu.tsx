"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  Shield,
  GraduationCap,
  Users,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  VIP: "Acceso VIP",
  MENTOR: "Mentor",
  STUDENT: "Estudiante",
};

const roleBadgeColors: Record<string, string> = {
  ADMIN: "bg-red-500/20 text-red-400",
  VIP: "bg-amber-500/20 text-amber-400",
  MENTOR: "bg-blue-500/20 text-blue-400",
  STUDENT: "bg-primary/20 text-primary",
};

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-9 w-9 rounded-full bg-surface-2 animate-pulse" />
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const role = user.role || "STUDENT";
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 hover:bg-surface-2"
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "Avatar"}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
              {initials}
            </div>
          )}
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium">{user.name || user.email}</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
              roleBadgeColors[role]
            )}>
              {roleLabels[role]}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name || "Usuario"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Dashboard link based on role */}
        <DropdownMenuItem asChild>
          <Link href="/app/dashboard" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Mi Panel
          </Link>
        </DropdownMenuItem>

        {/* Admin Panel - Only for ADMIN role */}
        {role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer text-red-400">
              <Shield className="mr-2 h-4 w-4" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}

        {/* Mentor options */}
        {(role === "MENTOR" || role === "ADMIN") && (
          <DropdownMenuItem asChild>
            <Link href="/app/lives" className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              Mis Lives
            </Link>
          </DropdownMenuItem>
        )}

        {/* Student/Common options */}
        <DropdownMenuItem asChild>
          <Link href="/app/cursos" className="cursor-pointer">
            <GraduationCap className="mr-2 h-4 w-4" />
            Mis Cursos
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/app/perfil" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Mi Perfil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/app/membresia" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Membresía
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-red-400 focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
