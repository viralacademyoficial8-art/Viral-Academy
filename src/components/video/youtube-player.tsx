"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  destroy: () => void;
  getPlayerState: () => number;
}

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

// Load YouTube IFrame API
let apiLoaded = false;
let apiLoading = false;
const apiCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiLoaded && window.YT) {
      resolve();
      return;
    }

    apiCallbacks.push(resolve);

    if (apiLoading) {
      return;
    }

    apiLoading = true;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      apiCallbacks.forEach((cb) => cb());
      apiCallbacks.length = 0;
    };
  });
}

export function YouTubePlayer({
  videoId,
  title = "Video",
  className,
  autoPlay = false,
}: YouTubePlayerProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const playerContainerId = useRef(`yt-player-${videoId}-${Math.random().toString(36).slice(2)}`);

  const destroyPlayer = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        // Player may already be destroyed
      }
      playerRef.current = null;
    }
  }, []);

  const initPlayer = useCallback(async () => {
    setIsLoading(true);
    setHasEnded(false);

    await loadYouTubeAPI();

    // Destroy existing player if any
    destroyPlayer();

    // Create player container
    const container = containerRef.current;
    if (!container) return;

    // Remove existing player div if any
    const existingDiv = document.getElementById(playerContainerId.current);
    if (existingDiv) {
      existingDiv.remove();
    }

    // Create new player div
    const playerDiv = document.createElement("div");
    playerDiv.id = playerContainerId.current;
    playerDiv.className = "absolute inset-0 w-full h-full";

    const playerWrapper = container.querySelector(".player-wrapper");
    if (playerWrapper) {
      playerWrapper.appendChild(playerDiv);
    }

    playerRef.current = new window.YT.Player(playerContainerId.current, {
      videoId: videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        showinfo: 0,
        iv_load_policy: 3,
        fs: 1,
        playsinline: 1,
        controls: 1,
        cc_load_policy: 0,
        autoplay: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          setIsLoading(false);
          setShowOverlay(false);
          event.target.playVideo();
        },
        onStateChange: (event) => {
          // YT.PlayerState.ENDED = 0
          if (event.data === 0) {
            setHasEnded(true);
            setShowOverlay(true);
          }
          // YT.PlayerState.PLAYING = 1
          if (event.data === 1) {
            setHasEnded(false);
            setShowOverlay(false);
          }
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    });
  }, [videoId, destroyPlayer]);

  const handlePlay = () => {
    if (hasEnded && playerRef.current) {
      // Replay - seek to start and play
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
      setShowOverlay(false);
      setHasEnded(false);
    } else {
      // First play - initialize player
      initPlayer();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyPlayer();
    };
  }, [destroyPlayer]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-black overflow-hidden group",
        className
      )}
    >
      {/* Player wrapper */}
      <div className="player-wrapper absolute inset-0 overflow-hidden">
        {/* YouTube player will be inserted here */}
      </div>

      {/* Custom overlay - shown initially and when video ends */}
      {showOverlay && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={handlePlay}
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

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

          {/* Custom play/replay button */}
          <button
            className="relative z-20 w-20 h-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl"
            onClick={handlePlay}
          >
            {hasEnded ? (
              <RotateCcw className="w-8 h-8 text-primary-foreground" />
            ) : (
              <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
            )}
          </button>

          {/* Video title / replay text */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <h3 className="text-white text-lg font-medium truncate">
              {hasEnded ? "Reproducir de nuevo" : title}
            </h3>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}
    </div>
  );
}

// Alternative: Simple version for cases where API isn't needed
export function YouTubePlayerSimple({
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
        <img
          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
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
