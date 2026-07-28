// lib/services/platform-slug.ts

/**
 * Converts a clean platform name into a URL-safe slug.
 * Example: "Website Traffic from Brazil" → "website-traffic-from-brazil"
 */
export function platformToSlug(platform: string): string {
	if (!platform) return "";

	return platform
		.trim()
		.toLowerCase()
		.replace(/&/g, "and")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * Optional alias map for nicer short URLs.
 */
const PLATFORM_SLUG_ALIASES: Record<string, string> = {
	"website-traffic-from-brazil": "brazil-traffic",
	"website-traffic-from-canada": "canada-traffic",
	"website-traffic-from-china": "china-traffic",
	"website-traffic-from-czech": "czech-traffic",
	"website-traffic-from-egypt": "egypt-traffic",
	"website-traffic-from-france": "france-traffic",
	"website-traffic-from-germany": "germany-traffic",
	"website-traffic-from-uk": "uk-traffic",
	"website-traffic-from-india": "india-traffic",
	"website-traffic-from-indonesia": "indonesia-traffic",
	"website-traffic-from-italy": "italy-traffic",
	"website-traffic-from-japan": "japan-traffic",
	"website-traffic-from-south-korea": "south-korea-traffic",
	"website-traffic-from-mexico": "mexico-traffic",
	"website-traffic-from-netherlands": "netherlands-traffic",
	"website-traffic-from-pakistan": "pakistan-traffic",
	"website-traffic-from-poland": "poland-traffic",
	"website-traffic-from-portugal": "portugal-traffic",
	"website-traffic-from-romania": "romania-traffic",
	"website-traffic-from-russia": "russia-traffic",
	"website-traffic-from-singapore": "singapore-traffic",
	"website-traffic-from-thailand": "thailand-traffic",
	"website-traffic-from-taiwan": "taiwan-traffic",
	"website-traffic-from-turkey": "turkey-traffic",
	"website-traffic-from-ukraine": "ukraine-traffic",
	"website-traffic-from-usa": "usa-traffic",
	"website-traffic-from-vietnam": "vietnam-traffic",
	"website-traffic": "website-traffic",
	"mobile-app-installs": "mobile-app-installs",
};

/**
 * Returns the final public slug for a platform name.
 */
export function getPlatformSlug(platform: string): string {
	const baseSlug = platformToSlug(platform);
	return PLATFORM_SLUG_ALIASES[baseSlug] ?? baseSlug;
}
