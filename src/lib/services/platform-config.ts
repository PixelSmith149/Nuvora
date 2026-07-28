// /lib/services/platform-config.ts

import {
	AiFillAndroid,
	AiFillApple,
	AiFillFacebook,
	AiFillGooglePlusCircle,
	AiFillInstagram,
	AiFillLinkedin,
	AiFillPinterest,
	AiFillRedditCircle,
	AiFillTwitterCircle,
	AiFillYoutube,
} from "react-icons/ai";
import {
	BiBuilding,
	BiCart,
	BiCloud,
	BiDollar,
	BiGlobe,
	BiGroup,
	BiHeadphone,
	BiMap,
	BiMusic,
	BiPhone,
	BiStore,
	BiTrendingUp,
	BiUser,
	BiWorld,
} from "react-icons/bi";
import { FaLinkedin, FaYandex } from "react-icons/fa";
import {
	IoChatbubble,
	IoChatbubbleOutline,
	IoChatbubbleSharp,
	IoChatbubbles,
	IoDesktop,
	IoEarth,
	IoFlag,
	IoFlagOutline,
	IoFlagSharp,
	IoGlobe,
	IoGlobeOutline,
	IoGlobeSharp,
	IoHeadset,
	IoLaptop,
	IoLink,
	IoLinkOutline,
	IoLinkSharp,
	IoLocation,
	IoLocationOutline,
	IoLocationSharp,
	IoMic,
	IoMicOutline,
	IoMicSharp,
	IoMusicalNote,
	IoMusicalNotes,
	IoPhoneLandscape,
	IoPhonePortrait,
	IoRadio,
	IoShare,
	IoShareOutline,
	IoShareSharp,
	IoTabletLandscape,
	IoTabletPortrait,
	IoWatch,
} from "react-icons/io5";
import {
	MdAndroid,
	MdLocationOn,
	MdMusicNote,
	MdPhoneIphone,
	MdPodcasts,
	MdSearch,
	MdShoppingBag,
	MdStorefront,
	MdWeb,
} from "react-icons/md";
import {
	SiApple,
	SiBehance,
	SiDeezer,
	SiDiscord,
	SiDribbble,
	SiFacebook,
	SiGithub,
	SiGoogle,
	SiInstagram,
	SiKickstarter,
	SiLine,
	SiMedium,
	SiPinterest,
	SiQuora,
	SiReddit,
	SiRumble,
	SiShopee,
	SiSnapchat,
	SiSoundcloud,
	SiSpotify,
	SiTelegram,
	SiThreads,
	SiTidal,
	SiTiktok,
	SiTumblr,
	SiTwitch,
	SiVimeo,
	SiVk,
	SiWhatsapp,
	SiX,
	SiYoutube,
} from "react-icons/si";

// ─── Platform Config ──────────────────────────────────────────────────────
export const PLATFORM_CONFIG = {
	// ─── Social Media ──────────────────────────────────────────────────────
	instagram: {
		icon: SiInstagram,
		color: "text-pink-500",
		bg: "bg-pink-500/10",
		border: "hover:border-pink-500/50",
		label: "Instagram",
	},
	tiktok: {
		icon: SiTiktok,
		color: "text-cyan-400",
		bg: "bg-cyan-500/10",
		border: "hover:border-cyan-500/50",
		label: "TikTok",
	},
	youtube: {
		icon: SiYoutube,
		color: "text-red-500",
		bg: "bg-red-500/10",
		border: "hover:border-red-500/50",
		label: "YouTube",
	},
	twitter: {
		icon: SiX,
		color: "text-white",
		bg: "bg-white/10",
		border: "hover:border-white/30",
		label: "X (Twitter)",
	},
	facebook: {
		icon: SiFacebook,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		border: "hover:border-blue-500/50",
		label: "Facebook",
	},
	threads: {
		icon: SiThreads,
		color: "text-white",
		bg: "bg-white/10",
		border: "hover:border-white/30",
		label: "Threads",
	},
	linkedin: {
		icon: FaLinkedin,
		color: "text-blue-600",
		bg: "bg-blue-600/10",
		border: "hover:border-blue-600/50",
		label: "LinkedIn",
	},
	snapchat: {
		icon: SiSnapchat,
		color: "text-yellow-400",
		bg: "bg-yellow-400/10",
		border: "hover:border-yellow-400/50",
		label: "Snapchat",
	},
	pinterest: {
		icon: SiPinterest,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Pinterest",
	},
	reddit: {
		icon: SiReddit,
		color: "text-orange-600",
		bg: "bg-orange-600/10",
		border: "hover:border-orange-600/50",
		label: "Reddit",
	},
	tumblr: {
		icon: SiTumblr,
		color: "text-indigo-800",
		bg: "bg-indigo-800/10",
		border: "hover:border-indigo-800/50",
		label: "Tumblr",
	},
	bluesky: {
		icon: BiCloud,
		color: "text-blue-400",
		bg: "bg-blue-400/10",
		border: "hover:border-blue-400/50",
		label: "BlueSky",
	},
	rednote: {
		icon: MdMusicNote,
		color: "text-red-500",
		bg: "bg-red-500/10",
		border: "hover:border-red-500/50",
		label: "RedNote",
	},

	// ─── Messaging ────────────────────────────────────────────────────────
	telegram: {
		icon: SiTelegram,
		color: "text-sky-400",
		bg: "bg-sky-500/10",
		border: "hover:border-sky-500/50",
		label: "Telegram",
	},
	discord: {
		icon: SiDiscord,
		color: "text-indigo-400",
		bg: "bg-indigo-500/10",
		border: "hover:border-indigo-500/50",
		label: "Discord",
	},
	whatsapp: {
		icon: SiWhatsapp,
		color: "text-green-500",
		bg: "bg-green-500/10",
		border: "hover:border-green-500/50",
		label: "WhatsApp",
	},
	line: {
		icon: SiLine,
		color: "text-green-500",
		bg: "bg-green-500/10",
		border: "hover:border-green-500/50",
		label: "Line",
	},
	"line-voom": {
		icon: SiLine,
		color: "text-green-400",
		bg: "bg-green-400/10",
		border: "hover:border-green-400/50",
		label: "Line Voom",
	},

	// ─── Music Platforms ──────────────────────────────────────────────────
	spotify: {
		icon: SiSpotify,
		color: "text-green-500",
		bg: "bg-green-500/10",
		border: "hover:border-green-500/50",
		label: "Spotify",
	},
	soundcloud: {
		icon: SiSoundcloud,
		color: "text-orange-500",
		bg: "bg-orange-500/10",
		border: "hover:border-orange-500/50",
		label: "SoundCloud",
	},
	"apple-music": {
		icon: SiApple,
		color: "text-pink-500",
		bg: "bg-pink-500/10",
		border: "hover:border-pink-500/50",
		label: "Apple Music",
	},
	deezer: {
		icon: SiDeezer,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		border: "hover:border-blue-500/50",
		label: "Deezer",
	},
	tidal: {
		icon: SiTidal,
		color: "text-cyan-400",
		bg: "bg-cyan-400/10",
		border: "hover:border-cyan-400/50",
		label: "Tidal",
	},
	audiomack: {
		icon: SiSoundcloud,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		border: "hover:border-blue-500/50",
		label: "Audiomack",
	},
	shazam: {
		icon: SiApple,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		border: "hover:border-blue-500/50",
		label: "Shazam",
	},
	mixcloud: {
		icon: SiSoundcloud,
		color: "text-blue-600",
		bg: "bg-blue-600/10",
		border: "hover:border-blue-600/50",
		label: "Mixcloud",
	},
	boomplay: {
		icon: MdMusicNote,
		color: "text-orange-500",
		bg: "bg-orange-500/10",
		border: "hover:border-orange-500/50",
		label: "BoomPlay",
	},
	reverbenation: {
		icon: MdMusicNote,
		color: "text-purple-500",
		bg: "bg-purple-500/10",
		border: "hover:border-purple-500/50",
		label: "Reverbnation",
	},
	"spinnin-records": {
		icon: MdMusicNote,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		border: "hover:border-blue-500/50",
		label: "Spinnin Records",
	},
	datpiff: {
		icon: MdMusicNote,
		color: "text-green-500",
		bg: "bg-green-500/10",
		border: "hover:border-green-500/50",
		label: "Datpiff",
	},

	// ─── Gaming & Streaming ──────────────────────────────────────────────
	twitch: {
		icon: SiTwitch,
		color: "text-purple-500",
		bg: "bg-purple-500/10",
		border: "hover:border-purple-500/50",
		label: "Twitch",
	},
	kick: {
		icon: SiKickstarter,
		color: "text-green-500",
		bg: "bg-green-500/10",
		border: "hover:border-green-500/50",
		label: "Kick",
	},
	trovo: {
		icon: SiTwitch,
		color: "text-cyan-400",
		bg: "bg-cyan-400/10",
		border: "hover:border-cyan-400/50",
		label: "Trovo",
	},
	rumble: {
		icon: SiRumble,
		color: "text-green-500",
		bg: "bg-green-500/10",
		border: "hover:border-green-500/50",
		label: "Rumble",
	},
	vimeo: {
		icon: SiVimeo,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		border: "hover:border-blue-500/50",
		label: "Vimeo",
	},
	coub: {
		icon: MdMusicNote,
		color: "text-orange-500",
		bg: "bg-orange-500/10",
		border: "hover:border-orange-500/50",
		label: "Coub",
	},
	rutube: {
		icon: SiYoutube,
		color: "text-red-500",
		bg: "bg-red-500/10",
		border: "hover:border-red-500/50",
		label: "Rutube",
	},
	vk: {
		icon: SiVk,
		color: "text-blue-600",
		bg: "bg-blue-600/10",
		border: "hover:border-blue-600/50",
		label: "VKontakte",
	},
	"ok-ru": {
		icon: SiVk,
		color: "text-orange-500",
		bg: "bg-orange-500/10",
		border: "hover:border-orange-500/50",
		label: "OK.ru",
	},
	yandex: {
		icon: FaYandex,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Yandex",
	},

	// ─── Short Video Platforms ───────────────────────────────────────────
	kwai: {
		icon: AiFillAndroid,
		color: "text-green-500",
		bg: "bg-green-500/10",
		border: "hover:border-green-500/50",
		label: "Kwai",
	},
	likee: {
		icon: AiFillAndroid,
		color: "text-red-500",
		bg: "bg-red-500/10",
		border: "hover:border-red-500/50",
		label: "Likee",
	},
	snackvideo: {
		icon: AiFillAndroid,
		color: "text-yellow-500",
		bg: "bg-yellow-500/10",
		border: "hover:border-yellow-500/50",
		label: "SnackVideo",
	},

	// ─── E-commerce & Marketplace ────────────────────────────────────────
	shopee: {
		icon: SiShopee,
		color: "text-orange-500",
		bg: "bg-orange-500/10",
		border: "hover:border-orange-500/50",
		label: "Shopee",
	},

	// ─── Content & Publishing ────────────────────────────────────────────
	medium: {
		icon: SiMedium,
		color: "text-white",
		bg: "bg-white/10",
		border: "hover:border-white/30",
		label: "Medium",
	},
	quora: {
		icon: SiQuora,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Quora",
	},
	podcast: {
		icon: MdPodcasts,
		color: "text-purple-500",
		bg: "bg-purple-500/10",
		border: "hover:border-purple-500/50",
		label: "Podcast",
	},

	// ─── Developer & Portfolio ────────────────────────────────────────────
	github: {
		icon: SiGithub,
		color: "text-white",
		bg: "bg-white/10",
		border: "hover:border-white/30",
		label: "GitHub",
	},
	dribbble: {
		icon: SiDribbble,
		color: "text-pink-500",
		bg: "bg-pink-500/10",
		border: "hover:border-pink-500/50",
		label: "Dribbble",
	},
	behance: {
		icon: SiBehance,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		border: "hover:border-blue-500/50",
		label: "Behance",
	},

	// ─── SEO & Web Services ───────────────────────────────────────────────
	coinmarketcap: {
		icon: BiDollar,
		color: "text-yellow-500",
		bg: "bg-yellow-500/10",
		border: "hover:border-yellow-500/50",
		label: "CoinMarketCap",
	},
	"google-knowledge-panel": {
		icon: SiGoogle,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		border: "hover:border-blue-500/50",
		label: "Google Knowledge Panel",
	},
	"google-maps-citations": {
		icon: MdLocationOn,
		color: "text-green-500",
		bg: "bg-green-500/10",
		border: "hover:border-green-500/50",
		label: "Google Maps Citations",
	},
	"google-visitors": {
		icon: SiGoogle,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		border: "hover:border-blue-500/50",
		label: "Google Visitors",
	},
	"social-signals": {
		icon: BiTrendingUp,
		color: "text-purple-500",
		bg: "bg-purple-500/10",
		border: "hover:border-purple-500/50",
		label: "Social Signals",
	},
	backlink: {
		icon: IoLink,
		color: "text-blue-400",
		bg: "bg-blue-400/10",
		border: "hover:border-blue-400/50",
		label: "Backlink SEO",
	},

	// ─── Website Traffic ──────────────────────────────────────────────────
	"website-traffic": {
		icon: IoGlobe,
		color: "text-blue-400",
		bg: "bg-blue-400/10",
		border: "hover:border-blue-400/50",
		label: "Website Traffic",
	},
	"seo-friendly-traffic": {
		icon: IoGlobe,
		color: "text-green-400",
		bg: "bg-green-400/10",
		border: "hover:border-green-400/50",
		label: "SEO Traffic",
	},
	"adult-traffic": {
		icon: IoGlobe,
		color: "text-red-400",
		bg: "bg-red-400/10",
		border: "hover:border-red-400/50",
		label: "Adult Traffic",
	},
	"mobile-traffic-android": {
		icon: IoPhonePortrait,
		color: "text-green-400",
		bg: "bg-green-400/10",
		border: "hover:border-green-400/50",
		label: "Android Traffic",
	},
	"mobile-traffic-iphone": {
		icon: IoPhonePortrait,
		color: "text-gray-400",
		bg: "bg-gray-400/10",
		border: "hover:border-gray-400/50",
		label: "iPhone Traffic",
	},
	"referrer-traffic": {
		icon: IoLink,
		color: "text-yellow-400",
		bg: "bg-yellow-400/10",
		border: "hover:border-yellow-400/50",
		label: "Referrer Traffic",
	},
	"mobile-app-installs": {
		icon: IoPhonePortrait,
		color: "text-blue-400",
		bg: "bg-blue-400/10",
		border: "hover:border-blue-400/50",
		label: "Mobile App Installs",
	},

	// ─── Country-Specific Traffic ─────────────────────────────────────────
	"usa-traffic": {
		icon: IoFlag,
		color: "text-red-500",
		bg: "bg-red-500/10",
		border: "hover:border-red-500/50",
		label: "USA Traffic",
	},
	"uk-traffic": {
		icon: IoFlag,
		color: "text-blue-700",
		bg: "bg-blue-700/10",
		border: "hover:border-blue-700/50",
		label: "UK Traffic",
	},
	"brazil-traffic": {
		icon: IoFlag,
		color: "text-green-500",
		bg: "bg-green-500/10",
		border: "hover:border-green-500/50",
		label: "Brazil Traffic",
	},
	"india-traffic": {
		icon: IoFlag,
		color: "text-orange-500",
		bg: "bg-orange-500/10",
		border: "hover:border-orange-500/50",
		label: "India Traffic",
	},
	"japan-traffic": {
		icon: IoFlag,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Japan Traffic",
	},
	"south-korea-traffic": {
		icon: IoFlag,
		color: "text-blue-600",
		bg: "bg-blue-600/10",
		border: "hover:border-blue-600/50",
		label: "South Korea Traffic",
	},
	"germany-traffic": {
		icon: IoFlag,
		color: "text-yellow-600",
		bg: "bg-yellow-600/10",
		border: "hover:border-yellow-600/50",
		label: "Germany Traffic",
	},
	"france-traffic": {
		icon: IoFlag,
		color: "text-blue-600",
		bg: "bg-blue-600/10",
		border: "hover:border-blue-600/50",
		label: "France Traffic",
	},
	"italy-traffic": {
		icon: IoFlag,
		color: "text-green-600",
		bg: "bg-green-600/10",
		border: "hover:border-green-600/50",
		label: "Italy Traffic",
	},
	"spain-traffic": {
		icon: IoFlag,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Spain Traffic",
	},
	"russia-traffic": {
		icon: IoFlag,
		color: "text-blue-600",
		bg: "bg-blue-600/10",
		border: "hover:border-blue-600/50",
		label: "Russia Traffic",
	},
	"turkey-traffic": {
		icon: IoFlag,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Turkey Traffic",
	},
	"egypt-traffic": {
		icon: IoFlag,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Egypt Traffic",
	},
	"pakistan-traffic": {
		icon: IoFlag,
		color: "text-green-600",
		bg: "bg-green-600/10",
		border: "hover:border-green-600/50",
		label: "Pakistan Traffic",
	},
	"vietnam-traffic": {
		icon: IoFlag,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Vietnam Traffic",
	},
	"thailand-traffic": {
		icon: IoFlag,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Thailand Traffic",
	},
	"indonesia-traffic": {
		icon: IoFlag,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Indonesia Traffic",
	},
	"singapore-traffic": {
		icon: IoFlag,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Singapore Traffic",
	},
	"netherlands-traffic": {
		icon: IoFlag,
		color: "text-orange-500",
		bg: "bg-orange-500/10",
		border: "hover:border-orange-500/50",
		label: "Netherlands Traffic",
	},
	"poland-traffic": {
		icon: IoFlag,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Poland Traffic",
	},
	"ukraine-traffic": {
		icon: IoFlag,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		border: "hover:border-blue-500/50",
		label: "Ukraine Traffic",
	},
	"romania-traffic": {
		icon: IoFlag,
		color: "text-blue-600",
		bg: "bg-blue-600/10",
		border: "hover:border-blue-600/50",
		label: "Romania Traffic",
	},
	"portugal-traffic": {
		icon: IoFlag,
		color: "text-green-600",
		bg: "bg-green-600/10",
		border: "hover:border-green-600/50",
		label: "Portugal Traffic",
	},
	"czech-traffic": {
		icon: IoFlag,
		color: "text-blue-600",
		bg: "bg-blue-600/10",
		border: "hover:border-blue-600/50",
		label: "Czech Traffic",
	},
	"mexico-traffic": {
		icon: IoFlag,
		color: "text-green-600",
		bg: "bg-green-600/10",
		border: "hover:border-green-600/50",
		label: "Mexico Traffic",
	},
	"canada-traffic": {
		icon: IoFlag,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "Canada Traffic",
	},
	"china-traffic": {
		icon: IoFlag,
		color: "text-red-600",
		bg: "bg-red-600/10",
		border: "hover:border-red-600/50",
		label: "China Traffic",
	},
	"taiwan-traffic": {
		icon: IoFlag,
		color: "text-blue-600",
		bg: "bg-blue-600/10",
		border: "hover:border-blue-600/50",
		label: "Taiwan Traffic",
	},

	"adult-traffic-iphone": {
		icon: IoPhonePortrait,
		color: "text-red-400",
		bg: "bg-red-400/10",
		border: "hover:border-red-400/50",
		label: "Adult Traffic (iPhone)",
	},
	"adult-traffic-android": {
		icon: IoPhonePortrait,
		color: "text-red-500",
		bg: "bg-red-500/10",
		border: "hover:border-red-500/50",
		label: "Adult Traffic (Android)",
	},

	// ─── Clubhouse ────────────────────────────────────────────────────────
	clubhouse: {
		icon: BiGroup,
		color: "text-green-500",
		bg: "bg-green-500/10",
		border: "hover:border-green-500/50",
		label: "Clubhouse",
	},

	// ─── Mentimeter ───────────────────────────────────────────────────────
	mentimeter: {
		icon: BiTrendingUp,
		color: "text-purple-500",
		bg: "bg-purple-500/10",
		border: "hover:border-purple-500/50",
		label: "Mentimeter",
	},

	// ─── JAP Exclusive ────────────────────────────────────────────────────
	"jap-exclusive": {
		icon: BiGlobe,
		color: "text-yellow-400",
		bg: "bg-yellow-400/10",
		border: "hover:border-yellow-400/50",
		label: "JAP Exclusive",
	},
} as const;

export type PlatformKey = keyof typeof PLATFORM_CONFIG;

// ─── Helper: Normalize any platform name/slug into a config key ───────────
export function normalizePlatformKey(platform: string): string {
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

// ─── Country detection for traffic platforms ──────────────────────────────
const COUNTRY_TRAFFIC_MAP: Record<string, string> = {
	brazil: "brazil-traffic",
	canada: "canada-traffic",
	china: "china-traffic",
	czech: "czech-traffic",
	egypt: "egypt-traffic",
	france: "france-traffic",
	germany: "germany-traffic",
	uk: "uk-traffic",
	"united-kingdom": "uk-traffic",
	india: "india-traffic",
	indonesia: "indonesia-traffic",
	italy: "italy-traffic",
	japan: "japan-traffic",
	"south-korea": "south-korea-traffic",
	korea: "south-korea-traffic",
	mexico: "mexico-traffic",
	netherlands: "netherlands-traffic",
	pakistan: "pakistan-traffic",
	poland: "poland-traffic",
	portugal: "portugal-traffic",
	romania: "romania-traffic",
	russia: "russia-traffic",
	singapore: "singapore-traffic",
	thailand: "thailand-traffic",
	taiwan: "taiwan-traffic",
	turkey: "turkey-traffic",
	ukraine: "ukraine-traffic",
	usa: "usa-traffic",
	"united-states": "usa-traffic",
	vietnam: "vietnam-traffic",
};

// ─── Helper: Get platform config by name or slug ─────────────────────────
export function getPlatformConfig(platform: string) {
	const key = normalizePlatformKey(platform);

	// 1. Direct match
	if (key in PLATFORM_CONFIG) {
		return PLATFORM_CONFIG[key as PlatformKey];
	}

	// 2. Common social aliases
	const socialAliases: Record<string, PlatformKey> = {
		x: "twitter",
		"x-twitter": "twitter",
		"twitter-x": "twitter",
	};

	if (socialAliases[key] && socialAliases[key] in PLATFORM_CONFIG) {
		return PLATFORM_CONFIG[socialAliases[key]];
	}

	// 3. Country traffic detection
	// Handles: "website-traffic-from-brazil", "brazil-traffic", "traffic-brazil", etc.
	if (key.includes("traffic")) {
		for (const [country, configKey] of Object.entries(COUNTRY_TRAFFIC_MAP)) {
			if (key.includes(country)) {
				if (configKey in PLATFORM_CONFIG) {
					return PLATFORM_CONFIG[configKey as PlatformKey];
				}
			}
		}

		// Generic traffic fallbacks
		if (key.includes("adult") && key.includes("iphone")) {
			return (
				PLATFORM_CONFIG["adult-traffic-iphone"] ??
				PLATFORM_CONFIG["adult-traffic"]
			);
		}
		if (key.includes("adult") && key.includes("android")) {
			return (
				PLATFORM_CONFIG["adult-traffic-android"] ??
				PLATFORM_CONFIG["adult-traffic"]
			);
		}
		if (key.includes("adult")) {
			return PLATFORM_CONFIG["adult-traffic"];
		}
		if (key.includes("iphone") || key.includes("ios")) {
			return PLATFORM_CONFIG["mobile-traffic-iphone"];
		}
		if (key.includes("android")) {
			return PLATFORM_CONFIG["mobile-traffic-android"];
		}
		if (key.includes("referrer")) {
			return PLATFORM_CONFIG["referrer-traffic"];
		}
		if (key.includes("seo")) {
			return PLATFORM_CONFIG["seo-friendly-traffic"];
		}

		// Default website traffic
		return PLATFORM_CONFIG["website-traffic"];
	}

	// 4. Mobile app installs
	if (key.includes("app-install") || key.includes("mobile-app")) {
		return PLATFORM_CONFIG["mobile-app-installs"];
	}

	// 5. Fallback
	return {
		icon: IoGlobe,
		color: "text-zinc-500",
		bg: "bg-zinc-500/10",
		border: "hover:border-zinc-500/50",
		label: platform,
	};
}

export function getPlatformColor(platform: string): string {
	return getPlatformConfig(platform).color || "text-zinc-400";
}

export function getPlatformIcon(platform: string) {
	return getPlatformConfig(platform).icon || IoGlobe;
}

export function getPlatformLabel(platform: string): string {
	return getPlatformConfig(platform).label || platform;
}
