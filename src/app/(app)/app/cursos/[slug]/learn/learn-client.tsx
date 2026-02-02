"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  File,
  FileText,
  Heart,
  List,
  Lock,
  Loader2,
  MessageCircle,
  Paperclip,
  Pin,
  Play,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { YouTubePlayer, getYouTubeVideoId } from "@/components/video/youtube-player";
import { VimeoPlayer, getVimeoVideoInfo, isVimeoUrl } from "@/components/video/vimeo-player";
import { CourseCompletionModal } from "@/components/certificate/course-completion-modal";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  videoUrl: string | null;
  completed: boolean;
  isLocked?: boolean;
  isFileOnly?: boolean;
  hasResources?: boolean;
}

interface Module {
  id: string;
  title: string;
  isComplete?: boolean;
  lessons: Lesson[];
}

interface Resource {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
}

interface CurrentLesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  duration: number;
  notes: string | null;
  moduleTitle: string;
  completed: boolean;
  isFileOnly?: boolean;
  resources?: Resource[];
}

interface Course {
  id: string;
  slug: string;
  title: string;
  modules: Module[];
}

interface CommentAuthor {
  id: string;
  email: string;
  role: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    avatar: string | null;
  } | null;
}

interface CommentAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

interface Comment {
  id: string;
  content: string;
  attachments: CommentAttachment[] | null;
  pinned: boolean;
  createdAt: string;
  author: CommentAuthor;
  replies: Comment[];
  likes: { userId: string }[];
}

interface Props {
  course: Course;
  currentLesson: CurrentLesson;
  prevLessonId: string | null;
  nextLessonId: string | null;
  nextLessonLocked?: boolean;
  progress: number;
  completedCount: number;
  totalLessons: number;
  userId?: string;
  userRole?: string;
  studentName?: string;
  hasCertificate?: boolean;
}

export function LearnClient({
  course,
  currentLesson,
  prevLessonId,
  nextLessonId,
  nextLessonLocked = false,
  progress,
  completedCount,
  totalLessons,
  userId,
  userRole,
  studentName = "Estudiante",
  hasCertificate = false,
}: Props) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(
    course.modules.map((m) => m.id)
  );

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [localProgress, setLocalProgress] = useState(progress);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Determine video type and extract ID
  const isVimeo = currentLesson.videoUrl ? isVimeoUrl(currentLesson.videoUrl) : false;
  const youtubeVideoId = currentLesson.videoUrl && !isVimeo
    ? getYouTubeVideoId(currentLesson.videoUrl)
    : null;
  const vimeoInfo = currentLesson.videoUrl && isVimeo
    ? getVimeoVideoInfo(currentLesson.videoUrl)
    : null;

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      const res = await fetch(`/api/lessons/${currentLesson.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  }, [currentLesson.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      const res = await fetch("/api/lessons/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          completed: !currentLesson.completed,
        }),
      });

      if (res.ok) {
        const isMarkedComplete = !currentLesson.completed;
        toast.success(
          isMarkedComplete
            ? "¡Lección completada!"
            : "Lección marcada como pendiente"
        );

        // Check if course is now 100% complete
        if (isMarkedComplete && !hasCertificate) {
          const newCompletedCount = completedCount + 1;
          const newProgress = Math.round((newCompletedCount / totalLessons) * 100);
          setLocalProgress(newProgress);

          if (newProgress >= 100) {
            // Show completion modal after a short delay
            setTimeout(() => {
              setShowCompletionModal(true);
            }, 500);
          }
        }

        router.refresh();
      } else {
        toast.error("Error al actualizar progreso");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Error de conexión");
    } finally {
      setIsCompleting(false);
    }
  };

  const navigateToLesson = (lessonId: string, isLocked?: boolean) => {
    if (isLocked) {
      toast.error("Completa las lecciones anteriores para desbloquear esta");
      return;
    }
    router.push(`/app/cursos/${course.slug}/learn?lesson=${lessonId}`);
  };

  // Upload attachment
  const handleAttachmentUpload = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validate file size (10MB max for comments)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo es muy grande. Máximo 10MB");
      return;
    }

    setAttachments((prev) => [...prev, file]);
  };

  // Submit comment
  const handleSubmitComment = async (parentId?: string) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim() && attachments.length === 0) {
      toast.error("Escribe un comentario");
      return;
    }

    setSubmittingComment(true);
    try {
      // Upload attachments first
      let uploadedAttachments: CommentAttachment[] = [];
      if (attachments.length > 0) {
        setUploadingAttachment(true);
        for (const file of attachments) {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetch("/api/upload/attachments", {
            method: "POST",
            body: formData,
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            uploadedAttachments.push({
              url: data.url,
              type: file.type,
              name: file.name,
              size: file.size,
            });
          }
        }
        setUploadingAttachment(false);
      }

      const res = await fetch(`/api/lessons/${currentLesson.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          parentId: parentId || null,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : null,
        }),
      });

      if (res.ok) {
        toast.success("Comentario publicado");
        setNewComment("");
        setReplyContent("");
        setReplyingTo(null);
        setAttachments([]);
        fetchComments();
      } else {
        toast.error("Error al publicar comentario");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Error de conexión");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("¿Eliminar este comentario?")) return;

    try {
      const res = await fetch(`/api/lessons/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Comentario eliminado");
        fetchComments();
      } else {
        toast.error("Error al eliminar comentario");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Error de conexión");
    }
  };

  // Like comment
  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/lessons/comments/${commentId}/like`, {
        method: "POST",
      });

      if (res.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // Pin/Unpin comment
  const handlePinComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/lessons/comments/${commentId}/pin`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Comentario actualizado");
        fetchComments();
      } else {
        toast.error("Error al fijar comentario");
      }
    } catch (error) {
      console.error("Error pinning comment:", error);
      toast.error("Error de conexión");
    }
  };

  // Helper function to render text with clickable links
  const renderContentWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#BFFF00] hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Helper functions
  const getAuthorName = (author: CommentAuthor) => {
    if (author.profile?.displayName) return author.profile.displayName;
    if (author.profile?.firstName) {
      return `${author.profile.firstName} ${author.profile.lastName || ""}`.trim();
    }
    return author.email.split("@")[0];
  };

  const getAuthorInitials = (author: CommentAuthor) => {
    const name = getAuthorName(author);
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-500 text-white text-xs">Admin</Badge>;
      case "MENTOR":
        return <Badge className="bg-[#BFFF00] text-black text-xs">Mentor</Badge>;
      case "STUDENT":
        return <Badge variant="outline" className="text-xs">Estudiante</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Usuario</Badge>;
    }
  };

  const getFileIcon = (fileType: string | null) => {
    const type = (fileType || "").toLowerCase();
    if (type === "pdf") return <FileText className="w-5 h-5 text-red-500" />;
    if (["doc", "docx"].includes(type)) return <FileText className="w-5 h-5 text-blue-500" />;
    if (["xls", "xlsx"].includes(type)) return <FileText className="w-5 h-5 text-green-500" />;
    if (["ppt", "pptx"].includes(type)) return <FileText className="w-5 h-5 text-orange-500" />;
    if (["zip", "rar"].includes(type)) return <File className="w-5 h-5 text-yellow-500" />;
    return <File className="w-5 h-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Comment Component
  const CommentItem = ({ comment, isReply = false, userRole }: { comment: Comment; isReply?: boolean; userRole?: string }) => {
    const isLiked = userId ? comment.likes.some((l) => l.userId === userId) : false;
    const isAuthor = userId === comment.author.id;
    const canPin = userRole === "ADMIN" || userRole === "MENTOR";

    return (
      <div className={cn(
        "flex gap-3",
        isReply && "ml-10",
        comment.pinned && !isReply && "bg-[#BFFF00]/5 border border-[#BFFF00]/20 rounded-lg p-3 -mx-3"
      )}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.author.profile?.avatar || undefined} />
          <AvatarFallback className="text-xs bg-muted">
            {getAuthorInitials(comment.author)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {comment.pinned && !isReply && (
              <Badge className="bg-[#BFFF00] text-black text-xs gap-1">
                <Pin className="w-3 h-3" />
                Fijado
              </Badge>
            )}
            <span className="font-medium text-sm">{getAuthorName(comment.author)}</span>
            {getRoleBadge(comment.author.role)}
            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{renderContentWithLinks(comment.content)}</p>

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {comment.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded bg-muted/50 hover:bg-muted text-xs"
                >
                  {att.type.startsWith("image/") ? (
                    <Image src={att.url} alt={att.name} width={100} height={60} className="rounded object-cover" />
                  ) : (
                    <>
                      <Paperclip className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{att.name}</span>
                    </>
                  )}
                </a>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => handleLikeComment(comment.id)}
              className={cn(
                "flex items-center gap-1 text-xs hover:text-[#BFFF00] transition-colors",
                isLiked ? "text-[#BFFF00]" : "text-muted-foreground"
              )}
            >
              <Heart className={cn("w-3 h-3", isLiked && "fill-current")} />
              {comment.likes.length > 0 && comment.likes.length}
            </button>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Responder
              </button>
            )}
            {isAuthor && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            {canPin && !isReply && (
              <button
                onClick={() => handlePinComment(comment.id)}
                className={cn(
                  "flex items-center gap-1 text-xs transition-colors",
                  comment.pinned ? "text-[#BFFF00]" : "text-muted-foreground hover:text-[#BFFF00]"
                )}
                title={comment.pinned ? "Desfijar comentario" : "Fijar comentario"}
              >
                <Pin className={cn("w-3 h-3", comment.pinned && "fill-current")} />
                {comment.pinned ? "Desfijar" : "Fijar"}
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
                  disabled={submittingComment}
                >
                  {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply userRole={userRole} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -mx-4 md:-mx-6 lg:-mx-8 -my-6">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/app/cursos/${course.slug}`}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">{course.title}</p>
              <h1 className="font-semibold">{currentLesson.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex">
              {progress}% completado
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable content area */}
        <ScrollArea className="flex-1">
          {/* Video Player, Text Content, or File-only view */}
          {currentLesson.isFileOnly ? (
            <div className="bg-gradient-to-b from-muted/50 to-background p-8 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-[#BFFF00]/20 rounded-2xl flex items-center justify-center">
                  <FileText className="w-10 h-10 text-[#BFFF00]" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Material de Estudio</h2>
                <p className="text-muted-foreground">
                  Descarga los archivos adjuntos para esta lección
                </p>
              </div>
            </div>
          ) : youtubeVideoId ? (
            <div className="w-full bg-black flex items-center justify-center">
              <div className="w-full max-h-[65vh] aspect-video">
                <YouTubePlayer
                  videoId={youtubeVideoId}
                  title={currentLesson.title}
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : vimeoInfo ? (
            <div className="w-full bg-black flex items-center justify-center">
              <div className="w-full max-h-[65vh] aspect-video">
                <VimeoPlayer
                  videoId={vimeoInfo.videoId}
                  hash={vimeoInfo.hash}
                  title={currentLesson.title}
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : currentLesson.notes ? (
            <div className="bg-gradient-to-b from-muted/50 to-background p-6 md:p-8 min-h-[300px]">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#BFFF00]/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#BFFF00]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Contenido de la Lección</h2>
                    <p className="text-sm text-muted-foreground">Lee las instrucciones a continuación</p>
                  </div>
                </div>
                <div className="prose prose-invert prose-sm md:prose-base max-w-none bg-card/50 rounded-xl p-6 border">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {renderContentWithLinks(currentLesson.notes)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full bg-black flex items-center justify-center">
              <div className="w-full max-h-[65vh] aspect-video flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No hay video disponible para esta lección</p>
                  <p className="text-sm text-gray-400 mt-2">
                    El video será agregado próximamente
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resources/Attachments Section */}
          {currentLesson.resources && currentLesson.resources.length > 0 && (
            <div className="p-4 border-t bg-background/50">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-[#BFFF00]" />
                <h3 className="font-semibold">Material de apoyo</h3>
                <Badge variant="secondary" className="ml-auto">
                  {currentLesson.resources.length} archivo{currentLesson.resources.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="grid gap-2">
                {currentLesson.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    {getFileIcon(resource.fileType)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {resource.fileType?.toUpperCase()} {resource.fileSize ? `• ${formatFileSize(resource.fileSize)}` : ""}
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-[#BFFF00] transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="p-4 border-t">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 w-full mb-4"
            >
              <MessageCircle className="w-5 h-5 text-[#BFFF00]" />
              <h3 className="font-semibold">Preguntas y comentarios</h3>
              <Badge variant="secondary" className="ml-2">
                {comments.length}
              </Badge>
              <ChevronDown className={cn("w-4 h-4 ml-auto transition-transform", !showComments && "-rotate-90")} />
            </button>

            {showComments && (
              <div className="space-y-4">
                {/* New Comment Input */}
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-muted">TU</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe tu pregunta o comentario..."
                      className="min-h-[80px] resize-none"
                    />

                    {/* Attachment preview */}
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((file, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted text-xs">
                            <Paperclip className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <button onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}>
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                          onChange={(e) => e.target.files && handleAttachmentUpload(e.target.files)}
                        />
                        <div className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Paperclip className="w-4 h-4" />
                          Adjuntar archivo
                        </div>
                      </label>
                      <Button
                        onClick={() => handleSubmitComment()}
                        disabled={submittingComment || uploadingAttachment}
                        size="sm"
                      >
                        {submittingComment || uploadingAttachment ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Publicar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay comentarios aún</p>
                    <p className="text-sm">¡Sé el primero en comentar!</p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t">
                    {comments.map((comment) => (
                      <CommentItem key={comment.id} comment={comment} userRole={userRole} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Controls */}
        <div className="p-4 border-t bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevLessonId}
                onClick={() => prevLessonId && navigateToLesson(prevLessonId)}
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
              <Button
                variant={currentLesson.completed ? "secondary" : "default"}
                size="sm"
                onClick={handleMarkComplete}
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <Loader2 className="w-4 h-4 animate-spin sm:mr-2" />
                ) : (
                  <Check className="w-4 h-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">
                  {currentLesson.completed ? "Completada" : "Marcar completada"}
                </span>
              </Button>
            </div>
            <Button
              size="sm"
              disabled={!nextLessonId || nextLessonLocked}
              onClick={() => nextLessonId && navigateToLesson(nextLessonId, nextLessonLocked)}
            >
              {nextLessonLocked && <Lock className="w-4 h-4 sm:mr-2" />}
              <span className="hidden sm:inline">Siguiente</span>
              {!nextLessonLocked && <ArrowRight className="w-4 h-4 sm:ml-2" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "w-80 border-l bg-background flex flex-col transition-all duration-300",
          "fixed md:relative right-0 top-0 h-full z-50 md:z-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0 md:w-0 md:border-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Contenido del curso</h2>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tu progreso</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedCount} de {totalLessons} lecciones completadas
            </p>
          </div>
        </div>

        {/* Lessons List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {course.modules.map((module) => (
              <Collapsible
                key={module.id}
                open={expandedModules.includes(module.id)}
                onOpenChange={() => toggleModule(module.id)}
              >
                <CollapsibleTrigger className="flex items-start justify-between w-full p-3 rounded-lg hover:bg-muted/50 text-left gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {expandedModules.includes(module.id) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-sm leading-tight">{module.title}</span>
                    {module.isComplete && (
                      <Check className="w-4 h-4 text-[#BFFF00] flex-shrink-0" />
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {module.lessons.filter((l) => l.completed).length}/
                    {module.lessons.length}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-4 space-y-1">
                    {module.lessons.map((lesson) => {
                      const lessonContent = (
                        <>
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                              lesson.completed
                                ? "bg-[#BFFF00] text-black"
                                : lesson.isLocked
                                ? "bg-muted border border-border"
                                : "bg-muted border border-border"
                            )}
                          >
                            {lesson.isLocked ? (
                              <Lock className="w-3 h-3" />
                            ) : lesson.completed ? (
                              <Check className="w-3 h-3" />
                            ) : lesson.isFileOnly ? (
                              <FileText className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm leading-tight",
                                lesson.id === currentLesson.id && "font-medium"
                              )}
                            >
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              {lesson.duration > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration >= 3600
                                    ? `${Math.floor(lesson.duration / 3600)}:${String(Math.floor((lesson.duration % 3600) / 60)).padStart(2, '0')}:${String(lesson.duration % 60).padStart(2, '0')}`
                                    : `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}`
                                  }
                                </span>
                              )}
                              {lesson.hasResources && (
                                <span className="flex items-center gap-1 text-[#BFFF00]">
                                  <Paperclip className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      );

                      const lessonClasses = cn(
                        "flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors",
                        lesson.id === currentLesson.id
                          ? "bg-primary/10 border border-primary/20"
                          : lesson.isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-muted/50"
                      );

                      // Use Link for unlocked lessons, button for locked ones
                      if (lesson.isLocked) {
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => toast.error("Completa las lecciones anteriores para desbloquear esta")}
                            disabled
                            className={lessonClasses}
                          >
                            {lessonContent}
                          </button>
                        );
                      }

                      return (
                        <Link
                          key={lesson.id}
                          href={`/app/cursos/${course.slug}/learn?lesson=${lesson.id}`}
                          className={lessonClasses}
                        >
                          {lessonContent}
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Course Completion Modal */}
      <CourseCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        courseId={course.id}
        courseTitle={course.title}
        studentName={studentName}
      />
    </div>
  );
}
