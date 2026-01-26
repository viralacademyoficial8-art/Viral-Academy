import {
  Home,
  BookOpen,
  Users,
  CreditCard,
  Calendar,
  HelpCircle,
  Mail,
  LayoutDashboard,
  GraduationCap,
  Video,
  Play,
  Award,
  MessageSquare,
  FolderOpen,
  User,
  Bell,
  Search,
  Settings,
  BarChart3,
  UserCog,
  FileText,
  Shield,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
  disabled?: boolean;
  external?: boolean;
  badge?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

// Navegación pública (marketing site)
export const publicNavItems: NavItem[] = [
  { title: "Inicio", href: "/" },
  { title: "Viral Academy", href: "/viral-academy" },
  { title: "Mentores", href: "/mentores" },
  { title: "Cursos", href: "/cursos" },
  { title: "Membresía", href: "/membresia" },
  { title: "Eventos", href: "/eventos" },
  { title: "FAQ", href: "/faq" },
];

// Footer links
export const footerLinks = {
  producto: [
    { title: "Cursos", href: "/cursos" },
    { title: "Membresía", href: "/membresia" },
    { title: "Eventos", href: "/eventos" },
    { title: "Mentores", href: "/mentores" },
  ],
  recursos: [
    { title: "FAQ", href: "/faq" },
    { title: "Contacto", href: "/contacto" },
    { title: "Blog", href: "/blog" },
  ],
  legal: [
    { title: "Términos y Condiciones", href: "/legal/terminos" },
    { title: "Política de Privacidad", href: "/legal/privacidad" },
  ],
};

// Sidebar del alumno (Student)
export const studentSidebarNav: NavSection[] = [
  {
    items: [
      { title: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Aprendizaje",
    items: [
      { title: "Cursos", href: "/app/cursos", icon: GraduationCap },
      { title: "Lives", href: "/app/lives", icon: Video },
      { title: "Replays", href: "/app/replays", icon: Play },
      { title: "Recursos", href: "/app/recursos", icon: FolderOpen },
      { title: "Certificados", href: "/app/certificados", icon: Award },
    ],
  },
  {
    title: "Comunidad",
    items: [
      { title: "Foro", href: "/app/comunidad", icon: MessageSquare },
    ],
  },
  {
    title: "Cuenta",
    items: [
      { title: "Perfil", href: "/app/perfil", icon: User },
      { title: "Membresía", href: "/app/membresia", icon: CreditCard },
    ],
  },
];

// Sidebar del mentor
export const mentorSidebarNav: NavSection[] = [
  {
    items: [
      { title: "Panel Mentor", href: "/app/mentor", icon: LayoutDashboard },
    ],
  },
  {
    title: "Gestión",
    items: [
      { title: "Mis Cursos", href: "/app/mentor/cursos", icon: GraduationCap },
      { title: "Lives", href: "/app/mentor/lives", icon: Video },
      { title: "Comunidad", href: "/app/mentor/comunidad", icon: MessageSquare },
    ],
  },
  {
    title: "Análisis",
    items: [
      { title: "Analytics", href: "/app/mentor/analytics", icon: BarChart3 },
    ],
  },
];

// Sidebar del admin
export const adminSidebarNav: NavSection[] = [
  {
    items: [
      { title: "Panel Admin", href: "/app/admin", icon: Shield },
    ],
  },
  {
    title: "Gestión",
    items: [
      { title: "Usuarios", href: "/app/admin/usuarios", icon: UserCog },
      { title: "Membresías", href: "/app/admin/membresias", icon: CreditCard },
      { title: "Cursos", href: "/app/admin/cursos", icon: GraduationCap },
      { title: "Eventos", href: "/app/admin/eventos", icon: Calendar },
    ],
  },
  {
    title: "Sistema",
    items: [
      { title: "Auditoría", href: "/app/admin/auditoria", icon: FileText },
      { title: "Configuración", href: "/app/admin/settings", icon: Settings },
    ],
  },
];

// Topbar actions
export const topbarActions: NavItem[] = [
  { title: "Buscar", href: "/app/buscar", icon: Search },
  { title: "Notificaciones", href: "/app/notificaciones", icon: Bell },
];
