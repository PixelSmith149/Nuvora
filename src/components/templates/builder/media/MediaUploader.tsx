"use client";

import {
	AlertCircle,
	Check,
	FileImage,
	FileVideo,
	Loader2,
	Upload,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { useToast } from "@/lib/use-toast";
import type { MediaFile } from "./types";

interface MediaUploaderProps {
	onUploadComplete: (media: MediaFile) => void;
	onCancel: () => void;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/mov"];

export function MediaUploader({
	onUploadComplete,
	onCancel,
}: MediaUploaderProps) {
	const { toast } = useToast();
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const validateFile = (file: File): { valid: boolean; error?: string } => {
		const isImage = IMAGE_TYPES.includes(file.type);
		const isVideo = VIDEO_TYPES.includes(file.type);

		if (!isImage && !isVideo) {
			return {
				valid: false,
				error: "Unsupported file type. Please upload an image or video.",
			};
		}

		if (isImage && file.size > MAX_IMAGE_SIZE) {
			return { valid: false, error: `Image too large. Max size is 10MB.` };
		}

		if (isVideo && file.size > MAX_VIDEO_SIZE) {
			return { valid: false, error: `Video too large. Max size is 50MB.` };
		}

		return { valid: true };
	};

	const uploadFile = async (file: File): Promise<MediaFile> => {
		const formData = new FormData();
		formData.append("file", file);

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener("progress", (e) => {
				if (e.lengthComputable) {
					setUploadProgress(Math.round((e.loaded / e.total) * 100));
				}
			});

			xhr.addEventListener("load", () => {
				if (xhr.status === 200) {
					try {
						const response = JSON.parse(xhr.responseText);
						resolve(response);
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

			xhr.open("POST", "/api/st/media/upload", true);
			xhr.send(formData);
		});
	};

	const handleFile = async (file: File) => {
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

		try {
			const result = await uploadFile(file);
			onUploadComplete(result);
		} catch (err: any) {
			setError(err.message);
			toast({
				title: "Upload Failed",
				description: err.message || "Failed to upload file.",
				variant: "destructive",
			});
		} finally {
			setIsUploading(false);
		}
	};

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFile(files[0]);
		}
	}, []);

	return (
		<div className="flex flex-col items-center justify-center h-40">
			{isUploading ? (
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
					<p className="text-sm text-zinc-400">
						Uploading... {uploadProgress}%
					</p>
					<div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
						<div
							className="h-full bg-emerald-500 transition-all duration-300"
							style={{ width: `${uploadProgress}%` }}
						/>
					</div>
				</div>
			) : (
				<div
					onDragOver={(e) => {
						e.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={handleDrop}
					className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-all ${
						isDragging
							? "border-emerald-500 bg-emerald-500/10"
							: "border-white/10 hover:border-white/20"
					}`}
				>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*,video/*"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) handleFile(file);
							if (fileInputRef.current) fileInputRef.current.value = "";
						}}
						className="absolute inset-0 opacity-0 cursor-pointer"
					/>
					<Upload className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
					<p className="text-sm text-white">Drag & drop or click to upload</p>
					<p className="text-xs text-zinc-500 mt-1">
						Images (10MB max) • Videos (50MB max)
					</p>
					{error && (
						<div className="flex items-center gap-2 mt-2 text-xs text-red-400">
							<AlertCircle className="h-3.5 w-3.5" />
							<span>{error}</span>
						</div>
					)}
					<button
						onClick={onCancel}
						className="mt-3 text-xs text-zinc-500 hover:text-white transition-colors"
					>
						Cancel
					</button>
				</div>
			)}
		</div>
	);
}
