// components/market/OneTimeUploadPanel.tsx

"use client";

import {
	AlertCircle,
	BookOpen,
	CheckCircle2,
	CloudUpload,
	Code,
	Database,
	FileCheck,
	FileText,
	Globe,
	Image as ImageIcon,
	Layers,
	Loader2,
	Music,
	Palette,
	ShoppingBag,
	Smartphone,
	Sparkles,
	TrendingUp,
	Video,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import supabaseClient from "@/lib/supabase/client";
import { useMarket } from "@/lib/use-market";

// ============================================================
// TYPES
// ============================================================

interface PanelProps {
	userId: string;
	onSuccess: () => void;
}

interface UploadTicketResponse {
	uploadUrl: string;
	storagePath: string;
	tokenPath: string;
}

type UploadStatus =
	| "IDLE"
	| "TRANSMITTING"
	| "FINALIZING"
	| "SUCCESS"
	| "ERROR";

// ─── Category Types ─────────────────────────────────────────

export type AssetCategory =
	| "source_code"
	| "website_template"
	| "theme_plugin"
	| "ui_kit_component"
	| "automation_script"
	| "api_integration"
	| "database_schema"
	| "config_file"
	| "ebook_guide"
	| "pdf_manual"
	| "course_video"
	| "workshop_material"
	| "spreadsheet_tool"
	| "browser_extension"
	| "notion_template"
	| "obsidian_vault"
	| "logo_template"
	| "font_typography"
	| "stock_media"
	| "mockup_template"
	| "social_media_kit"
	| "ad_creative"
	| "email_template"
	| "ai_prompt"
	| "game_asset"
	| "3d_model"
	| "minecraft_map"
	| "dnd_resource"
	| "music_pack"
	| "sound_effect"
	| "stock_photo"
	| "stock_video"
	| "custom";

interface CategoryConfig {
	id: AssetCategory;
	label: string;
	icon: React.ReactNode;
	description: string;
	requiresFile: boolean;
	assetType: "file" | "token" | "template" | "code" | "link";
	placeholder: string;
	allowedExtensions?: string[];
}

// ============================================================
// CATEGORY CONFIGURATIONS
// ============================================================

const CATEGORIES: CategoryConfig[] = [
	// ─── CODE & DEVELOPMENT ──────────────────────────────────
	{
		id: "source_code",
		label: "Source Code / Full Project",
		icon: <Code className="h-4 w-4" />,
		description: "Complete source code repositories, scripts, or libraries",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload ZIP of your source code",
		allowedExtensions: [".zip", ".rar", ".tar.gz", ".7z"],
	},
	{
		id: "website_template",
		label: "Website Template",
		icon: <Globe className="h-4 w-4" />,
		description: "HTML/CSS/JS templates, landing pages, email templates",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload ZIP of your template",
		allowedExtensions: [".zip", ".rar"],
	},
	{
		id: "theme_plugin",
		label: "Theme / Plugin",
		icon: <Layers className="h-4 w-4" />,
		description: "WordPress themes, Shopify themes, plugins, extensions",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload ZIP of your theme/plugin",
		allowedExtensions: [".zip"],
	},
	{
		id: "ui_kit_component",
		label: "UI Kit / Component Library",
		icon: <Palette className="h-4 w-4" />,
		description: "Figma/Adobe XD kits, React/Vue component libraries",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload UI Kit package",
		allowedExtensions: [".zip", ".fig", ".xd"],
	},
	{
		id: "automation_script",
		label: "Automation Script",
		icon: <Code className="h-4 w-4" />,
		description: "Python/JS automation scripts, web scrapers, macros",
		requiresFile: false,
		assetType: "code",
		placeholder: "Paste your script code here",
	},
	{
		id: "api_integration",
		label: "API Integration / SDK",
		icon: <Code className="h-4 w-4" />,
		description: "API wrappers, SDKs, connectors, integration code",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload API integration package",
		allowedExtensions: [".zip", ".tar.gz"],
	},
	{
		id: "database_schema",
		label: "Database Schema",
		icon: <Database className="h-4 w-4" />,
		description: "SQL schemas, database structures, migration files",
		requiresFile: false,
		assetType: "code",
		placeholder: "Paste your SQL schema here",
	},
	{
		id: "config_file",
		label: "Configuration File / Template",
		icon: <FileText className="h-4 w-4" />,
		description: "Dockerfiles, CI/CD pipelines, config templates",
		requiresFile: false,
		assetType: "template",
		placeholder: "Paste your configuration here",
	},

	// ─── CREATIVE ASSETS ──────────────────────────────────────
	{
		id: "logo_template",
		label: "Logo Template",
		icon: <Palette className="h-4 w-4" />,
		description: "Custom logo templates, brand identity kits",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload logo template files",
		allowedExtensions: [".zip", ".ai", ".eps", ".svg"],
	},
	{
		id: "font_typography",
		label: "Font / Typography",
		icon: <FileText className="h-4 w-4" />,
		description: "Custom fonts, typefaces, font families",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload font files (.ttf, .otf, .woff)",
		allowedExtensions: [".ttf", ".otf", ".woff", ".woff2", ".zip"],
	},
	{
		id: "stock_media",
		label: "Stock Media (Photo/Video/Audio)",
		icon: <ImageIcon className="h-4 w-4" />,
		description: "Royalty-free photos, videos, audio clips",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your media files",
		allowedExtensions: [".jpg", ".png", ".mp4", ".mp3", ".wav", ".zip"],
	},
	{
		id: "mockup_template",
		label: "Mockup Template",
		icon: <Palette className="h-4 w-4" />,
		description: "Product mockups, device frames, packaging templates",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload mockup template files",
		allowedExtensions: [".zip", ".psd", ".ai"],
	},

	// ─── SOCIAL & MARKETING ──────────────────────────────────
	{
		id: "social_media_kit",
		label: "Social Media Kit",
		icon: <TrendingUp className="h-4 w-4" />,
		description: "Instagram/TikTok templates, overlay packs, story kits",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload social media kit",
		allowedExtensions: [".zip", ".psd"],
	},
	{
		id: "ad_creative",
		label: "Ad Creative Template",
		icon: <TrendingUp className="h-4 w-4" />,
		description: "Facebook/Google ad templates, banner designs",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload ad creative files",
		allowedExtensions: [".zip", ".psd", ".ai"],
	},
	{
		id: "email_template",
		label: "Email Template",
		icon: <FileText className="h-4 w-4" />,
		description: "HTML email templates, campaign frameworks",
		requiresFile: false,
		assetType: "code",
		placeholder: "Paste your HTML email template",
	},

	// ─── EDUCATIONAL ──────────────────────────────────────────
	{
		id: "ebook_guide",
		label: "E-book / Guide",
		icon: <BookOpen className="h-4 w-4" />,
		description: "PDF guides, e-books, documentation",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your PDF file",
		allowedExtensions: [".pdf", ".epub", ".mobi"],
	},
	{
		id: "pdf_manual",
		label: "PDF Manual / Workbook",
		icon: <FileText className="h-4 w-4" />,
		description: "Instruction manuals, workbooks, checklists",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your PDF file",
		allowedExtensions: [".pdf"],
	},
	{
		id: "course_video",
		label: "Video Course / Tutorial",
		icon: <Video className="h-4 w-4" />,
		description: "Pre-recorded video courses, tutorial series",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your video course files",
		allowedExtensions: [".mp4", ".zip", ".rar"],
	},
	{
		id: "workshop_material",
		label: "Workshop Material",
		icon: <BookOpen className="h-4 w-4" />,
		description: "Slide decks, workbooks, workshop guides",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload workshop materials",
		allowedExtensions: [".pdf", ".pptx", ".zip"],
	},

	// ─── PRODUCTIVITY & TEMPLATES ────────────────────────────
	{
		id: "spreadsheet_tool",
		label: "Spreadsheet Tool / Calculator",
		icon: <FileText className="h-4 w-4" />,
		description: "Excel/Google Sheets calculators, trackers, dashboards",
		requiresFile: false,
		assetType: "template",
		placeholder: "Paste your spreadsheet formula or template link",
	},
	{
		id: "browser_extension",
		label: "Browser Extension",
		icon: <Globe className="h-4 w-4" />,
		description: "Chrome/Firefox extensions, userscripts",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload extension package",
		allowedExtensions: [".zip", ".crx"],
	},
	{
		id: "notion_template",
		label: "Notion Template",
		icon: <FileText className="h-4 w-4" />,
		description: "Notion templates, databases, systems",
		requiresFile: false,
		assetType: "link",
		placeholder: "Paste your Notion template link",
	},
	{
		id: "obsidian_vault",
		label: "Obsidian Vault / PKM System",
		icon: <FileText className="h-4 w-4" />,
		description: "Obsidian vaults, personal knowledge management systems",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your Obsidian vault",
		allowedExtensions: [".zip"],
	},

	// ─── AI & TECH ────────────────────────────────────────────
	{
		id: "ai_prompt",
		label: "AI Prompt Library",
		icon: <Code className="h-4 w-4" />,
		description: "ChatGPT prompt libraries, Midjourney prompts",
		requiresFile: false,
		assetType: "code",
		placeholder: "Paste your prompt library here",
	},

	// ─── GAMING & ENTERTAINMENT ──────────────────────────────
	{
		id: "game_asset",
		label: "Game Asset",
		icon: <Layers className="h-4 w-4" />,
		description: "Sprites, character models, level designs",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your game assets",
		allowedExtensions: [".zip", ".fbx", ".gltf", ".png"],
	},
	{
		id: "3d_model",
		label: "3D Model",
		icon: <Layers className="h-4 w-4" />,
		description: "Blender/FBX/GLTF models, textures, materials",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your 3D model files",
		allowedExtensions: [".zip", ".fbx", ".gltf", ".blend", ".obj"],
	},
	{
		id: "minecraft_map",
		label: "Minecraft Map / Adventure",
		icon: <Layers className="h-4 w-4" />,
		description: "Custom Minecraft worlds, adventure maps",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your Minecraft map",
		allowedExtensions: [".zip", ".mcworld"],
	},
	{
		id: "dnd_resource",
		label: "D&D / RPG Resource",
		icon: <BookOpen className="h-4 w-4" />,
		description: "Campaigns, character sheets, rulebooks, maps",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your D&D resources",
		allowedExtensions: [".pdf", ".zip"],
	},

	// ─── AUDIO ─────────────────────────────────────────────────
	{
		id: "music_pack",
		label: "Music Pack / Loops",
		icon: <Music className="h-4 w-4" />,
		description: "Royalty-free music, loops, soundtracks",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your music files",
		allowedExtensions: [".mp3", ".wav", ".flac", ".zip"],
	},
	{
		id: "sound_effect",
		label: "Sound Effect Pack",
		icon: <Music className="h-4 w-4" />,
		description: "SFX packs, sound libraries, audio effects",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your sound effects",
		allowedExtensions: [".mp3", ".wav", ".zip"],
	},

	// ─── STOCK MEDIA ──────────────────────────────────────────
	{
		id: "stock_photo",
		label: "Stock Photo Set",
		icon: <ImageIcon className="h-4 w-4" />,
		description: "Royalty-free photos, image packs",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your photo set",
		allowedExtensions: [".jpg", ".png", ".webp", ".zip"],
	},
	{
		id: "stock_video",
		label: "Stock Video / Footage",
		icon: <Video className="h-4 w-4" />,
		description: "Royalty-free videos, motion graphics, footage",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your video files",
		allowedExtensions: [".mp4", ".mov", ".zip"],
	},

	// ─── CUSTOM ───────────────────────────────────────────────
	{
		id: "custom",
		label: "Custom / Other",
		icon: <Layers className="h-4 w-4" />,
		description: "Other digital products not listed above",
		requiresFile: true,
		assetType: "file",
		placeholder: "Upload your custom digital product",
		allowedExtensions: [".zip", ".rar"],
	},
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export function OneTimeUploadPanel({ userId, onSuccess }: PanelProps) {
	const { createListing } = useMarket(userId);

	// ─── Form State ──────────────────────────────────────────
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [selectedCategory, setSelectedCategory] =
		useState<AssetCategory>("custom");

	// ─── Dynamic Asset State ──────────────────────────────────
	const [assetFile, setAssetFile] = useState<File | null>(null);
	const [assetCode, setAssetCode] = useState("");
	const [assetLink, setAssetLink] = useState("");
	const [assetTemplate, setAssetTemplate] = useState("");

	// ─── File State ──────────────────────────────────────────
	const [coverImage, setCoverImage] = useState<File | null>(null);
	const [coverPreview, setCoverPreview] = useState("");

	// ─── Upload State ────────────────────────────────────────
	const [uploadStatus, setUploadStatus] = useState<UploadStatus>("IDLE");
	const [progressLog, setProgressLog] = useState("");
	const [uploadProgress, setUploadProgress] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// ─── Refs ────────────────────────────────────────────────
	const coverInputRef = useRef<HTMLInputElement>(null);
	const assetInputRef = useRef<HTMLInputElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const currentCategory =
		CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];

	const requiresAsset = currentCategory.requiresFile;

	const {
		saveFormState,
		getFormState,
		clearFormState,
		uploadSession,
		saveUploadProgress,
		clearUploadSession,
	} = useAppSession();

	// ─── Load saved form state ────────────────────────────────
	useEffect(() => {
		const saved = getFormState("one_time_upload");
		if (saved) {
			if (saved.title) setTitle(saved.title);
			if (saved.description) setDescription(saved.description);
			if (saved.price) setPrice(saved.price);
			if (saved.category) setSelectedCategory(saved.category);
		}

		// Load upload session
		if (uploadSession) {
			setProgressLog(
				`📌 Continuing upload: ${uploadSession.title || "Untitled"}`,
			);
			if (uploadSession.current_step === "uploading_cover") {
				setUploadStatus("TRANSMITTING");
			}
		}
	}, []);

	// ─── Auto-save form ────────────────────────────────────────
	const autoSave = useCallback(
		(data: any) => {
			saveFormState("one_time_upload", data);
		},
		[saveFormState],
	);

	// ─── Update progress ──────────────────────────────────────
	const updateProgress = useCallback(
		async (step: string, progress: number) => {
			saveUploadProgress({
				...uploadSession,
				current_step: step,
				progress,
				title,
				description,
				price,
				category: selectedCategory,
			});
		},
		[
			uploadSession,
			title,
			description,
			price,
			selectedCategory,
			saveUploadProgress,
		],
	);

	// ─── On success ────────────────────────────────────────────
	const handleSuccess = () => {
		clearFormState("one_time_upload");
		clearUploadSession();
		onSuccess();
	};

	// ─── Cleanup ──────────────────────────────────────────────
	useEffect(() => {
		return () => {
			if (coverPreview) {
				URL.revokeObjectURL(coverPreview);
			}
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [coverPreview]);

	// ─── Handle Cover Image Selection ──────────────────────
	const handleCoverPick = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			if (
				!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
					file.type,
				)
			) {
				setErrorMessage(
					"Invalid image format. Please upload JPEG, PNG, WebP, or GIF.",
				);
				e.target.value = "";
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				setErrorMessage("Image too large. Maximum size is 5MB.");
				e.target.value = "";
				return;
			}

			if (coverPreview) {
				URL.revokeObjectURL(coverPreview);
			}

			setCoverImage(file);
			setCoverPreview(URL.createObjectURL(file));
			setErrorMessage(null);
		},
		[coverPreview],
	);

	// ─── Handle Asset Selection ──────────────────────────────
	const handleAssetPick = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			const maxSize = 50 * 1024 * 1024;
			if (file.size > maxSize) {
				setErrorMessage(
					`File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`,
				);
				e.target.value = "";
				return;
			}

			setAssetFile(file);
			setErrorMessage(null);
		},
		[],
	);

	// ─── Helper: Upload file with progress ──────────────────
	const uploadFileWithProgress = useCallback(
		(
			uploadUrl: string,
			file: File,
			onProgress: (progress: number) => void,
		): Promise<void> => {
			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();

				xhr.upload.addEventListener("progress", (event) => {
					if (event.lengthComputable) {
						const progress = Math.round((event.loaded / event.total) * 100);
						onProgress(progress);
					}
				});

				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve();
					} else {
						reject(
							new Error(
								`Upload failed with status ${xhr.status}: ${xhr.statusText}`,
							),
						);
					}
				};

				xhr.onerror = () => {
					reject(
						new Error(
							"Network error during upload. Please check your connection.",
						),
					);
				};

				xhr.ontimeout = () => {
					reject(new Error("Upload timed out. Please try again."));
				};

				xhr.open("PUT", uploadUrl);
				xhr.setRequestHeader("Content-Type", file.type);
				xhr.timeout = 120000;
				xhr.send(file);
			});
		},
		[],
	);

	// ─── Helper: Get upload ticket ──────────────────────────
	const getUploadTicket = useCallback(
		async (
			token: string,
			fileName: string,
			fileType: string,
			isPublicBucket: boolean,
		): Promise<UploadTicketResponse> => {
			const response = await fetch("/api/market-place/upload-ticket", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ fileName, fileType, isPublicBucket }),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.error ||
						`Upload ticket request failed (${response.status})`,
				);
			}

			return response.json();
		},
		[],
	);

	// ─── Helper: Get or create store ────────────────────────
	const getOrCreateStore = useCallback(async (): Promise<string> => {
		const { data: storeData, error: storeError } = await supabaseClient
			.from("global_market_stores")
			.select("id")
			.eq("user_id", userId)
			.maybeSingle();

		if (storeError) {
		}

		if (storeData?.id) {
			return storeData.id;
		}

		const { data: newStore, error: createError } = await supabaseClient
			.from("global_market_stores")
			.insert({ user_id: userId })
			.select()
			.single();

		if (createError || !newStore) {
			throw new Error(
				`Failed to create store: ${createError?.message || "Unknown error"}`,
			);
		}

		return newStore.id;
	}, [userId]);

	// ─── Get asset payload based on category type ──────────
	const getAssetPayload = useCallback(() => {
		const basePayload = {
			category: selectedCategory,
			category_label: currentCategory.label,
			asset_type: currentCategory.assetType,
		};

		switch (currentCategory.assetType) {
			case "file":
				return {
					...basePayload,
					file_name: assetFile?.name || null,
					file_size: assetFile?.size || 0,
					file_type: assetFile?.type || null,
				};
			case "code":
				return {
					...basePayload,
					code: assetCode,
				};
			case "template":
				return {
					...basePayload,
					template: assetTemplate,
				};
			case "link":
				return {
					...basePayload,
					link: assetLink,
				};
			default:
				return basePayload;
		}
	}, [
		selectedCategory,
		currentCategory,
		assetFile,
		assetCode,
		assetTemplate,
		assetLink,
	]);

	// ─── Main: Execute Pipeline Deployment ──────────────────
	const executePipelineDeployment = useCallback(async () => {
		// ─── Validation ─────────────────────────────────────────
		if (!title || !price || !coverImage) {
			setErrorMessage(
				"Please fill in all required fields and upload a cover image.",
			);
			return;
		}

		// Validate asset based on category type
		if (currentCategory.requiresFile && !assetFile) {
			setErrorMessage(`Please upload a file for "${currentCategory.label}"`);
			return;
		}

		if (currentCategory.assetType === "code" && !assetCode.trim()) {
			setErrorMessage(`Please paste your code for "${currentCategory.label}"`);
			return;
		}

		if (currentCategory.assetType === "template" && !assetTemplate.trim()) {
			setErrorMessage(
				`Please paste your template for "${currentCategory.label}"`,
			);
			return;
		}

		if (currentCategory.assetType === "link" && !assetLink.trim()) {
			setErrorMessage(`Please provide a link for "${currentCategory.label}"`);
			return;
		}

		setUploadStatus("TRANSMITTING");
		setProgressLog("Validating files before upload...");
		setErrorMessage(null);
		setUploadProgress(0);

		try {
			const session = await supabaseClient.auth.getSession();
			const token = session.data.session?.access_token;
			if (!token) {
				throw new Error("You must be logged in to upload.");
			}

			// ─── STEP 1: Upload Cover Image ──────────────────────
			setProgressLog("📸 Uploading cover image...");

			const coverTicket = await getUploadTicket(
				token,
				coverImage.name,
				coverImage.type,
				true,
			);

			await uploadFileWithProgress(
				coverTicket.uploadUrl,
				coverImage,
				(progress) => setUploadProgress(progress),
			);

			const finalPublicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/marketplace-public/${coverTicket.storagePath}`;

			// ─── STEP 2: Upload Asset File (if required) ─────────
			let vaultPath = "";
			let fileOriginalName = "";
			let fileSizeBytes = 0;
			let fileMimeType = "";

			if (currentCategory.requiresFile && assetFile) {
				setProgressLog(
					`📦 Uploading asset file (${(assetFile.size / 1024 / 1024).toFixed(2)} MB)...`,
				);

				const assetTicket = await getUploadTicket(
					token,
					assetFile.name,
					assetFile.type,
					false,
				);

				await uploadFileWithProgress(
					assetTicket.uploadUrl,
					assetFile,
					(progress) => setUploadProgress(progress),
				);

				vaultPath = assetTicket.storagePath;
				fileOriginalName = assetFile.name;
				fileSizeBytes = assetFile.size;
				fileMimeType = assetFile.type;
			}

			// ─── STEP 3: Create Listing ──────────────────────────
			setUploadStatus("FINALIZING");
			setProgressLog("📝 Creating listing record...");

			const storeId = await getOrCreateStore();
			const assetPayload = getAssetPayload();

			const { data: listing, error: lErr } = await supabaseClient
				.from("market_listings")
				.insert({
					seller_id: userId,
					store_id: storeId,
					title: title.trim(),
					description: description.trim(),
					display_pic_url: finalPublicUrl,
					price: parseFloat(price),
					tab_category: "product",
					product_sale_type: "one_time",
					status: "pending_verification",
					encrypted_asset_payload: JSON.stringify({
						...assetPayload,
						vault_path: vaultPath,
					}),
				})
				.select()
				.single();

			if (lErr || !listing) {
				throw new Error(
					`Listing creation failed: ${lErr?.message || "Unknown error"}`,
				);
			}

			// ─── STEP 4: Create Tool Record ──────────────────────
			setProgressLog("🔧 Creating digital tool record...");

			const { data: tool, error: tErr } = await supabaseClient
				.from("one_time_digital_tools")
				.insert({
					listing_id: listing.id,
					seller_id: userId,
					product_title: title.trim(),
					product_description: description.trim(),
					sale_price: parseFloat(price),
					display_cover_url: finalPublicUrl,
					storage_vault_path: vaultPath,
					file_original_name: fileOriginalName || "no-file",
					file_size_bytes: fileSizeBytes || 0,
					file_mime_type: fileMimeType || "application/octet-stream",
					safety_status: "SCANNING",
					asset_category: selectedCategory,
					asset_type: currentCategory.assetType,
					asset_content: currentCategory.requiresFile
						? null
						: JSON.stringify(getAssetPayload()),
				})
				.select()
				.single();

			if (tErr || !tool) {
				throw new Error(
					`Tool record creation failed: ${tErr?.message || "Unknown error"}`,
				);
			}

			// ─── STEP 5: Security Scan (only for files) ──────────
			if (currentCategory.requiresFile && vaultPath) {
				setProgressLog("🔒 Running security scan...");
				await triggerSecurityScan(token, listing.id, tool.id, vaultPath);
			} else {
				// Skip scan for non-file assets
				await supabaseClient
					.from("one_time_digital_tools")
					.update({ safety_status: "PASSED" })
					.eq("id", tool.id);
			}

			setUploadStatus("SUCCESS");
			setProgressLog("✅ Deployment complete! Your listing is now live.");
			setUploadProgress(100);

			setTimeout(() => {
				onSuccess();
			}, 2000);
		} catch (err: any) {
			setUploadStatus("ERROR");
			setErrorMessage(
				err.message || "An unexpected error occurred during upload.",
			);
			setProgressLog(`❌ Error: ${err.message}`);

			setTimeout(() => {
				setUploadStatus("IDLE");
				setProgressLog("");
			}, 5000);
		}
	}, [
		title,
		description,
		price,
		coverImage,
		assetFile,
		selectedCategory,
		currentCategory,
		assetCode,
		assetTemplate,
		assetLink,
		getAssetPayload,
		getUploadTicket,
		uploadFileWithProgress,
		getOrCreateStore,
		userId,
		onSuccess,
	]);

	// ─── Trigger Security Scan ──────────────────────────────
	const triggerSecurityScan = useCallback(
		async (
			token: string,
			listingId: string,
			toolId: string,
			storagePath: string,
		): Promise<void> => {
			const response = await fetch("/api/market-place/verify-asset", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ listingId, toolId, storagePath }),
			});

			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				const text = await response.text();
				throw new Error(
					`Security scan failed: Server returned ${response.status}`,
				);
			}

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.reason || errorData.error || "Security scan failed",
				);
			}

			const result = await response.json();

			if (!result.verified) {
				throw new Error(result.reason || "Security scan failed");
			}
		},
		[],
	);

	// ─── Reset form ──────────────────────────────────────────
	const resetForm = useCallback(() => {
		if (coverPreview) {
			URL.revokeObjectURL(coverPreview);
		}
		setTitle("");
		setDescription("");
		setPrice("");
		setCoverImage(null);
		setCoverPreview("");
		setAssetFile(null);
		setAssetCode("");
		setAssetLink("");
		setAssetTemplate("");
		setSelectedCategory("custom");
		setUploadStatus("IDLE");
		setProgressLog("");
		setUploadProgress(0);
		setErrorMessage(null);
	}, [coverPreview]);

	// ─── Validation ──────────────────────────────────────────
	const isFormValid = useCallback(() => {
		if (!title || !price || !coverImage || uploadStatus !== "IDLE")
			return false;

		if (currentCategory.requiresFile && !assetFile) return false;
		if (currentCategory.assetType === "code" && !assetCode.trim()) return false;
		if (currentCategory.assetType === "template" && !assetTemplate.trim())
			return false;
		if (currentCategory.assetType === "link" && !assetLink.trim()) return false;

		return true;
	}, [
		title,
		price,
		coverImage,
		uploadStatus,
		currentCategory,
		assetFile,
		assetCode,
		assetTemplate,
		assetLink,
	]);

	// ─── Render Dynamic Asset Field ──────────────────────────
	const renderAssetField = () => {
		if (currentCategory.requiresFile) {
			return (
				<div className="space-y-1.5">
					<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
						Asset File
					</Label>
					<input
						type="file"
						ref={assetInputRef}
						onChange={handleAssetPick}
						className="hidden"
					/>
					{!assetFile ? (
						<div
							onClick={() => assetInputRef.current?.click()}
							className="border-2 border-dashed border-zinc-800 bg-zinc-950/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/20 transition-colors group"
						>
							<CloudUpload className="h-5 w-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
							<span className="text-xs font-medium text-zinc-400">
								{currentCategory.placeholder}
							</span>
							{currentCategory.allowedExtensions && (
								<span className="text-[9px] text-zinc-600">
									Allowed: {currentCategory.allowedExtensions.join(", ")}
								</span>
							)}
						</div>
					) : (
						<div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<FileCheck className="h-5 w-5 text-emerald-400" />
								<div>
									<p className="text-xs font-bold text-zinc-200 truncate max-w-[180px]">
										{assetFile.name}
									</p>
									<p className="text-[10px] text-zinc-500">
										{(assetFile.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => setAssetFile(null)}
								className="h-7 text-[10px] rounded-lg text-zinc-500 hover:text-white"
							>
								<X className="h-3.5 w-3.5" />
							</Button>
						</div>
					)}
				</div>
			);
		}

		switch (currentCategory.assetType) {
			case "code":
				return (
					<div className="space-y-1.5">
						<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
							Code / Script
						</Label>
						<Textarea
							value={assetCode}
							onChange={(e) => setAssetCode(e.target.value)}
							className="bg-zinc-950 border-zinc-800 text-sm rounded-xl resize-none font-mono text-zinc-200"
							rows={6}
							placeholder={currentCategory.placeholder}
						/>
					</div>
				);

			case "template":
				return (
					<div className="space-y-1.5">
						<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
							Template / Content
						</Label>
						<Textarea
							value={assetTemplate}
							onChange={(e) => setAssetTemplate(e.target.value)}
							className="bg-zinc-950 border-zinc-800 text-sm rounded-xl resize-none font-mono text-zinc-200"
							rows={4}
							placeholder={currentCategory.placeholder}
						/>
					</div>
				);

			case "link":
				return (
					<div className="space-y-1.5">
						<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
							Resource Link
						</Label>
						<Input
							value={assetLink}
							onChange={(e) => setAssetLink(e.target.value)}
							className="bg-zinc-950 border-zinc-800 text-sm rounded-xl text-white"
							placeholder={currentCategory.placeholder}
						/>
					</div>
				);

			default:
				return null;
		}
	};

	// ─── Render ───────────────────────────────────────────────
	return (
		<div className="w-full max-w-4xl mx-auto bg-zinc-950/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6">
			<div className="flex items-center gap-3 border-b border-white/5 pb-4">
				<Sparkles className="h-5 w-5 text-emerald-400" />
				<div>
					<h2 className="text-base font-black text-white tracking-tight">
						Deploy One-Time Digital Asset
					</h2>
					<p className="text-xs text-zinc-500 mt-0.5">
						Choose a category, fill in the details, and publish your digital
						product.
					</p>
				</div>
			</div>

			{uploadStatus === "IDLE" ? (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
					{/* ─── LEFT COLUMN ──────────────────────────────────── */}
					<div className="space-y-4">
						{/* ─── Category Selector ────────────────────────── */}
						<div className="space-y-1.5">
							<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
								Product Category
							</Label>
							<Select
								value={selectedCategory}
								onValueChange={(value) =>
									setSelectedCategory(value as AssetCategory)
								}
							>
								<SelectTrigger className="bg-zinc-950 border-zinc-800 rounded-xl h-11 text-sm text-white">
									<SelectValue placeholder="Select category..." />
								</SelectTrigger>
								<SelectContent className="bg-zinc-950 border-zinc-800 rounded-xl max-h-[300px]">
									{CATEGORIES.map((cat) => (
										<SelectItem
											key={cat.id}
											value={cat.id}
											className="text-sm text-zinc-300 hover:bg-zinc-900 focus:bg-zinc-900"
										>
											<div className="flex items-center gap-2">
												{cat.icon}
												<span>{cat.label}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-[9px] text-zinc-600 mt-1">
								{currentCategory.description}
								{!currentCategory.requiresFile && (
									<span className="text-amber-400 ml-1">
										(No file upload required)
									</span>
								)}
							</p>
						</div>

						{/* ─── Title ────────────────────────────────────── */}
						<div className="space-y-1.5">
							<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
								Product Display Name
							</Label>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="bg-zinc-950 border-zinc-800 text-sm rounded-xl h-10 text-white"
								placeholder="e.g., UI Dashboard Source Kit"
							/>
						</div>

						{/* ─── Price ────────────────────────────────────── */}
						<div className="space-y-1.5">
							<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
								Sale Price (USD)
							</Label>
							<Input
								type="number"
								step="0.01"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								className="bg-zinc-950 border-zinc-800 text-sm rounded-xl h-10 text-white"
								placeholder="0.00"
							/>
						</div>

						{/* ─── Description ──────────────────────────────── */}
						<div className="space-y-1.5">
							<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
								Description
							</Label>
							<Textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="bg-zinc-950 border-zinc-800 text-sm rounded-xl resize-none text-white"
								rows={3}
								placeholder="Describe your product, features, and what the buyer will receive..."
							/>
						</div>
					</div>

					{/* ─── RIGHT COLUMN ─────────────────────────────────── */}
					<div className="space-y-4">
						{/* ─── Cover Image ───────────────────────────────── */}
						<div className="space-y-1.5">
							<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
								Public Cover Image
							</Label>
							<input
								type="file"
								ref={coverInputRef}
								onChange={handleCoverPick}
								accept="image/*"
								className="hidden"
							/>
							{!coverPreview ? (
								<div
									onClick={() => coverInputRef.current?.click()}
									className="border-2 border-dashed border-zinc-800 bg-zinc-950/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/20 transition-colors"
								>
									<ImageIcon className="h-5 w-5 text-zinc-500" />
									<span className="text-xs font-medium text-zinc-400">
										Select Cover Image
									</span>
									<span className="text-[9px] text-zinc-600">
										JPEG, PNG, WebP, GIF · Max 5MB
									</span>
								</div>
							) : (
								<div className="relative rounded-xl overflow-hidden border border-zinc-800 h-32 bg-black">
									<img
										src={coverPreview}
										alt="Cover Preview"
										className="w-full h-full object-cover"
									/>
									<button
										onClick={() => {
											if (coverPreview) URL.revokeObjectURL(coverPreview);
											setCoverImage(null);
											setCoverPreview("");
										}}
										className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 border border-white/10 text-white hover:bg-white/20 transition-colors"
									>
										<X className="h-3.5 w-3.5" />
									</button>
								</div>
							)}
						</div>

						{/* ─── Dynamic Asset Field ───────────────────────── */}
						{renderAssetField()}

						{/* ─── Category Type Badge ───────────────────────── */}
						<div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/50 border border-white/5">
							<div className="p-1.5 rounded-lg bg-zinc-800/50">
								{currentCategory.icon}
							</div>
							<div>
								<p className="text-[10px] font-bold text-zinc-300">
									{currentCategory.label}
								</p>
								<p className="text-[9px] text-zinc-500">
									Asset Type: {currentCategory.assetType}
									{currentCategory.requiresFile && " · File Required"}
								</p>
							</div>
						</div>

						{/* ─── Submit ────────────────────────────────────── */}
						<Button
							onClick={executePipelineDeployment}
							disabled={!isFormValid()}
							className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs h-11 rounded-xl transition-all shadow-xl shadow-emerald-500/5 disabled:opacity-20"
						>
							Authorize Pipeline Release & Publish Listing
						</Button>

						{/* ─── Error ────────────────────────────────────── */}
						{errorMessage && (
							<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
								<AlertCircle className="h-4 w-4 shrink-0" />
								<span>{errorMessage}</span>
							</div>
						)}
					</div>
				</div>
			) : (
				/* ─── Upload Status ─────────────────────────────────── */
				<div className="flex flex-col items-center justify-center py-16 text-center space-y-4 animate-in zoom-in-95 duration-200">
					<Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
					<div className="space-y-1">
						<h4 className="text-sm font-bold text-white tracking-tight uppercase">
							{uploadStatus === "TRANSMITTING" && "Uploading Asset..."}
							{uploadStatus === "FINALIZING" && "Finalizing Listing..."}
							{uploadStatus === "SUCCESS" && "✅ Deployment Complete!"}
							{uploadStatus === "ERROR" && "❌ Upload Failed"}
						</h4>
						<p className="text-xs font-mono text-zinc-500 bg-zinc-950/80 px-3 py-1.5 rounded-lg border border-zinc-800/60 transition-all">
							{progressLog}
						</p>
						{uploadProgress > 0 && uploadStatus !== "SUCCESS" && (
							<div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden mx-auto mt-2">
								<div
									className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
