"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Lock,
  Send,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Author {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

interface CommentType {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  likesCount: number;
  isLiked: boolean;
  replies?: CommentType[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
  author: Author;
  category: {
    id: string;
    slug: string;
    name: string;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  comments: CommentType[];
}

interface PostDetailClientProps {
  post: Post;
  userId?: string;
  userRole?: string;
}

const POST_TYPES: Record<string, { label: string; color: string }> = {
  ANNOUNCEMENT: { label: "Anuncio", color: "bg-blue-500/10 text-blue-500" },
  QUESTION: { label: "Pregunta", color: "bg-yellow-500/10 text-yellow-500" },
  WIN: { label: "Win", color: "bg-green-500/10 text-green-500" },
  RESOURCE: { label: "Recurso", color: "bg-purple-500/10 text-purple-500" },
  GENERAL: { label: "General", color: "bg-gray-500/10 text-gray-500" },
};

export function PostDetailClient({ post: initialPost, userId, userRole }: PostDetailClientProps) {
  const router = useRouter();
  const [post, setPost] = React.useState(initialPost);
  const [newComment, setNewComment] = React.useState("");
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<{ type: "post" | "comment"; id: string } | null>(null);

  const isAdminOrMentor = userRole === "ADMIN" || userRole === "MENTOR";
  const isAuthor = userId === post.author.id;
  const typeInfo = POST_TYPES[post.type] || POST_TYPES.GENERAL;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-500 text-white text-[10px] px-1 py-0">Admin</Badge>;
      case "MENTOR":
        return <Badge className="bg-[#BFFF00] text-black text-[10px] px-1 py-0">Mentor</Badge>;
      default:
        return null;
    }
  };

  const handleLikePost = async () => {
    if (!userId) {
      toast.error("Inicia sesión para dar like");
      return;
    }

    try {
      const res = await fetch(`/api/community/posts/${post.id}/like`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setPost((prev) => ({
          ...prev,
          likesCount: data.liked ? prev.likesCount + 1 : prev.likesCount - 1,
          isLiked: data.liked,
        }));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleLikeComment = async (commentId: string, isReply = false, parentId?: string) => {
    if (!userId) {
      toast.error("Inicia sesión para dar like");
      return;
    }

    try {
      const res = await fetch(`/api/community/comments/${commentId}/like`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setPost((prev) => ({
          ...prev,
          comments: prev.comments.map((comment) => {
            if (isReply && parentId) {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: comment.replies?.map((reply) =>
                    reply.id === commentId
                      ? {
                          ...reply,
                          likesCount: data.liked ? reply.likesCount + 1 : reply.likesCount - 1,
                          isLiked: data.liked,
                        }
                      : reply
                  ),
                };
              }
              return comment;
            }
            return comment.id === commentId
              ? {
                  ...comment,
                  likesCount: data.liked ? comment.likesCount + 1 : comment.likesCount - 1,
                  isLiked: data.liked,
                }
              : comment;
          }),
        }));
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleSubmitComment = async (parentId?: string) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) {
      toast.error("Escribe un comentario");
      return;
    }

    if (!userId) {
      toast.error("Inicia sesión para comentar");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          parentId: parentId || null,
        }),
      });

      if (res.ok) {
        toast.success("Comentario publicado");
        setNewComment("");
        setReplyContent("");
        setReplyingTo(null);
        router.refresh();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Error al publicar comentario");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error(error instanceof Error ? error.message : "Error al publicar comentario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const url =
        itemToDelete.type === "post"
          ? `/api/community/posts/${itemToDelete.id}`
          : `/api/community/comments/${itemToDelete.id}`;

      const res = await fetch(url, { method: "DELETE" });

      if (res.ok) {
        toast.success(itemToDelete.type === "post" ? "Publicación eliminada" : "Comentario eliminado");
        if (itemToDelete.type === "post") {
          router.push("/app/comunidad");
        } else {
          router.refresh();
        }
      } else {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const CommentComponent = ({
    comment,
    isReply = false,
    parentId,
  }: {
    comment: CommentType;
    isReply?: boolean;
    parentId?: string;
  }) => {
    const isCommentAuthor = userId === comment.author.id;
    const canDelete = isCommentAuthor || isAdminOrMentor;
    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
      addSuffix: true,
      locale: es,
    });

    return (
      <div className={`flex gap-3 ${isReply ? "ml-12" : ""}`}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          {comment.author.avatar && <AvatarImage src={comment.author.avatar} />}
          <AvatarFallback className="text-xs">
            {comment.author.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.author.name}</span>
              {getRoleBadge(comment.author.role)}
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>
          <div className="flex items-center gap-4 mt-2 ml-2">
            <button
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
              className={`flex items-center gap-1 text-xs hover:text-red-500 transition-colors ${
                comment.isLiked ? "text-red-500" : "text-muted-foreground"
              }`}
            >
              <Heart className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`} />
              {comment.likesCount > 0 && comment.likesCount}
            </button>
            {!isReply && !post.locked && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Responder
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  setItemToDelete({ type: "comment", id: comment.id });
                  setDeleteDialogOpen(true);
                }}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Reply input */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escribe una respuesta..."
                className="min-h-[60px] text-sm resize-none"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={() => handleSubmitComment(comment.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentComponent key={reply.id} comment={reply} isReply parentId={comment.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/comunidad">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold line-clamp-1">{post.title}</h1>
          <p className="text-sm text-muted-foreground">{post.category.name}</p>
        </div>
        {(isAuthor || isAdminOrMentor) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setItemToDelete({ type: "post", id: post.id });
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar publicación
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Post Content */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12">
              {post.author.avatar && <AvatarImage src={post.author.avatar} />}
              <AvatarFallback>
                {post.author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold">{post.author.name}</span>
                {getRoleBadge(post.author.role)}
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {post.pinned && (
                  <Badge variant="secondary" className="text-xs">
                    <Pin className="w-3 h-3 mr-1" />
                    Fijado
                  </Badge>
                )}
                {post.locked && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Bloqueado
                  </Badge>
                )}
                <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
              </div>
              <h2 className="text-xl font-bold mb-3">{post.title}</h2>
              <p className="whitespace-pre-wrap">{post.content}</p>

              <div className="flex items-center gap-6 mt-6 pt-4 border-t">
                <button
                  onClick={handleLikePost}
                  className={`flex items-center gap-2 hover:text-red-500 transition-colors ${
                    post.isLiked ? "text-red-500" : "text-muted-foreground"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                  <span>{post.likesCount} Me gusta</span>
                </button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.commentsCount} Comentarios</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comentarios ({post.comments.length})
          </h3>

          {/* New Comment Input */}
          {!post.locked ? (
            <div className="flex gap-3 mb-6">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-xs">TU</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="min-h-[80px] resize-none mb-2"
                />
                <Button
                  onClick={() => handleSubmitComment()}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                  className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Comentar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground mb-6">
              <Lock className="w-5 h-5 mx-auto mb-2" />
              <p className="text-sm">Esta publicación está bloqueada para comentarios</p>
            </div>
          )}

          {/* Comments List */}
          {post.comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No hay comentarios aún</p>
              <p className="text-sm">¡Sé el primero en comentar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <CommentComponent key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === "post"
                ? "Esta acción eliminará la publicación y todos sus comentarios permanentemente."
                : "Esta acción eliminará el comentario permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
