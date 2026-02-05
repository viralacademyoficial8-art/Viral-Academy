import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, User, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layouts/public-layout";
import { getPublishedBlogPosts, BLOG_CATEGORIES } from "@/lib/actions/blog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Viral Academy",
  description: "Artículos, tutoriales y recursos sobre marketing digital, inteligencia artificial y negocios digitales.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <PublicLayout>
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Newspaper className="w-4 h-4" />
            Blog
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Recursos y <span className="text-primary">artículos</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aprende estrategias de marketing digital, inteligencia artificial, mentalidad
            y negocios digitales con contenido práctico y actualizado.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 md:py-24 bg-surface-1/50 border-y border-border">
        <div className="container-wide">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Próximamente</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Estamos preparando contenido increíble para ti. ¡Únete a la comunidad para ser el primero en acceder!
              </p>
              <Button asChild>
                <Link href="/auth/registro">Únete ahora</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                const authorName = post.author.profile?.displayName || post.author.email;
                const categoryLabel = BLOG_CATEGORIES[post.category as keyof typeof BLOG_CATEGORIES] || post.category;

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group"
                  >
                    <Card className="flex flex-col h-full overflow-hidden hover:border-primary/50 transition-colors">
                      {/* Image */}
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                        {post.thumbnail ? (
                          <Image
                            src={post.thumbnail}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={post.thumbnail.startsWith('http')}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Newspaper className="w-12 h-12 text-primary/30" />
                          </div>
                        )}
                        {post.featured && (
                          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            Destacado
                          </div>
                        )}
                      </div>

                      <CardHeader className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {categoryLabel}
                          </Badge>
                        </div>
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {post.excerpt || post.content.substring(0, 150)}...
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {authorName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {post.readTime} min
                          </span>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {post.publishedAt
                              ? format(new Date(post.publishedAt), "d 'de' MMMM, yyyy", { locale: es })
                              : format(new Date(post.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Leer más <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Accede a contenido exclusivo
            </h2>
            <p className="text-muted-foreground mb-8">
              Únete a Viral Academy y accede a cursos, lives, recursos y contenido exclusivo
              para acelerar tu crecimiento como emprendedor digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/registro">
                  Únete ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/membresia">Ver membresía</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
