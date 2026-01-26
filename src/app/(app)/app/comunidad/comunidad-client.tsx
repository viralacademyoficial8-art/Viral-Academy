"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Heart,
  Pin,
  Megaphone,
  HelpCircle,
  Trophy,
  FolderOpen,
  Search,
  Plus,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  postsCount: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  pinned: boolean;
  author: {
    id?: string;
    name: string;
    avatar: string | null | undefined;
    role?: string;
  };
  category: {
    slug: string;
    name: string;
  };
  commentsCount: number;
  likesCount: number;
  createdAt: string;
  isLiked?: boolean;
}

interface ComunidadClientProps {
  categories: Category[];
  posts: Post[];
  userId?: string;
  userRole?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  megaphone: <Megaphone className="w-5 h-5" />,
  "help-circle": <HelpCircle className="w-5 h-5" />,
  trophy: <Trophy className="w-5 h-5" />,
  folder: <FolderOpen className="w-5 h-5" />,
  "message-circle": <MessageCircle className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
};

const POST_TYPES: Record<string, { label: string; color: string }> = {
  ANNOUNCEMENT: { label: "Anuncio", color: "bg-blue-500/10 text-blue-500" },
  QUESTION: { label: "Pregunta", color: "bg-yellow-500/10 text-yellow-500" },
  WIN: { label: "Win", color: "bg-green-500/10 text-green-500" },
  RESOURCE: { label: "Recurso", color: "bg-purple-500/10 text-purple-500" },
  GENERAL: { label: "General", color: "bg-gray-500/10 text-gray-500" },
};

export function ComunidadClient({ categories, posts: initialPosts, userId, userRole }: ComunidadClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [posts, setPosts] = React.useState(initialPosts);
  const [showNewPostModal, setShowNewPostModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New post form state
  const [newPostTitle, setNewPostTitle] = React.useState("");
  const [newPostContent, setNewPostContent] = React.useState("");
  const [newPostCategory, setNewPostCategory] = React.useState("");
  const [newPostType, setNewPostType] = React.useState("GENERAL");

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedPosts = filteredPosts.filter((p) => p.pinned);
  const regularPosts = filteredPosts.filter((p) => !p.pinned);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory) {
      toast.error("Completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          categoryId: newPostCategory,
          type: newPostType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear publicación");
      }

      toast.success("Publicación creada");
      setShowNewPostModal(false);
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory("");
      setNewPostType("GENERAL");
      router.refresh();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear publicación");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error("Inicia sesión para dar like");
      return;
    }

    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likesCount: data.liked ? p.likesCount + 1 : p.likesCount - 1,
                  isLiked: data.liked,
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const isAdminOrMentor = userRole === "ADMIN" || userRole === "MENTOR";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Comunidad</h1>
          <p className="text-muted-foreground">
            Conecta, pregunta y comparte con otros miembros.
          </p>
        </div>
        <Button onClick={() => setShowNewPostModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva publicación
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar - Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-4"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Categorías</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                  selectedCategory === null ? "bg-primary/10 text-primary" : "hover:bg-surface-2"
                }`}
              >
                <span className="text-sm">Todas</span>
                <Badge variant="secondary" className="text-xs">
                  {posts.length}
                </Badge>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    selectedCategory === category.slug
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {CATEGORY_ICONS[category.icon || "message-circle"]}
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.postsCount}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content - Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en la comunidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Pinned Posts */}
          {pinnedPosts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Pin className="w-4 h-4" />
                Fijados
              </h3>
              {pinnedPosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLikePost} userId={userId} />
              ))}
            </div>
          )}

          {/* Regular Posts */}
          <div className="space-y-3">
            {regularPosts.length === 0 && pinnedPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No hay publicaciones aún.</p>
                  <p className="text-sm text-muted-foreground mt-1">¡Sé el primero en publicar!</p>
                </CardContent>
              </Card>
            ) : (
              regularPosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLikePost} userId={userId} />
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* New Post Modal */}
      <Dialog open={showNewPostModal} onOpenChange={setShowNewPostModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva publicación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="¿De qué quieres hablar?"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={newPostType} onValueChange={setNewPostType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="QUESTION">Pregunta</SelectItem>
                    <SelectItem value="WIN">Win 🎉</SelectItem>
                    <SelectItem value="RESOURCE">Recurso</SelectItem>
                    {isAdminOrMentor && (
                      <SelectItem value="ANNOUNCEMENT">Anuncio</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                placeholder="Escribe tu publicación..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNewPostModal(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim() || !newPostCategory}
                className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Publicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostCard({
  post,
  onLike,
  userId,
}: {
  post: Post;
  onLike: (postId: string, e: React.MouseEvent) => void;
  userId?: string;
}) {
  const typeInfo = POST_TYPES[post.type] || POST_TYPES.GENERAL;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: es,
  });

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-500 text-white text-[10px] px-1 py-0">Admin</Badge>;
      case "MENTOR":
        return <Badge className="bg-[#BFFF00] text-black text-[10px] px-1 py-0">Mentor</Badge>;
      default:
        return null;
    }
  };

  return (
    <Link href={`/app/comunidad/${post.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar className="w-10 h-10">
              {post.author.avatar && <AvatarImage src={post.author.avatar} />}
              <AvatarFallback>
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.pinned && <Pin className="w-4 h-4 text-primary" />}
                    <h3 className="font-semibold line-clamp-1">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {post.author.name}
                      {getRoleBadge(post.author.role)}
                    </span>
                    <span>·</span>
                    <span>{timeAgo}</span>
                    <span>·</span>
                    <span>{post.category.name}</span>
                  </div>
                </div>
                <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {post.commentsCount}
                </span>
                <button
                  onClick={(e) => onLike(post.id, e)}
                  className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                    post.isLiked ? "text-red-500" : ""
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                  {post.likesCount}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
