// components/social-tenant/SiteEditor.tsx

"use client";

import {
	AlertCircle,
	ArrowLeft,
	CheckCircle2,
	Edit3,
	Eye,
	Image as ImageIcon,
	Layout,
	Loader2,
	Monitor,
	Palette,
	Redo2,
	RefreshCw,
	Save,
	Smartphone,
	Sparkles,
	Type,
	Undo2,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSiteEditor } from "@/lib/hooks/useSiteEditor";
import { useSocialTenant } from "@/lib/hooks/useSocialTenant";

interface SiteEditorProps {
	siteId: string;
	userId: string;
	username: string;
}

type EditMode = "text" | "colors" | "layout";
type DeviceMode = "desktop" | "mobile";

interface EditableSection {
	id: string;
	type:
		| "hero"
		| "about"
		| "services"
		| "products"
		| "testimonials"
		| "pricing"
		| "contact";
	title: string;
	content: string;
}

export function SiteEditor({ siteId, userId, username }: SiteEditorProps) {
	const router = useRouter();
	const { getSite, updateSite } = useSocialTenant();
	const { editSite, saving, error } = useSiteEditor();

	const [site, setSite] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [editMode, setEditMode] = useState<EditMode>("text");
	const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
	const [selectedSection, setSelectedSection] = useState<string | null>(null);
	const [editedContent, setEditedContent] = useState<Record<string, string>>(
		{},
	);
	const [previewHtml, setPreviewHtml] = useState<string>("");
	const [isPreviewMode, setIsPreviewMode] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [showToast, setShowToast] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);

	// ─── Detect Mobile ──────────────────────────────────────────
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// ─── Load Site ──────────────────────────────────────────────
	useEffect(() => {
		const loadSite = async () => {
			const siteData = await getSite(siteId);
			if (siteData) {
				setSite(siteData);
				setPreviewHtml(siteData.html_code || "");

				// Extract editable sections from HTML (simplified)
				if (siteData.html_code) {
					const sections = extractSections(siteData.html_code);
					setEditedContent(sections);
				}
			}
			setLoading(false);
		};
		loadSite();
	}, [siteId, getSite]);

	// ─── Extract Sections from HTML ────────────────────────────
	const extractSections = (html: string): Record<string, string> => {
		// This is a simplified parser. In production, use a proper HTML parser.
		const sections: Record<string, string> = {};

		// Try to find common section patterns
		const patterns = [
			{
				id: "hero",
				regex:
					/<section[^>]*class="[^"]*hero[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
			},
			{
				id: "about",
				regex:
					/<section[^>]*class="[^"]*about[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
			},
			{
				id: "services",
				regex:
					/<section[^>]*class="[^"]*services[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
			},
			{
				id: "products",
				regex:
					/<section[^>]*class="[^"]*products[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
			},
			{
				id: "testimonials",
				regex:
					/<section[^>]*class="[^"]*testimonials[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
			},
			{
				id: "pricing",
				regex:
					/<section[^>]*class="[^"]*pricing[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
			},
			{
				id: "contact",
				regex:
					/<section[^>]*class="[^"]*contact[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
			},
		];

		for (const pattern of patterns) {
			const match = html.match(pattern.regex);
			if (match) {
				sections[pattern.id] = match[1].trim();
			}
		}

		// If no sections found, treat entire body as editable
		if (Object.keys(sections).length === 0) {
			const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
			if (bodyMatch) {
				sections["content"] = bodyMatch[1].trim();
			}
		}

		return sections;
	};

	// ─── Save Changes ───────────────────────────────────────────
	const handleSave = async () => {
		if (!site || !site.html_code) return;

		try {
			let newHtml = site.html_code;

			// Apply edits to HTML
			for (const [sectionId, content] of Object.entries(editedContent)) {
				if (sectionId === "content") {
					// Replace body content
					newHtml = newHtml.replace(
						/<body[^>]*>([\s\S]*?)<\/body>/i,
						`<body>${content}</body>`,
					);
				} else {
					// Replace specific section
					const regex = new RegExp(
						`<section[^>]*class="[^"]*${sectionId}[^"]*"[^>]*>([\\s\\S]*?)<\\/section>`,
						"i",
					);
					const match = newHtml.match(regex);
					if (match) {
						newHtml = newHtml.replace(
							regex,
							`<section class="${sectionId}">${content}</section>`,
						);
					}
				}
			}

			// Save the updated HTML
			const updatedSite = await updateSite(siteId, "html", {
				html: newHtml,
				status: "published",
			});

			if (updatedSite) {
				setSite(updatedSite);
				setPreviewHtml(newHtml);
				setShowToast({
					message: "Changes saved successfully!",
					type: "success",
				});
				setTimeout(() => setShowToast(null), 3000);
			}
		} catch (err) {
			setShowToast({
				message: "Failed to save changes. Please try again.",
				type: "error",
			});
			setTimeout(() => setShowToast(null), 3000);
		}
	};

	// ─── Layout Options ─────────────────────────────────────────
	const layoutOptions = [
		{ id: "single", label: "Single Column", icon: "▌" },
		{ id: "two", label: "Two Columns", icon: "▌▌" },
		{ id: "three", label: "Three Columns", icon: "▌▌▌" },
	];

	// ─── Color Options ──────────────────────────────────────────
	const colorOptions = [
		{ id: "emerald", value: "#10b981", label: "Emerald" },
		{ id: "sky", value: "#0ea5e9", label: "Sky" },
		{ id: "purple", value: "#8b5cf6", label: "Purple" },
		{ id: "rose", value: "#f43f5e", label: "Rose" },
		{ id: "amber", value: "#f59e0b", label: "Amber" },
		{ id: "zinc", value: "#71717a", label: "Zinc" },
	];

	// ─── Loading State ──────────────────────────────────────────
	if (loading) {
		return (
			<div className="flex items-center justify-center h-[60vh]">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
					<p className="text-xs text-zinc-500">Loading editor...</p>
				</div>
			</div>
		);
	}

	if (!site) {
		return (
			<div className="flex items-center justify-center h-[60vh]">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
					<h2 className="text-xl font-bold text-white">Site not found</h2>
					<Button onClick={() => router.push("/st")} className="mt-4">
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	// ─── Main Render ────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-black text-white">
			{/* ─── Top Bar ──────────────────────────────────────────── */}
			<div className="sticky top-0 z-30 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<button
						onClick={() => router.push("/st")}
						className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
					<div>
						<h1 className="text-sm font-bold text-white">{site.site_name}</h1>
						<p className="text-[10px] text-zinc-500">Manual Editor</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					{/* Device toggle */}
					<div className="flex rounded-lg border border-white/5 overflow-hidden">
						<button
							onClick={() => setDeviceMode("desktop")}
							className={`px-3 py-1.5 text-xs font-medium transition-all ${
								deviceMode === "desktop"
									? "bg-emerald-500/20 text-emerald-400"
									: "text-zinc-400 hover:text-white"
							}`}
						>
							<Monitor className="h-4 w-4" />
						</button>
						<button
							onClick={() => setDeviceMode("mobile")}
							className={`px-3 py-1.5 text-xs font-medium transition-all ${
								deviceMode === "mobile"
									? "bg-emerald-500/20 text-emerald-400"
									: "text-zinc-400 hover:text-white"
							}`}
						>
							<Smartphone className="h-4 w-4" />
						</button>
					</div>

					<Button
						onClick={() => setIsPreviewMode(!isPreviewMode)}
						variant="ghost"
						className="text-xs text-zinc-400 hover:text-white"
					>
						{isPreviewMode ? (
							<Edit3 className="h-4 w-4 mr-1" />
						) : (
							<Eye className="h-4 w-4 mr-1" />
						)}
						{isPreviewMode ? "Edit" : "Preview"}
					</Button>

					<Button
						onClick={handleSave}
						disabled={saving}
						className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-4 py-2 text-xs flex items-center gap-2"
					>
						{saving ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						Save
					</Button>
				</div>
			</div>

			{/* ─── Toast ────────────────────────────────────────────── */}
			{showToast && (
				<div
					className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
						showToast.type === "success"
							? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
							: "bg-red-500/10 border border-red-500/20 text-red-400"
					}`}
				>
					{showToast.message}
				</div>
			)}

			{/* ─── Main Content ────────────────────────────────────── */}
			<div className="max-w-7xl mx-auto p-4 lg:p-6">
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
					{/* ─── Left Panel: Controls ────────────────────────── */}
					<div className="lg:col-span-2 space-y-4">
						{/* Edit Mode Tabs */}
						<div className="grid grid-cols-3 gap-2">
							<button
								onClick={() => setEditMode("text")}
								className={`p-3 rounded-xl border text-xs font-bold transition-all ${
									editMode === "text"
										? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
										: "border-white/5 text-zinc-400 hover:border-white/15"
								}`}
							>
								<Type className="h-4 w-4 mx-auto mb-1" />
								Text
							</button>
							<button
								onClick={() => setEditMode("colors")}
								className={`p-3 rounded-xl border text-xs font-bold transition-all ${
									editMode === "colors"
										? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
										: "border-white/5 text-zinc-400 hover:border-white/15"
								}`}
							>
								<Palette className="h-4 w-4 mx-auto mb-1" />
								Colors
							</button>
							<button
								onClick={() => setEditMode("layout")}
								className={`p-3 rounded-xl border text-xs font-bold transition-all ${
									editMode === "layout"
										? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
										: "border-white/5 text-zinc-400 hover:border-white/15"
								}`}
							>
								<Layout className="h-4 w-4 mx-auto mb-1" />
								Layout
							</button>
						</div>

						{/* ─── Text Edit Mode ────────────────────────────── */}
						{editMode === "text" && (
							<div className="space-y-4">
								<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
									<p className="text-xs text-zinc-500 mb-3">
										Select a section to edit its content:
									</p>
									<div className="space-y-2 max-h-[400px] overflow-y-auto">
										{Object.keys(editedContent).map((sectionId) => (
											<button
												key={sectionId}
												onClick={() => setSelectedSection(sectionId)}
												className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
													selectedSection === sectionId
														? "border-emerald-500/30 bg-emerald-500/10"
														: "border-white/5 hover:border-white/15"
												}`}
											>
												<span className="font-bold text-white capitalize">
													{sectionId}
												</span>
												<p className="text-zinc-500 truncate mt-0.5">
													{editedContent[sectionId]?.slice(0, 60)}...
												</p>
											</button>
										))}
									</div>
								</div>

								{selectedSection && (
									<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
										<Label className="text-xs font-bold text-white capitalize mb-2 block">
											Edit {selectedSection}
										</Label>
										<Textarea
											value={editedContent[selectedSection] || ""}
											onChange={(e) =>
												setEditedContent({
													...editedContent,
													[selectedSection]: e.target.value,
												})
											}
											className="bg-black border-white/10 text-white rounded-xl min-h-[150px] text-sm"
											placeholder="Enter your content here..."
										/>
										<p className="text-[10px] text-zinc-500 mt-2">
											You can edit HTML content directly. Changes will appear in
											preview.
										</p>
									</div>
								)}
							</div>
						)}

						{/* ─── Colors Edit Mode ──────────────────────────── */}
						{editMode === "colors" && (
							<div className="space-y-4">
								<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
									<p className="text-xs text-zinc-500 mb-3">
										Choose a primary color:
									</p>
									<div className="grid grid-cols-3 gap-2">
										{colorOptions.map((color) => (
											<button
												key={color.id}
												onClick={() => {
													// Apply color change to preview
													const newPreview = previewHtml.replace(
														/--primary-color:[^;]+;/g,
														`--primary-color: ${color.value};`,
													);
													setPreviewHtml(newPreview);
												}}
												className="p-3 rounded-xl border border-white/5 hover:border-white/15 transition-all text-center"
											>
												<div
													className="w-8 h-8 rounded-full mx-auto mb-1 border border-white/10"
													style={{ backgroundColor: color.value }}
												/>
												<span className="text-[10px] text-zinc-400">
													{color.label}
												</span>
											</button>
										))}
									</div>
								</div>

								<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
									<Label className="text-xs font-bold text-white block mb-2">
										Custom Color
									</Label>
									<div className="flex items-center gap-3">
										<Input
											type="color"
											className="w-12 h-12 p-1 bg-black border-white/10 rounded-xl"
											onChange={(e) => {
												const newPreview = previewHtml.replace(
													/--primary-color:[^;]+;/g,
													`--primary-color: ${e.target.value};`,
												);
												setPreviewHtml(newPreview);
											}}
										/>
										<Input
											type="text"
											placeholder="#10b981"
											className="flex-1 bg-black border-white/10 text-white rounded-xl h-10 text-xs"
											onChange={(e) => {
												if (e.target.value.match(/^#[0-9a-f]{6}$/i)) {
													const newPreview = previewHtml.replace(
														/--primary-color:[^;]+;/g,
														`--primary-color: ${e.target.value};`,
													);
													setPreviewHtml(newPreview);
												}
											}}
										/>
									</div>
								</div>
							</div>
						)}

						{/* ─── Layout Edit Mode ──────────────────────────── */}
						{editMode === "layout" && (
							<div className="space-y-4">
								<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
									<p className="text-xs text-zinc-500 mb-3">
										Choose a layout style:
									</p>
									<div className="grid grid-cols-3 gap-2">
										{layoutOptions.map((layout) => (
											<button
												key={layout.id}
												onClick={() => {
													// Apply layout change to preview
													// This is simplified - in production, you'd apply proper layout changes
													const newPreview = previewHtml.replace(
														/<div class="grid[^"]*">/,
														`<div class="grid grid-cols-${layout.id === "single" ? "1" : layout.id === "two" ? "2" : "3"} gap-4">`,
													);
													setPreviewHtml(newPreview);
												}}
												className="p-4 rounded-xl border border-white/5 hover:border-white/15 transition-all text-center"
											>
												<div className="text-2xl text-zinc-400">
													{layout.icon}
												</div>
												<span className="text-[10px] text-zinc-400 mt-1 block">
													{layout.label}
												</span>
											</button>
										))}
									</div>
								</div>

								<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
									<p className="text-xs text-zinc-500">Layout Tips:</p>
									<ul className="text-[10px] text-zinc-400 space-y-1 mt-2 list-disc list-inside">
										<li>Single column: Best for landing pages</li>
										<li>Two columns: Great for product showcases</li>
										<li>Three columns: Ideal for services and galleries</li>
									</ul>
								</div>
							</div>
						)}

						{/* ─── Edit Info ──────────────────────────────────── */}
						<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
							<div className="flex items-center gap-2 text-[10px] text-zinc-500">
								<Sparkles className="h-3 w-3 text-emerald-400" />
								<span>
									Session: {site.is_session_active ? "Active" : "Closed"}
								</span>
								<span className="w-px h-3 bg-white/5" />
								<span>
									Last saved: {new Date(site.updated_at).toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					{/* ─── Right Panel: Preview ─────────────────────────── */}
					<div className="lg:col-span-3">
						<div
							className={`bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden ${
								deviceMode === "mobile"
									? "flex items-center justify-center p-4"
									: ""
							}`}
						>
							<div
								className={
									deviceMode === "mobile"
										? "w-[375px] h-[700px] overflow-hidden rounded-2xl border border-white/10"
										: "w-full min-h-[500px]"
								}
							>
								{isPreviewMode ? (
									<iframe
										srcDoc={previewHtml}
										className="w-full h-full border-0 bg-white"
										title="Website Preview"
										sandbox="allow-scripts allow-modals allow-same-origin"
									/>
								) : (
									<div className="w-full h-full overflow-auto p-4 bg-black">
										<pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap">
											{previewHtml ||
												'No content to preview. Click "Edit" to make changes.'}
										</pre>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
