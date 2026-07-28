// lib/st/types/templates-animation.ts

// ─── Template Categories (28 total) ──────────────────────────────────
export type TemplateCategory =
	// Business
	| "business"
	| "corporate"
	| "startup"
	| "saas"
	| "agency"
	| "consulting"
	| "lawfirm"
	| "accounting"
	| "insurance"
	| "construction"
	| "logistics"
	| "manufacturing"
	// E-commerce
	| "ecommerce"
	| "fashion"
	| "electronics"
	| "grocery"
	| "pharmacy"
	| "furniture"
	| "jewelry"
	| "beauty"
	| "marketplace"
	| "digitalproducts"
	// Portfolio
	| "portfolio"
	| "designer"
	| "photographer"
	| "videographer"
	| "artist"
	| "musician"
	| "architect"
	| "developer"
	| "resume"
	// Restaurant & Hospitality
	| "restaurant"
	| "fastfood"
	| "coffee"
	| "bakery"
	| "hotel"
	| "resort"
	| "airbnb"
	| "eventvenue"
	| "catering"
	// Healthcare
	| "healthcare"
	| "hospital"
	| "clinic"
	| "dentist"
	| "veterinary"
	| "therapist"
	| "fitness"
	| "gym"
	| "yoga"
	// Education
	| "education"
	| "school"
	| "university"
	| "onlinecourse"
	| "lms"
	| "coaching"
	| "tutoring"
	| "training"
	// Real Estate
	| "realestate"
	| "realtor"
	| "propertymanagement"
	| "rental"
	| "constructionprojects"
	// Finance
	| "finance"
	| "banking"
	| "investment"
	| "fintech"
	| "crypto"
	| "loans"
	| "tax"
	// Travel
	| "travel"
	| "travelagency"
	| "tourbooking"
	| "visa"
	| "airline"
	| "carrental"
	| "cruise"
	// Entertainment
	| "entertainment"
	| "streaming"
	| "music"
	| "podcast"
	| "gaming"
	| "moviereviews"
	| "eventtickets"
	// Other Core Categories
	| "website"
	| "link-in-bio"
	| "social"
	| "email"
	| "landing"
	| "dashboard"
	| "blog"
	| "booking"
	| "ai"
	| "mobileapp"
	| "presentation"
	| "document"
	| "marketing"
	| "cms"
	| "industry"
	| "internal"
	| "authentication"
	| "web3"
	| "nonprofit"
	| "church"
	| "mosque"
	| "community"
	| "fundraising"
	// Legacy/General
	| "custom";

// ─── Animation Types ──────────────────────────────────────────────────
export type AnimationType =
	// Fade Animations
	| "fade"
	| "fadeout"
	| "crossfade"
	| "fadeup"
	| "fadedown"
	| "fadeleft"
	| "faderight"
	// Slide Animations
	| "slide"
	| "slideup"
	| "slidedown"
	| "slideleft"
	| "slideright"
	| "slidefade"
	| "slidereveal"
	// Scale Animations
	| "scale"
	| "zoomin"
	| "zoomout"
	| "scaleup"
	| "scaledown"
	| "popin"
	| "popout"
	| "grow"
	| "shrink"
	// Rotation Animations
	| "rotate"
	| "spin"
	| "flipx"
	| "flipy"
	| "rotate3d"
	| "cardflip"
	// Blur Animations
	| "blurin"
	| "blurout"
	| "frosted"
	| "glassmorph"
	| "focus"
	// Morphing Animations
	| "morph"
	| "svgmorph"
	| "borderradius"
	| "iconmorph"
	| "buttonmorph"
	| "containermorph"
	// Parallax
	| "parallax"
	| "scrollparallax"
	| "layereddepth"
	| "floatingbg"
	| "perspective"
	// Floating
	| "float"
	| "bobbing"
	| "hoverfloat"
	| "orbital"
	| "drift"
	// Elastic & Spring
	| "bounce"
	| "spring"
	| "elastic"
	| "rubberband"
	| "overshoot"
	// Liquid
	| "liquidblob"
	| "liquidfill"
	| "waterripple"
	| "inkspread"
	| "gooey"
	// Glow
	| "glow"
	| "pulseglow"
	| "neonglow"
	| "breathing"
	| "gradientglow"
	| "aura"
	// Gradient
	| "gradient"
	| "aurora"
	| "mesh"
	| "lineargradient"
	| "radialgradient"
	// Particle
	| "particles"
	| "dust"
	| "stars"
	| "sparks"
	| "fireflies"
	| "snow"
	| "rain"
	// Cursor
	| "cursor"
	| "cursortrail"
	| "cursorblob"
	| "magnetic"
	// Loading
	| "loader"
	| "skeleton"
	| "shimmer"
	| "pulse"
	| "circular"
	| "dotloader"
	| "progress"
	// Scroll
	| "scrollreveal"
	| "stagger"
	| "pinsection"
	| "horizontalscroll"
	| "scrollzoom"
	| "scrollprogress"
	// Text
	| "typewriter"
	| "characterreveal"
	| "wordreveal"
	| "splittext"
	| "scramble"
	| "gradientflow"
	| "wavetext"
	// Card
	| "cardlift"
	| "cardtilt"
	| "card3d"
	| "glassshine"
	| "cardstack"
	| "cardexpand"
	| "cardcollapse"
	// Navigation
	| "expandingmenu"
	| "morphingnavbar"
	| "floatingnavbar"
	| "dock"
	| "activeindicator"
	// Background
	| "animatedmesh"
	| "auroralights"
	| "noisemotion"
	| "wavebg"
	| "gradientflowbg"
	| "gridmotion"
	// Page Transitions
	| "pagetransition"
	| "fadetransition"
	| "slidetransition"
	| "zoomtransition"
	| "sharedelement"
	| "curtainreveal"
	| "swipetransition"
	// Hero
	| "herofloat"
	| "imagereveal"
	| "layerreveal"
	| "scrollzoomhero"
	| "cinematic"
	// Icon
	| "drawsvg"
	| "morphicon"
	| "iconspin"
	| "iconbounce"
	| "iconpulse"
	| "iconwiggle"
	| "microrotation"
	// Microinteractions
	| "buttonpress"
	| "toggle"
	| "checkbox"
	| "successcheck"
	| "notification"
	| "ripple"
	| "copyfeedback"
	// Premium Effects
	| "glassmorphism"
	| "dynamicblur"
	| "refraction"
	| "glassreflection"
	| "transparencyshift"
	| "satinshine"
	| "metallicsweep"
	| "lightsweep"
	| "softreflection"
	| "silkmotion"
	| "velvetfade"
	| "goldaccent"
	// AI-Inspired
	| "neuralnetwork"
	| "datastream"
	| "matrix"
	| "hologram"
	| "scanningbeam"
	| "digitalpulse"
	// Dashboard
	| "counter"
	| "livechart"
	| "progressring"
	| "kpi"
	| "activityfeed"
	| "livepulse"
	// Premium Framer Motion Patterns
	| "staggerchildren"
	| "sharedlayout"
	| "animatepresence"
	| "layouttransition"
	| "springphysics"
	| "dragsnap"
	| "reorder"
	// Custom
	| "custom";

// ─── Animation Triggers ───────────────────────────────────────────────
export type AnimationTrigger = "load" | "scroll" | "hover" | "click";

// ─── Animation Preset Categories ──────────────────────────────────────
export type AnimationPresetCategory =
	| "entrance"
	| "exit"
	| "attention"
	| "interaction"
	| "premium"
	| "loading"
	| "text"
	| "scroll"
	| "dashboard"
	| "microinteraction"
	| "fade"
	| "slide"
	| "scale"
	| "rotate"
	| "blur"
	| "morph"
	| "parallax"
	| "float"
	| "spring"
	| "liquid"
	| "glow"
	| "gradient"
	| "particle"
	| "cursor"
	| "card"
	| "navigation"
	| "background"
	| "pagereveal"
	| "hero"
	| "icon"
	| "premiumeffect"
	| "ai";

// ─── Template Interface ──────────────────────────────────────────────
export interface Template {
	id: string;
	user_id: string;
	name: string;
	description: string | null;
	category: TemplateCategory;
	type: "custom" | "preset" | "clone";
	preview_image: string | null;
	html_code: string | null;
	css_code: string | null;
	js_code: string | null;
	settings: Record<string, any>;
	is_published: boolean;
	is_public: boolean;
	view_count: number;
	clone_count: number;
	download_count: number;
	tags: string[];
	created_at: string;
	updated_at: string;
}

// ─── Animation Interface ─────────────────────────────────────────────
export interface Animation {
	id: string;
	user_id: string;
	template_id: string | null;
	name: string;
	description: string | null;
	type: AnimationType;
	duration: number;
	delay: number;
	easing: string;
	direction: "normal" | "reverse" | "alternate";
	iteration_count: string;
	fill_mode: "forwards" | "backwards" | "both" | "none";
	trigger: AnimationTrigger;
	properties: Record<string, any>;
	keyframes: Record<string, Record<string, string>>;
	css_code: string | null;
	is_preset: boolean;
	download_count: number;
	created_at: string;
	updated_at: string;
}

// ─── Animation Preset Interface ──────────────────────────────────────
export interface AnimationPreset {
	id: string;
	name: string;
	description: string | null;
	type: AnimationType;
	duration: number;
	easing: string;
	properties: Record<string, any>;
	keyframes: Record<string, Record<string, string>>;
	css_code: string;
	category: AnimationPresetCategory;
	preview_gif: string | null;
	tags: string[];
	created_at: string;
}

// ─── Download Record Interface ──────────────────────────────────────
export interface DownloadRecord {
	id: string;
	user_id: string;
	template_id: string | null;
	animation_id: string | null;
	format: "html" | "css" | "js" | "zip" | "json";
	downloaded_at: string;
}

// ─── Category Helpers ────────────────────────────────────────────────
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
	// Business
	"business",
	"corporate",
	"startup",
	"saas",
	"agency",
	"consulting",
	"lawfirm",
	"accounting",
	"insurance",
	"construction",
	"logistics",
	"manufacturing",
	// E-commerce
	"ecommerce",
	"fashion",
	"electronics",
	"grocery",
	"pharmacy",
	"furniture",
	"jewelry",
	"beauty",
	"marketplace",
	"digitalproducts",
	// Portfolio
	"portfolio",
	"designer",
	"photographer",
	"videographer",
	"artist",
	"musician",
	"architect",
	"developer",
	"resume",
	// Restaurant & Hospitality
	"restaurant",
	"fastfood",
	"coffee",
	"bakery",
	"hotel",
	"resort",
	"airbnb",
	"eventvenue",
	"catering",
	// Healthcare
	"healthcare",
	"hospital",
	"clinic",
	"dentist",
	"veterinary",
	"therapist",
	"fitness",
	"gym",
	"yoga",
	// Education
	"education",
	"school",
	"university",
	"onlinecourse",
	"lms",
	"coaching",
	"tutoring",
	"training",
	// Real Estate
	"realestate",
	"realtor",
	"propertymanagement",
	"rental",
	"constructionprojects",
	// Finance
	"finance",
	"banking",
	"investment",
	"fintech",
	"crypto",
	"loans",
	"tax",
	// Travel
	"travel",
	"travelagency",
	"tourbooking",
	"visa",
	"airline",
	"carrental",
	"cruise",
	// Entertainment
	"entertainment",
	"streaming",
	"music",
	"podcast",
	"gaming",
	"moviereviews",
	"eventtickets",
	// Core
	"website",
	"link-in-bio",
	"social",
	"email",
	"landing",
	"dashboard",
	"blog",
	"booking",
	"ai",
	"mobileapp",
	"presentation",
	"document",
	"marketing",
	"cms",
	"industry",
	"internal",
	"authentication",
	"web3",
	"nonprofit",
	"church",
	"mosque",
	"community",
	"fundraising",
	"custom",
];

export const ANIMATION_TYPES: AnimationType[] = [
	"fade",
	"fadeout",
	"crossfade",
	"fadeup",
	"fadedown",
	"fadeleft",
	"faderight",
	"slide",
	"slideup",
	"slidedown",
	"slideleft",
	"slideright",
	"slidefade",
	"slidereveal",
	"scale",
	"zoomin",
	"zoomout",
	"scaleup",
	"scaledown",
	"popin",
	"popout",
	"grow",
	"shrink",
	"rotate",
	"spin",
	"flipx",
	"flipy",
	"rotate3d",
	"cardflip",
	"blurin",
	"blurout",
	"frosted",
	"glassmorph",
	"focus",
	"morph",
	"svgmorph",
	"borderradius",
	"iconmorph",
	"buttonmorph",
	"containermorph",
	"parallax",
	"scrollparallax",
	"layereddepth",
	"floatingbg",
	"perspective",
	"float",
	"bobbing",
	"hoverfloat",
	"orbital",
	"drift",
	"bounce",
	"spring",
	"elastic",
	"rubberband",
	"overshoot",
	"liquidblob",
	"liquidfill",
	"waterripple",
	"inkspread",
	"gooey",
	"glow",
	"pulseglow",
	"neonglow",
	"breathing",
	"gradientglow",
	"aura",
	"gradient",
	"aurora",
	"mesh",
	"lineargradient",
	"radialgradient",
	"particles",
	"dust",
	"stars",
	"sparks",
	"fireflies",
	"snow",
	"rain",
	"cursor",
	"cursortrail",
	"cursorblob",
	"magnetic",
	"loader",
	"skeleton",
	"shimmer",
	"pulse",
	"circular",
	"dotloader",
	"progress",
	"scrollreveal",
	"stagger",
	"pinsection",
	"horizontalscroll",
	"scrollzoom",
	"scrollprogress",
	"typewriter",
	"characterreveal",
	"wordreveal",
	"splittext",
	"scramble",
	"gradientflow",
	"wavetext",
	"cardlift",
	"cardtilt",
	"card3d",
	"glassshine",
	"cardstack",
	"cardexpand",
	"cardcollapse",
	"expandingmenu",
	"morphingnavbar",
	"floatingnavbar",
	"dock",
	"activeindicator",
	"animatedmesh",
	"auroralights",
	"noisemotion",
	"wavebg",
	"gradientflowbg",
	"gridmotion",
	"pagetransition",
	"fadetransition",
	"slidetransition",
	"zoomtransition",
	"sharedelement",
	"curtainreveal",
	"swipetransition",
	"herofloat",
	"imagereveal",
	"layerreveal",
	"scrollzoomhero",
	"cinematic",
	"drawsvg",
	"morphicon",
	"iconspin",
	"iconbounce",
	"iconpulse",
	"iconwiggle",
	"microrotation",
	"buttonpress",
	"toggle",
	"checkbox",
	"successcheck",
	"notification",
	"ripple",
	"copyfeedback",
	"glassmorphism",
	"dynamicblur",
	"refraction",
	"glassreflection",
	"transparencyshift",
	"satinshine",
	"metallicsweep",
	"lightsweep",
	"softreflection",
	"silkmotion",
	"velvetfade",
	"goldaccent",
	"neuralnetwork",
	"datastream",
	"matrix",
	"hologram",
	"scanningbeam",
	"digitalpulse",
	"counter",
	"livechart",
	"progressring",
	"kpi",
	"activityfeed",
	"livepulse",
	"staggerchildren",
	"sharedlayout",
	"animatepresence",
	"layouttransition",
	"springphysics",
	"dragsnap",
	"reorder",
	"custom",
];

export const PRESET_CATEGORIES: AnimationPresetCategory[] = [
	"entrance",
	"exit",
	"attention",
	"interaction",
	"premium",
	"loading",
	"text",
	"scroll",
	"dashboard",
	"microinteraction",
	"fade",
	"slide",
	"scale",
	"rotate",
	"blur",
	"morph",
	"parallax",
	"float",
	"spring",
	"liquid",
	"glow",
	"gradient",
	"particle",
	"cursor",
	"card",
	"navigation",
	"background",
	"pagereveal",
	"hero",
	"icon",
	"premiumeffect",
	"ai",
];

export const TRIGGER_OPTIONS: AnimationTrigger[] = [
	"load",
	"scroll",
	"hover",
	"click",
];
