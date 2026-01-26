"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  GraduationCap,
  MessageSquare,
  FileText,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  level: string;
  category: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  authorName: string;
  categoryName: string;
  createdAt: string;
}

interface Resource {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string | null;
  courseName: string | null;
}

interface SearchClientProps {
  initialQuery: string;
  courses: Course[];
  posts: Post[];
  resources: Resource[];
}

const POST_TYPES: Record<string, { label: string; color: string }> = {
  ANNOUNCEMENT: { label: "Anuncio", color: "bg-blue-500/10 text-blue-500" },
  QUESTION: { label: "Pregunta", color: "bg-yellow-500/10 text-yellow-500" },
  WIN: { label: "Win", color: "bg-green-500/10 text-green-500" },
  RESOURCE: { label: "Recurso", color: "bg-purple-500/10 text-purple-500" },
  GENERAL: { label: "General", color: "bg-gray-500/10 text-gray-500" },
};

export function SearchClient({
  initialQuery,
  courses,
  posts,
  resources,
}: SearchClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/app/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const totalResults = courses.length + posts.length + resources.length;
  const hasResults = totalResults > 0;
  const hasSearched = initialQuery.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Buscar</h1>
        <p className="text-muted-foreground">
          Busca cursos, publicaciones de la comunidad y recursos.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="¿Qué estás buscando? (cursos, publicaciones, recursos...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-12 text-base"
            autoFocus
          />
        </div>
        <Button type="submit" size="lg" className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90 h-12 px-6">
          Buscar
        </Button>
      </form>

      {/* Results */}
      {hasSearched && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {hasResults ? (
                <>
                  <span className="font-semibold text-foreground">{totalResults}</span> resultado{totalResults !== 1 ? "s" : ""} para &quot;{initialQuery}&quot;
                </>
              ) : (
                <>No se encontraron resultados para &quot;{initialQuery}&quot;</>
              )}
            </p>
          </div>

          {hasResults && (
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">
                  Todos ({totalResults})
                </TabsTrigger>
                <TabsTrigger value="courses">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Cursos ({courses.length})
                </TabsTrigger>
                <TabsTrigger value="posts">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comunidad ({posts.length})
                </TabsTrigger>
                <TabsTrigger value="resources">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Recursos ({resources.length})
                </TabsTrigger>
              </TabsList>

              {/* All Results */}
              <TabsContent value="all" className="space-y-6">
                {courses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-[#BFFF00]" />
                      Cursos
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.slice(0, 3).map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                    {courses.length > 3 && (
                      <Button variant="ghost" className="w-full" asChild>
                        <Link href={`/app/buscar?q=${encodeURIComponent(initialQuery)}&tab=courses`}>
                          Ver todos los cursos <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    )}
                  </div>
                )}

                {posts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#BFFF00]" />
                      Comunidad
                    </h3>
                    <div className="space-y-3">
                      {posts.slice(0, 3).map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                )}

                {resources.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-[#BFFF00]" />
                      Recursos
                    </h3>
                    <div className="space-y-2">
                      {resources.slice(0, 3).map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses" className="space-y-4">
                {courses.length === 0 ? (
                  <EmptyState icon={GraduationCap} message="No se encontraron cursos" />
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Posts Tab */}
              <TabsContent value="posts" className="space-y-3">
                {posts.length === 0 ? (
                  <EmptyState icon={MessageSquare} message="No se encontraron publicaciones" />
                ) : (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-2">
                {resources.length === 0 ? (
                  <EmptyState icon={FolderOpen} message="No se encontraron recursos" />
                ) : (
                  resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}

          {!hasResults && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin resultados</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Intenta con otros términos de búsqueda o navega por las secciones del menú.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!hasSearched && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">¿Qué quieres encontrar?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Escribe en el buscador para encontrar cursos, publicaciones de la comunidad y recursos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/app/cursos/${course.slug}`}>
      <Card className="overflow-hidden hover:border-primary/50 transition-colors h-full">
        <div className="aspect-video bg-muted relative">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h4 className="font-semibold line-clamp-2 mb-2">{course.title}</h4>
          {course.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function PostCard({ post }: { post: Post }) {
  const typeInfo = POST_TYPES[post.type] || POST_TYPES.GENERAL;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <Link href={`/app/comunidad/${post.id}`}>
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold line-clamp-1">{post.title}</h4>
            <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {post.content}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{post.authorName}</span>
            <span>·</span>
            <span>{timeAgo}</span>
            <span>·</span>
            <span>{post.categoryName}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
    >
      <FileText className="w-8 h-8 text-[#BFFF00]" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{resource.title}</p>
        <p className="text-xs text-muted-foreground">
          {resource.fileType?.toUpperCase()}
          {resource.courseName && ` · ${resource.courseName}`}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground" />
    </a>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof Search; message: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Icon className="w-12 h-12 mx-auto mb-2 opacity-30" />
      <p>{message}</p>
    </div>
  );
}
