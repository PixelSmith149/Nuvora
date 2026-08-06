// lib/st/urls.ts

const PLATFORM_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "nu-vora.app";

/**
 * Returns the public URL for a published site.
 * Production: https://{slug}.nu-vora.app
 * Local:      http://{slug}.localhost:3000  (or fallback)
 */
export function getSitePublicUrl(siteSlug: string): string {
  if (!siteSlug) return "";

  const isLocal =
    typeof window !== "undefined"
      ? window.location.hostname.includes("localhost") ||
        window.location.hostname.includes("127.0.0.1")
      : process.env.NODE_ENV === "development";

  if (isLocal) {
    // Easy local testing – still works with the old path
    return `http://localhost:3000/s/${siteSlug}`;
  }

  return `https://${siteSlug}.${PLATFORM_DOMAIN}`;
}

/**
 * Returns only the hostname part (useful for DomainGuide)
 */
export function getSiteHostname(siteSlug: string): string {
  return `${siteSlug}.${PLATFORM_DOMAIN}`;
}