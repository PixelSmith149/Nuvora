"use client";

import {
	AlertCircle,
	Check,
	File,
	FileImage,
	FileVideo,
	Image,
	Loader2,
	Trash2,
	Upload,
	Video,
	X,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { useToast } from "@/lib/use-toast";
import { useBuilder } from "../core/BuilderProvider";

// ─── Supported file types ──────────────────────────────────────────────
const IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	"image/avif",
];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/mov", "video/quicktime"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export function PreviewImageInput() {
	const { previewImage, setPreviewImage, setIsDirty } = useBuilder();
	const { toast } = useToast();

	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [fileType, setFileType] = useState<"image" | "video" | null>(null);
	const [error, setError] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const dropZoneRef = useRef<HTMLDivElement>(null);

	// ─── Detect file type ──────────────────────────────────────────────────
	const detectFileType = (file: File): "image" | "video" | null => {
		if (IMAGE_TYPES.includes(file.type)) return "image";
		if (VIDEO_TYPES.includes(file.type)) return "video";
		// Check extension as fallback
		const ext = file.name.split(".").pop()?.toLowerCase();
		if (
			["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"].includes(ext || "")
		)
			return "image";
		if (["mp4", "webm", "mov", "qt"].includes(ext || "")) return "video";
		return null;
	};

	// ─── Validate file ──────────────────────────────────────────────────────
	const validateFile = (file: File): { valid: boolean; error?: string } => {
		const type = detectFileType(file);
		if (!type) {
			return {
				valid: false,
				error: "Unsupported file type. Please upload an image or video.",
			};
		}

		if (type === "image" && file.size > MAX_IMAGE_SIZE) {
			return {
				valid: false,
				error: `Image file too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`,
			};
		}

		if (type === "video" && file.size > MAX_VIDEO_SIZE) {
			return {
				valid: false,
				error: `Video file too large. Maximum size is ${MAX_VIDEO_SIZE / 1024 / 1024}MB.`,
			};
		}

		return { valid: true };
	};

	// ─── Upload file to server ──────────────────────────────────────────────
	const uploadFile = async (file: File): Promise<string> => {
		const formData = new FormData();
		formData.append("file", file);

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener("progress", (e) => {
				if (e.lengthComputable) {
					const progress = Math.round((e.loaded / e.total) * 100);
					setUploadProgress(progress);
				}
			});

			xhr.addEventListener("load", () => {
				if (xhr.status === 200) {
					try {
						const response = JSON.parse(xhr.responseText);
						resolve(response.url);
					} catch {
						reject(new Error("Failed to parse server response"));
					}
				} else {
					reject(new Error(`Upload failed: ${xhr.statusText}`));
				}
			});

			xhr.addEventListener("error", () => {
				reject(new Error("Network error during upload"));
			});

			// ─── Replace with your actual upload endpoint ───────────────────────
			xhr.open("POST", "/api/st/upload", true);
			xhr.send(formData);
		});
	};

	// ─── Handle file selection ──────────────────────────────────────────────
	const handleFile = async (file: File) => {
		// ─── Validate ────────────────────────────────────────────────────────
		const validation = validateFile(file);
		if (!validation.valid) {
			setError(validation.error || "Invalid file");
			toast({
				title: "Invalid File",
				description:
					validation.error || "Please upload a valid image or video.",
				variant: "destructive",
			});
			return;
		}

		setError(null);
		setIsUploading(true);
		setUploadProgress(0);

		// ─── For small images, use FileReader for instant preview ──────────
		const type = detectFileType(file);
		setFileType(type);

		try {
			// ─── Upload to server ──────────────────────────────────────────────
			const url = await uploadFile(file);

			// ─── Update preview image ──────────────────────────────────────────
			setPreviewImage(url);
			setIsDirty(true);

			toast({
				title: "✅ Upload Successful",
				description: `${file.name} uploaded successfully.`,
				variant: "success",
			});
		} catch (err: any) {
			setError(err.message);
			toast({
				title: "Upload Failed",
				description: err.message || "Failed to upload file.",
				variant: "destructive",
			});
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	// ─── Handle file selection from input ──────────────────────────────────
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFile(file);
		}
		// Reset input so same file can be re-selected
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// ─── Drag & Drop handlers ──────────────────────────────────────────────
	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFile(files[0]);
		}
	}, []);

	// ─── Paste handler ──────────────────────────────────────────────────────
	const handlePaste = useCallback(async (e: ClipboardEvent) => {
		const items = e.clipboardData?.items;
		if (!items) return;

		for (const item of items) {
			if (item.type.startsWith("image/")) {
				const file = item.getAsFile();
				if (file) {
					e.preventDefault();
					handleFile(file);
					break;
				}
			}
		}
	}, []);

	// ─── Add paste listener ──────────────────────────────────────────────────
	React.useEffect(() => {
		document.addEventListener("paste", handlePaste);
		return () => document.removeEventListener("paste", handlePaste);
	}, [handlePaste]);

	// ─── Clear preview ───────────────────────────────────────────────────────
	const handleClear = () => {
		setPreviewImage("");
		setFileType(null);
		setError(null);
		setIsDirty(true);
	};

	// ─── Determine file type from URL ──────────────────────────────────────
	const getUrlFileType = (url: string): "image" | "video" | null => {
		if (!url) return null;
		if (
			/\.(mp4|webm|mov|gif)$/i.test(url) ||
			url.includes("youtube") ||
			url.includes("vimeo")
		) {
			return "video";
		}
		return "image";
	};

	const urlFileType = previewImage ? getUrlFileType(previewImage) : null;

	// ─── Render ──────────────────────────────────────────────────────────────
	return (
		<div className="space-y-3">
			<label className="text-xs text-zinc-400 flex items-center gap-2">
				<Image className="h-3.5 w-3.5" />
				Preview Image / Video
			</label>

			{/* ─── Upload Area ────────────────────────────────────────────────── */}
			{!previewImage && (
				<div
					ref={dropZoneRef}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
						isDragging
							? "border-emerald-500 bg-emerald-500/10"
							: "border-white/10 hover:border-white/20 bg-black/30"
					}`}
				>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*,video/*"
						onChange={handleFileSelect}
						className="absolute inset-0 opacity-0 cursor-pointer z-10"
					/>

					<div className="flex flex-col items-center gap-2">
						{isUploading ? (
							<>
								<Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
								<p className="text-sm text-zinc-400">
									Uploading... {uploadProgress}%
								</p>
								<div className="w-full max-w-xs h-1 bg-white/10 rounded-full overflow-hidden">
									<div
										className="h-full bg-emerald-500 transition-all duration-300"
										style={{ width: `${uploadProgress}%` }}
									/>
								</div>
							</>
						) : (
							<>
								<div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
									<Upload className="h-6 w-6 text-emerald-400" />
								</div>
								<p className="text-sm font-medium text-white">
									Drag & drop or click to upload
								</p>
								<p className="text-xs text-zinc-500">
									Supports images (JPG, PNG, GIF, WebP, SVG) and videos (MP4,
									WebM, MOV)
								</p>
								<p className="text-[10px] text-zinc-600">
									Max image: 10MB • Max video: 50MB
								</p>
								<div className="flex items-center gap-4 text-[10px] text-zinc-500 mt-1">
									<span className="flex items-center gap-1">
										<Upload className="h-3 w-3" /> Click to upload
									</span>
									<span className="flex items-center gap-1">
										<File className="h-3 w-3" /> Drag & drop
									</span>
									<span className="flex items-center gap-1">
										<Image className="h-3 w-3" /> Ctrl+V to paste
									</span>
								</div>
							</>
						)}
					</div>
				</div>
			)}

			{/* ─── Preview ────────────────────────────────────────────────────── */}
			{previewImage && (
				<div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
					{/* ─── Preview Content ───────────────────────────────────────── */}
					<div className="relative">
						{urlFileType === "video" ? (
							<video
								src={previewImage}
								className="w-full max-h-[200px] object-contain"
								controls
								muted
								autoPlay={false}
							/>
						) : (
							<img
								src={previewImage}
								alt="Preview"
								className="w-full max-h-[200px] object-contain"
								onError={(e) => {
									(e.target as HTMLImageElement).src = "";
									(e.target as HTMLImageElement).alt = "Invalid image URL";
									setError("Failed to load image");
								}}
							/>
						)}

						{/* ─── Overlay Controls ────────────────────────────────────── */}
						<div className="absolute top-2 right-2 flex items-center gap-1">
							<span
								className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
									urlFileType === "video"
										? "bg-purple-500/20 text-purple-400 border border-purple-500/20"
										: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
								}`}
							>
								{urlFileType === "video" ? "🎬 Video" : "🖼️ Image"}
							</span>
							<button
								onClick={handleClear}
								className="p-1 rounded-lg bg-black/70 hover:bg-red-500/70 text-white transition-colors"
								title="Remove preview"
							>
								<Trash2 className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>

					{/* ─── Footer ────────────────────────────────────────────────── */}
					<div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-t border-white/5">
						<span className="text-[10px] text-zinc-500 truncate max-w-[200px]">
							{previewImage.length > 50
								? previewImage.substring(0, 50) + "..."
								: previewImage}
						</span>
						<div className="flex items-center gap-2">
							<span className="text-[10px] text-emerald-400 flex items-center gap-1">
								<Check className="h-3 w-3" />
								Loaded
							</span>
							{isUploading && (
								<span className="text-[10px] text-amber-400 flex items-center gap-1">
									<Loader2 className="h-3 w-3 animate-spin" />
									Uploading...
								</span>
							)}
						</div>
					</div>
				</div>
			)}

			{/* ─── URL Input (Fallback) ────────────────────────────────────── */}
			<div className="relative">
				<div className="flex items-center gap-2">
					<div className="relative flex-1">
						<input
							value={previewImage}
							onChange={(e) => {
								setPreviewImage(e.target.value);
								setIsDirty(true);
								setError(null);
								// Detect type from URL
								const type = getUrlFileType(e.target.value);
								setFileType(type);
							}}
							placeholder="Or enter URL (https://example.com/image.jpg)"
							className="w-full bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500/30 focus:outline-none transition-colors pr-10"
						/>
						{previewImage && (
							<button
								type="button"
								onClick={handleClear}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
					<button
						onClick={() => fileInputRef.current?.click()}
						className="flex-shrink-0 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors"
					>
						<Upload className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* ─── Error Message ────────────────────────────────────────────── */}
			{error && (
				<div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
					<AlertCircle className="h-4 w-4 flex-shrink-0" />
					<span>{error}</span>
					<button
						onClick={() => setError(null)}
						className="ml-auto text-red-400 hover:text-red-300 transition-colors"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</div>
			)}

			{/* ─── Helper Text ────────────────────────────────────────────── */}
			<p className="text-[10px] text-zinc-500">
				💡 Upload an image or video preview for your template. Used in
				dashboard, gallery, and template cards.
			</p>
		</div>
	);
}
