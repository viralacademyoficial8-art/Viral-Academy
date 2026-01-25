"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
}

// Extract YouTube video ID from various URL formats
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function YouTubePlayer({
  videoId,
  title = "Video",
  className,
  autoPlay = false,
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(!autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // YouTube embed parameters to minimize branding:
  // - rel=0: Don't show related videos from other channels
  // - modestbranding=1: Minimal YouTube branding
  // - showinfo=0: Hide video title and uploader (deprecated but still works)
  // - iv_load_policy=3: Hide video annotations
  // - disablekb=0: Enable keyboard controls
  // - fs=1: Allow fullscreen
  // - playsinline=1: Play inline on mobile
  // - controls=1: Show player controls (set to 0 to hide completely)
  // - cc_load_policy=0: Don't auto-show captions
  // - autoplay: Only if specified
  const embedParams = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    showinfo: "0",
    iv_load_policy: "3",
    disablekb: "0",
    fs: "1",
    playsinline: "1",
    controls: "1",
    cc_load_policy: "0",
    autoplay: isPlaying || autoPlay ? "1" : "0",
    enablejsapi: "1",
    origin: typeof window !== "undefined" ? window.location.origin : "",
  });

  // Use youtube-nocookie.com for enhanced privacy and reduced branding
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${embedParams.toString()}`;

  const handlePlay = () => {
    setShowOverlay(false);
    setIsPlaying(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      const iframe = containerRef.current.querySelector("iframe");
      if (iframe) {
        if (iframe.requestFullscreen) {
          iframe.requestFullscreen();
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-black overflow-hidden group",
        className
      )}
    >
      {/* Main video container with overflow hidden to crop YouTube logo in corners */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Slight scale to crop edges where YouTube branding appears */}
        <div className="absolute inset-[-2%] w-[104%] h-[104%]">
          {(isPlaying || autoPlay || !showOverlay) && (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
            />
          )}
        </div>
      </div>

      {/* Custom overlay to hide YouTube logo when paused */}
      {showOverlay && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10 bg-black/60 backdrop-blur-sm"
          onClick={handlePlay}
        >
          {/* Thumbnail */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            onError={(e) => {
              // Fallback to hqdefault if maxresdefault doesn't exist
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

          {/* Custom play button */}
          <button
            className="relative z-20 w-20 h-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl"
            onClick={handlePlay}
          >
            <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
          </button>

          {/* Video title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <h3 className="text-white text-lg font-medium truncate">{title}</h3>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isPlaying && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-5 bg-black/80">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* Bottom gradient to hide YouTube branding at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-20 opacity-0 group-hover:opacity-0" />

      {/* Top-right corner cover to hide YouTube logo */}
      <div className="absolute top-0 right-0 w-32 h-12 pointer-events-none z-20">
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent opacity-0" />
      </div>
    </div>
  );
}

// Alternative: Minimal player that shows only when clicked (no YouTube UI until play)
export function YouTubePlayerMinimal({
  videoId,
  title = "Video",
  className,
}: Omit<YouTubePlayerProps, "autoPlay">) {
  const [isActive, setIsActive] = useState(false);

  const embedParams = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    showinfo: "0",
    iv_load_policy: "3",
    fs: "1",
    playsinline: "1",
    controls: "1",
    autoplay: "1",
  });

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${embedParams.toString()}`;

  if (!isActive) {
    return (
      <div
        className={cn(
          "relative w-full h-full bg-black cursor-pointer group",
          className
        )}
        onClick={() => setIsActive(true)}
      >
        {/* Thumbnail */}
        <img
          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/90 group-hover:bg-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-2xl">
            <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full bg-black", className)}>
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}
