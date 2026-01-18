import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Brand */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-surface-1 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-hover shadow-lg shadow-primary/25">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-xl">
            Viral<span className="text-primary">Academy</span>
          </span>
        </Link>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <blockquote className="text-2xl font-medium leading-relaxed">
            &quot;No necesitas más información.
            <br />
            Necesitas un sistema y constancia.&quot;
          </blockquote>
          <div>
            <p className="font-medium">Leonardo Gómez Ortiz</p>
            <p className="text-sm text-muted-foreground">Founder, Viral Academy</p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-3">
          <p className="text-sm text-muted-foreground">Lo que obtienes:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Acceso a todos los cursos
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Clases en vivo semanales
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Comunidad de emprendedores
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Recursos y plantillas
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-10 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-hover shadow-lg shadow-primary/25">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-xl">
              Viral<span className="text-primary">Academy</span>
            </span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
