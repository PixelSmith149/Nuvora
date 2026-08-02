/**
 * Detects JAP-style "Auto" services from title/name.
 * Examples: "TikTok Auto Shares", "[TikTok][Auto][Views]", "Instagram Auto Likes"
 */
export function isAutoService(nameOrTitle: string | null | undefined): boolean {
  if (!nameOrTitle) return false;
  return /\bauto\b/i.test(nameOrTitle) || /\[auto\]/i.test(nameOrTitle);
}

/** Optional: extract username from a profile / video URL */
export function extractUsernameFromTarget(target: string): string | null {
  const t = target.trim();

  // @handle
  if (/^@[\w.-]+$/.test(t)) return t.slice(1);

  // tiktok.com/@user/...
  const tiktok = t.match(/tiktok\.com\/@([\w.-]+)/i);
  if (tiktok?.[1]) return tiktok[1];

  // instagram.com/user/
  const ig = t.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  if (ig?.[1] && ig[1] !== "p" && ig[1] !== "reel") return ig[1];

  // youtube.com/@user
  const yt = t.match(/youtube\.com\/@([\w.-]+)/i);
  if (yt?.[1]) return yt[1];

  return null;
}