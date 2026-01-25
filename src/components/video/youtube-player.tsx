"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, Loader2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

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
        UNSTARTED: number;
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
  getCurrentTime: () => number;
  getDuration: () => number;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
}

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  showBranding?: boolean;
  brandingLogo?: string;
  brandingText?: string;
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

// Format time in MM:SS or HH:MM:SS
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Load YouTube IFrame API
let apiLoaded = false;
let apiLoading = false;
const apiCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiLoaded && window.YT && window.YT.Player) {
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
  showBranding = true,
  brandingText = "Viral Academy",
}: YouTubePlayerProps) {
  // Player state
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  // Time state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  // Volume state
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // UI state
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const playerContainerId = useRef(`yt-player-${videoId}-${Math.random().toString(36).slice(2)}`);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize player
  const initPlayer = useCallback(async () => {
    setIsLoading(true);

    await loadYouTubeAPI();

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
    playerDiv.style.position = "absolute";
    playerDiv.style.top = "0";
    playerDiv.style.left = "0";
    playerDiv.style.width = "100%";
    playerDiv.style.height = "100%";

    const playerWrapper = container.querySelector(".player-wrapper");
    if (playerWrapper) {
      playerWrapper.appendChild(playerDiv);
    }

    playerRef.current = new window.YT.Player(playerContainerId.current, {
      videoId: videoId,
      playerVars: {
        controls: 0, // Hide YouTube controls completely
        disablekb: 1, // Disable keyboard controls (we'll handle them)
        fs: 0, // Disable YouTube fullscreen button
        iv_load_policy: 3, // Hide annotations
        modestbranding: 1,
        rel: 0, // Don't show related videos
        showinfo: 0,
        playsinline: 1,
        origin: window.location.origin,
        enablejsapi: 1,
        cc_load_policy: 0,
      },
      events: {
        onReady: (event) => {
          setIsReady(true);
          setIsLoading(false);
          setDuration(event.target.getDuration());
          setVolume(event.target.getVolume());
          setIsMuted(event.target.isMuted());
          event.target.playVideo();
        },
        onStateChange: (event) => {
          switch (event.data) {
            case -1: // UNSTARTED
              break;
            case 0: // ENDED
              setIsPlaying(false);
              setHasEnded(true);
              if (timeUpdateInterval.current) {
                clearInterval(timeUpdateInterval.current);
              }
              break;
            case 1: // PLAYING
              setIsPlaying(true);
              setHasEnded(false);
              setHasStarted(true);
              startTimeUpdate();
              break;
            case 2: // PAUSED
              setIsPlaying(false);
              break;
            case 3: // BUFFERING
              setIsLoading(true);
              break;
          }
          if (event.data !== 3) {
            setIsLoading(false);
          }
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    });
  }, [videoId]);

  // Start time update interval
  const startTimeUpdate = useCallback(() => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }

    timeUpdateInterval.current = setInterval(() => {
      if (playerRef.current && !isSeeking) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 250);
  }, [isSeeking]);

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!hasStarted) {
      initPlayer();
      return;
    }

    if (hasEnded) {
      playerRef.current?.seekTo(0, true);
      playerRef.current?.playVideo();
      setHasEnded(false);
      return;
    }

    if (isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
  }, [hasStarted, hasEnded, isPlaying, initPlayer]);

  // Handle seek
  const handleSeek = useCallback((value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    setIsSeeking(true);
  }, []);

  const handleSeekEnd = useCallback((value: number[]) => {
    const newTime = value[0];
    playerRef.current?.seekTo(newTime, true);
    setIsSeeking(false);
  }, []);

  // Handle volume
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    playerRef.current?.setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
      playerRef.current?.unMute();
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      playerRef.current?.unMute();
      playerRef.current?.setVolume(volume > 0 ? volume : 50);
      setIsMuted(false);
      if (volume === 0) setVolume(50);
    } else {
      playerRef.current?.mute();
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  }, []);

  // Handle mouse movement for controls visibility
  const handleMouseMove = useCallback(() => {
    setShowControls(true);

    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasStarted) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          playerRef.current?.seekTo(Math.max(0, currentTime - 10), true);
          break;
        case "ArrowRight":
          e.preventDefault();
          playerRef.current?.seekTo(Math.min(duration, currentTime + 10), true);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange([Math.min(100, volume + 10)]);
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange([Math.max(0, volume - 10)]);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasStarted, togglePlay, currentTime, duration, volume, handleVolumeChange, toggleMute, toggleFullscreen]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-black overflow-hidden group select-none",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Player wrapper - YouTube iframe goes here */}
      <div className="player-wrapper absolute inset-0 pointer-events-none" />

      {/* Click overlay to toggle play/pause */}
      {hasStarted && (
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={togglePlay}
        />
      )}

      {/* Initial overlay - before video starts */}
      {!hasStarted && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
          onClick={togglePlay}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

          {/* Play button */}
          <button className="relative z-30 w-20 h-20 rounded-full bg-[#00D4FF] hover:bg-[#00B8E6] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </button>

          {/* Branding */}
          {showBranding && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3 bg-black/60 backdrop-blur-sm rounded-xl p-4">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-10 h-10">
                  <polygon points="30,20 70,50 30,80" fill="#BFFF00" />
                  <polygon points="50,20 90,50 50,80" fill="#00D4FF" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">{brandingText}</span>
            </div>
          )}
        </div>
      )}

      {/* End screen overlay */}
      {hasEnded && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
          onClick={togglePlay}
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
          <div className="absolute inset-0 bg-black/60" />

          {/* Replay button */}
          <button className="relative z-30 w-20 h-20 rounded-full bg-[#00D4FF] hover:bg-[#00B8E6] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl">
            <RotateCcw className="w-8 h-8 text-white" />
          </button>

          <p className="absolute bottom-20 text-white text-lg font-medium z-30">
            Reproducir de nuevo
          </p>

          {/* Branding */}
          {showBranding && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3 bg-black/60 backdrop-blur-sm rounded-xl p-4">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-10 h-10">
                  <polygon points="30,20 70,50 30,80" fill="#BFFF00" />
                  <polygon points="50,20 90,50 50,80" fill="#00D4FF" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">{brandingText}</span>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <Loader2 className="w-12 h-12 text-[#00D4FF] animate-spin" />
        </div>
      )}

      {/* Custom controls */}
      {hasStarted && !hasEnded && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

          {/* Controls container */}
          <div className="relative px-4 pb-3 pt-8">
            {/* Progress bar */}
            <div className="mb-3 group/progress">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                onValueCommit={handleSeekEnd}
                className="cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:opacity-0 group-hover/progress:[&_[role=slider]]:opacity-100 [&_[role=slider]]:transition-opacity [&_[role=slider]]:bg-[#00D4FF] [&_[role=slider]]:border-0 [&>span:first-child]:h-1 group-hover/progress:[&>span:first-child]:h-1.5 [&>span:first-child]:transition-all [&>span:first-child]:bg-white/30 [&_[data-orientation=horizontal]>[data-orientation=horizontal]]:bg-[#00D4FF]"
              />
            </div>

            {/* Bottom controls */}
            <div className="flex items-center justify-between">
              {/* Left controls */}
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <button
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" fill="white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" fill="white" />
                  )}
                </button>

                {/* Volume */}
                <div
                  className="flex items-center gap-1"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>

                  <div className={cn(
                    "overflow-hidden transition-all duration-200",
                    showVolumeSlider ? "w-20 opacity-100" : "w-0 opacity-0"
                  )}>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[data-orientation=horizontal]>[data-orientation=horizontal]]:bg-white"
                    />
                  </div>
                </div>

                {/* Time */}
                <span className="text-white text-sm ml-2 tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1">
                {/* Fullscreen */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5 text-white" />
                  ) : (
                    <Maximize className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branding overlay during playback - optional small logo */}
      {hasStarted && !hasEnded && showBranding && showControls && (
        <div className="absolute top-4 right-4 z-20 opacity-70 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <svg viewBox="0 0 100 100" className="w-5 h-5">
              <polygon points="30,20 70,50 30,80" fill="#BFFF00" />
              <polygon points="50,20 90,50 50,80" fill="#00D4FF" />
            </svg>
            <span className="text-white text-xs font-medium">{brandingText}</span>
          </div>
        </div>
      )}
    </div>
  );
}
