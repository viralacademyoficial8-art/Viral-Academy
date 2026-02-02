"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, Loader2, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { deobfuscateVideoId } from "@/lib/video-obfuscation";

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
}

// Extract YouTube video ID from various URL formats (supports obfuscated IDs)
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      // Deobfuscate if the ID is obfuscated
      return deobfuscateVideoId(match[1]);
    }
  }

  // Check if the URL itself is an obfuscated ID
  if (url.startsWith('vob_')) {
    return deobfuscateVideoId(url);
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
  videoId: obfuscatedVideoId,
  title = "Video",
  className,
}: YouTubePlayerProps) {
  // Deobfuscate video ID (handles both obfuscated and plain IDs)
  const videoId = useMemo(() => deobfuscateVideoId(obfuscatedVideoId), [obfuscatedVideoId]);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  // Time state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Volume state
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // UI state
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const playerContainerId = useRef(`yt-player-${videoId}-${Math.random().toString(36).slice(2)}`);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize player
  const initPlayer = useCallback(async () => {
    setIsLoading(true);

    await loadYouTubeAPI();

    const container = containerRef.current;
    if (!container) return;

    const existingDiv = document.getElementById(playerContainerId.current);
    if (existingDiv) {
      existingDiv.remove();
    }

    const playerDiv = document.createElement("div");
    playerDiv.id = playerContainerId.current;
    playerDiv.style.position = "absolute";
    playerDiv.style.top = "0";
    playerDiv.style.left = "0";
    playerDiv.style.width = "calc(100% + 2px)";
    playerDiv.style.height = "calc(100% + 60px)"; // Reduced height - controls disabled via API

    const playerWrapper = container.querySelector(".player-wrapper");
    if (playerWrapper) {
      playerWrapper.appendChild(playerDiv);
    }

    playerRef.current = new window.YT.Player(playerContainerId.current, {
      videoId: videoId,
      playerVars: {
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1,
        origin: window.location.origin,
        enablejsapi: 1,
        cc_load_policy: 0,
      },
      events: {
        onReady: (event) => {
          setIsLoading(false);
          setDuration(event.target.getDuration());
          setVolume(event.target.getVolume());
          setIsMuted(event.target.isMuted());
          event.target.playVideo();
        },
        onStateChange: (event) => {
          switch (event.data) {
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

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    playerRef.current?.seekTo(newTime, true);
    setCurrentTime(newTime);
  }, [duration]);

  const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;

    setHoverTime(time);
    setHoverPosition(e.clientX - rect.left);
  }, [duration]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
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

  const skip = useCallback((seconds: number) => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  }, [currentTime, duration]);

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

  // Keyboard shortcuts
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
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
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
  }, [hasStarted, togglePlay, skip, toggleMute, toggleFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
      }
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-neutral-950 overflow-hidden select-none",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* CSS to hide YouTube elements */}
      <style>{`
        .player-wrapper iframe {
          pointer-events: none !important;
        }
        .player-wrapper {
          overflow: hidden;
        }
      `}</style>

      {/* Player wrapper - minimal cropping to hide YouTube branding */}
      <div
        className="player-wrapper absolute pointer-events-none"
        style={{
          top: '-40px',
          left: '-1px',
          right: '-1px',
          bottom: '-20px',
          overflow: 'hidden'
        }}
      />

      {/* Full overlay to block YouTube interactions and cover edges */}
      <div className="absolute inset-0 z-10" />

      {/* Click to play/pause - positioned above everything except controls */}
      {hasStarted && (
        <div
          className="absolute inset-0 z-15 cursor-pointer"
          onClick={togglePlay}
          style={{ zIndex: 15 }}
        />
      )}

      {/* Initial State - Thumbnail with play button */}
      {!hasStarted && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          style={{ zIndex: 25 }}
          onClick={togglePlay}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />

          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />
          <div className="absolute inset-0 bg-black/30" />

          {/* Play button - Hexagonal style */}
          <div className="relative z-30 group">
            <div className="w-24 h-24 relative flex items-center justify-center">
              {/* Outer glow */}
              <div className="absolute inset-0 bg-[#BFFF00]/20 rounded-2xl blur-xl group-hover:bg-[#BFFF00]/30 transition-all duration-500" />

              {/* Main button */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-[#BFFF00] to-[#9ACC00] rounded-2xl flex items-center justify-center shadow-lg shadow-[#BFFF00]/25 group-hover:scale-110 group-hover:shadow-[#BFFF00]/40 transition-all duration-300 rotate-0 group-hover:rotate-3">
                <Play className="w-9 h-9 text-black ml-1" fill="black" strokeWidth={0} />
              </div>
            </div>
          </div>

          {/* Title at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white/90 text-lg font-medium">{title}</p>
          </div>
        </div>
      )}

      {/* End State - Replay */}
      {hasEnded && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
          style={{ zIndex: 25 }}
          onClick={togglePlay}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />

          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Replay button */}
          <div className="relative z-30 group mb-4">
            <div className="w-24 h-24 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#BFFF00]/20 rounded-2xl blur-xl group-hover:bg-[#BFFF00]/30 transition-all duration-500" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-[#BFFF00] to-[#9ACC00] rounded-2xl flex items-center justify-center shadow-lg shadow-[#BFFF00]/25 group-hover:scale-110 transition-all duration-300">
                <RotateCcw className="w-8 h-8 text-black" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <p className="text-white text-xl font-semibold z-30">Ver de nuevo</p>
          <p className="text-white/60 text-sm mt-1 z-30">{title}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 35 }}>
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-[#BFFF00]/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-[#BFFF00] rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Controls */}
      {hasStarted && !hasEnded && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 transition-all duration-300",
            showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ zIndex: 30 }}
        >
          {/* Gradient background */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

          <div className="relative px-4 pb-4 pt-12">
            {/* Progress bar */}
            <div
              ref={progressRef}
              className="relative h-6 flex items-center cursor-pointer group mb-2"
              onClick={handleProgressClick}
              onMouseMove={handleProgressHover}
              onMouseLeave={() => setHoverTime(null)}
            >
              {/* Track background */}
              <div className="absolute left-0 right-0 h-1 bg-white/20 rounded-full group-hover:h-1.5 transition-all" />

              {/* Progress fill */}
              <div
                className="absolute left-0 h-1 bg-[#BFFF00] rounded-full group-hover:h-1.5 transition-all"
                style={{ width: `${progress}%` }}
              />

              {/* Thumb */}
              <div
                className="absolute w-3.5 h-3.5 bg-[#BFFF00] rounded-full shadow-lg shadow-black/50 opacity-0 group-hover:opacity-100 transition-all -translate-x-1/2"
                style={{ left: `${progress}%` }}
              />

              {/* Hover time tooltip */}
              {hoverTime !== null && (
                <div
                  className="absolute bottom-full mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded font-medium -translate-x-1/2"
                  style={{ left: hoverPosition }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Bottom controls */}
            <div className="flex items-center justify-between">
              {/* Left side */}
              <div className="flex items-center gap-1">
                {/* Play/Pause */}
                <button
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" fill="white" strokeWidth={0} />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" strokeWidth={0} />
                  )}
                </button>

                {/* Skip back */}
                <button
                  onClick={(e) => { e.stopPropagation(); skip(-10); }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  <SkipBack className="w-4 h-4 text-white" fill="white" strokeWidth={0} />
                </button>

                {/* Skip forward */}
                <button
                  onClick={(e) => { e.stopPropagation(); skip(10); }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  <SkipForward className="w-4 h-4 text-white" fill="white" strokeWidth={0} />
                </button>

                {/* Volume */}
                <div
                  className="flex items-center"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>

                  <div className={cn(
                    "overflow-hidden transition-all duration-200",
                    showVolumeSlider ? "w-20 opacity-100 ml-1" : "w-0 opacity-0"
                  )}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
                    />
                  </div>
                </div>

                {/* Time */}
                <span className="text-white/90 text-sm ml-2 tabular-nums font-medium">
                  {formatTime(currentTime)}
                  <span className="text-white/50 mx-1">/</span>
                  {formatTime(duration)}
                </span>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-1">
                {/* Fullscreen */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
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

      {/* Center Play/Pause button - shown when paused or on hover */}
      {hasStarted && !hasEnded && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300",
            showControls && !isPlaying ? "opacity-100" : "opacity-0"
          )}
          style={{ zIndex: 25 }}
        >
          <div className="w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" fill="white" strokeWidth={0} />
            ) : (
              <Play className="w-10 h-10 text-white ml-1" fill="white" strokeWidth={0} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
