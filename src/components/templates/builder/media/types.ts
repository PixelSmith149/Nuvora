// components/templates/builder/media/types.ts

export interface MediaFile {
	id: string;
	url: string;
	name: string;
	type: "image" | "video";
	size: number;
	mimeType: string;
	uploadedAt: string;
	userId: string;
	width?: number;
	height?: number;
	duration?: number; // for videos
}

export interface MediaLibraryProps {
	onInsert?: (url: string, name: string) => void;
	onClose?: () => void;
}
