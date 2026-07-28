"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useBuilder } from "../core/BuilderProvider";

const JS_KEYWORDS = [
	"console.log",
	"console.error",
	"console.warn",
	"console.info",
	"function",
	"const",
	"let",
	"var",
	"return",
	"if",
	"else",
	"for",
	"while",
	"document.querySelector",
	"document.querySelectorAll",
	"document.getElementById",
	"document.addEventListener",
	"window.addEventListener",
	"fetch",
	"then",
	"catch",
	"finally",
	"async",
	"await",
	"try",
	"catch",
	"throw",
	"new",
	"this",
	"class",
	"export",
	"import",
	"Array",
	"Object",
	"String",
	"Number",
	"Boolean",
	"JSON.parse",
	"JSON.stringify",
];

export function JSEditor() {
	const { jsCode, setJsCode, isDirty, setIsDirty } = useBuilder();
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setJsCode(value);

		// ─── Mark as dirty when user types ──────────────────────────────
		if (!isDirty) {
			setIsDirty(true);
		}

		// ─── Autocomplete ──────────────────────────────────────────────────
		const cursorPos = e.target.selectionStart;
		const textBefore = value.substring(0, cursorPos);
		const lastWord = textBefore.split(/[\s\n.()]/).pop() || "";

		if (lastWord.length > 0 && lastWord.length < 15) {
			const matches = JS_KEYWORDS.filter((keyword) =>
				keyword.startsWith(lastWord),
			).slice(0, 8);

			if (matches.length > 0) {
				setSuggestions(matches);
				setShowSuggestions(true);
			} else {
				setShowSuggestions(false);
			}
		} else {
			setShowSuggestions(false);
		}
	};

	const insertSuggestion = (suggestion: string) => {
		if (!textareaRef.current) return;

		const cursorPos = textareaRef.current.selectionStart;
		const textBefore = jsCode.substring(0, cursorPos);
		const textAfter = jsCode.substring(cursorPos);

		const lastSpace = textBefore.lastIndexOf(" ");
		const lastNewline = textBefore.lastIndexOf("\n");
		const start = Math.max(lastSpace, lastNewline) + 1;

		const newText = textBefore.substring(0, start) + suggestion + textAfter;
		setJsCode(newText);
		setShowSuggestions(false);

		const newPos = start + suggestion.length;
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				textareaRef.current.setSelectionRange(newPos, newPos);
			}
		}, 10);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (showSuggestions && suggestions.length > 0) {
			if (e.key === "Enter" || e.key === "Tab") {
				e.preventDefault();
				insertSuggestion(suggestions[0]);
				return;
			}
			if (e.key === "Escape") {
				setShowSuggestions(false);
				return;
			}
		}
	};

	return (
		<div className="relative">
			<textarea
				ref={textareaRef}
				value={jsCode}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				className="w-full bg-black border border-white/10 text-white rounded-xl p-3 text-sm font-mono min-h-[200px] resize-none focus:border-emerald-500/30 focus:outline-none"
				spellCheck={false}
				placeholder="// Write your JavaScript here"
			/>

			{showSuggestions && suggestions.length > 0 && (
				<div className="absolute bottom-full left-0 mb-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-[200px] overflow-y-auto min-w-[200px] z-20">
					{suggestions.map((suggestion, index) => (
						<button
							key={index}
							onClick={() => insertSuggestion(suggestion)}
							className="w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/5 transition-colors font-mono"
						>
							{suggestion}
						</button>
					))}
					<div className="px-3 py-1 text-[8px] text-zinc-500 border-t border-white/5">
						Press Enter or Tab to insert
					</div>
				</div>
			)}

			<div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
				<span>💡 Start typing a keyword for suggestions</span>
				<span>•</span>
				<span className="text-zinc-600">{jsCode.length} chars</span>
				<span>•</span>
				<span className="text-zinc-600">
					{jsCode.split(/\n/).filter((l) => l.trim()).length} lines
				</span>
			</div>
		</div>
	);
}
