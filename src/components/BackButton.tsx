"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
	const router = useRouter();

	return (
		<button
			onClick={() => router.back()}
			className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-3 text-sm text-white/70 backdrop-blur-md transition hover:text-white hover:border-white/30 hover:scale-105"
		>
			← Back
		</button>
	);
}
