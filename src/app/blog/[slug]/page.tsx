import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User, Tag, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layouts/public-layout";
import { getBlogPostBySlug, getPublishedBlogPosts, BLOG_CATEGORIES } from "@/lib/actions/blog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || !post.published) {
    return {
      title: "Artículo no encontrado | Viral Academy",
    };
  }

  return {
    title: `${post.title} | Viral Academy`,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.profile?.displayName || post.author.email],
      images: post.thumbnail ? [post.thumbnail] : [],
    },
  };
}

// Simple markdown parser for basic formatting
function parseMarkdown(content: string): string {
  let html = content
    // Escape HTML first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-6">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Unordered lists
    .replace(/^\s*[-*]\s+(.*)$/gim, '<li class="ml-6 list-disc">$1</li>')
    // Ordered lists
    .replace(/^\s*\d+\.\s+(.*)$/gim, '<li class="ml-6 list-decimal">$1</li>')
    // Blockquotes
    .replace(/^>\s+(.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">$1</blockquote>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Horizontal rule
    .replace(/^---$/gim, '<hr class="my-8 border-border" />')
    // Paragraphs (must be last)
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // Line breaks
    .replace(/\n/g, '<br />');

  // Wrap in paragraph if not starting with a block element
  if (!html.startsWith('<h') && !html.startsWith('<pre') && !html.startsWith('<blockquote') && !html.startsWith('<ul') && !html.startsWith('<ol')) {
    html = '<p class="mb-4">' + html + '</p>';
  }

  return html;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  // Get related posts (same category, excluding current post)
  const allPosts = await getPublishedBlogPosts(4);
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  const authorName = post.author.profile?.displayName || post.author.email;
  const categoryLabel = BLOG_CATEGORIES[post.category as keyof typeof BLOG_CATEGORIES] || post.category;
  const publishDate = post.publishedAt || post.createdAt;

  return (
    <PublicLayout>
      {/* Header */}
      <article className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-wide max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>

          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge variant="secondary">{categoryLabel}</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {format(new Date(publishDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {post.readTime} min de lectura
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Author */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {authorName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium">{authorName}</p>
              <p className="text-sm text-muted-foreground">Autor</p>
            </div>
          </div>

          {/* Featured Image */}
          {post.thumbnail && (
            <div className="aspect-video relative rounded-2xl overflow-hidden mb-10">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
                priority
                unoptimized={post.thumbnail.startsWith('http')}
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-12 pt-8 border-t border-border">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="flex items-center gap-4 mt-8">
            <span className="text-sm text-muted-foreground">Compartir:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator.share({
                    title: post.title,
                    text: post.excerpt || '',
                    url: window.location.href,
                  });
                }
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 md:py-24 bg-surface-1/50 border-t border-border">
          <div className="container-wide">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Artículos relacionados
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {relatedPosts.map((relatedPost) => {
                const relatedAuthorName = relatedPost.author.profile?.displayName || relatedPost.author.email;
                const relatedCategoryLabel = BLOG_CATEGORIES[relatedPost.category as keyof typeof BLOG_CATEGORIES] || relatedPost.category;

                return (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group"
                  >
                    <div className="rounded-xl overflow-hidden bg-background border border-border hover:border-primary/50 transition-colors">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                        {relatedPost.thumbnail ? (
                          <Image
                            src={relatedPost.thumbnail}
                            alt={relatedPost.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            unoptimized={relatedPost.thumbnail.startsWith('http')}
                          />
                        ) : null}
                      </div>
                      <div className="p-5">
                        <Badge variant="secondary" className="text-xs mb-2">
                          {relatedCategoryLabel}
                        </Badge>
                        <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {relatedAuthorName}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Quieres más contenido como este?
            </h2>
            <p className="text-muted-foreground mb-8">
              Únete a Viral Academy y accede a cursos, lives y contenido exclusivo
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
                <Link href="/blog">Ver más artículos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
