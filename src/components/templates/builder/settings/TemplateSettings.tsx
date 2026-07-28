"use client";

import React, { useState } from "react";
import { useBuilder } from "../core/BuilderProvider";
import { MediaLibraryButton } from "../media/MediaLibraryButton";
import { CategoryDropdown } from "./CategoryDropdown";
import { PreviewImageInput } from "./PreviewImageInput";
import { PublishToggles } from "./PublishToggles";
import { TagsInput } from "./TagsInput";

export function TemplateSettings() {
	const { name, setName, description, setDescription } = useBuilder();

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-bold text-white">Template Settings</h3>

			{/* ─── Name ────────────────────────────────────────────────────── */}
			<div className="space-y-1.5">
				<label className="text-xs text-zinc-400">Name *</label>
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="My Template"
					className="w-full bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500/30 focus:outline-none transition-colors"
				/>
			</div>

			{/* ─── Description ─────────────────────────────────────────────── */}
			<div className="space-y-1.5">
				<label className="text-xs text-zinc-400">Description</label>
				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="What does this template do?"
					className="w-full bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500/30 focus:outline-none h-16 resize-none"
				/>
			</div>

			{/* ─── Category ────────────────────────────────────────────────── */}
			<CategoryDropdown />

			{/* ─── Tags ────────────────────────────────────────────────────── */}
			<TagsInput />

			{/* ─── Preview Image ───────────────────────────────────────────── */}
			<PreviewImageInput />

			{/* ─── Media Library ──────────────────────────────────────────── */}
			<MediaLibraryButton />

			{/* ─── Publish Toggles ─────────────────────────────────────────── */}
			<PublishToggles />
		</div>
	);
}
