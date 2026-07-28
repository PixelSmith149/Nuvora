// components/market/ReusableUploadPanel.tsx

"use client";

import {
	AlertCircle,
	AlertTriangle,
	BookOpen,
	CheckCircle2,
	CloudUpload,
	Code2,
	Database,
	FileCheck,
	FileText,
	Globe,
	HelpCircle,
	Image as ImageIcon,
	Layers,
	Loader2,
	Music,
	Palette,
	ShoppingBag,
	Smartphone,
	Sparkles,
	TrendingUp,
	Users,
	Video,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
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

// ============================================================
// TYPES
// ============================================================

type ReusableCategory =
	| "notion_template"
	| "canva_template"
	| "excel_tracker"
	| "resume_template"
	| "digital_planner"
	| "saas_boilerplate"
	| "code_snippets"
	| "cli_tool"
	| "browser_extension"
	| "github_repo"
	| "font_typography"
	| "logo_pack"
	| "stock_media"
	| "digital_art"
	| "ui_kit"
	| "online_course"
	| "ebook_guide"
	| "video_tutorial"
	| "workshop_material"
	| "interview_prep"
	| "marketing_kit"
	| "social_media_template"
	| "email_template"
	| "productivity_system"
	| "spreadsheet_tool"
	| "ai_prompt_library"
	| "ai_powered_tool"
	| "game_asset"
	| "3d_model"
	| "music_pack"
	| "fitness_guide"
	| "meal_plan"
	| "meditation_track"
	| "habit_tracker"
	| "custom";

interface CategoryConfig {
	id: ReusableCategory;
	label: string;
	icon: React.ReactNode;
	description: string;
	requiresFile: boolean;
	fileTypes?: string[];
	assetType: "file" | "link" | "text" | "json";
	placeholder: string;
	maxFileSize?: number;
}

// ============================================================
// CATEGORY CONFIGURATIONS
// ============================================================

const CATEGORIES: CategoryConfig[] = [
	// ─── TEMPLATES & PLANNERS ──────────────────────────────
	{
		id: "notion_template",
		label: "Notion Template",
		icon: <FileText className="h-4 w-4" />,
		description: "Notion dashboards, planners, trackers, and systems",
		requiresFile: false,
		assetType: "link",
		placeholder: "Paste your Notion template share link",
	},
	{
		id: "canva_template",
		label: "Canva Template",
		icon: <Palette className="h-4 w-4" />,
		description: "Canva social media kits, presentations, templates",
		requiresFile: false,
		assetType: "link",
		placeholder: "Paste your Canva template link",
	},
	{
		id: "excel_tracker",
		label: "Excel/Sheets Tracker",
		icon: <FileText className="h-4 w-4" />,
		description: "Budget planners, inventory trackers, dashboards",
		requiresFile: true,
		fileTypes: [".xlsx", ".xls", ".csv", ".gsheet"],
		assetType: "file",
		placeholder: "Upload your Excel/Sheets file",
	},
	{
		id: "resume_template",
		label: "Resume/Proposal Template",
		icon: <FileText className="h-4 w-4" />,
		description: "Professional resume designs, proposal templates",
		requiresFile: true,
		fileTypes: [".pdf", ".docx", ".zip"],
		assetType: "file",
		placeholder: "Upload your template files",
	},
	{
		id: "digital_planner",
		label: "Digital Planner",
		icon: <FileText className="h-4 w-4" />,
		description: "Daily/weekly/monthly planners, goal journals",
		requiresFile: true,
		fileTypes: [".pdf", ".png", ".zip"],
		assetType: "file",
		placeholder: "Upload your digital planner",
	},

	// ─── DEVELOPER & CODE ──────────────────────────────────
	{
		id: "saas_boilerplate",
		label: "SaaS Boilerplate",
		icon: <Code2 className="h-4 w-4" />,
		description: "Full-stack starter kits with auth & payments",
		requiresFile: true,
		fileTypes: [".zip", ".tar.gz"],
		assetType: "file",
		placeholder: "Upload your boilerplate ZIP",
		maxFileSize: 200,
	},
	{
		id: "code_snippets",
		label: "Code Snippets & Libraries",
		icon: <Code2 className="h-4 w-4" />,
		description: "React components, utilities, API wrappers",
		requiresFile: false,
		assetType: "text",
		placeholder: "Paste your code snippets here",
	},
	{
		id: "cli_tool",
		label: "CLI Tool / Script",
		icon: <Code2 className="h-4 w-4" />,
		description: "Command-line tools, automation scripts, generators",
		requiresFile: true,
		fileTypes: [".zip", ".tar.gz", ".sh", ".py"],
		assetType: "file",
		placeholder: "Upload your CLI tool",
	},
	{
		id: "browser_extension",
		label: "Browser Extension",
		icon: <Globe className="h-4 w-4" />,
		description: "Chrome/Firefox extensions, userscripts",
		requiresFile: true,
		fileTypes: [".zip", ".crx"],
		assetType: "file",
		placeholder: "Upload your extension package",
	},
	{
		id: "github_repo",
		label: "GitHub Repository Access",
		icon: <Code2 className="h-4 w-4" />,
		description: "Private GitHub repo access, production code",
		requiresFile: false,
		assetType: "link",
		placeholder: "Paste the GitHub repository link",
	},

	// ─── CREATIVE & DESIGN ──────────────────────────────────
	{
		id: "font_typography",
		label: "Font / Typography",
		icon: <FileText className="h-4 w-4" />,
		description: "Custom fonts, typefaces, font families",
		requiresFile: true,
		fileTypes: [".ttf", ".otf", ".woff", ".woff2", ".zip"],
		assetType: "file",
		placeholder: "Upload your font files",
	},
	{
		id: "logo_pack",
		label: "Logo Pack / Brand Kit",
		icon: <Palette className="h-4 w-4" />,
		description: "Logo templates, brand identity kits",
		requiresFile: true,
		fileTypes: [".zip", ".ai", ".eps", ".svg"],
		assetType: "file",
		placeholder: "Upload your logo pack",
	},
	{
		id: "stock_media",
		label: "Stock Media (Photos/Video/Audio)",
		icon: <ImageIcon className="h-4 w-4" />,
		description: "Royalty-free stock photos, videos, audio",
		requiresFile: true,
		fileTypes: [".jpg", ".png", ".mp4", ".mp3", ".wav", ".zip"],
		assetType: "file",
		placeholder: "Upload your stock media files",
	},
	{
		id: "digital_art",
		label: "Digital Art / Illustrations",
		icon: <Palette className="h-4 w-4" />,
		description: "Digital artwork, illustrations, graphics",
		requiresFile: true,
		fileTypes: [".png", ".jpg", ".svg", ".ai", ".zip"],
		assetType: "file",
		placeholder: "Upload your digital art",
	},
	{
		id: "ui_kit",
		label: "UI Kit / Design System",
		icon: <Palette className="h-4 w-4" />,
		description: "Figma/Adobe XD kits, component libraries",
		requiresFile: true,
		fileTypes: [".zip", ".fig", ".xd"],
		assetType: "file",
		placeholder: "Upload your UI Kit",
	},

	// ─── EDUCATIONAL ────────────────────────────────────────
	{
		id: "online_course",
		label: "Online Course / Masterclass",
		icon: <BookOpen className="h-4 w-4" />,
		description: "Video courses, tutorials, masterclasses",
		requiresFile: true,
		fileTypes: [".zip", ".mp4", ".rar"],
		assetType: "file",
		placeholder: "Upload your course files",
	},
	{
		id: "ebook_guide",
		label: "E-book / Guide",
		icon: <BookOpen className="h-4 w-4" />,
		description: "PDF guides, e-books, documentation",
		requiresFile: true,
		fileTypes: [".pdf", ".epub", ".mobi"],
		assetType: "file",
		placeholder: "Upload your PDF/EPUB file",
	},
	{
		id: "video_tutorial",
		label: "Video Tutorial",
		icon: <Video className="h-4 w-4" />,
		description: "Pre-recorded video tutorials, screen recordings",
		requiresFile: true,
		fileTypes: [".mp4", ".mov", ".zip"],
		assetType: "file",
		placeholder: "Upload your video tutorial",
	},
	{
		id: "workshop_material",
		label: "Workshop Material",
		icon: <BookOpen className="h-4 w-4" />,
		description: "Slide decks, workbooks, workshop guides",
		requiresFile: true,
		fileTypes: [".pdf", ".pptx", ".zip"],
		assetType: "file",
		placeholder: "Upload your workshop materials",
	},
	{
		id: "interview_prep",
		label: "Interview Prep / System Design",
		icon: <BookOpen className="h-4 w-4" />,
		description: "Coding interview guides, system design resources",
		requiresFile: true,
		fileTypes: [".pdf", ".zip"],
		assetType: "file",
		placeholder: "Upload your interview prep material",
	},

	// ─── BUSINESS & MARKETING ──────────────────────────────
	{
		id: "marketing_kit",
		label: "Marketing Kit / Funnel",
		icon: <TrendingUp className="h-4 w-4" />,
		description: "Email swipe files, ad libraries, funnels",
		requiresFile: true,
		fileTypes: [".zip", ".pdf", ".docx"],
		assetType: "file",
		placeholder: "Upload your marketing kit",
	},
	{
		id: "social_media_template",
		label: "Social Media Template",
		icon: <TrendingUp className="h-4 w-4" />,
		description: "Instagram/TikTok templates, brand visual kits",
		requiresFile: true,
		fileTypes: [".zip", ".psd", ".ai"],
		assetType: "file",
		placeholder: "Upload your social media templates",
	},
	{
		id: "email_template",
		label: "Email Template",
		icon: <FileText className="h-4 w-4" />,
		description: "HTML email templates, campaign frameworks",
		requiresFile: false,
		assetType: "text",
		placeholder: "Paste your HTML email template code",
	},
	{
		id: "productivity_system",
		label: "Productivity System",
		icon: <FileText className="h-4 w-4" />,
		description: "PKM systems, workflow templates, Obsidian vaults",
		requiresFile: false,
		assetType: "text",
		placeholder: "Paste your system description or template",
	},
	{
		id: "spreadsheet_tool",
		label: "Spreadsheet Tool / Calculator",
		icon: <FileText className="h-4 w-4" />,
		description: "Automated spreadsheets, calculators, dashboards",
		requiresFile: true,
		fileTypes: [".xlsx", ".xls", ".csv"],
		assetType: "file",
		placeholder: "Upload your spreadsheet file",
	},

	// ─── AI & TECH ──────────────────────────────────────────
	{
		id: "ai_prompt_library",
		label: "AI Prompt Library",
		icon: <Code2 className="h-4 w-4" />,
		description: "ChatGPT, Midjourney, Claude prompt collections",
		requiresFile: false,
		assetType: "text",
		placeholder: "Paste your prompt library here",
	},
	{
		id: "ai_powered_tool",
		label: "AI-Powered Tool",
		icon: <Code2 className="h-4 w-4" />,
		description: "AI-based content generators, analyzers, tools",
		requiresFile: false,
		assetType: "link",
		placeholder: "Paste your AI tool link",
	},

	// ─── GAMING & CREATIVE ──────────────────────────────────
	{
		id: "game_asset",
		label: "Game Asset",
		icon: <Layers className="h-4 w-4" />,
		description: "Sprites, character models, level designs",
		requiresFile: true,
		fileTypes: [".zip", ".fbx", ".gltf", ".png"],
		assetType: "file",
		placeholder: "Upload your game assets",
	},
	{
		id: "3d_model",
		label: "3D Model",
		icon: <Layers className="h-4 w-4" />,
		description: "3D models, textures, materials",
		requiresFile: true,
		fileTypes: [".zip", ".fbx", ".gltf", ".blend", ".obj"],
		assetType: "file",
		placeholder: "Upload your 3D model files",
	},
	{
		id: "music_pack",
		label: "Music Pack / Beats",
		icon: <Music className="h-4 w-4" />,
		description: "Royalty-free music, beats, soundtracks",
		requiresFile: true,
		fileTypes: [".mp3", ".wav", ".flac", ".zip"],
		assetType: "file",
		placeholder: "Upload your music pack",
	},

	// ─── LIFESTYLE & PERSONAL DEVELOPMENT ──────────────────
	{
		id: "fitness_guide",
		label: "Fitness Guide / Workout Plan",
		icon: <FileText className="h-4 w-4" />,
		description: "Workout programs, fitness guides",
		requiresFile: true,
		fileTypes: [".pdf", ".zip"],
		assetType: "file",
		placeholder: "Upload your fitness guide",
	},
	{
		id: "meal_plan",
		label: "Meal Plan / Recipes",
		icon: <FileText className="h-4 w-4" />,
		description: "Meal plans, recipe collections, nutrition guides",
		requiresFile: true,
		fileTypes: [".pdf", ".zip"],
		assetType: "file",
		placeholder: "Upload your meal plan",
	},
	{
		id: "meditation_track",
		label: "Meditation Track / Audio",
		icon: <Music className="h-4 w-4" />,
		description: "Guided meditations, mindfulness tracks",
		requiresFile: true,
		fileTypes: [".mp3", ".wav", ".zip"],
		assetType: "file",
		placeholder: "Upload your meditation audio",
	},
	{
		id: "habit_tracker",
		label: "Habit Tracker / Journal",
		icon: <FileText className="h-4 w-4" />,
		description: "Habit tracking templates, journal prompts",
		requiresFile: true,
		fileTypes: [".pdf", ".zip"],
		assetType: "file",
		placeholder: "Upload your habit tracker",
	},

	// ─── CUSTOM ─────────────────────────────────────────────
	{
		id: "custom",
		label: "Custom / Other",
		icon: <Layers className="h-4 w-4" />,
		description: "Other digital products not listed",
		requiresFile: true,
		fileTypes: [".zip", ".rar"],
		assetType: "file",
		placeholder: "Upload your custom product",
	},
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export function ReusableUploadPanel({
	userId,
	onSuccess,
}: {
	userId: string;
	onSuccess: () => void;
}) {
	// ─── Form State ──────────────────────────────────────────
	const [selectedCategory, setSelectedCategory] =
		useState<ReusableCategory>("custom");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [diyManual, setDiyManual] = useState("");
	const [cautions, setCautions] = useState("");
	const [price, setPrice] = useState("");

	// ─── File State ──────────────────────────────────────────
	const [coverImage, setCoverImage] = useState<File | null>(null);
	const [coverPreview, setCoverPreview] = useState("");
	const [coreFile, setCoreFile] = useState<File | null>(null);

	// ─── Dynamic Asset State ─────────────────────────────────
	const [textContent, setTextContent] = useState("");
	const [linkContent, setLinkContent] = useState("");

	// ─── Upload State ────────────────────────────────────────
	const [status, setStatus] = useState<
		"IDLE" | "PROCESSING" | "SUCCESS" | "ERROR"
	>("IDLE");
	const [progressLog, setProgressLog] = useState("");
	const [uploadProgress, setUploadProgress] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// ─── Refs ────────────────────────────────────────────────
	const coverInputRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// ─── Get Current Category Config ────────────────────────
	const currentCategory =
		CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];

	// ─── Cleanup ──────────────────────────────────────────────
	useEffect(() => {
		return () => {
			if (coverPreview) {
				URL.revokeObjectURL(coverPreview);
			}
		};
	}, [coverPreview]);

	// ─── Handle Cover Image ──────────────────────────────────
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

	// ─── Handle Core File ────────────────────────────────────
	const handleFilePick = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			const maxSize = (currentCategory.maxFileSize || 50) * 1024 * 1024;
			if (file.size > maxSize) {
				setErrorMessage(
					`File too large. Maximum size is ${currentCategory.maxFileSize || 50}MB.`,
				);
				e.target.value = "";
				return;
			}

			// Check file extension if specified
			if (currentCategory.fileTypes && currentCategory.fileTypes.length > 0) {
				const ext = "." + file.name.split(".").pop()?.toLowerCase();
				if (!currentCategory.fileTypes.includes(ext)) {
					setErrorMessage(
						`Invalid file type. Allowed: ${currentCategory.fileTypes.join(", ")}`,
					);
					e.target.value = "";
					return;
				}
			}

			setCoreFile(file);
			setErrorMessage(null);
		},
		[currentCategory],
	);

	// ─── Upload File with Progress ──────────────────────────
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
						onProgress(Math.round((event.loaded / event.total) * 100));
					}
				});

				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) resolve();
					else reject(new Error(`Upload failed: ${xhr.status}`));
				};

				xhr.onerror = () => reject(new Error("Network error"));
				xhr.ontimeout = () => reject(new Error("Upload timed out"));
				xhr.open("PUT", uploadUrl);
				xhr.setRequestHeader("Content-Type", file.type);
				xhr.timeout = 120000;
				xhr.send(file);
			});
		},
		[],
	);

	// ─── Get Upload Ticket ──────────────────────────────────
	const getUploadTicket = useCallback(
		async (
			token: string,
			fileName: string,
			fileType: string,
			isPublic: boolean,
		) => {
			const response = await fetch("/api/market-place/upload-ticket", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ fileName, fileType, isPublicBucket: isPublic }),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.error || `Upload ticket failed (${response.status})`,
				);
			}

			return response.json();
		},
		[],
	);

	// ─── Get or Create Store ─────────────────────────────────
	const getOrCreateStore = useCallback(async (): Promise<string> => {
		const { data: storeData, error: storeError } = await supabaseClient
			.from("global_market_stores")
			.select("id")
			.eq("user_id", userId)
			.maybeSingle();

		if (storeData?.id) return storeData.id;

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

	// ─── Process Upload ──────────────────────────────────────
	const processUploadPipeline = async () => {
		// ─── Validation ─────────────────────────────────────────
		if (!title || !price || !coverImage) {
			setErrorMessage(
				"Please fill in all required fields and upload a cover image.",
			);
			return;
		}

		if (currentCategory.requiresFile && !coreFile) {
			setErrorMessage(`Please upload a file for "${currentCategory.label}"`);
			return;
		}

		if (currentCategory.assetType === "text" && !textContent.trim()) {
			setErrorMessage(
				`Please paste your content for "${currentCategory.label}"`,
			);
			return;
		}

		if (currentCategory.assetType === "link" && !linkContent.trim()) {
			setErrorMessage(`Please provide a link for "${currentCategory.label}"`);
			return;
		}

		setStatus("PROCESSING");
		setProgressLog("Validating files...");
		setErrorMessage(null);
		setUploadProgress(0);

		try {
			const session = await supabaseClient.auth.getSession();
			const token = session.data.session?.access_token;
			if (!token) throw new Error("You must be logged in.");

			// ─── Upload Cover Image ──────────────────────────────
			setProgressLog("📸 Uploading cover image...");
			const coverTicket = await getUploadTicket(
				token,
				coverImage.name,
				coverImage.type,
				true,
			);
			await uploadFileWithProgress(coverTicket.uploadUrl, coverImage, (p) =>
				setUploadProgress(p),
			);
			const coverUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/marketplace-public/${coverTicket.storagePath}`;

			// ─── Upload Core File (if needed) ─────────────────────
			let vaultPath = "";
			let fileName = "";
			let fileSize = 0;

			if (currentCategory.requiresFile && coreFile) {
				setProgressLog(`📦 Uploading ${currentCategory.label}...`);
				const fileTicket = await getUploadTicket(
					token,
					coreFile.name,
					coreFile.type,
					false,
				);
				await uploadFileWithProgress(fileTicket.uploadUrl, coreFile, (p) =>
					setUploadProgress(p),
				);
				vaultPath = fileTicket.storagePath;
				fileName = coreFile.name;
				fileSize = coreFile.size;
			}

			// ─── Build Fulfillment Payload ────────────────────────
			const fulfillmentPayload: any = {
				category: selectedCategory,
				category_label: currentCategory.label,
				asset_type: currentCategory.assetType,
			};

			if (currentCategory.requiresFile) {
				fulfillmentPayload.vault_path = vaultPath;
				fulfillmentPayload.file_name = fileName;
				fulfillmentPayload.file_size = fileSize;
			}

			if (currentCategory.assetType === "text") {
				fulfillmentPayload.text_content = textContent;
			}

			if (currentCategory.assetType === "link") {
				fulfillmentPayload.link = linkContent;
			}

			// ─── Create Store ─────────────────────────────────────
			setProgressLog("📝 Creating listing...");
			const storeId = await getOrCreateStore();

			// ─── Create Listing ───────────────────────────────────
			const { data: listing, error: lErr } = await supabaseClient
				.from("market_listings")
				.insert({
					seller_id: userId,
					store_id: storeId,
					title: title.trim(),
					description: description.trim(),
					display_pic_url: coverUrl,
					price: parseFloat(price),
					tab_category: "digital_tool",
					product_sale_type: "recurring",
					status: "active",
					encrypted_asset_payload: JSON.stringify(fulfillmentPayload),
				})
				.select()
				.single();

			if (lErr || !listing) {
				throw new Error(
					`Listing creation failed: ${lErr?.message || "Unknown error"}`,
				);
			}

			// ─── Create Reusable Product Record ──────────────────
			setProgressLog("🔧 Creating reusable product record...");
			const { data: product, error: pErr } = await supabaseClient
				.from("reusable_digital_products")
				.insert({
					listing_id: listing.id,
					seller_id: userId,
					asset_category: selectedCategory,
					product_title: title.trim(),
					product_description: description.trim(),
					usage_guidelines_diy: diyManual || null,
					risk_cautions: cautions || null,
					sale_price: parseFloat(price),
					display_cover_url: coverUrl,
					fulfillment_payload: fulfillmentPayload,
					safety_status: "pending",
				})
				.select()
				.single();

			if (pErr || !product) {
				throw new Error(
					`Product record creation failed: ${pErr?.message || "Unknown error"}`,
				);
			}

			// ─── Success ──────────────────────────────────────────
			setStatus("SUCCESS");
			setProgressLog("✅ Deployment complete! Your product is now live.");
			setUploadProgress(100);

			setTimeout(() => {
				onSuccess();
			}, 2000);
		} catch (err: any) {
			setStatus("ERROR");
			setErrorMessage(err.message || "An unexpected error occurred.");
			setProgressLog(`❌ Error: ${err.message}`);

			setTimeout(() => {
				setStatus("IDLE");
				setProgressLog("");
			}, 5000);
		}
	};

	// ─── Reset Form ──────────────────────────────────────────
	const resetForm = useCallback(() => {
		if (coverPreview) URL.revokeObjectURL(coverPreview);
		setTitle("");
		setDescription("");
		setDiyManual("");
		setCautions("");
		setPrice("");
		setCoverImage(null);
		setCoverPreview("");
		setCoreFile(null);
		setTextContent("");
		setLinkContent("");
		setSelectedCategory("custom");
		setStatus("IDLE");
		setProgressLog("");
		setUploadProgress(0);
		setErrorMessage(null);
	}, [coverPreview]);

	// ─── Validation ──────────────────────────────────────────
	const isFormValid = (): boolean => {
		if (!title || !price || !coverImage || status !== "IDLE") return false;

		if (currentCategory.requiresFile && !coreFile) return false;
		if (currentCategory.assetType === "text" && !textContent.trim())
			return false;
		if (currentCategory.assetType === "link" && !linkContent.trim())
			return false;

		return true;
	};

	// ─── Render Dynamic Asset Field ──────────────────────────
	const renderAssetField = () => {
		if (currentCategory.requiresFile) {
			return (
				<div className="space-y-1.5">
					<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
						Core Product File
					</Label>
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFilePick}
						className="hidden"
					/>
					{!coreFile ? (
						<div
							onClick={() => fileInputRef.current?.click()}
							className="border-2 border-dashed border-zinc-800 bg-zinc-950/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/20 transition-colors"
						>
							<CloudUpload className="h-5 w-5 text-zinc-500" />
							<span className="text-xs font-medium text-zinc-400">
								{currentCategory.placeholder}
							</span>
							{currentCategory.fileTypes && (
								<span className="text-[9px] text-zinc-600">
									Allowed: {currentCategory.fileTypes.join(", ")}
								</span>
							)}
							{currentCategory.maxFileSize && (
								<span className="text-[9px] text-zinc-600">
									Max: {currentCategory.maxFileSize}MB
								</span>
							)}
						</div>
					) : (
						<div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<FileCheck className="h-5 w-5 text-emerald-400" />
								<div>
									<p className="text-xs font-bold text-zinc-200 truncate max-w-[150px]">
										{coreFile.name}
									</p>
									<p className="text-[10px] text-zinc-500">
										{(coreFile.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => setCoreFile(null)}
								className="h-7 text-[10px] rounded-lg text-zinc-500 hover:text-white"
							>
								<X className="h-3.5 w-3.5" />
							</Button>
						</div>
					)}
				</div>
			);
		}

		if (currentCategory.assetType === "text") {
			return (
				<div className="space-y-1.5">
					<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
						Content / Code
					</Label>
					<Textarea
						value={textContent}
						onChange={(e) => setTextContent(e.target.value)}
						className="bg-zinc-950 border-zinc-800 text-sm rounded-xl resize-none font-mono text-zinc-200"
						rows={6}
						placeholder={currentCategory.placeholder}
					/>
				</div>
			);
		}

		if (currentCategory.assetType === "link") {
			return (
				<div className="space-y-1.5">
					<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
						Resource Link
					</Label>
					<Input
						value={linkContent}
						onChange={(e) => setLinkContent(e.target.value)}
						className="bg-zinc-950 border-zinc-800 text-sm rounded-xl text-white"
						placeholder={currentCategory.placeholder}
					/>
					<p className="text-[9px] text-zinc-600">
						Share link will be delivered to buyers after purchase
					</p>
				</div>
			);
		}

		return null;
	};

	// ─── Render ───────────────────────────────────────────────
	return (
		<div className="w-full max-w-4xl mx-auto bg-zinc-950/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6">
			<div className="flex items-center gap-3 border-b border-white/5 pb-4">
				<Sparkles className="h-5 w-5 text-emerald-400" />
				<div>
					<h2 className="text-base font-black text-white tracking-tight">
						Deploy Reusable Digital Product
					</h2>
					<p className="text-xs text-zinc-500 mt-0.5">
						Create once, sell infinitely. Choose a category and configure your
						product.
					</p>
				</div>
			</div>

			{status === "IDLE" ? (
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
									setSelectedCategory(value as ReusableCategory)
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
							<p className="text-[9px] text-zinc-600 mt-1 flex items-center gap-1">
								{currentCategory.icon}
								<span>{currentCategory.description}</span>
								{!currentCategory.requiresFile && (
									<span className="text-amber-400 ml-1">
										(No file required)
									</span>
								)}
							</p>
						</div>

						{/* ─── Title ────────────────────────────────────── */}
						<div className="space-y-1.5">
							<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
								Product Title
							</Label>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="bg-zinc-950 border-zinc-800 text-sm rounded-xl h-10 text-white"
								placeholder="e.g., Premium Notion Dashboard"
							/>
						</div>

						{/* ─── Price ────────────────────────────────────── */}
						<div className="space-y-1.5">
							<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
								Price (USD)
							</Label>
							<Input
								type="number"
								step="0.01"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								className="bg-zinc-950 border-zinc-800 text-sm rounded-xl h-10 text-white"
								placeholder="29.99"
							/>
						</div>

						{/* ─── Description ──────────────────────────────── */}
						<div className="space-y-1.5">
							<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
								Marketplace Description
							</Label>
							<Textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="bg-zinc-950 border-zinc-800 text-sm rounded-xl resize-none text-white"
								rows={2}
								placeholder="Describe what buyers will receive..."
							/>
						</div>

						{/* ─── DIY Manual ────────────────────────────────── */}
						<div className="space-y-1.5">
							<div className="flex items-center gap-1.5">
								<HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
								<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
									Setup Instructions (DIY)
								</Label>
							</div>
							<Textarea
								value={diyManual}
								onChange={(e) => setDiyManual(e.target.value)}
								className="bg-zinc-950 border-zinc-800 text-sm rounded-xl resize-none text-white"
								rows={2}
								placeholder="Step-by-step setup instructions..."
							/>
						</div>

						{/* ─── Cautions ──────────────────────────────────── */}
						<div className="space-y-1.5">
							<div className="flex items-center gap-1.5">
								<AlertTriangle className="h-3.5 w-3.5 text-amber-500/80" />
								<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
									Requirements & Cautions
								</Label>
							</div>
							<Textarea
								value={cautions}
								onChange={(e) => setCautions(e.target.value)}
								className="bg-zinc-950 border-zinc-800 text-sm rounded-xl resize-none text-white"
								rows={2}
								placeholder="System requirements, dependencies, usage notices..."
							/>
						</div>
					</div>

					{/* ─── RIGHT COLUMN ─────────────────────────────────── */}
					<div className="space-y-4">
						{/* ─── Cover Image ───────────────────────────────── */}
						<div className="space-y-1.5">
							<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
								Cover Image
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

						{/* ─── Category Badge ────────────────────────────── */}
						<div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/50 border border-white/5">
							<div className="p-1.5 rounded-lg bg-zinc-800/50">
								{currentCategory.icon}
							</div>
							<div>
								<p className="text-[10px] font-bold text-zinc-300">
									{currentCategory.label}
								</p>
								<p className="text-[9px] text-zinc-500">
									Type: {currentCategory.assetType}
									{currentCategory.requiresFile && " · File Required"}
								</p>
							</div>
						</div>

						{/* ─── Submit ────────────────────────────────────── */}
						<Button
							onClick={processUploadPipeline}
							disabled={!isFormValid()}
							className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs h-11 rounded-xl transition-all shadow-xl shadow-emerald-500/5 disabled:opacity-20"
						>
							Deploy Reusable Product
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
							{status === "PROCESSING" && "Processing Product..."}
							{status === "SUCCESS" && "✅ Deployment Complete!"}
							{status === "ERROR" && "❌ Upload Failed"}
						</h4>
						<p className="text-xs font-mono text-zinc-500 bg-zinc-950/80 px-3 py-1.5 rounded-lg border border-zinc-800/60 transition-all">
							{progressLog}
						</p>
						{uploadProgress > 0 && status !== "SUCCESS" && (
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
