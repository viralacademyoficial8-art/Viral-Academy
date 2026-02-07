import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft, Search, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Simple Header */}
      <header className="p-6">
        <Link href="/" className="inline-block">
          <Image
            src="/images/logo.png"
            alt="Viral Academy"
            width={180}
            height={50}
            className="h-10 w-auto dark:hidden"
          />
          <Image
            src="/images/logo-dark.png"
            alt="Viral Academy"
            width={180}
            height={50}
            className="h-10 w-auto hidden dark:block"
          />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Number with gradient */}
          <div className="relative mb-8">
            <h1 className="text-[12rem] md:text-[16rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary/20 to-primary/5 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Search className="w-16 h-16 md:w-20 md:h-20 text-primary/50" />
              </div>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            ¡Oops! Página no encontrada
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Parece que esta página se volvió viral y desapareció.
            No te preocupes, te ayudamos a encontrar lo que buscas.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Ir al inicio
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/cursos">
                <BookOpen className="w-4 h-4 mr-2" />
                Ver cursos
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Enlaces rápidos
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/membresia"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Membresía
              </Link>
              <span className="text-border">•</span>
              <Link
                href="/eventos"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Eventos
              </Link>
              <span className="text-border">•</span>
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Blog
              </Link>
              <span className="text-border">•</span>
              <Link
                href="/contacto"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          ¿Necesitas ayuda?{" "}
          <Link href="/contacto" className="text-primary hover:underline">
            Contáctanos
          </Link>
        </p>
      </footer>
    </div>
  );
}
