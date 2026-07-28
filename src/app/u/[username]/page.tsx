// app/u/[username]/page.tsx

import {
	ChevronDown,
	ExternalLink,
	Link2,
	Mail,
	MapPin,
	Phone,
	Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	getLinks,
	getProfileByUsername,
	getSocials,
	trackView,
} from "@/lib/st/services/link-in-bio.service";
import { getTemplate, SOCIAL_PLATFORMS } from "@/lib/st/types/link-in-bio";

interface LinkInBioPageProps {
	params: {
		username: string;
	};
}
export async function generateMetadata({
	params,
}: LinkInBioPageProps): Promise<Metadata> {
	const { username } = await params;
	const profile = await getProfileByUsername(username);
	if (!profile || !profile.is_published) {
		return {
			title: "Link-in-Bio | Prime Boostage",
		};
	}
	return {
		title: profile.display_name || profile.username,
		description: profile.bio || "Link-in-Bio page on Prime Boostage",
		openGraph: {
			title: profile.display_name || profile.username,
			description: profile.bio || "Link-in-Bio page on Prime Boostage",
			images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
			url: `https://nuvora.com/u/${username}`,
		},
		twitter: {
			card: "summary",
			title: profile.display_name || profile.username,
			description: profile.bio || "Link-in-Bio page on Prime Boostage",
			images: profile.avatar_url ? [profile.avatar_url] : [],
		},
		robots: "index, follow",
	};
}
export default async function LinkInBioPage({ params }: LinkInBioPageProps) {
	const { username } = await params;
	const profile = await getProfileByUsername(username);
	if (!profile || !profile.is_published) {
		notFound();
	}
	await trackView(profile.id);
	const [links, socials] = await Promise.all([
		getLinks(profile.id),
		getSocials(profile.id),
	]);
	// ─── Get template and user settings ──────────────────────────
	const template = getTemplate(profile.template_id);
	const defaultStyles = template.styles;
	const userSettings = profile.template_settings || {};
	const styles = {
		...defaultStyles,
		...userSettings,
	};
	const themeColor = profile.theme_color || "#10b981";
	const blogText = profile.blog_text || "";
	const buttonStyle =
		userSettings.button_style ||
		styles.buttonStyle ||
		"bg-white/5 hover:bg-white/10";
	const buttonHover =
		userSettings.button_hover || styles.buttonHover || "hover:scale-105";
	const fontFamily =
		userSettings.font_family || styles.fontFamily || "font-sans";
	const textColor = userSettings.text_color || styles.textColor || "text-white";
	const cardBackground =
		userSettings.card_background ||
		styles.cardBackground ||
		"bg-zinc-900/80 backdrop-blur-sm";
	const cardBorder =
		userSettings.card_border || styles.cardBorder || "border border-white/5";
	const cardShadow =
		userSettings.card_shadow || styles.cardShadow || "shadow-2xl";
	const cardRadius =
		userSettings.card_radius || styles.cardRadius || "rounded-2xl";
	const cardBorderWidth =
		userSettings.card_border_width || styles.cardBorderWidth || "border";
	const avatarStyle =
		userSettings.avatar_style ||
		styles.avatarStyle ||
		"rounded-full border-4 border-zinc-900 shadow-xl";
	const avatarBorder =
		userSettings.avatar_border ||
		styles.avatarBorder ||
		"border-4 border-zinc-900";
	const typographyWeight =
		userSettings.typography_weight || styles.typographyWeight || "font-normal";
	const typographyCase =
		userSettings.typography_case || styles.typographyCase || "normal-case";
	const spacing = userSettings.spacing || styles.spacing || "medium";
	// ─── Get favicon ──────────────────────────────────────────────
	const getFavicon = (url: string) => {
		try {
			const domain = new URL(url).hostname;
			return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
		} catch {
			return null;
		}
	};
	// ─── Build background ─────────────────────────────────────────
	const getBackgroundClass = () => {
		const bgType = styles.backgroundType || "solid";
		const bgValue = styles.backgroundValue || "#000000";

		switch (bgType) {
			case "gradient":
				return `bg-gradient-to-br ${bgValue}`;
			case "animated-gradient":
				return `bg-gradient-to-br ${bgValue} bg-[length:400%_400%] animate-gradient`;
			case "blurred":
				return `bg-gradient-to-br ${bgValue} backdrop-blur-3xl`;
			case "pattern":
				return `bg-gradient-to-br ${bgValue} bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[length:20px_20px]`;
			case "solid":
			default:
				return `bg-[${themeColor}]`;
		}
	};
	// ─── Get spacing ──────────────────────────────────────────────
	const getSpacing = () => {
		switch (spacing) {
			case "compact":
				return "p-4 gap-3";
			case "generous":
				return "p-8 gap-8";
			default:
				return "p-6 gap-6";
		}
	};
	// ─── Helper to get platform color ────────────────────────────
	const getPlatformColor = (platform: string) => {
		const p = SOCIAL_PLATFORMS.find((s) => s.id === platform);
		return p?.color || "#71717a";
	};
	return (
		<div
			className={`min-h-screen flex items-start justify-center p-4 pt-8 ${fontFamily} ${getBackgroundClass()}`}
		>
			<div className="h-20" />
			<div className="w-full max-w-md">
				{/* ─── Card Container ────────────────────────────────────── */}
				<div
					className={`
            ${cardBackground}
            ${cardBorder}
            ${cardShadow}
            ${cardRadius}
            ${cardBorderWidth}
             overflow-y-auto
            ${getSpacing()}
            animate-in duration-700
             min-h-[92vh]
             max-h-[92vh] 
            scrollbar-thin
          `}
				>
					{/* ───────────────── Cover + Avatar ───────────────── */}
					<div className="relative -mx-2 -mt-2">
						<div className={`aspect-[3/1] overflow-hidden ${cardRadius}`}>
							{profile.cover_image_url ? (
								<img
									src={profile.cover_image_url}
									alt="Cover"
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full bg-gradient-to-r from-zinc-800 to-zinc-950 flex items-center justify-center">
									<span className="text-4xl opacity-20">🖼️</span>
								</div>
							)}
						</div>
						<div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
							{profile.avatar_url ? (
								<img
									src={profile.avatar_url}
									alt={profile.display_name || profile.username || "User"}
									className={`w-24 h-24 object-cover ${avatarStyle} ${avatarBorder}`}
								/>
							) : (
								<div
									className={`
                    w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-400
                    flex items-center justify-center text-3xl font-bold text-white
                    ${avatarStyle} ${avatarBorder}
                  `}
								>
									{(profile.display_name ||
										profile.username ||
										"U")[0].toUpperCase()}
								</div>
							)}
						</div>
					</div>
					{/* ───────────────── Spacer ────────────────────────────── */}
					<div className="h-14" />
					{/* ───────────────── Name + Bio ────────────────────────── */}
					<div className="text-center">
						<h1
							className={`text-2xl font-bold tracking-tight ${textColor} ${typographyWeight} ${typographyCase}`}
						>
							{profile.display_name || profile.username}
						</h1>
						{profile.bio && (
							<p
								className={`mt-2 max-w-xs mx-auto text-sm leading-relaxed ${textColor} opacity-70`}
							>
								{profile.bio}
							</p>
						)}
					</div>

					<div className="w-full flex justify-center px-4">
						<div className="w-full max-w-3xl">
							<div className="relative rounded-full py-2">
								<div className="h-[1px] w-full rounded-full bg-white/[0.01]" />
							</div>
						</div>
					</div>
					{/* ───────────────── Contact Button ────────────────────── */}
					{(profile.contact_email ||
						profile.contact_phone ||
						profile.contact_location) && (
						<div className="flex justify-center px-4">
							<details className="group relative">
								{/* Contact Button - No Background */}
								<summary
									className={`
          flex items-center gap-2
          ${buttonStyle}
          ${buttonHover}
          ${cardRadius}
          px-5 py-2.5 text-sm cursor-pointer list-none transition-all duration-300
          ${textColor}
          border border-white/10
          hover:border-white/20
          hover:scale-[1.02]
        `}
								>
									<Mail className="h-4 w-4" />
									<span className="font-medium">Contact</span>
									<ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" />
								</summary>

								{/* Modal Dropdown - Dark Background */}
								<div className="absolute left-1/2 top-full mt-3 w-[280px] -translate-x-1/2 z-50">
									{/* Backdrop blur overlay */}
									<div className="relative rounded-2xl bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
										{/* Premium gradient accent line */}
										<div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

										{/* Inner glow */}
										<div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />

										{/* Header */}
										<div className="px-4 pt-4 pb-2 border-b border-white/5">
											<p className="text-[10px] font-mono text-emerald-400/40 tracking-widest uppercase text-center">
												Contact Options
											</p>
										</div>

										{/* Contact Items */}
										<div className="p-1.5 space-y-0.5">
											{profile.contact_email && (
												<a
													href={`mailto:${profile.contact_email}`}
													className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200 group/item"
												>
													<div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
														<Mail className="h-4 w-4 text-emerald-400" />
													</div>
													<span className="flex-1 truncate">
														{profile.contact_email}
													</span>
													<span className="text-[10px] text-emerald-400/40 group-hover/item:text-emerald-400/70 transition-colors">
														→
													</span>
												</a>
											)}

											{profile.contact_phone && (
												<a
													href={`tel:${profile.contact_phone}`}
													className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200 group/item"
												>
													<div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
														<Phone className="h-4 w-4 text-blue-400" />
													</div>
													<span className="flex-1 truncate">
														{profile.contact_phone}
													</span>
													<span className="text-[10px] text-blue-400/40 group-hover/item:text-blue-400/70 transition-colors">
														→
													</span>
												</a>
											)}

											{profile.contact_location && (
												<div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-400">
													<div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
														<MapPin className="h-4 w-4 text-amber-400" />
													</div>
													<span className="flex-1 truncate">
														{profile.contact_location}
													</span>
												</div>
											)}
										</div>

										{/* Footer */}
										<div className="px-4 py-2 border-t border-white/5">
											<p className="text-[9px] text-zinc-500/50 text-center font-mono tracking-wider">
												• {profile.contact_email ? "email" : ""}{" "}
												{profile.contact_email && profile.contact_phone
													? "•"
													: ""}{" "}
												{profile.contact_phone ? "phone" : ""}{" "}
												{profile.contact_location ? "• location" : ""} •
											</p>
										</div>

										{/* Subtle decorative dots */}
										<div className="absolute bottom-2 left-3 flex gap-1">
											<div className="w-1 h-1 rounded-full bg-emerald-400/20" />
											<div className="w-1 h-1 rounded-full bg-emerald-400/10" />
										</div>
										<div className="absolute bottom-2 right-3 flex gap-1">
											<div className="w-1 h-1 rounded-full bg-emerald-400/10" />
											<div className="w-1 h-1 rounded-full bg-emerald-400/20" />
										</div>
									</div>

									{/* Triangle pointer */}
									<div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-black/95 border-l border-t border-white/10" />
								</div>
							</details>
						</div>
					)}

					<div className="w-full flex justify-center px-4">
						<div className="w-full max-w-3xl">
							<div className="relative rounded-full py-2">
								<div className="h-[1px] w-full rounded-full bg-white/[0.01]" />
							</div>
						</div>
					</div>
					{/* ───────────────── Blog Text ────────────────────────── */}
					{blogText && (
						<div className="w-full flex justify-center px-4">
							<div className="relative w-full max-w-3xl group">
								{/* Main oval bar - NO background, just subtle border */}
								<div className="relative rounded-full border border-white/5 backdrop-blur-sm p-4 md:p-5 transition-all duration-500 hover:border-white/15">
									{/* Ultra-subtle inner glow (barely visible) */}
									<div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

									{/* Content */}
									<div
										className={`relative text-center text-xs md:text-sm leading-relaxed ${textColor} opacity-70`}
									>
										{blogText}
									</div>

									{/* Minimal decorative dots */}
									<div className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-emerald-400/20" />
									<div className="absolute right-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-emerald-400/20" />
								</div>
							</div>
						</div>
					)}
					{/* ───────────────── Social Links ────────────────────── */}
					{socials.length > 0 && (
						<div className="w-full flex justify-center px-4">
							<div className="w-full max-w-2xl">
								{/* Tighter oval */}
								<div className="relative rounded-full border border-white/5 px-3 py-2 transition-all duration-300 hover:border-white/10">
									<div className="relative flex flex-wrap justify-center items-center gap-1.5">
										{socials.map((social) => {
											const platform = SOCIAL_PLATFORMS.find(
												(p) => p.id === social.platform,
											);
											const displayName =
												social.display_name ||
												platform?.label ||
												social.platform;
											const platformColor = getPlatformColor(social.platform);

											return (
												<a
													key={social.id}
													href={social.url}
													target="_blank"
													rel="noopener noreferrer"
													aria-label={platform?.label || social.platform}
													className={`
                  flex items-center gap-1.5
                  rounded-full
                  px-2.5 py-1.5 text-xs transition-all duration-300
                  ${textColor}
                  border border-white/5
                  hover:border-white/15
                  hover:bg-white/5
                  hover:scale-[1.05]
                `}
												>
													<span
														className="text-sm"
														style={{ color: platformColor }}
													>
														{platform?.icon || "🔗"}
													</span>
													<span className="text-[10px] font-medium opacity-80 hover:opacity-100 transition-opacity">
														{displayName}
													</span>
												</a>
											);
										})}
									</div>
								</div>
							</div>
						</div>
					)}
					{/* ───────────────── Links ────────────────────────────── */}
					<div className="space-y-4 pt-2">
						{links
							.filter((link) => link.is_active !== false)
							.map((link, index) => {
								const favicon = getFavicon(link.url);
								const delay = index * 50;
								return (
									<details
										key={link.id}
										className="group relative"
										style={{ animationDelay: `${delay}ms` }}
									>
										<summary
											className={`
                        flex items-center gap-3
                        ${buttonStyle}
                        ${buttonHover}
                        ${cardRadius}
                        ${cardBorder}
                        px-4 py-3 transition-all cursor-pointer list-none
                        ${textColor}
                        animate-in duration-500 fade-in
                      `}
										>
											{favicon ? (
												<img
													src={favicon}
													alt=""
													className="w-6 h-6 rounded-full flex-shrink-0"
												/>
											) : (
												<span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs flex-shrink-0">
													{link.icon || "🔗"}
												</span>
											)}
											<span className="flex-1 text-sm font-medium">
												{link.title}
											</span>
											<ChevronDown className="h-4 w-4 text-zinc-500 flex-shrink-0 transition-transform group-open:rotate-180" />
										</summary>
										<div
											className={`
                        absolute left-0 right-0 top-full mt-2
                        ${cardBackground}
                        ${cardBorder}
                        ${cardShadow}
                        ${cardRadius}
                        overflow-hidden z-20
                        p-4 space-y-3
                      `}
										>
											{/* ─── Description ────────────────────────── */}
											{link.description && (
												<p className={`text-sm ${textColor} opacity-70`}>
													{link.description}
												</p>
											)}
											{/* ─── Open Link Button ───────────────────── */}
											<a
												href={`/api/st/link-in-bio/click/${link.id}?redirect=${encodeURIComponent(link.url)}`}
												target="_blank"
												rel="noopener noreferrer"
												className={`
                          flex items-center justify-center gap-2 w-full
                          ${buttonStyle}
                          ${buttonHover}
                          ${cardRadius}
                          px-4 py-2.5 text-sm transition-all
                          ${textColor}
                          border border-white/10
                          font-medium
                        `}
											>
												<ExternalLink className="h-4 w-4" />
												Open Link
											</a>
										</div>
									</details>
								);
							})}
					</div>
				</div>
				{/* ───────────────── ULTRA PREMIUM FOOTER ────────────────────────────── */}
				<div className="mt-6 pt-4 border-t border-white/5">
					<div className="relative rounded-2xl bg-black/70 backdrop-blur-2xl border border-white/10 px-6 py-5 shadow-2xl shadow-black/40 overflow-hidden">
						{/* Animated gradient border */}
						<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 opacity-50 animate-pulse" />

						{/* Top glow line */}
						<div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

						{/* Bottom glow line */}
						<div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />

						{/* Corner accents */}
						<div className="absolute top-2 left-3 w-1.5 h-1.5 rounded-full bg-emerald-400/30" />
						<div className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-emerald-400/30" />
						<div className="absolute bottom-2 left-3 w-1.5 h-1.5 rounded-full bg-emerald-400/10" />
						<div className="absolute bottom-2 right-3 w-1.5 h-1.5 rounded-full bg-emerald-400/10" />

						{/* Content */}
						<div className="relative flex flex-col items-center justify-center gap-2">
							<div className="flex items-center gap-3">
								<span className="text-[10px] text-white/30 font-mono tracking-widest uppercase">
									<span className="text-emerald-400/40">✦</span> Prime Boostage
								</span>
								<span className="w-px h-4 bg-white/10" />
								<span className="text-[10px] text-white/40">
									Built with{" "}
									<span className="text-rose-400 animate-pulse inline-block">
										❤️
									</span>
								</span>
								<span className="w-px h-4 bg-white/10" />
								<span className="text-[9px] text-white/20 font-mono tracking-wider">
									v{new Date().getFullYear()}
								</span>
							</div>
							<p className="text-[8px] text-white/15 font-mono tracking-[0.2em] uppercase">
								Secure • Private • Decentralized
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
