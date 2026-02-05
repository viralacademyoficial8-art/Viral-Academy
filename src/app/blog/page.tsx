import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos, tutoriales y recursos sobre marketing digital, inteligencia artificial y negocios digitales.",
};

const blogPosts = [
  {
    id: 1,
    title: "Cómo crear contenido viral en 2024",
    description: "Descubre las estrategias y técnicas que utilizan los creadores más exitosos para generar contenido que se comparte masivamente.",
    category: "Marketing Digital",
    author: "Leonardo Gómez",
    date: "2024-01-15",
    readTime: "8 min",
    image: null,
  },
  {
    id: 2,
    title: "Inteligencia Artificial para emprendedores",
    description: "Herramientas de IA que puedes implementar hoy en tu negocio para automatizar procesos y aumentar tu productividad.",
    category: "IA",
    author: "Leonardo Gómez",
    date: "2024-01-10",
    readTime: "12 min",
    image: null,
  },
  {
    id: 3,
    title: "El poder de la mentalidad en los negocios",
    description: "Cómo tu forma de pensar impacta directamente en el éxito de tu emprendimiento y qué puedes hacer para mejorarla.",
    category: "Mentalidad",
    author: "Susy Ponce",
    date: "2024-01-05",
    readTime: "6 min",
    image: null,
  },
  {
    id: 4,
    title: "Guía completa de Meta Ads",
    description: "Todo lo que necesitas saber para crear campañas publicitarias efectivas en Facebook e Instagram.",
    category: "Marketing Digital",
    author: "Leonardo Gómez",
    date: "2024-01-01",
    readTime: "15 min",
    image: null,
  },
  {
    id: 5,
    title: "Construye tu marca personal desde cero",
    description: "Pasos prácticos para desarrollar una marca personal auténtica que te diferencie en el mercado digital.",
    category: "Marca Personal",
    author: "Susy Ponce",
    date: "2023-12-28",
    readTime: "10 min",
    image: null,
  },
  {
    id: 6,
    title: "Automatización de negocios digitales",
    description: "Aprende a crear sistemas automatizados que trabajen por ti las 24 horas del día.",
    category: "Automatización",
    author: "Leonardo Gómez",
    date: "2023-12-20",
    readTime: "9 min",
    image: null,
  },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="section-padding bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide text-center">
          <Badge variant="outline" className="mb-4">Blog</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Recursos y artículos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aprende estrategias de marketing digital, inteligencia artificial, mentalidad
            y negocios digitales con contenido práctico y actualizado.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id} hover className="flex flex-col">
                {/* Image placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg" />

                <CardHeader className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.date)}
                    </span>
                    <Button variant="ghost" size="sm" className="text-primary" disabled>
                      Leer más <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-12 text-center p-8 rounded-2xl bg-surface-1 border border-border">
            <h3 className="text-xl font-semibold mb-2">Más contenido próximamente</h3>
            <p className="text-muted-foreground mb-4">
              Estamos trabajando en nuevos artículos y recursos. Mientras tanto,
              únete a Viral Academy para acceder a contenido exclusivo.
            </p>
            <Button asChild>
              <Link href="/membresia">
                Ver membresía
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
