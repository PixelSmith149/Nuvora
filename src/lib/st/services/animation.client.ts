// lib/st/services/animation.client.ts
"use client";

import {
	type Animation,
	type AnimationPreset,
	AnimationType,
} from "@/lib/st/types/templates-animation";

// ─── Get animations for current user ──────────────────────────────────
export async function getAnimationsClient(): Promise<Animation[]> {
	const response = await fetch("/api/st/t-a/animations", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to fetch animations");
	}

	const data = await response.json();
	return data.animations || [];
}

// ─── Get animation presets ────────────────────────────────────────────
export async function getAnimationPresetsClient(): Promise<AnimationPreset[]> {
	const response = await fetch("/api/st/t-a/presets", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to fetch animation presets");
	}

	const data = await response.json();
	return data.presets || [];
}

export async function createAnimationClient(
	userId: string,
	data: Partial<Animation>,
): Promise<Animation> {
	const response = await fetch("/api/st/t-a/animations", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userId, ...data }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to create animation");
	}

	const result = await response.json();
	return result.animation;
}

export async function updateAnimationClient(
	id: string,
	userId: string,
	data: Partial<Animation>,
): Promise<Animation> {
	const response = await fetch(`/api/st/t-a/animations/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userId, ...data }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to update animation");
	}

	const result = await response.json();
	return result.animation;
}
