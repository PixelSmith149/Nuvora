// components/social-tenant/link-in-bio/LinkInBioEditor.tsx

"use client";

import {
	DragDropContext,
	Draggable,
	Droppable,
	type DropResult,
} from "@hello-pangea/dnd";
import {
	AlertCircle,
	AlignLeft,
	ArrowLeft,
	CheckCircle2,
	Copy,
	Edit3,
	ExternalLink,
	Eye,
	Globe,
	GripVertical,
	Link2,
	Loader2,
	Mail,
	Palette,
	Plus,
	Save,
	Trash2,
	Type,
	Users,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/social-tenant/link-in-bio/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	addLinkClient,
	addSocialClient,
	deleteLinkClient,
	deleteSocialClient,
	reorderLinksClient,
	toggleLinkActiveClient,
	updateProfileClient,
	updateSocialClient,
} from "@/lib/st/services/link-in-bio.client.service";
import {
	getTemplate,
	LINK_PLATFORMS,
	SOCIAL_PLATFORMS,
} from "@/lib/st/types/link-in-bio";

type EditorTab = "profile" | "links" | "socials" | "contact" | "theme";

interface LinkInBioEditorProps {
	userId: string;
	username: string;
	templateId: string;
	initialProfile: any;
	initialLinks: any[];
	initialSocials: any[];
}

// ─── Font Options ──────────────────────────────────────────────
const FONT_OPTIONS = [
	{ value: "font-sans", label: "Sans-Serif", className: "font-sans" },
	{ value: "font-serif", label: "Serif", className: "font-serif" },
	{ value: "font-mono", label: "Mono", className: "font-mono" },
	{ value: "font-inter", label: "Inter", className: "font-inter" },
	{ value: "font-playfair", label: "Playfair", className: "font-playfair" },
	{ value: "font-roboto", label: "Roboto", className: "font-roboto" },
	{ value: "font-poppins", label: "Poppins", className: "font-poppins" },
	{
		value: "font-montserrat",
		label: "Montserrat",
		className: "font-montserrat",
	},
	{ value: "font-open-sans", label: "Open Sans", className: "font-open-sans" },
	{ value: "font-lora", label: "Lora", className: "font-lora" },
];

export function LinkInBioEditor({
	userId,
	username,
	templateId,
	initialProfile,
	initialLinks,
	initialSocials,
}: LinkInBioEditorProps) {
	const router = useRouter();

	// ─── State ──────────────────────────────────────────────────────
	const [profile, setProfile] = useState(initialProfile);
	const [links, setLinks] = useState(initialLinks);
	const [socials, setSocials] = useState(initialSocials);
	const [activeTab, setActiveTab] = useState<EditorTab>("profile");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isPublished, setIsPublished] = useState(
		initialProfile?.is_published || false,
	);

	// ─── Profile Fields ────────────────────────────────────────────
	const [displayName, setDisplayName] = useState(
		initialProfile?.display_name ?? "",
	);
	const [bio, setBio] = useState(initialProfile?.bio ?? "");
	const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url ?? "");
	const [coverImageUrl, setCoverImageUrl] = useState(
		initialProfile?.cover_image_url ?? "",
	);
	const [contactEmail, setContactEmail] = useState(
		initialProfile?.contact_email ?? "",
	);
	const [contactPhone, setContactPhone] = useState(
		initialProfile?.contact_phone ?? "",
	);
	const [contactLocation, setContactLocation] = useState(
		initialProfile?.contact_location ?? "",
	);
	const [themeColor, setThemeColor] = useState(
		initialProfile?.theme_color ?? "#10b981",
	);

	// ─── Blog / Raw Text ──────────────────────────────────────────
	const [blogText, setBlogText] = useState(initialProfile?.blog_text ?? "");

	// ─── Theme Settings ────────────────────────────────────────────
	const [buttonStyle, setButtonStyle] = useState(
		initialProfile?.template_settings?.button_style ?? "rounded-full",
	);
	const [fontFamily, setFontFamily] = useState(
		initialProfile?.template_settings?.font_family ?? "font-sans",
	);

	// ─── New Link Form ────────────────────────────────────────────
	const [newLinkTitle, setNewLinkTitle] = useState("");
	const [newLinkUrl, setNewLinkUrl] = useState("");
	const [newLinkDescription, setNewLinkDescription] = useState("");
	const [newLinkPlatform, setNewLinkPlatform] = useState("custom");
	const [showAddLink, setShowAddLink] = useState(false);

	// ─── New Social Form ──────────────────────────────────────────
	const [newSocialPlatform, setNewSocialPlatform] = useState("");
	const [newSocialUrl, setNewSocialUrl] = useState("");
	const [newSocialDisplayName, setNewSocialDisplayName] = useState("");
	const [showAddSocial, setShowAddSocial] = useState(false);

	// ─── Editing Social Name ──────────────────────────────────────
	const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
	const [editingSocialName, setEditingSocialName] = useState("");

	// ─── Upload State ─────────────────────────────────────────────
	const [uploading, setUploading] = useState(false);
	const [uploadType, setUploadType] = useState<"avatar" | "cover" | null>(null);
	const [copied, setCopied] = useState(false);

	const template = getTemplate(templateId);
	const templateStyles = template.styles;

	// ─── Image Upload ─────────────────────────────────────────────
	const handleImageUpload = async (file: File, type: "avatar" | "cover") => {
		if (!file) return;
		setUploading(true);
		setUploadType(type);
		setError(null);

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", type);

			const response = await fetch("/api/st/link-in-bio/upload", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (result.success) {
				if (type === "avatar") {
					setAvatarUrl(result.url);
				} else {
					setCoverImageUrl(result.url);
				}
				setSuccess("Image uploaded successfully!");
				setTimeout(() => setSuccess(null), 3000);
			} else {
				setError(result.error || "Upload failed");
			}
		} catch (err: any) {
			setError(err.message || "Upload failed");
		} finally {
			setUploading(false);
			setUploadType(null);
		}
	};

	// ─── Save Profile ─────────────────────────────────────────────
	const handleSave = async () => {
		if (!profile) return;
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			await updateProfileClient(profile.id, {
				display_name: displayName,
				template_id: templateId,
				bio,
				avatar_url: avatarUrl,
				cover_image_url: coverImageUrl,
				contact_email: contactEmail,
				contact_phone: contactPhone,
				contact_location: contactLocation,
				theme_color: themeColor,
				blog_text: blogText,
				template_settings: {
					...profile.template_settings,
					button_style: buttonStyle,
					font_family: fontFamily,
				},
			});
			setSuccess("Saved successfully!");
			setTimeout(() => setSuccess(null), 3000);
		} catch (err: any) {
			console.log("fontFamily:", fontFamily);
			setError(err.message || "Failed to save");
		} finally {
			setSaving(false);
		}
	};

	// ─── Publish ──────────────────────────────────────────────────
	const handlePublish = async () => {
		if (!profile) return;
		setSaving(true);
		setError(null);

		try {
			await updateProfileClient(profile.id, {
				is_published: true,
				display_name: displayName,
				template_id: templateId,
				bio,
				avatar_url: avatarUrl,
				cover_image_url: coverImageUrl,
				contact_email: contactEmail,
				contact_phone: contactPhone,
				contact_location: contactLocation,
				theme_color: themeColor,
				blog_text: blogText,
				template_settings: {
					...profile.template_settings,
					button_style: buttonStyle,
					font_family: fontFamily,
				},
			});
			setIsPublished(true);
			setSuccess("Published successfully! 🎉");
			setTimeout(() => setSuccess(null), 3000);
		} catch (err: any) {
			setError(err.message || "Failed to publish");
		} finally {
			setSaving(false);
		}
	};

	const handleCopyLink = async () => {
		const url = `${window.location.origin}/u/${username}`;
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setSuccess("Link copied to clipboard!");
			setTimeout(() => {
				setCopied(false);
				setSuccess(null);
			}, 3000);
		} catch (err) {
			setError("Failed to copy link");
			setTimeout(() => setError(null), 3000);
		}
	};

	// ─── Social Display Name Handlers ─────────────────────────────
	const handleStartEditSocialName = (socialId: string, currentName: string) => {
		setEditingSocialId(socialId);
		setEditingSocialName(currentName || "");
	};

	const handleSaveSocialName = async (socialId: string) => {
		if (!profile) return;
		try {
			const social = socials.find((s) => s.id === socialId);
			if (!social) return;

			const updated = await updateSocialClient(socialId, {
				display_name: editingSocialName.trim() || null,
			});
			setSocials(socials.map((s) => (s.id === socialId ? updated : s)));
			setEditingSocialId(null);
			setEditingSocialName("");
			setSuccess("Social name updated!");
			setTimeout(() => setSuccess(null), 2000);
		} catch (err: any) {
			setError(err.message || "Failed to update social name");
		}
	};

	// ─── Link Handlers ────────────────────────────────────────────
	const handleAddLink = async () => {
		if (!newLinkTitle || !newLinkUrl || !profile) return;

		try {
			const link = await addLinkClient(profile.id, {
				platform: newLinkPlatform,
				title: newLinkTitle,
				description: newLinkDescription || null,
				url: newLinkUrl,
				icon:
					LINK_PLATFORMS.find((p) => p.id === newLinkPlatform)?.icon || null,
				is_active: true,
				order_index: links.length,
			});
			setLinks([...links, link]);
			setNewLinkTitle("");
			setNewLinkUrl("");
			setNewLinkDescription("");
			setNewLinkPlatform("custom");
			setShowAddLink(false);
			setSuccess("Link added!");
			setTimeout(() => setSuccess(null), 2000);
		} catch (err: any) {
			setError(err.message || "Failed to add link");
		}
	};

	const handleDeleteLink = async (linkId: string) => {
		if (!confirm("Delete this link?")) return;
		try {
			await deleteLinkClient(linkId);
			setLinks(links.filter((l) => l.id !== linkId));
		} catch (err: any) {
			setError(err.message || "Failed to delete link");
		}
	};

	const handleToggleLink = async (linkId: string, isActive: boolean) => {
		try {
			const updated = await toggleLinkActiveClient(linkId, isActive);
			setLinks(links.map((l) => (l.id === linkId ? updated : l)));
		} catch (err: any) {
			setError(err.message || "Failed to toggle link");
		}
	};

	const handleLinkDragEnd = async (result: DropResult) => {
		if (!result.destination || !profile) return;

		const items = Array.from(links);
		const [reordered] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reordered);
		setLinks(items);

		try {
			await reorderLinksClient(
				profile.id,
				items.map((l) => l.id),
			);
		} catch (err: any) {
			setError(err.message || "Failed to reorder links");
		}
	};

	// ─── Social Handlers ──────────────────────────────────────────
	const handleAddSocial = async () => {
		if (!newSocialPlatform || !newSocialUrl || !profile) return;

		try {
			const social = await addSocialClient(
				profile.id,
				newSocialPlatform,
				newSocialUrl,
				newSocialDisplayName.trim() || null,
			);
			setSocials([...socials, social]);
			setNewSocialPlatform("");
			setNewSocialUrl("");
			setNewSocialDisplayName("");
			setShowAddSocial(false);
			setSuccess("Social added!");
			setTimeout(() => setSuccess(null), 2000);
		} catch (err: any) {
			setError(err.message || "Failed to add social");
		}
	};

	const handleDeleteSocial = async (socialId: string) => {
		if (!confirm("Delete this social link?")) return;
		try {
			await deleteSocialClient(socialId);
			setSocials(socials.filter((s) => s.id !== socialId));
		} catch (err: any) {
			setError(err.message || "Failed to delete social");
		}
	};

	const handleSocialDragEnd = async (result: DropResult) => {
		if (!result.destination || !profile) return;

		const items = Array.from(socials);
		const [reordered] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reordered);
		setSocials(items);
	};

	if (!template) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
					<h2 className="text-xl font-bold text-white">Template not found</h2>
					<Button
						onClick={() => router.push("/st/link-in-bio")}
						className="mt-4"
					>
						Back to Templates
					</Button>
				</div>
			</div>
		);
	}

	// ─── Build Background Class ──────────────────────────────────
	const getPreviewBackground = () => {
		const bgType = templateStyles.backgroundType || "solid";
		const bgValue = templateStyles.backgroundValue || "#000000";

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
				return themeColor ? `bg-[${themeColor}]` : "bg-black";
		}
	};

	// ─── Render Tabs ──────────────────────────────────────────────
	const renderTabContent = () => {
		switch (activeTab) {
			case "profile":
				return (
					<div className="space-y-4">
						<h3 className="text-sm font-bold text-white">Profile Settings</h3>

						{/* Avatar */}
						<div className="space-y-1.5">
							<Label className="text-xs text-zinc-400">Avatar</Label>
							<div className="flex items-center gap-3">
								{avatarUrl && (
									<img
										src={avatarUrl}
										alt="Avatar"
										className="w-12 h-12 rounded-full object-cover border border-white/10"
									/>
								)}
								<Input
									type="file"
									accept="image/*"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleImageUpload(file, "avatar");
									}}
									disabled={uploading}
									className="flex-1 bg-black border-white/10 text-white rounded-xl h-10 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/5 file:text-white hover:file:bg-white/10"
								/>
								{avatarUrl && (
									<button
										onClick={() => setAvatarUrl("")}
										className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400"
									>
										<X className="h-4 w-4" />
									</button>
								)}
							</div>
						</div>

						{/* Cover Image */}
						<div className="space-y-1.5">
							<Label className="text-xs text-zinc-400">Cover Image</Label>
							<div className="flex items-center gap-3">
								{coverImageUrl && (
									<img
										src={coverImageUrl}
										alt="Cover"
										className="w-16 h-10 rounded object-cover border border-white/10"
									/>
								)}
								<Input
									type="file"
									accept="image/*"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleImageUpload(file, "cover");
									}}
									disabled={uploading}
									className="flex-1 bg-black border-white/10 text-white rounded-xl h-10 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/5 file:text-white hover:file:bg-white/10"
								/>
								{coverImageUrl && (
									<button
										onClick={() => setCoverImageUrl("")}
										className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400"
									>
										<X className="h-4 w-4" />
									</button>
								)}
							</div>
						</div>

						{/* Display Name */}
						<div className="space-y-1.5">
							<Label className="text-xs text-zinc-400">Display Name</Label>
							<Input
								value={displayName ?? ""}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder="Your name"
								className="bg-black border-white/10 text-white rounded-xl h-10 text-sm"
							/>
						</div>

						{/* Bio */}
						<div className="space-y-1.5">
							<Label className="text-xs text-zinc-400">Bio</Label>
							<Textarea
								value={bio ?? ""}
								onChange={(e) => setBio(e.target.value)}
								placeholder="Tell your audience about yourself..."
								className="bg-black border-white/10 text-white rounded-xl h-20 text-sm resize-none"
							/>
						</div>

						{/* Blog / Raw Text Field */}
						<div className="space-y-1.5 pt-2 border-t border-white/5">
							<Label className="text-xs text-zinc-400 flex items-center gap-2">
								<AlignLeft className="h-3.5 w-3.5" />
								Blog / Raw Text
							</Label>
							<Textarea
								value={blogText ?? ""}
								onChange={(e) => setBlogText(e.target.value)}
								placeholder="Write a blog post, personal message, or raw text to display on your page..."
								className="bg-black border-white/10 text-white rounded-xl h-32 text-sm resize-none"
							/>
							<p className="text-[10px] text-zinc-500">
								This text will appear on your public link-in-bio page.
							</p>
						</div>
					</div>
				);

			case "links":
				return (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-bold text-white">Your Links</h3>
							<Button
								onClick={() => setShowAddLink(!showAddLink)}
								className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-8 px-3 text-xs"
							>
								<Plus className="h-3.5 w-3.5 mr-1" />
								Add Link
							</Button>
						</div>

						{showAddLink && (
							<div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 space-y-3">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div className="space-y-1">
										<Label className="text-xs text-zinc-400">Platform</Label>
										<select
											value={newLinkPlatform}
											onChange={(e) => setNewLinkPlatform(e.target.value)}
											className="w-full bg-black border-white/10 text-white rounded-xl h-10 px-3 text-sm"
										>
											{LINK_PLATFORMS.map((p) => (
												<option key={p.id} value={p.id}>
													{p.icon} {p.label}
												</option>
											))}
										</select>
									</div>
									<div className="space-y-1">
										<Label className="text-xs text-zinc-400">Title</Label>
										<Input
											value={newLinkTitle}
											onChange={(e) => setNewLinkTitle(e.target.value)}
											placeholder="My Website"
											className="bg-black border-white/10 text-white rounded-xl h-10 text-sm"
										/>
									</div>
								</div>
								<div className="space-y-1">
									<Label className="text-xs text-zinc-400">
										Description (Optional)
									</Label>
									<Textarea
										value={newLinkDescription}
										onChange={(e) => setNewLinkDescription(e.target.value)}
										placeholder="Brief description of this link..."
										className="bg-black border-white/10 text-white rounded-xl h-16 text-sm resize-none"
									/>
									<p className="text-[10px] text-zinc-500">
										A short description that will appear when someone clicks the
										link.
									</p>
								</div>

								<div className="space-y-1">
									<Label className="text-xs text-zinc-400">URL</Label>
									<Input
										value={newLinkUrl}
										onChange={(e) => setNewLinkUrl(e.target.value)}
										placeholder="https://example.com"
										className="bg-black border-white/10 text-white rounded-xl h-10 text-sm"
									/>
								</div>
								<div className="flex gap-2">
									<Button
										onClick={handleAddLink}
										className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-9 text-xs flex-1"
									>
										Add Link
									</Button>
									<Button
										onClick={() => setShowAddLink(false)}
										variant="outline"
										className="border-white/10 text-zinc-400 hover:bg-zinc-900 rounded-xl h-9 text-xs"
									>
										Cancel
									</Button>
								</div>
							</div>
						)}

						<DragDropContext onDragEnd={handleLinkDragEnd}>
							<Droppable droppableId="links">
								{(provided) => (
									<div
										{...provided.droppableProps}
										ref={provided.innerRef}
										className="space-y-2"
									>
										{links.map((link, index) => (
											<Draggable
												key={link.id}
												draggableId={link.id}
												index={index}
											>
												{(provided) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-xl border border-white/5"
													>
														<div
															{...provided.dragHandleProps}
															className="cursor-grab"
														>
															<GripVertical className="h-4 w-4 text-zinc-500" />
														</div>
														<span className="text-lg">{link.icon || "🔗"}</span>
														<div className="flex-1 min-w-0">
															<p className="text-sm font-medium text-white truncate">
																{link.title}
															</p>
															<p className="text-xs text-zinc-500 truncate">
																{link.description}
															</p>
															<p className="text-xs text-zinc-500 truncate">
																{link.url}
															</p>
														</div>
														<Switch
															checked={link.is_active !== false}
															onCheckedChange={(checked) =>
																handleToggleLink(link.id, checked)
															}
															className="data-[state=checked]:bg-emerald-500"
														/>
														<span className="text-[10px] text-zinc-500">
															{link.clicks || 0} clicks
														</span>
														<button
															onClick={() => handleDeleteLink(link.id)}
															className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
														>
															<Trash2 className="h-4 w-4" />
														</button>
													</div>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</DragDropContext>

						{links.length === 0 && !showAddLink && (
							<div className="text-center py-6 text-zinc-500 text-sm">
								No links yet. Add your first link above!
							</div>
						)}
					</div>
				);

			case "socials":
				return (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-bold text-white">Social Media</h3>
							<Button
								onClick={() => setShowAddSocial(!showAddSocial)}
								className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-8 px-3 text-xs"
							>
								<Plus className="h-3.5 w-3.5 mr-1" />
								Add Social
							</Button>
						</div>

						{showAddSocial && (
							<div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 space-y-3">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div className="space-y-1">
										<Label className="text-xs text-zinc-400">Platform</Label>
										<select
											value={newSocialPlatform}
											onChange={(e) => setNewSocialPlatform(e.target.value)}
											className="w-full bg-black border-white/10 text-white rounded-xl h-10 px-3 text-sm"
										>
											<option value="">Select platform</option>
											{SOCIAL_PLATFORMS.map((p) => (
												<option key={p.id} value={p.id}>
													{p.icon} {p.label}
												</option>
											))}
										</select>
									</div>
									<div className="space-y-1">
										<Label className="text-xs text-zinc-400">URL</Label>
										<Input
											value={newSocialUrl}
											onChange={(e) => setNewSocialUrl(e.target.value)}
											placeholder="https://instagram.com/..."
											className="bg-black border-white/10 text-white rounded-xl h-10 text-sm"
										/>
									</div>
								</div>
								<div className="space-y-1">
									<Label className="text-xs text-zinc-400">
										Display Name (Optional)
									</Label>
									<Input
										value={newSocialDisplayName}
										onChange={(e) => setNewSocialDisplayName(e.target.value)}
										placeholder="My TikTok Handle"
										className="bg-black border-white/10 text-white rounded-xl h-10 text-sm"
									/>
									<p className="text-[10px] text-zinc-500">
										If empty, the platform name will be shown.
									</p>
								</div>
								<div className="flex gap-2">
									<Button
										onClick={handleAddSocial}
										disabled={!newSocialPlatform || !newSocialUrl}
										className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-9 text-xs flex-1"
									>
										Add Social
									</Button>
									<Button
										onClick={() => setShowAddSocial(false)}
										variant="outline"
										className="border-white/10 text-zinc-400 hover:bg-zinc-900 rounded-xl h-9 text-xs"
									>
										Cancel
									</Button>
								</div>
							</div>
						)}

						<DragDropContext onDragEnd={handleSocialDragEnd}>
							<Droppable droppableId="socials">
								{(provided) => (
									<div
										{...provided.droppableProps}
										ref={provided.innerRef}
										className="flex flex-wrap gap-3"
									>
										{socials.map((social, index) => {
											const platform = SOCIAL_PLATFORMS.find(
												(p) => p.id === social.platform,
											);
											const displayName =
												social.display_name ||
												platform?.label ||
												social.platform;
											const isEditing = editingSocialId === social.id;

											return (
												<Draggable
													key={social.id}
													draggableId={social.id}
													index={index}
												>
													{(provided) => (
														<div
															ref={provided.innerRef}
															{...provided.draggableProps}
															className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 rounded-xl border border-white/5 group"
														>
															<div
																{...provided.dragHandleProps}
																className="cursor-grab"
															>
																<GripVertical className="h-3.5 w-3.5 text-zinc-500" />
															</div>
															<span className="text-lg">
																{platform?.icon || "🔗"}
															</span>

															{isEditing ? (
																<div className="flex items-center gap-1">
																	<Input
																		value={editingSocialName}
																		onChange={(e) =>
																			setEditingSocialName(e.target.value)
																		}
																		className="h-7 w-32 bg-black border-white/10 text-white rounded-lg text-xs"
																		autoFocus
																		onKeyDown={(e) => {
																			if (e.key === "Enter")
																				handleSaveSocialName(social.id);
																			if (e.key === "Escape") {
																				setEditingSocialId(null);
																				setEditingSocialName("");
																			}
																		}}
																	/>
																	<button
																		onClick={() =>
																			handleSaveSocialName(social.id)
																		}
																		className="p-0.5 rounded hover:bg-emerald-500/20 text-emerald-400"
																	>
																		<CheckCircle2 className="h-3.5 w-3.5" />
																	</button>
																	<button
																		onClick={() => {
																			setEditingSocialId(null);
																			setEditingSocialName("");
																		}}
																		className="p-0.5 rounded hover:bg-red-500/20 text-red-400"
																	>
																		<X className="h-3.5 w-3.5" />
																	</button>
																</div>
															) : (
																<>
																	<span className="text-xs text-zinc-300 max-w-[100px] truncate">
																		{displayName}
																	</span>
																	<button
																		onClick={() =>
																			handleStartEditSocialName(
																				social.id,
																				social.display_name || "",
																			)
																		}
																		className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
																	>
																		<Edit3 className="h-3 w-3" />
																	</button>
																</>
															)}

															<button
																onClick={() => handleDeleteSocial(social.id)}
																className="p-0.5 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
															>
																<X className="h-3.5 w-3.5" />
															</button>
														</div>
													)}
												</Draggable>
											);
										})}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</DragDropContext>

						{socials.length === 0 && !showAddSocial && (
							<div className="text-center w-full py-4 text-zinc-500 text-sm">
								No social links added yet.
							</div>
						)}
					</div>
				);

			case "contact":
				return (
					<div className="space-y-4">
						<h3 className="text-sm font-bold text-white">Contact Details</h3>
						<div className="space-y-1.5">
							<Label className="text-xs text-zinc-400">Email</Label>
							<Input
								value={contactEmail ?? ""}
								onChange={(e) => setContactEmail(e.target.value)}
								placeholder="contact@example.com"
								className="bg-black border-white/10 text-white rounded-xl h-10 text-sm"
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs text-zinc-400">Phone</Label>
							<Input
								value={contactPhone ?? ""}
								onChange={(e) => setContactPhone(e.target.value)}
								placeholder="+1 (555) 000-0000"
								className="bg-black border-white/10 text-white rounded-xl h-10 text-sm"
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs text-zinc-400">Location</Label>
							<Input
								value={contactLocation ?? ""}
								onChange={(e) => setContactLocation(e.target.value)}
								placeholder="New York, NY"
								className="bg-black border-white/10 text-white rounded-xl h-10 text-sm"
							/>
						</div>
					</div>
				);

			case "theme":
				return (
					<div className="space-y-4">
						<h3 className="text-sm font-bold text-white">
							Theme Customization
						</h3>

						<div className="space-y-1.5">
							<Label className="text-xs text-zinc-400">Primary Color</Label>
							<div className="flex items-center gap-3">
								<input
									type="color"
									value={themeColor}
									onChange={(e) => setThemeColor(e.target.value)}
									className="w-12 h-12 rounded-xl bg-black border-white/10 cursor-pointer"
								/>
								<Input
									value={themeColor}
									onChange={(e) => setThemeColor(e.target.value)}
									className="flex-1 bg-black border-white/10 text-white rounded-xl h-10 text-sm"
								/>
							</div>
							<p className="text-[10px] text-zinc-500">
								This color will be used as the background color for your page.
							</p>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs text-zinc-400">Button Style</Label>
							<div className="flex flex-wrap gap-2">
								{[
									"rounded-full",
									"rounded-xl",
									"rounded-lg",
									"rounded-none",
								].map((style) => (
									<button
										key={style}
										onClick={() => setButtonStyle(style)}
										className={`px-4 py-2 text-xs font-medium transition-all rounded-md ${
											buttonStyle === style
												? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
												: "bg-zinc-900/50 text-zinc-400 border border-white/5 hover:border-white/15"
										}`}
									>
										{style.replace("rounded-", "").toUpperCase()}
									</button>
								))}
							</div>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs text-zinc-400 flex items-center gap-2">
								<Type className="h-3.5 w-3.5" />
								Font Family
							</Label>
							<select
								value={fontFamily}
								onChange={(e) => setFontFamily(e.target.value)}
								className="w-full bg-black border-white/10 text-white rounded-xl h-10 px-3 text-sm"
							>
								{FONT_OPTIONS.map((font) => (
									<option
										key={font.value}
										value={font.value}
										className={font.className}
									>
										{font.label}
									</option>
								))}
							</select>
							<p className="text-[10px] text-zinc-500">
								This font will be applied to all text on your page.
							</p>
						</div>

						<div className="p-4 bg-zinc-900/30 rounded-xl border border-white/5">
							<p className="text-xs text-zinc-400">
								Template:{" "}
								<span className="text-white font-medium">{template.name}</span>
							</p>
							<p className="text-xs text-zinc-400 mt-1">
								Category:{" "}
								<span className="text-white">{template.category}</span>
							</p>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	// ─── Main Render ──────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-black text-white">
			<TopBar
				template={template}
				username={username}
				isPublished={isPublished}
				saving={saving}
				uploading={uploading}
				error={error}
				success={success}
				copied={copied}
				onSave={handleSave}
				onPublish={handlePublish}
				onCopyLink={handleCopyLink}
			/>

			{/* ─── Main Content ──────────────────────────────────────── */}
			<div className="max-w-7xl mx-auto p-4">
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
					{/* ─── Left: Tabs ────────────────────────────────────── */}

					<div className="lg:col-span-1 space-y-1">
						{[
							{
								id: "profile",
								label: "Profile",
								icon: <Users className="h-4 w-4" />,
							},
							{
								id: "links",
								label: "Links",
								icon: <Link2 className="h-4 w-4" />,
							},
							{
								id: "socials",
								label: "Socials",
								icon: <Users className="h-4 w-4" />,
							},
							{
								id: "contact",
								label: "Contact",
								icon: <Mail className="h-4 w-4" />,
							},
							{
								id: "theme",
								label: "Theme",
								icon: <Palette className="h-4 w-4" />,
							},
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as EditorTab)}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
									activeTab === tab.id
										? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
										: "text-zinc-400 hover:text-white hover:bg-white/5"
								}`}
							>
								{tab.icon}
								{tab.label}
							</button>
						))}
					</div>

					{/* ─── Center: Content ───────────────────────────────── */}
					<div className="lg:col-span-2 bg-zinc-950/40 border border-white/5 rounded-2xl p-6">
						{renderTabContent()}
					</div>

					{/* ─── Right: Live Preview ───────────────────────────── */}
					<div className="lg:col-span-2">
						<div className="sticky top-24">
							<div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4">
								<div className="flex items-center justify-between mb-3">
									<h3 className="text-xs font-bold text-white flex items-center gap-2">
										<Eye className="h-3.5 w-3.5 text-emerald-400" />
										Live Preview
									</h3>
									<span className="text-[10px] text-zinc-500">Mobile view</span>
								</div>

								<div className="flex justify-center">
									<div className="w-[320px] aspect-[9/16] bg-black rounded-2xl border border-white/10 overflow-hidden relative">
										{/* ─── Preview Container ────────────────────── */}
										<div
											className={`
                        w-full h-full p-4 overflow-y-auto 
                        ${templateStyles.fontFamily || "font-sans"}
                        ${templateStyles.typographyWeight || "font-normal"}
                        ${templateStyles.typographyCase || "normal-case"}
                        ${getPreviewBackground()}
                      `}
										>
											{/* ─── Card ────────────────────────────────── */}
											<div
												className={`
                          relative z-10
                          ${templateStyles.cardBackground || "bg-zinc-900/80 backdrop-blur-sm"}
                          ${templateStyles.cardBorder || "border border-white/5"}
                          ${templateStyles.cardShadow || "shadow-2xl"}
                          ${templateStyles.cardRadius || "rounded-2xl"}
                          ${templateStyles.cardBorderWidth || "border"}
                          ${templateStyles.spacing === "compact" ? "p-4 gap-1.5" : templateStyles.spacing === "generous" ? "p-8 gap-6" : "p-6 gap-4"}
                          space-y-3
                        `}
											>
												{/* ─── Cover ────────────────────────────── */}
												{coverImageUrl && (
													<div
														className={`aspect-[3/1] rounded-lg overflow-hidden bg-zinc-800 ${templateStyles.cardRadius || "rounded-lg"}`}
													>
														<img
															src={coverImageUrl}
															alt="Cover"
															className="w-full h-full object-cover"
														/>
													</div>
												)}

												{/* ─── Avatar ────────────────────────────── */}
												<div className="flex flex-col items-center text-center">
													{avatarUrl ? (
														<img
															src={avatarUrl}
															alt={displayName || username}
															className={`
                                w-16 h-16 object-cover 
                                ${templateStyles.avatarStyle || "rounded-full border-2 border-white shadow-lg"}
                                ${templateStyles.avatarBorder || "border-2 border-white"}
                              `}
														/>
													) : (
														<div
															className={`
                                w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-400 
                                flex items-center justify-center text-2xl font-bold text-white
                                ${templateStyles.avatarStyle || "rounded-full border-2 border-white shadow-lg"}
                                ${templateStyles.avatarBorder || "border-2 border-white"}
                              `}
														>
															{(displayName ||
																username ||
																"U")[0].toUpperCase()}
														</div>
													)}

													<h2
														className={`text-base font-bold mt-2 ${templateStyles.textColor || "text-white"}`}
													>
														{displayName || username}
													</h2>
													{bio && (
														<p
															className={`text-xs mt-1 ${templateStyles.textColor || "text-white"} opacity-70`}
														>
															{bio}
														</p>
													)}
												</div>

												{/* ─── Blog Text ────────────────────────── */}
												{blogText && (
													<div
														className={`text-xs ${templateStyles.textColor || "text-white"} opacity-60 text-center border-t border-white/5 pt-3`}
													>
														{blogText}
													</div>
												)}

												{/* ─── Socials ────────────────────────────── */}
												{socials.length > 0 && (
													<div className="flex flex-wrap justify-center gap-2">
														{socials.map((s) => {
															const p = SOCIAL_PLATFORMS.find(
																(pl) => pl.id === s.platform,
															);
															const displayName =
																s.display_name || p?.label || s.platform;
															return (
																<span
																	key={s.id}
																	className={`
                                    flex items-center gap-1 px-2 py-1 text-xs
                                    ${templateStyles.buttonStyle || "bg-white/5"}
                                    ${templateStyles.cardRadius || "rounded-full"}
                                    ${templateStyles.textColor || "text-zinc-300"}
                                    border border-white/5
                                  `}
																>
																	<span>{p?.icon || "🔗"}</span>
																	<span>{displayName}</span>
																</span>
															);
														})}
													</div>
												)}

												{/* ─── Links ────────────────────────────── */}
												<div className="space-y-2">
													{links
														.filter((l) => l.is_active !== false)
														.slice(0, 4)
														.map((link) => (
															<div
																key={link.id}
																className={`
                                px-4 py-2 text-center text-sm
                                ${templateStyles.buttonStyle || "bg-white/5"}
                                ${templateStyles.buttonHover || "hover:scale-105"}
                                ${templateStyles.cardRadius || "rounded-xl"}
                                ${templateStyles.textColor || "text-white"}
                                border border-white/5
                                transition-all
                              `}
															>
																<span className="flex items-center justify-center gap-2">
																	{link.icon && <span>{link.icon}</span>}
																	<span>{link.title}</span>
																</span>
															</div>
														))}
												</div>

												{/* ─── Contact ────────────────────────────── */}
												{(contactEmail || contactPhone || contactLocation) && (
													<div
														className={`text-center text-xs ${templateStyles.textColor || "text-white"} opacity-60 pt-2 border-t border-white/10`}
													>
														{contactEmail && <div>{contactEmail}</div>}
														{contactPhone && <div>{contactPhone}</div>}
														{contactLocation && <div>{contactLocation}</div>}
													</div>
												)}

												{/* ─── Footer ────────────────────────────── */}
												<div className="text-center text-[8px] text-white/30 pt-2 border-t border-white/5">
													Built with ❤️ on Nu-vora
												</div>
											</div>
										</div>
									</div>
								</div>
								<p className="text-[10px] text-zinc-500 text-center mt-3">
									Preview updates as you edit
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
