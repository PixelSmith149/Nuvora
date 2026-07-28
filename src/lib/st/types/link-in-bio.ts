// lib/st/types/link-in-bio.ts

// ─── Template Types ──────────────────────────────────────────────

export interface TemplateStyles {
	background: string;
	cardBackground: string;
	textColor: string;
	buttonStyle: string;
	avatarStyle: string;
	fontFamily: string;
	accentColor: string;
	coverStyle?: string;
	cardBorder: string; // border style
	cardShadow: string; // shadow style
	buttonHover: string; // hover effect
	avatarBorder: string; // avatar border
	animation: string; // entry animation
	backgroundType:
		| "solid"
		| "gradient"
		| "animated-gradient"
		| "pattern"
		| "blurred";
	backgroundValue: string; // CSS value for background
	typographyWeight: string; // font weight
	typographyCase: string; // text transform
	spacing: "compact" | "medium" | "generous";
	cardRadius: string; // border radius
	cardBorderWidth: string;
}

export interface TemplateDefaultSettings {
	showSocials: boolean;
	showContact: boolean;
	buttonRadius: string;
	animation: string;
	avatarShape: "circle" | "rounded" | "square";
}

export interface Template {
	id: string;
	name: string;
	description: string;
	previewImage: string;
	styles: TemplateStyles;
	defaultSettings: TemplateDefaultSettings;
	category: "minimal" | "luxury" | "creative" | "professional" | "playful";
}

// ─── Database Types ──────────────────────────────────────────────

export interface LinkInBioProfile {
	id: string;
	user_id: string;
	username: string;
	template_id: string;
	display_name: string | null;
	bio: string | null;
	avatar_url: string | null;
	cover_image_url: string | null;
	theme_color: string;
	template_settings: Record<string, any>;
	contact_email: string | null;
	contact_phone: string | null;
	contact_location: string | null;
	is_published: boolean;
	view_count: number;
	custom_domain: string | null;
	blog_text: string | null;
	created_at: string;
	updated_at: string;
}

export interface LinkInBioLink {
	id: string;
	profile_id: string;
	platform: string;
	title: string;
	url: string;
	icon: string | null;
	order_index: number;
	is_active: boolean;
	clicks: number;
	created_at: string;
	updated_at: string;
	description: string;
}

export interface LinkInBioSocial {
	id: string;
	profile_id: string;
	platform: string;
	url: string;
	created_at: string;
	updated_at: string;
	display_name: string;
}

// ─── Supported Platforms ─────────────────────────────────────────

export const SOCIAL_PLATFORMS = [
	{ id: "instagram", label: "Instagram", icon: "📷", color: "#E4405F" },
	{ id: "youtube", label: "YouTube", icon: "🎥", color: "#FF0000" },
	{ id: "twitter", label: "Twitter", icon: "🐦", color: "#1DA1F2" },
	{ id: "tiktok", label: "TikTok", icon: "🎵", color: "#000000" },
	{ id: "facebook", label: "Facebook", icon: "👍", color: "#1877F2" },
	{ id: "linkedin", label: "LinkedIn", icon: "💼", color: "#0A66C2" },
	{ id: "github", label: "GitHub", icon: "🐙", color: "#181717" },
	{ id: "pinterest", label: "Pinterest", icon: "📌", color: "#BD081C" },
	{ id: "snapchat", label: "Snapchat", icon: "👻", color: "#FFFC00" },
	{ id: "telegram", label: "Telegram", icon: "✈️", color: "#26A5E4" },
	{ id: "whatsapp", label: "WhatsApp", icon: "💬", color: "#25D366" },
	{ id: "discord", label: "Discord", icon: "🎮", color: "#5865F2" },
	{ id: "reddit", label: "Reddit", icon: "🤖", color: "#FF4500" },
	{ id: "twitch", label: "Twitch", icon: "🎮", color: "#9146FF" },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]["id"];

export const LINK_PLATFORMS = [
	{ id: "website", label: "Website", icon: "🌐" },
	{ id: "shop", label: "Shop", icon: "🛍️" },
	{ id: "portfolio", label: "Portfolio", icon: "🎨" },
	{ id: "blog", label: "Blog", icon: "📝" },
	{ id: "podcast", label: "Podcast", icon: "🎙️" },
	{ id: "course", label: "Course", icon: "📚" },
	{ id: "event", label: "Event", icon: "📅" },
	{ id: "donation", label: "Donation", icon: "❤️" },
	{ id: "custom", label: "Custom Link", icon: "🔗" },
] as const;

// ─── Template Configuration ──────────────────────────────────────

export const TEMPLATES: Template[] = [
	// ─── 1. Minimal ──────────────────────────────────────────────
	{
		id: "minimal",
		name: "Minimal",
		description: "Clean, airy, spacious, ultra-minimalist.",
		previewImage: "/templates/minimal-preview.png",
		category: "minimal",
		styles: {
			background: "bg-white",
			cardBackground: "bg-transparent",
			textColor: "text-gray-900",
			buttonStyle:
				"text-gray-700 hover:text-gray-900 border-b-2 border-gray-300 hover:border-gray-700 rounded-none",
			avatarStyle: "rounded-full w-20 h-20 border-0 shadow-none",
			fontFamily: "font-light",
			accentColor: "#000000",
			// ✅ Distinct
			cardBorder: "border-0",
			cardShadow: "shadow-none",
			buttonHover: "hover:translate-x-1",
			avatarBorder: "border-0",
			animation: "fade-in",
			backgroundType: "solid",
			backgroundValue: "#ffffff",
			typographyWeight: "font-light",
			typographyCase: "normal-case",
			spacing: "generous",
			cardRadius: "rounded-none",
			cardBorderWidth: "border-0",
		},
		defaultSettings: {
			showSocials: true,
			showContact: true,
			buttonRadius: "rounded-none",
			animation: "fade-in",
			avatarShape: "circle",
		},
	},

	// ─── 2. Dark Luxe ────────────────────────────────────────────
	{
		id: "dark-luxe",
		name: "Dark Luxe",
		description: "Premium, dark, golden accents, luxury brand.",
		previewImage: "/templates/dark-luxe-preview.png",
		category: "luxury",
		styles: {
			background: "bg-gradient-to-br from-gray-900 to-black",
			cardBackground: "bg-white/5 backdrop-blur-sm border border-amber-500/20",
			textColor: "text-amber-100",
			buttonStyle:
				"bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-bold",
			avatarStyle:
				"rounded-full border-2 border-amber-400 shadow-xl shadow-amber-400/20",
			fontFamily: "font-serif",
			accentColor: "#d4af37",
			// ✅ Distinct
			cardBorder: "border-2 border-amber-500/30",
			cardShadow: "shadow-2xl shadow-amber-500/10",
			buttonHover: "hover:scale-105 hover:shadow-lg hover:shadow-amber-400/30",
			avatarBorder: "border-2 border-amber-400",
			animation: "fade-in-up",
			backgroundType: "gradient",
			backgroundValue: "from-gray-900 to-black",
			typographyWeight: "font-bold",
			typographyCase: "normal-case",
			spacing: "generous",
			cardRadius: "rounded-2xl",
			cardBorderWidth: "border-2",
		},
		defaultSettings: {
			showSocials: true,
			showContact: true,
			buttonRadius: "rounded-full",
			animation: "fade-in-up",
			avatarShape: "circle",
		},
	},

	// ─── 3. Glass ────────────────────────────────────────────────
	{
		id: "glass",
		name: "Glass",
		description: "Modern, frosted glass, translucent, tech-forward.",
		previewImage: "/templates/glass-preview.png",
		category: "creative",
		styles: {
			background:
				"bg-gradient-to-br from-sky-500/30 via-purple-500/30 to-pink-500/30 backdrop-blur-3xl",
			cardBackground: "bg-white/10 backdrop-blur-2xl border border-white/20",
			textColor: "text-white",
			buttonStyle:
				"bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20",
			avatarStyle: "rounded-full border-2 border-white/30 shadow-xl",
			fontFamily: "font-sans",
			accentColor: "#8b5cf6",
			// ✅ Distinct
			cardBorder: "border border-white/20",
			cardShadow: "shadow-xl shadow-white/5",
			buttonHover: "hover:shadow-lg hover:shadow-purple-500/20",
			avatarBorder: "border-2 border-white/30",
			animation: "fade-in",
			backgroundType: "blurred",
			backgroundValue: "from-sky-500/30 via-purple-500/30 to-pink-500/30",
			typographyWeight: "font-light",
			typographyCase: "normal-case",
			spacing: "medium",
			cardRadius: "rounded-2xl",
			cardBorderWidth: "border",
		},
		defaultSettings: {
			showSocials: true,
			showContact: true,
			buttonRadius: "rounded-xl",
			animation: "fade-in",
			avatarShape: "circle",
		},
	},

	// ─── 4. Gradient ─────────────────────────────────────────────
	{
		id: "gradient",
		name: "Gradient",
		description: "Vibrant, creative, bold, artistic.",
		previewImage: "/templates/gradient-preview.png",
		category: "creative",
		styles: {
			background:
				"bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 animate-gradient",
			cardBackground: "bg-white/10 backdrop-blur-sm border border-white/20",
			textColor: "text-white",
			buttonStyle:
				"bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-300 hover:to-purple-300 text-white font-bold",
			avatarStyle: "rounded-full border-2 border-white shadow-xl",
			fontFamily: "font-bold",
			accentColor: "#ec4899",
			// ✅ Distinct
			cardBorder: "border-2 border-white/20",
			cardShadow: "shadow-2xl shadow-purple-500/20",
			buttonHover: "hover:scale-105 hover:shadow-lg hover:shadow-purple-400/30",
			avatarBorder: "border-2 border-white",
			animation: "fade-in-up",
			backgroundType: "animated-gradient",
			backgroundValue: "from-pink-500 via-purple-500 to-indigo-500",
			typographyWeight: "font-bold",
			typographyCase: "normal-case",
			spacing: "medium",
			cardRadius: "rounded-2xl",
			cardBorderWidth: "border-2",
		},
		defaultSettings: {
			showSocials: true,
			showContact: true,
			buttonRadius: "rounded-lg",
			animation: "fade-in-up",
			avatarShape: "circle",
		},
	},

	// ─── 5. Bold ──────────────────────────────────────────────────
	{
		id: "bold",
		name: "Bold",
		description: "Strong, high-contrast, impactful, confident.",
		previewImage: "/templates/bold-preview.png",
		category: "creative",
		styles: {
			background: "bg-black",
			cardBackground: "bg-zinc-900 border-2 border-zinc-700",
			textColor: "text-white",
			buttonStyle:
				"bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-wide",
			avatarStyle:
				"rounded-full border-4 border-lime-400 shadow-xl shadow-lime-400/20",
			fontFamily: "font-black",
			accentColor: "#a3e635",
			// ✅ Distinct
			cardBorder: "border-2 border-zinc-700",
			cardShadow: "shadow-2xl shadow-lime-400/5",
			buttonHover: "hover:scale-110 hover:shadow-lg hover:shadow-lime-400/30",
			avatarBorder: "border-4 border-lime-400",
			animation: "fade-in",
			backgroundType: "solid",
			backgroundValue: "#000000",
			typographyWeight: "font-black",
			typographyCase: "uppercase",
			spacing: "compact",
			cardRadius: "rounded-none",
			cardBorderWidth: "border-2",
		},
		defaultSettings: {
			showSocials: true,
			showContact: true,
			buttonRadius: "rounded-none",
			animation: "fade-in",
			avatarShape: "circle",
		},
	},

	// ─── 6. Elegant ──────────────────────────────────────────────
	{
		id: "elegant",
		name: "Elegant",
		description: "Soft, romantic, refined, timeless.",
		previewImage: "/templates/elegant-preview.png",
		category: "luxury",
		styles: {
			background: "bg-gradient-to-br from-rose-50 to-amber-50",
			cardBackground: "bg-white/80 backdrop-blur-sm border border-rose-200/30",
			textColor: "text-rose-900",
			buttonStyle:
				"bg-rose-100 border border-rose-200 hover:bg-rose-200 text-rose-800 font-serif",
			avatarStyle: "rounded-full border-2 border-rose-200 shadow-lg",
			fontFamily: "font-serif",
			accentColor: "#f43f5e",
			// ✅ Distinct
			cardBorder: "border-2 border-rose-200/30",
			cardShadow: "shadow-xl shadow-rose-100/50",
			buttonHover: "hover:shadow-lg hover:shadow-rose-200/50",
			avatarBorder: "border-2 border-rose-200",
			animation: "fade-in",
			backgroundType: "gradient",
			backgroundValue: "from-rose-50 to-amber-50",
			typographyWeight: "font-medium",
			typographyCase: "normal-case",
			spacing: "generous",
			cardRadius: "rounded-2xl",
			cardBorderWidth: "border-2",
		},
		defaultSettings: {
			showSocials: true,
			showContact: true,
			buttonRadius: "rounded-full",
			animation: "fade-in",
			avatarShape: "circle",
		},
	},

	// ─── 7. Neon ──────────────────────────────────────────────────
	{
		id: "neon",
		name: "Neon",
		description: "Electric, futuristic, nightclub, gaming.",
		previewImage: "/templates/neon-preview.png",
		category: "creative",
		styles: {
			background: "bg-black",
			cardBackground: "bg-black/80 border-2 border-cyan-400/30",
			textColor: "text-cyan-100",
			buttonStyle:
				"border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]",
			avatarStyle:
				"rounded-full border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]",
			fontFamily: "font-mono",
			accentColor: "#06b6d4",
			// ✅ Distinct
			cardBorder: "border-2 border-cyan-400/30",
			cardShadow: "shadow-[0_0_40px_rgba(34,211,238,0.1)]",
			buttonHover:
				"hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]",
			avatarBorder: "border-2 border-cyan-400",
			animation: "fade-in",
			backgroundType: "solid",
			backgroundValue: "#000000",
			typographyWeight: "font-light",
			typographyCase: "normal-case",
			spacing: "medium",
			cardRadius: "rounded-xl",
			cardBorderWidth: "border-2",
		},
		defaultSettings: {
			showSocials: true,
			showContact: true,
			buttonRadius: "rounded-lg",
			animation: "fade-in",
			avatarShape: "circle",
		},
	},

	// ─── 8. Nature ───────────────────────────────────────────────
	{
		id: "nature",
		name: "Nature",
		description: "Organic, earthy, calming, wellness.",
		previewImage: "/templates/nature-preview.png",
		category: "minimal",
		styles: {
			background: "bg-gradient-to-br from-emerald-50 to-amber-50",
			cardBackground:
				"bg-white/80 backdrop-blur-sm border border-emerald-200/30 rounded-3xl",
			textColor: "text-emerald-900",
			buttonStyle:
				"bg-emerald-100 border border-emerald-200 hover:bg-emerald-200 text-emerald-800 rounded-2xl",
			avatarStyle: "rounded-full border-2 border-emerald-200 shadow-lg",
			fontFamily: "font-sans",
			accentColor: "#059669",
			// ✅ Distinct
			cardBorder: "border-2 border-emerald-200/30",
			cardShadow: "shadow-xl shadow-emerald-100/50",
			buttonHover: "hover:shadow-lg hover:shadow-emerald-200/50",
			avatarBorder: "border-2 border-emerald-200",
			animation: "fade-in-up",
			backgroundType: "gradient",
			backgroundValue: "from-emerald-50 to-amber-50",
			typographyWeight: "font-light",
			typographyCase: "normal-case",
			spacing: "generous",
			cardRadius: "rounded-3xl",
			cardBorderWidth: "border-2",
		},
		defaultSettings: {
			showSocials: true,
			showContact: true,
			buttonRadius: "rounded-full",
			animation: "fade-in-up",
			avatarShape: "circle",
		},
	},

	// ─── 9. Professional ──────────────────────────────────────────
	{
		id: "professional",
		name: "Professional",
		description: "Corporate, clean, trustworthy, business.",
		previewImage: "/templates/professional-preview.png",
		category: "professional",
		styles: {
			background: "bg-slate-50",
			cardBackground: "bg-white border border-slate-200 shadow-sm",
			textColor: "text-slate-900",
			buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
			avatarStyle: "rounded-full border-2 border-slate-200 shadow-sm",
			fontFamily: "font-sans",
			accentColor: "#2563eb",
			// ✅ Distinct
			cardBorder: "border-2 border-slate-200",
			cardShadow: "shadow-sm",
			buttonHover: "hover:shadow-md",
			avatarBorder: "border-2 border-slate-200",
			animation: "fade-in",
			backgroundType: "solid",
			backgroundValue: "#f1f5f9",
			typographyWeight: "font-normal",
			typographyCase: "normal-case",
			spacing: "medium",
			cardRadius: "rounded-lg",
			cardBorderWidth: "border-2",
		},
		defaultSettings: {
			showSocials: true,
			showContact: true,
			buttonRadius: "rounded-lg",
			animation: "fade-in",
			avatarShape: "circle",
		},
	},

	// ─── 10. Playful ──────────────────────────────────────────────
	{
		id: "playful",
		name: "Playful",
		description: "Fun, colorful, whimsical, child-like.",
		previewImage: "/templates/playful-preview.png",
		category: "playful",
		styles: {
			background: "bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100",
			cardBackground:
				"bg-white/80 backdrop-blur-sm border-2 border-yellow-200/50 rounded-3xl shadow-[0_8px_30px_rgba(255,200,0,0.2)]",
			textColor: "text-gray-800",
			buttonStyle:
				"bg-gradient-to-r from-yellow-400 to-pink-400 hover:from-yellow-300 hover:to-pink-300 text-white font-bold rounded-3xl shadow-lg",
			avatarStyle:
				"rounded-full border-4 border-yellow-300 shadow-xl shadow-yellow-200/50",
			fontFamily: "font-sans",
			accentColor: "#f59e0b",
			// ✅ Distinct
			cardBorder: "border-4 border-yellow-200/50",
			cardShadow: "shadow-[0_8px_30px_rgba(255,200,0,0.2)]",
			buttonHover:
				"hover:scale-110 hover:rotate-2 hover:shadow-2xl hover:shadow-yellow-200/50",
			avatarBorder: "border-4 border-yellow-300",
			animation: "bounce-in",
			backgroundType: "pattern",
			backgroundValue: "from-yellow-100 via-pink-100 to-blue-100",
			typographyWeight: "font-bold",
			typographyCase: "normal-case",
			spacing: "medium",
			cardRadius: "rounded-3xl",
			cardBorderWidth: "border-4",
		},
		defaultSettings: {
			showSocials: true,
			showContact: true,
			buttonRadius: "rounded-full",
			animation: "bounce-in",
			avatarShape: "circle",
		},
	},
];

// ─── Helper Functions ────────────────────────────────────────────
export const DEFAULT_TEMPLATE_STYLES: TemplateStyles = {
	background: "bg-black",
	cardBackground: "bg-white/10 backdrop-blur-sm",
	textColor: "text-white",
	buttonStyle: "bg-white/10 hover:bg-white/20 rounded-full text-white",
	avatarStyle: "rounded-full border-4 border-white shadow-lg",
	fontFamily: "font-sans",
	accentColor: "#10b981",
	cardBorder: "border border-white/10",
	cardShadow: "shadow-lg",
	buttonHover: "hover:scale-105",
	avatarBorder: "border-2 border-white",
	animation: "fade-in",
	backgroundType: "solid",
	backgroundValue: "#000000",
	typographyWeight: "font-normal",
	typographyCase: "normal-case",
	spacing: "medium",
	cardRadius: "rounded-2xl",
	cardBorderWidth: "border",
};

// ─── Update getTemplate to always return a template ──────────
export function getTemplate(id: string): Template {
	const template = TEMPLATES.find((t) => t.id === id);
	if (!template) {
		// Return default template
		return {
			id: "minimal",
			name: "Minimal",
			description: "Clean, simple, and elegant",
			previewImage: "/templates/minimal-preview.png",
			category: "minimal",
			styles: DEFAULT_TEMPLATE_STYLES,
			defaultSettings: {
				showSocials: true,
				showContact: true,
				buttonRadius: "rounded-full",
				animation: "fade-in",
				avatarShape: "circle",
			},
		};
	}
	return template;
}

export function getTemplatesByCategory(
	category: Template["category"],
): Template[] {
	return TEMPLATES.filter((t) => t.category === category);
}

export function getSocialPlatform(platformId: string) {
	return SOCIAL_PLATFORMS.find((p) => p.id === platformId);
}

export function getLinkPlatform(platformId: string) {
	return LINK_PLATFORMS.find((p) => p.id === platformId);
}
