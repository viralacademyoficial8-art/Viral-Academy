"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, Loader2, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { deobfuscateVideoId } from "@/lib/video-obfuscation";

interface VimeoPlayerProps {
  videoId: string;
  hash?: string;
  title?: string;
  className?: string;
}

// Extract Vimeo video ID and hash from various URL/embed formats (supports obfuscated IDs)
export function getVimeoVideoInfo(input: string): { videoId: string; hash?: string } | null {
  if (!input) return null;

  // Check if the entire input is an obfuscated ID
  if (input.startsWith('vob_')) {
    const deobfuscated = deobfuscateVideoId(input);
    // After deobfuscation, try to parse it again
    return getVimeoVideoInfo(deobfuscated);
  }

  // Pattern 1: Full embed code - extract src URL
  const iframeSrcMatch = input.match(/src=["']([^"']+)["']/);
  if (iframeSrcMatch) {
    input = iframeSrcMatch[1];
  }

  // Pattern 2: player.vimeo.com/video/ID?h=HASH (ID might be obfuscated)
  const playerMatch = input.match(/player\.vimeo\.com\/video\/([^?\/]+)(?:\?h=([a-zA-Z0-9]+))?/);
  if (playerMatch) {
    return {
      videoId: deobfuscateVideoId(playerMatch[1]),
      hash: playerMatch[2] ? deobfuscateVideoId(playerMatch[2]) : undefined,
    };
  }

  // Pattern 3: vimeo.com/ID or vimeo.com/ID/HASH
  const vimeoMatch = input.match(/vimeo\.com\/([^\/]+)(?:\/([a-zA-Z0-9]+))?/);
  if (vimeoMatch) {
    return {
      videoId: deobfuscateVideoId(vimeoMatch[1]),
      hash: vimeoMatch[2] ? deobfuscateVideoId(vimeoMatch[2]) : undefined,
    };
  }

  // Pattern 4: Just the video ID (might be obfuscated)
  if (/^\d+$/.test(input.trim())) {
    return { videoId: input.trim() };
  }

  return null;
}

// Check if a URL/embed is from Vimeo
export function isVimeoUrl(input: string): boolean {
  if (!input) return false;
  return input.includes("vimeo.com") || input.includes("player.vimeo.com");
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

// Load Vimeo Player SDK
let sdkLoaded = false;
let sdkLoading = false;
const sdkCallbacks: (() => void)[] = [];

function loadVimeoSDK(): Promise<void> {
  return new Promise((resolve) => {
    if (sdkLoaded && window.Vimeo) {
      resolve();
      return;
    }

    sdkCallbacks.push(resolve);

    if (sdkLoading) {
      return;
    }

    sdkLoading = true;

    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.onload = () => {
      sdkLoaded = true;
      sdkCallbacks.forEach((cb) => cb());
      sdkCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

// Extend Window interface for Vimeo SDK
declare global {
  interface Window {
    Vimeo: {
      Player: new (
        element: HTMLElement | string,
        options?: {
          id?: number;
          url?: string;
          width?: number;
          height?: number;
          autopause?: boolean;
          autoplay?: boolean;
          background?: boolean;
          byline?: boolean;
          color?: string;
          controls?: boolean;
          dnt?: boolean;
          loop?: boolean;
          muted?: boolean;
          pip?: boolean;
          playsinline?: boolean;
          portrait?: boolean;
          responsive?: boolean;
          speed?: boolean;
          title?: boolean;
          transparent?: boolean;
        }
      ) => VimeoPlayer;
    };
  }
}

interface VimeoPlayer {
  play(): Promise<void>;
  pause(): Promise<void>;
  setCurrentTime(seconds: number): Promise<number>;
  getCurrentTime(): Promise<number>;
  getDuration(): Promise<number>;
  getVolume(): Promise<number>;
  setVolume(volume: number): Promise<number>;
  getMuted(): Promise<boolean>;
  setMuted(muted: boolean): Promise<boolean>;
  destroy(): void;
  on(event: string, callback: (data?: { seconds?: number; percent?: number; duration?: number }) => void): void;
  off(event: string, callback?: (data?: { seconds?: number; percent?: number; duration?: number }) => void): void;
}

export function VimeoPlayer({
  videoId: obfuscatedVideoId,
  hash: obfuscatedHash,
  title = "Video",
  className,
}: VimeoPlayerProps) {
  // Deobfuscate video ID and hash (handles both obfuscated and plain IDs)
  const videoId = useMemo(() => deobfuscateVideoId(obfuscatedVideoId), [obfuscatedVideoId]);
  const hash = useMemo(() => obfuscatedHash ? deobfuscateVideoId(obfuscatedHash) : undefined, [obfuscatedHash]);

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
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VimeoPlayer | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const playerContainerId = useRef(`vimeo-player-${videoId}-${Math.random().toString(36).slice(2)}`);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize player
  const initPlayer = useCallback(async () => {
    setIsLoading(true);

    await loadVimeoSDK();

    const container = containerRef.current;
    if (!container) return;

    const playerWrapper = container.querySelector(".player-wrapper");
    if (!playerWrapper) return;

    // Clear existing player
    const existingDiv = document.getElementById(playerContainerId.current);
    if (existingDiv) {
      existingDiv.remove();
    }

    const playerDiv = document.createElement("div");
    playerDiv.id = playerContainerId.current;
    playerDiv.style.position = "absolute";
    playerDiv.style.top = "0";
    playerDiv.style.left = "0";
    playerDiv.style.width = "100%";
    playerDiv.style.height = "100%";
    playerWrapper.appendChild(playerDiv);

    // Build video URL with hash if provided
    let videoUrl = `https://player.vimeo.com/video/${videoId}`;
    if (hash) {
      videoUrl += `?h=${hash}`;
    }

    const player = new window.Vimeo.Player(playerDiv, {
      url: videoUrl,
      responsive: true,
      controls: false,
      playsinline: true,
      dnt: true,
      title: false,
      byline: false,
      portrait: false,
    });

    playerRef.current = player;

    player.on("loaded", async () => {
      setIsLoading(false);
      const dur = await player.getDuration();
      setDuration(dur);
      const vol = await player.getVolume();
      setVolume(vol * 100);
      player.play();
    });

    player.on("play", () => {
      setIsPlaying(true);
      setHasEnded(false);
      setHasStarted(true);
    });

    player.on("pause", () => {
      setIsPlaying(false);
    });

    player.on("ended", () => {
      setIsPlaying(false);
      setHasEnded(true);
    });

    player.on("timeupdate", (data) => {
      if (data?.seconds !== undefined) {
        setCurrentTime(data.seconds);
      }
    });

    player.on("bufferstart", () => {
      setIsLoading(true);
    });

    player.on("bufferend", () => {
      setIsLoading(false);
    });

    player.on("error", () => {
      setIsLoading(false);
    });
  }, [videoId, hash]);

  const togglePlay = useCallback(async () => {
    if (!hasStarted) {
      initPlayer();
      return;
    }

    if (hasEnded) {
      await playerRef.current?.setCurrentTime(0);
      await playerRef.current?.play();
      setHasEnded(false);
      return;
    }

    if (isPlaying) {
      await playerRef.current?.pause();
    } else {
      await playerRef.current?.play();
    }
  }, [hasStarted, hasEnded, isPlaying, initPlayer]);

  const handleProgressClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration || !playerRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    await playerRef.current.setCurrentTime(newTime);
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

  const handleVolumeChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    await playerRef.current?.setVolume(newVolume / 100);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
      await playerRef.current?.setMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(async () => {
    if (isMuted) {
      await playerRef.current?.setMuted(false);
      await playerRef.current?.setVolume(volume > 0 ? volume / 100 : 0.5);
      setIsMuted(false);
      if (volume === 0) setVolume(50);
    } else {
      await playerRef.current?.setMuted(true);
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const skip = useCallback(async (seconds: number) => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    await playerRef.current.setCurrentTime(newTime);
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
      {/* CSS to hide Vimeo branding */}
      <style>{`
        .player-wrapper iframe {
          pointer-events: none !important;
        }
        .player-wrapper {
          overflow: hidden;
        }
      `}</style>

      {/* Player wrapper */}
      <div
        className="player-wrapper absolute inset-0 pointer-events-none"
        style={{ overflow: 'hidden' }}
      />

      {/* Full overlay to block Vimeo interactions */}
      <div className="absolute inset-0 z-10" />

      {/* Click to play/pause */}
      {hasStarted && (
        <div
          className="absolute inset-0 z-15 cursor-pointer"
          onClick={togglePlay}
          style={{ zIndex: 15 }}
        />
      )}

      {/* Initial State - Play button */}
      {!hasStarted && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-gradient-to-b from-neutral-900 to-neutral-950"
          style={{ zIndex: 25 }}
          onClick={togglePlay}
        >
          {/* Vimeo thumbnail */}
          <img
            src={`https://vumbnail.com/${videoId}.jpg`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />

          <div className="absolute inset-0 bg-black/30" />

          {/* Play button */}
          <div className="relative z-30 group">
            <div className="w-24 h-24 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#BFFF00]/20 rounded-2xl blur-xl group-hover:bg-[#BFFF00]/30 transition-all duration-500" />
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
              <div className="absolute left-0 right-0 h-1 bg-white/20 rounded-full group-hover:h-1.5 transition-all" />
              <div
                className="absolute left-0 h-1 bg-[#BFFF00] rounded-full group-hover:h-1.5 transition-all"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute w-3.5 h-3.5 bg-[#BFFF00] rounded-full shadow-lg shadow-black/50 opacity-0 group-hover:opacity-100 transition-all -translate-x-1/2"
                style={{ left: `${progress}%` }}
              />
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

                <button
                  onClick={(e) => { e.stopPropagation(); skip(-10); }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  <SkipBack className="w-4 h-4 text-white" fill="white" strokeWidth={0} />
                </button>

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

      {/* Center Play/Pause button */}
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
