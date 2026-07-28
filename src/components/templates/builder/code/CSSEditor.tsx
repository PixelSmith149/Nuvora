"use client";

import {
	AlertTriangle,
	AlignJustify,
	AlignLeft,
	Check,
	Minus,
	Palette,
	Plus,
	RefreshCw,
	Search,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useBuilder } from "../core/BuilderProvider";

// ─── CSS Properties ──────────────────────────────────────────────────────
const CSS_PROPERTIES = [
	// Layout
	"display",
	"position",
	"top",
	"right",
	"bottom",
	"left",
	"z-index",
	"flex",
	"flex-direction",
	"flex-wrap",
	"flex-flow",
	"flex-grow",
	"flex-shrink",
	"flex-basis",
	"grid",
	"grid-template-columns",
	"grid-template-rows",
	"grid-gap",
	"grid-column",
	"grid-row",
	"gap",
	"row-gap",
	"column-gap",
	"float",
	"clear",
	"overflow",
	"overflow-x",
	"overflow-y",
	// Box Model
	"width",
	"height",
	"max-width",
	"max-height",
	"min-width",
	"min-height",
	"margin",
	"margin-top",
	"margin-right",
	"margin-bottom",
	"margin-left",
	"padding",
	"padding-top",
	"padding-right",
	"padding-bottom",
	"padding-left",
	"border",
	"border-top",
	"border-right",
	"border-bottom",
	"border-left",
	"border-color",
	"border-width",
	"border-style",
	"border-radius",
	"box-shadow",
	"outline",
	"outline-offset",
	// Typography
	"font-family",
	"font-size",
	"font-weight",
	"font-style",
	"font-variant",
	"line-height",
	"letter-spacing",
	"word-spacing",
	"text-align",
	"text-decoration",
	"text-transform",
	"text-indent",
	"text-shadow",
	"text-overflow",
	"white-space",
	"word-wrap",
	"word-break",
	"overflow-wrap",
	// Colors & Background
	"color",
	"background",
	"background-color",
	"background-image",
	"background-size",
	"background-position",
	"background-repeat",
	"background-attachment",
	"background-clip",
	"background-origin",
	"background-blend-mode",
	"opacity",
	// Transforms & Transitions
	"transform",
	"transform-origin",
	"transition",
	"transition-property",
	"transition-duration",
	"transition-timing-function",
	"transition-delay",
	"animation",
	"animation-name",
	"animation-duration",
	"animation-timing-function",
	"animation-delay",
	"animation-iteration-count",
	"animation-direction",
	"animation-fill-mode",
	"animation-play-state",
	// Other
	"cursor",
	"pointer-events",
	"user-select",
	"visibility",
	"filter",
	"backdrop-filter",
	"mix-blend-mode",
	"isolation",
	"perspective",
	"perspective-origin",
	"backface-visibility",
	"will-change",
	"contain",
	"content",
	"counter-reset",
	"counter-increment",
	"list-style",
	"list-style-type",
	"list-style-position",
	"list-style-image",
	"quotes",
	"vertical-align",
	"table-layout",
	"border-collapse",
	"border-spacing",
	// Variables
	"--*",
	"var(--*)",
];

// ─── CSS Property Categories ────────────────────────────────────────────
const CSS_CATEGORIES = {
	Layout: [
		"display",
		"position",
		"top",
		"right",
		"bottom",
		"left",
		"z-index",
		"float",
		"clear",
		"overflow",
	],
	Flexbox: [
		"flex",
		"flex-direction",
		"flex-wrap",
		"flex-flow",
		"flex-grow",
		"flex-shrink",
		"flex-basis",
		"justify-content",
		"align-items",
	],
	Grid: [
		"grid",
		"grid-template-columns",
		"grid-template-rows",
		"grid-gap",
		"grid-column",
		"grid-row",
	],
	"Box Model": [
		"width",
		"height",
		"max-width",
		"max-height",
		"min-width",
		"min-height",
		"margin",
		"padding",
		"border",
		"border-radius",
		"box-shadow",
	],
	Typography: [
		"font-family",
		"font-size",
		"font-weight",
		"line-height",
		"letter-spacing",
		"text-align",
		"text-decoration",
		"text-shadow",
	],
	Colors: [
		"color",
		"background",
		"background-color",
		"background-image",
		"opacity",
		"filter",
	],
	Transforms: ["transform", "transform-origin", "transition", "animation"],
	Other: [
		"cursor",
		"pointer-events",
		"user-select",
		"visibility",
		"backdrop-filter",
		"mix-blend-mode",
	],
};

// ─── Color Values for Preview ───────────────────────────────────────────
const COLOR_PATTERN =
	/(#([0-9a-f]{3}|[0-9a-f]{6})|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|var\(--[^)]+\))/gi;

export function CSSEditor() {
	const { cssCode, setCssCode, isDirty, setIsDirty } = useBuilder();

	// ─── State ────────────────────────────────────────────────────────────
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [cursorPosition, setCursorPosition] = useState(0);
	const [lineNumbers, setLineNumbers] = useState<number[]>([1]);
	const [fontSize, setFontSize] = useState(14);
	const [wordWrap, setWordWrap] = useState(true);
	const [showLineNumbers, setShowLineNumbers] = useState(true);
	const [showSearch, setShowSearch] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchIndex, setSearchIndex] = useState(0);
	const [searchMatches, setSearchMatches] = useState<
		{ start: number; end: number }[]
	>([]);
	const [error, setError] = useState<string | null>(null);
	const [undoStack, setUndoStack] = useState<string[]>([]);
	const [undoIndex, setUndoIndex] = useState(-1);
	const [showCategoryHelp, setShowCategoryHelp] = useState(false);
	const [colors, setColors] = useState<
		{ name: string; value: string; position: number }[]
	>([]);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const editorRef = useRef<HTMLDivElement>(null);

	// ─── Update line numbers ──────────────────────────────────────────────
	useEffect(() => {
		const lines = cssCode.split("\n").length;
		setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
	}, [cssCode]);

	// ─── Extract colors for preview ──────────────────────────────────────
	useEffect(() => {
		const foundColors: { name: string; value: string; position: number }[] = [];
		let match;
		while ((match = COLOR_PATTERN.exec(cssCode)) !== null) {
			foundColors.push({
				name: match[0],
				value: match[0],
				position: match.index,
			});
		}
		setColors(foundColors);
	}, [cssCode]);

	// ─── Auto-indent on Enter ─────────────────────────────────────────────
	const handleKeyDown = (e: React.KeyboardEvent) => {
		// ─── Undo/Redo ──────────────────────────────────────────────────────
		if ((e.ctrlKey || e.metaKey) && e.key === "z") {
			e.preventDefault();
			if (!e.shiftKey) {
				undo();
			} else {
				redo();
			}
			return;
		}

		// ─── Search ──────────────────────────────────────────────────────────
		if ((e.ctrlKey || e.metaKey) && e.key === "f") {
			e.preventDefault();
			setShowSearch(true);
			setTimeout(() => {
				const searchInput = document.getElementById("css-search-input");
				if (searchInput) searchInput.focus();
			}, 100);
			return;
		}

		// ─── Format Document ────────────────────────────────────────────────
		if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
			e.preventDefault();
			formatDocument();
			return;
		}

		// ─── Suggestion handling ────────────────────────────────────────────
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

		// ─── Auto-indent on Enter ───────────────────────────────────────────
		if (e.key === "Enter") {
			const cursorPos = textareaRef.current?.selectionStart || 0;
			const textBefore = cssCode.substring(0, cursorPos);
			const currentLine = textBefore.split("\n").pop() || "";
			const indent = currentLine.match(/^\s*/)?.[0] || "";

			// ─── Detect if we're inside a block ──────────────────────────────
			const isInsideBlock =
				currentLine.includes("{") && !currentLine.includes("}");
			const extraIndent = isInsideBlock ? "  " : "";

			e.preventDefault();
			const newText =
				cssCode.slice(0, cursorPos) +
				"\n" +
				indent +
				extraIndent +
				cssCode.slice(cursorPos);
			setCssCode(newText);
			pushToUndo(newText);
			if (!isDirty) setIsDirty(true);
		}

		// ─── Auto-close braces ──────────────────────────────────────────────
		if (e.key === "{" && !e.shiftKey) {
			const cursorPos = textareaRef.current?.selectionStart || 0;
			const textBefore = cssCode.substring(0, cursorPos);
			const textAfter = cssCode.substring(cursorPos);

			e.preventDefault();
			const newText = textBefore + "{\n  \n}" + textAfter;
			setCssCode(newText);
			pushToUndo(newText);
			if (!isDirty) setIsDirty(true);

			setTimeout(() => {
				if (textareaRef.current) {
					textareaRef.current.setSelectionRange(cursorPos + 2, cursorPos + 2);
					textareaRef.current.focus();
				}
			}, 10);
			return;
		}
	};

	// ─── Undo/Redo ─────────────────────────────────────────────────────────
	const pushToUndo = (text: string) => {
		setUndoStack((prev) => {
			const newStack = prev.slice(0, undoIndex + 1);
			newStack.push(text);
			if (newStack.length > 100) newStack.shift();
			return newStack;
		});
		setUndoIndex((prev) => prev + 1);
	};

	const undo = () => {
		if (undoIndex > 0) {
			const newIndex = undoIndex - 1;
			setCssCode(undoStack[newIndex]);
			setUndoIndex(newIndex);
			setIsDirty(true);
		}
	};

	const redo = () => {
		if (undoIndex < undoStack.length - 1) {
			const newIndex = undoIndex + 1;
			setCssCode(undoStack[newIndex]);
			setUndoIndex(newIndex);
			setIsDirty(true);
		}
	};

	// ─── Format Document ──────────────────────────────────────────────────
	const formatDocument = () => {
		try {
			let formatted = "";
			let indentLevel = 0;
			const indentChar = "  ";
			const lines = cssCode.split("\n").filter((l) => l.trim());

			for (const line of lines) {
				const trimmed = line.trim();

				// ─── Decrease indent for closing braces ─────────────────────────
				if (trimmed.startsWith("}")) {
					indentLevel = Math.max(0, indentLevel - 1);
				}

				// ─── Add line with proper indent ──────────────────────────────
				formatted += indentChar.repeat(indentLevel) + trimmed + "\n";

				// ─── Increase indent for opening braces ────────────────────────
				if (trimmed.includes("{") && !trimmed.includes("}")) {
					indentLevel++;
				}
			}

			setCssCode(formatted.trim());
			pushToUndo(formatted.trim());
			setIsDirty(true);
		} catch (err) {
			console.error("Format error:", err);
		}
	};

	// ─── Search ────────────────────────────────────────────────────────────
	const performSearch = (query: string) => {
		if (!query) {
			setSearchMatches([]);
			setSearchIndex(0);
			return;
		}

		const matches: { start: number; end: number }[] = [];
		let index = 0;
		while (true) {
			const start = cssCode.indexOf(query, index);
			if (start === -1) break;
			matches.push({ start, end: start + query.length });
			index = start + query.length;
		}

		setSearchMatches(matches);
		setSearchIndex(matches.length > 0 ? 0 : -1);

		if (matches.length > 0) {
			highlightText(matches[0].start, matches[0].end);
		}
	};

	const highlightText = (start: number, end: number) => {
		if (textareaRef.current) {
			textareaRef.current.focus();
			textareaRef.current.setSelectionRange(start, end);
		}
	};

	const nextSearch = () => {
		if (searchMatches.length === 0) return;
		const next = (searchIndex + 1) % searchMatches.length;
		setSearchIndex(next);
		highlightText(searchMatches[next].start, searchMatches[next].end);
	};

	// ─── Handle text changes ──────────────────────────────────────────────
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setCssCode(value);
		pushToUndo(value);
		if (!isDirty) setIsDirty(true);

		// ─── Autocomplete ──────────────────────────────────────────────────
		const cursorPos = e.target.selectionStart;
		setCursorPosition(cursorPos);

		const textBefore = value.substring(0, cursorPos);
		const lastWord = textBefore.split(/[\s\n:;{]/).pop() || "";

		if (lastWord.length > 0 && lastWord.length < 20) {
			const matches = CSS_PROPERTIES.filter((prop) =>
				prop.startsWith(lastWord),
			).slice(0, 10);

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

	// ─── Insert Suggestion ──────────────────────────────────────────────
	const insertSuggestion = (suggestion: string) => {
		if (!textareaRef.current) return;

		const cursorPos = textareaRef.current.selectionStart;
		const textBefore = cssCode.substring(0, cursorPos);
		const textAfter = cssCode.substring(cursorPos);

		const lastSpace = textBefore.lastIndexOf(" ");
		const lastNewline = textBefore.lastIndexOf("\n");
		const start = Math.max(lastSpace, lastNewline) + 1;

		const newText =
			textBefore.substring(0, start) + suggestion + ": " + textAfter;
		setCssCode(newText);
		pushToUndo(newText);
		setShowSuggestions(false);
		if (!isDirty) setIsDirty(true);

		const newPos = start + suggestion.length + 2;
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				textareaRef.current.setSelectionRange(newPos, newPos);
			}
		}, 10);
	};

	return (
		<div className="relative" ref={editorRef}>
			{/* ─── Editor Toolbar ────────────────────────────────────────────── */}
			<div className="flex items-center justify-between gap-2 p-1.5 bg-zinc-950/40 border border-white/5 rounded-t-xl">
				<div className="flex items-center gap-1">
					<span className="text-[10px] font-bold text-zinc-500 px-2">CSS</span>

					{/* ─── Font Size ────────────────────────────────────────────── */}
					<button
						onClick={() => setFontSize(Math.max(10, fontSize - 2))}
						className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
					>
						<Minus className="h-3 w-3" />
					</button>
					<span className="text-[10px] text-zinc-500 w-6 text-center">
						{fontSize}
					</span>
					<button
						onClick={() => setFontSize(Math.min(24, fontSize + 2))}
						className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
					>
						<Plus className="h-3 w-3" />
					</button>

					<div className="w-px h-4 bg-white/5 mx-1" />

					{/* ─── Word Wrap ────────────────────────────────────────────── */}
					<button
						onClick={() => setWordWrap(!wordWrap)}
						className={`p-1 rounded transition-colors ${wordWrap ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}
					>
						<AlignJustify className="h-3.5 w-3.5" />
					</button>

					{/* ─── Line Numbers ──────────────────────────────────────────── */}
					<button
						onClick={() => setShowLineNumbers(!showLineNumbers)}
						className={`p-1 rounded transition-colors ${showLineNumbers ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}
					>
						<AlignLeft className="h-3.5 w-3.5" />
					</button>

					<div className="w-px h-4 bg-white/5 mx-1" />

					{/* ─── Format ────────────────────────────────────────────────── */}
					<button
						onClick={formatDocument}
						className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
						title="Format document (Ctrl+Shift+F)"
					>
						<RefreshCw className="h-3.5 w-3.5" />
					</button>

					{/* ─── Search ────────────────────────────────────────────────── */}
					<button
						onClick={() => setShowSearch(!showSearch)}
						className={`p-1 rounded transition-colors ${showSearch ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}
					>
						<Search className="h-3.5 w-3.5" />
					</button>

					{/* ─── Category Help ──────────────────────────────────────────── */}
					<button
						onClick={() => setShowCategoryHelp(!showCategoryHelp)}
						className={`p-1 rounded transition-colors ${showCategoryHelp ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}
						title="CSS Property Categories"
					>
						<Palette className="h-3.5 w-3.5" />
					</button>
				</div>

				<div className="flex items-center gap-2">
					{/* ─── Color Preview ────────────────────────────────────────── */}
					{colors.length > 0 && (
						<div className="flex items-center gap-1">
							{colors.slice(0, 3).map((color, i) => (
								<div
									key={i}
									className="w-4 h-4 rounded border border-white/10"
									style={{ backgroundColor: color.value }}
									title={color.value}
								/>
							))}
							{colors.length > 3 && (
								<span className="text-[9px] text-zinc-500">
									+{colors.length - 3}
								</span>
							)}
						</div>
					)}

					{/* ─── Validation Status ────────────────────────────────────── */}
					{error ? (
						<span className="text-[9px] text-red-400 flex items-center gap-1">
							<AlertTriangle className="h-3 w-3" />
							{error}
						</span>
					) : (
						<span className="text-[9px] text-emerald-400 flex items-center gap-1">
							<Check className="h-3 w-3" />
							Valid
						</span>
					)}
				</div>
			</div>

			{/* ─── Search Bar ────────────────────────────────────────────────── */}
			{showSearch && (
				<div className="flex items-center gap-2 p-1.5 bg-black border-x border-white/5">
					<Search className="h-3.5 w-3.5 text-zinc-500" />
					<input
						id="css-search-input"
						type="text"
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							performSearch(e.target.value);
						}}
						placeholder="Search..."
						className="flex-1 bg-transparent border-0 text-white text-xs focus:outline-none"
						onKeyDown={(e) => {
							if (e.key === "Enter") nextSearch();
							if (e.key === "Escape") setShowSearch(false);
						}}
					/>
					<span className="text-[10px] text-zinc-500">
						{searchMatches.length > 0
							? `${searchIndex + 1}/${searchMatches.length}`
							: "No matches"}
					</span>
					<button
						onClick={nextSearch}
						className="p-0.5 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
					>
						<span className="text-xs">↓</span>
					</button>
					<button
						onClick={() => setShowSearch(false)}
						className="p-0.5 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</div>
			)}

			{/* ─── Category Help ────────────────────────────────────────────── */}
			{showCategoryHelp && (
				<div className="p-2 bg-black border-x border-white/5">
					<div className="flex flex-wrap gap-2">
						{Object.entries(CSS_CATEGORIES).map(([category, props]) => (
							<div key={category} className="text-[10px]">
								<span className="font-bold text-emerald-400">{category}:</span>
								<span className="text-zinc-500 ml-1">
									{props.slice(0, 4).join(", ")}
									{props.length > 4 && (
										<span className="text-zinc-600">
											{" "}
											+{props.length - 4} more
										</span>
									)}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* ─── Editor Container ──────────────────────────────────────────── */}
			<div
				className={`relative bg-black border-x border-b border-white/10 rounded-b-xl overflow-hidden ${
					showSearch ? "rounded-t-none" : ""
				}`}
			>
				<div className="flex overflow-auto">
					{/* ─── Line Numbers ──────────────────────────────────────────── */}
					{showLineNumbers && (
						<div
							className="flex-shrink-0 py-3 px-2 text-right select-none bg-black/50 border-r border-white/5"
							style={{ minWidth: "40px" }}
						>
							{lineNumbers.map((num) => (
								<div
									key={num}
									className={`text-[10px] leading-[1.6] font-mono ${
										num ===
										Math.floor(
											(cursorPosition / cssCode.length) * lineNumbers.length,
										) +
											1
											? "text-purple-400"
											: "text-zinc-600"
									}`}
								>
									{num}
								</div>
							))}
						</div>
					)}

					{/* ─── Textarea ──────────────────────────────────────────────── */}
					<div className="flex-1 relative">
						<textarea
							ref={textareaRef}
							value={cssCode}
							onChange={handleChange}
							onKeyDown={handleKeyDown}
							className="w-full bg-transparent text-white rounded-b-xl p-3 font-mono resize-none focus:outline-none"
							style={{
								fontSize: `${fontSize}px`,
								lineHeight: "1.6",
								whiteSpace: wordWrap ? "pre-wrap" : "pre",
								minHeight: "250px",
								tabSize: 2,
							}}
							spellCheck={false}
							placeholder="/* Write your CSS here */"
						/>
					</div>
				</div>

				{/* ─── Autocomplete Suggestions ────────────────────────────────── */}
				{showSuggestions && suggestions.length > 0 && (
					<div className="absolute bottom-full left-0 mb-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-[200px] overflow-y-auto min-w-[200px] z-20">
						{suggestions.map((suggestion, index) => (
							<button
								key={index}
								onClick={() => insertSuggestion(suggestion)}
								className="w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/5 transition-colors font-mono flex items-center gap-2"
							>
								<span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
									prop
								</span>
								{suggestion}
							</button>
						))}
						<div className="px-3 py-1 text-[8px] text-zinc-500 border-t border-white/5">
							Press Enter or Tab to insert
						</div>
					</div>
				)}
			</div>

			{/* ─── Status Bar ────────────────────────────────────────────────── */}
			<div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
				<span>💡 Start typing a property name for suggestions</span>
				<span>•</span>
				<span className="text-zinc-600">{cssCode.length} chars</span>
				<span>•</span>
				<span className="text-zinc-600">
					{cssCode.split(/\n/).filter((l) => l.trim()).length} lines
				</span>
				<span>•</span>
				<span className={`${isDirty ? "text-amber-400" : "text-emerald-400"}`}>
					{isDirty ? "● Unsaved" : "✓ Saved"}
				</span>
				<span>•</span>
				<span className="text-zinc-600">
					Undo: {undoIndex + 1}/{undoStack.length}
				</span>
				{colors.length > 0 && (
					<span className="text-zinc-600">🎨 {colors.length} colors</span>
				)}
			</div>
		</div>
	);
}
