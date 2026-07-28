"use client";

import { Plus, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useBuilder } from "../core/BuilderProvider";

export function TagsInput() {
	const { tags, addTag, removeTag } = useBuilder();
	const [inputValue, setInputValue] = useState("");

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (inputValue.trim()) {
				addTag(inputValue.trim());
				setInputValue("");
			}
		}
	};

	const handleAdd = () => {
		if (inputValue.trim()) {
			addTag(inputValue.trim());
			setInputValue("");
		}
	};

	return (
		<div className="space-y-1.5">
			<label className="text-xs text-zinc-400">Tags</label>
			<div className="flex gap-2">
				<input
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Add a tag..."
					className="flex-1 bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500/30 focus:outline-none transition-colors"
				/>
				<button
					type="button"
					onClick={handleAdd}
					className="flex items-center gap-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors"
				>
					<Plus className="h-4 w-4" />
					Add
				</button>
			</div>
			{tags.length > 0 && (
				<div className="flex flex-wrap gap-1.5 mt-2">
					{tags.map((tag) => (
						<span
							key={tag}
							className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs"
						>
							{tag}
							<button
								type="button"
								onClick={() => removeTag(tag)}
								className="hover:text-red-400 transition-colors"
							>
								<X className="h-3 w-3" />
							</button>
						</span>
					))}
				</div>
			)}
		</div>
	);
}
