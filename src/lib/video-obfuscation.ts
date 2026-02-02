/**
 * Video URL obfuscation utilities
 *
 * This provides basic obfuscation to prevent casual inspection of video URLs
 * in the browser's element inspector. Note: This is NOT encryption and a
 * determined user can still find the URL through network requests or debugging.
 */

// Simple XOR key for obfuscation (not for security, just obfuscation)
const OBFUSCATION_KEY = 'V1r4l4c4d3my';

/**
 * Obfuscate a string using XOR and base64
 */
export function obfuscateVideoId(videoId: string): string {
  if (!videoId) return '';

  // XOR each character with the key
  let result = '';
  for (let i = 0; i < videoId.length; i++) {
    const charCode = videoId.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
    result += String.fromCharCode(charCode);
  }

  // Convert to base64 and add a prefix to identify obfuscated IDs
  return 'vob_' + btoa(result);
}

/**
 * Deobfuscate a video ID
 */
export function deobfuscateVideoId(obfuscatedId: string): string {
  if (!obfuscatedId) return '';

  // Check if it's an obfuscated ID
  if (!obfuscatedId.startsWith('vob_')) {
    return obfuscatedId; // Return as-is if not obfuscated
  }

  try {
    // Remove prefix and decode base64
    const encoded = obfuscatedId.slice(4);
    const decoded = atob(encoded);

    // XOR to get original
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
      result += String.fromCharCode(charCode);
    }

    return result;
  } catch {
    return obfuscatedId;
  }
}

/**
 * Obfuscate a full video URL (YouTube or Vimeo)
 * Returns the URL with the video ID replaced by an obfuscated version
 */
export function obfuscateVideoUrl(url: string): string {
  if (!url) return '';

  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Just the ID
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      const videoId = match[1];
      const obfuscatedId = obfuscateVideoId(videoId);
      return url.replace(videoId, obfuscatedId);
    }
  }

  // Vimeo patterns
  const vimeoPattern = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    const obfuscatedId = obfuscateVideoId(videoId);
    return url.replace(videoId, obfuscatedId);
  }

  return url;
}

/**
 * Server-side only: Obfuscate video URL for sending to client
 */
export function obfuscateForClient(videoUrl: string | null): string | null {
  if (!videoUrl) return null;
  return obfuscateVideoUrl(videoUrl);
}
