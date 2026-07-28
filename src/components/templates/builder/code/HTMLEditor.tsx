"use client";

import {
	AlertTriangle,
	AlignJustify,
	AlignLeft,
	Check,
	Code2,
	Minus,
	Plus,
	RefreshCw,
	Search,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBuilder } from "../core/BuilderProvider";
import { MediaContextMenu } from "../media/MediaContextMenu";

// ─── HTML Tags ──────────────────────────────────────────────────────────
const HTML_TAGS = [
	"div",
	"span",
	"p",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"a",
	"img",
	"button",
	"input",
	"form",
	"label",
	"textarea",
	"ul",
	"ol",
	"li",
	"table",
	"tr",
	"td",
	"th",
	"thead",
	"tbody",
	"tfoot",
	"section",
	"header",
	"footer",
	"nav",
	"main",
	"aside",
	"article",
	"figure",
	"figcaption",
	"blockquote",
	"code",
	"pre",
	"kbd",
	"samp",
	"video",
	"audio",
	"iframe",
	"canvas",
	"svg",
	"object",
	"embed",
	"strong",
	"em",
	"br",
	"hr",
	"link",
	"meta",
	"script",
	"style",
	"select",
	"option",
	"optgroup",
	"datalist",
	"fieldset",
	"legend",
	"dialog",
	"details",
	"summary",
	"template",
	"slot",
	"webview",
];

const HTML_ATTRIBUTES = [
	"class",
	"id",
	"src",
	"href",
	"alt",
	"title",
	"style",
	"width",
	"height",
	"type",
	"name",
	"value",
	"placeholder",
	"onclick",
	"onchange",
	"onsubmit",
	"onload",
	"onerror",
	"data-*",
	"aria-*",
	"role",
	"tabindex",
	"disabled",
	"readonly",
	"required",
	"checked",
	"selected",
	"multiple",
	"autofocus",
	"accept",
	"autocomplete",
	"autoplay",
	"controls",
	"loop",
	"muted",
	"poster",
	"preload",
	"playsinline",
	"crossorigin",
	"rel",
	"media",
];

// ─── Emmet Abbreviations ──────────────────────────────────────────────
const EMMET_ABBREVIATIONS: Record<string, string> = {
	"!": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
</body>
</html>`,
	link: '<link rel="stylesheet" href="">',
	img: '<img src="" alt="">',
	input: '<input type="text" />',
	script: '<script src=""></script>',
	style: "<style></style>",
	meta: '<meta charset="UTF-8">',
};

// ─── Color Palette for Syntax Highlighting ────────────────────────────
const SYNTAX_COLORS = {
	tag: "#e06c75",
	attribute: "#d19a66",
	value: "#98c379",
	string: "#98c379",
	comment: "#5c6370",
	bracket: "#abb2bf",
	keyword: "#c678dd",
};

export function HTMLEditor() {
	const { htmlCode, setHtmlCode, isDirty, setIsDirty } = useBuilder();

	// ─── State ────────────────────────────────────────────────────────────
	const [suggestions, setSuggestions] = useState<
		{ tag: string; type: "tag" | "attribute" }[]
	>([]);
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
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const [undoStack, setUndoStack] = useState<string[]>([]);
	const [undoIndex, setUndoIndex] = useState(-1);
	const [isFolded, setIsFolded] = useState<Record<string, boolean>>({});
	const [showEmmetHelp, setShowEmmetHelp] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const editorRef = useRef<HTMLDivElement>(null);

	// ─── Update line numbers ──────────────────────────────────────────────
	useEffect(() => {
		const lines = htmlCode.split("\n").length;
		setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
	}, [htmlCode]);

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
				const searchInput = document.getElementById("search-input");
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

		// ─── Emmet ───────────────────────────────────────────────────────────
		if (e.key === "Tab" && !e.shiftKey) {
			const cursorPos = textareaRef.current?.selectionStart || 0;
			const textBefore = htmlCode.substring(0, cursorPos);
			const lastWord = textBefore.split(/[\s\n]/).pop() || "";

			if (lastWord in EMMET_ABBREVIATIONS) {
				e.preventDefault();
				expandEmmet(lastWord);
				return;
			}
		}

		// ─── Suggestion handling ────────────────────────────────────────────
		if (showSuggestions && suggestions.length > 0) {
			if (e.key === "Enter" || e.key === "Tab") {
				e.preventDefault();
				insertSuggestion(suggestions[0].tag);
				return;
			}
			if (e.key === "Escape") {
				setShowSuggestions(false);
				return;
			}
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				// Keyboard navigation for suggestions
				return;
			}
		}

		// ─── Auto-indent on Enter ───────────────────────────────────────────
		if (e.key === "Enter") {
			const cursorPos = textareaRef.current?.selectionStart || 0;
			const textBefore = htmlCode.substring(0, cursorPos);
			const currentLine = textBefore.split("\n").pop() || "";
			const indent = currentLine.match(/^\s*/)?.[0] || "";

			// ─── Detect if we're inside a tag ─────────────────────────────────
			const isInsideTag =
				currentLine.includes("<") && !currentLine.includes("</");
			const extraIndent = currentLine.endsWith("<") || isInsideTag ? "  " : "";

			e.preventDefault();
			const newText =
				htmlCode.slice(0, cursorPos) +
				"\n" +
				indent +
				extraIndent +
				htmlCode.slice(cursorPos);
			setHtmlCode(newText);
			setCursorPosition(cursorPos + indent.length + extraIndent.length + 1);

			// ─── Push to undo stack ──────────────────────────────────────────
			pushToUndo(newText);

			// ─── Mark as dirty ──────────────────────────────────────────────
			if (!isDirty) setIsDirty(true);
		}

		// ─── Auto-close tags ───────────────────────────────────────────────
		if (e.key === ">" && !e.shiftKey) {
			const cursorPos = textareaRef.current?.selectionStart || 0;
			const textBefore = htmlCode.substring(0, cursorPos);

			const match = textBefore.match(/<(\w+)(?:\s[^>]*)?>$/);
			if (match) {
				const tagName = match[1];
				const textAfter = htmlCode.substring(cursorPos);
				const selfClosingTags = [
					"img",
					"input",
					"br",
					"hr",
					"link",
					"meta",
					"embed",
					"source",
					"track",
					"wbr",
				];

				if (
					!selfClosingTags.includes(tagName) &&
					!textAfter.includes(`</${tagName}>`)
				) {
					e.preventDefault();
					const newText =
						htmlCode.slice(0, cursorPos) +
						`</${tagName}>` +
						htmlCode.slice(cursorPos);
					setHtmlCode(newText);

					// ─── Push to undo stack ──────────────────────────────────────
					pushToUndo(newText);

					if (!isDirty) setIsDirty(true);

					// ─── Move cursor back to between tags ────────────────────────
					setTimeout(() => {
						if (textareaRef.current) {
							textareaRef.current.setSelectionRange(cursorPos, cursorPos);
							textareaRef.current.focus();
						}
					}, 10);
					return;
				}
			}
		}

		// ─── Tag rename (double-click) ─────────────────────────────────────
		if (e.key === "F2" && selectedTag) {
			e.preventDefault();
			renameTag(selectedTag);
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
			setHtmlCode(undoStack[newIndex]);
			setUndoIndex(newIndex);
			setIsDirty(true);
		}
	};

	const redo = () => {
		if (undoIndex < undoStack.length - 1) {
			const newIndex = undoIndex + 1;
			setHtmlCode(undoStack[newIndex]);
			setUndoIndex(newIndex);
			setIsDirty(true);
		}
	};

	// ─── Format Document ──────────────────────────────────────────────────
	const formatDocument = () => {
		try {
			const formatted = htmlCode;
			let indentLevel = 0;
			const indentChar = "  ";
			let result = "";

			const lines = htmlCode.split("\n").filter((l) => l.trim());

			for (const line of lines) {
				const trimmed = line.trim();

				// ─── Decrease indent for closing tags ──────────────────────────
				if (trimmed.startsWith("</")) {
					indentLevel = Math.max(0, indentLevel - 1);
				}

				// ─── Add line with proper indent ──────────────────────────────
				result += indentChar.repeat(indentLevel) + trimmed + "\n";

				// ─── Increase indent for opening tags ──────────────────────────
				if (
					trimmed.startsWith("<") &&
					!trimmed.startsWith("</") &&
					!trimmed.endsWith("/>")
				) {
					indentLevel++;
				}
			}

			setHtmlCode(result.trim());
			pushToUndo(result.trim());
			setIsDirty(true);
		} catch (err) {
			console.error("Format error:", err);
		}
	};

	// ─── Emmet Expansion ─────────────────────────────────────────────────
	const expandEmmet = (abbr: string) => {
		const expanded = EMMET_ABBREVIATIONS[abbr];
		if (!expanded) return;

		const cursorPos = textareaRef.current?.selectionStart || 0;
		const textBefore = htmlCode.substring(0, cursorPos);
		const textAfter = htmlCode.substring(cursorPos);
		const beforeAbbr = textBefore.substring(0, textBefore.length - abbr.length);

		const newText = beforeAbbr + expanded + textAfter;
		setHtmlCode(newText);
		pushToUndo(newText);
		setIsDirty(true);
		setShowEmmetHelp(false);
	};

	// ─── Rename Tag ──────────────────────────────────────────────────────
	const renameTag = (oldTag: string) => {
		const newTag = prompt(`Rename tag "${oldTag}" to:`, oldTag);
		if (!newTag || newTag === oldTag) return;

		const regex = new RegExp(`<${oldTag}([\\s>])|</${oldTag}>`, "g");
		const newHtml = htmlCode.replace(regex, (match, p1) => {
			if (p1) return `<${newTag}${p1}`;
			return `</${newTag}>`;
		});

		setHtmlCode(newHtml);
		pushToUndo(newHtml);
		setIsDirty(true);
		setSelectedTag(null);
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
			const start = htmlCode.indexOf(query, index);
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
		setHtmlCode(value);
		pushToUndo(value);

		if (!isDirty) setIsDirty(true);

		// ─── Autocomplete Logic ────────────────────────────────────────────
		const cursorPos = e.target.selectionStart;
		setCursorPosition(cursorPos);

		const textBefore = value.substring(0, cursorPos);
		const lastWord = textBefore.split(/[\s\n<]/).pop() || "";
		const isTag = textBefore.endsWith("<");

		if (isTag) {
			setSuggestions(HTML_TAGS.map((tag) => ({ tag, type: "tag" as const })));
			setShowSuggestions(true);
		} else if (
			lastWord.length > 0 &&
			(lastWord.startsWith("<") || textBefore.includes("<"))
		) {
			const cleanWord = lastWord.replace("<", "");
			const matchingTags = HTML_TAGS.filter((tag) =>
				tag.startsWith(cleanWord),
			).map((tag) => ({ tag, type: "tag" as const }));

			if (matchingTags.length > 0) {
				setSuggestions(matchingTags);
				setShowSuggestions(true);
			} else {
				setShowSuggestions(false);
			}
		} else if (lastWord.length > 0 && textBefore.includes(" ")) {
			const lastTag = textBefore.match(/<(\w+)(?:\s|>)/);
			if (lastTag) {
				const matchingAttrs = HTML_ATTRIBUTES.filter((attr) =>
					attr.startsWith(lastWord),
				).map((attr) => ({ tag: attr, type: "attribute" as const }));

				if (matchingAttrs.length > 0) {
					setSuggestions(matchingAttrs);
					setShowSuggestions(true);
				} else {
					setShowSuggestions(false);
				}
			}
		} else {
			setShowSuggestions(false);
		}
	};

	// ─── Insert Suggestion ──────────────────────────────────────────────
	const insertSuggestion = (suggestion: string) => {
		if (!textareaRef.current) return;

		const textBefore = htmlCode.substring(0, cursorPosition);
		const textAfter = htmlCode.substring(cursorPosition);

		const lastSpace = textBefore.lastIndexOf(" ");
		const lastBracket = textBefore.lastIndexOf("<");
		const start = Math.max(lastSpace, lastBracket) + 1;

		const newText = textBefore.substring(0, start) + suggestion + textAfter;
		setHtmlCode(newText);
		pushToUndo(newText);
		setShowSuggestions(false);

		if (!isDirty) setIsDirty(true);

		const newPos = start + suggestion.length;
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				textareaRef.current.setSelectionRange(newPos, newPos);
			}
		}, 10);
	};

	// ─── Handle Media Insert ─────────────────────────────────────────────
	const handleInsertMedia = (url: string, name: string) => {
		const isVideo =
			/\.(mp4|webm|mov|gif)$/i.test(url) ||
			url.includes("youtube") ||
			url.includes("vimeo");

		let mediaTag = "";
		if (isVideo) {
			mediaTag = `<video controls muted loop playsinline>\n  <source src="${url}" type="video/mp4" />\n  Your browser does not support the video tag.\n</video>`;
		} else {
			mediaTag = `<img src="${url}" alt="${name}" loading="lazy" />`;
		}

		const cursorPos = textareaRef.current?.selectionStart || htmlCode.length;
		const newText =
			htmlCode.slice(0, cursorPos) +
			"\n\n<!-- Media: " +
			name +
			" -->\n" +
			mediaTag +
			htmlCode.slice(cursorPos);
		setHtmlCode(newText);
		pushToUndo(newText);
		setIsDirty(true);
	};

	return (
		<div className="relative" ref={editorRef}>
			{/* ─── Editor Toolbar ────────────────────────────────────────────── */}
			<div className="flex items-center justify-between gap-2 p-1.5 bg-zinc-950/40 border border-white/5 rounded-t-xl">
				<div className="flex items-center gap-1">
					<span className="text-[10px] font-bold text-zinc-500 px-2">HTML</span>

					{/* ─── Font Size ────────────────────────────────────────────── */}
					<button
						onClick={() => setFontSize(Math.max(10, fontSize - 2))}
						className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
						title="Decrease font size"
					>
						<Minus className="h-3 w-3" />
					</button>
					<span className="text-[10px] text-zinc-500 w-6 text-center">
						{fontSize}
					</span>
					<button
						onClick={() => setFontSize(Math.min(24, fontSize + 2))}
						className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
						title="Increase font size"
					>
						<Plus className="h-3 w-3" />
					</button>

					<div className="w-px h-4 bg-white/5 mx-1" />

					{/* ─── Word Wrap ────────────────────────────────────────────── */}
					<button
						onClick={() => setWordWrap(!wordWrap)}
						className={`p-1 rounded transition-colors ${wordWrap ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}
						title="Toggle word wrap"
					>
						<AlignJustify className="h-3.5 w-3.5" />
					</button>

					{/* ─── Line Numbers ──────────────────────────────────────────── */}
					<button
						onClick={() => setShowLineNumbers(!showLineNumbers)}
						className={`p-1 rounded transition-colors ${showLineNumbers ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}
						title="Toggle line numbers"
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
						title="Search (Ctrl+F)"
					>
						<Search className="h-3.5 w-3.5" />
					</button>

					{/* ─── Emmet Help ────────────────────────────────────────────── */}
					<button
						onClick={() => setShowEmmetHelp(!showEmmetHelp)}
						className={`p-1 rounded transition-colors ${showEmmetHelp ? "text-emerald-400" : "text-zinc-500 hover:text-white"}`}
						title="Emmet abbreviations"
					>
						<Code2 className="h-3.5 w-3.5" />
					</button>
				</div>

				<div className="flex items-center gap-2">
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
						id="search-input"
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

			{/* ─── Emmet Help ────────────────────────────────────────────────── */}
			{showEmmetHelp && (
				<div className="p-2 bg-black border-x border-white/5 text-[10px] text-zinc-400 flex flex-wrap gap-3">
					<span className="font-bold text-zinc-300">Emmet:</span>
					{Object.keys(EMMET_ABBREVIATIONS).map((key) => (
						<span key={key} className="bg-white/5 px-1.5 py-0.5 rounded">
							<kbd className="text-emerald-400">{key}</kbd>
							<span className="text-zinc-600"> → </span>
							<span className="text-zinc-500">
								{EMMET_ABBREVIATIONS[key].slice(0, 30)}...
							</span>
						</span>
					))}
					<span className="text-zinc-500">
						Press <kbd className="text-white">Tab</kbd> to expand
					</span>
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
											(cursorPosition / htmlCode.length) * lineNumbers.length,
										) +
											1
											? "text-emerald-400"
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
							value={htmlCode}
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
							placeholder="<!-- Write your HTML here -->"
						/>

						{/* ─── Media Context Menu ──────────────────────────────────── */}
						<MediaContextMenu
							targetRef={textareaRef}
							onInsert={handleInsertMedia}
						/>
					</div>
				</div>

				{/* ─── Autocomplete Suggestions ────────────────────────────────── */}
				{showSuggestions && suggestions.length > 0 && (
					<div className="absolute bottom-full left-0 mb-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-[200px] overflow-y-auto min-w-[200px] z-20">
						{suggestions.map((suggestion, index) => (
							<button
								key={index}
								onClick={() => insertSuggestion(suggestion.tag)}
								className="w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/5 transition-colors flex items-center gap-2"
							>
								<span
									className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
										suggestion.type === "tag"
											? "bg-emerald-500/20 text-emerald-400"
											: "bg-purple-500/20 text-purple-400"
									}`}
								>
									{suggestion.type}
								</span>
								<span className="font-mono">{suggestion.tag}</span>
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
				<span>
					💡 Type <span className="text-zinc-400">&lt;</span> for tag
					suggestions
				</span>
				<span>•</span>
				<span>
					Auto-closes tags with <span className="text-zinc-400">&gt;</span>
				</span>
				<span>•</span>
				<span className="text-zinc-600">{htmlCode.length} chars</span>
				<span>•</span>
				<span className="text-zinc-600">
					{htmlCode.split(/\n/).filter((l) => l.trim()).length} lines
				</span>
				<span>•</span>
				<span className={`${isDirty ? "text-amber-400" : "text-emerald-400"}`}>
					{isDirty ? "● Unsaved" : "✓ Saved"}
				</span>
				<span>•</span>
				<span className="text-zinc-600">
					Undo: {undoIndex + 1}/{undoStack.length}
				</span>
			</div>
		</div>
	);
}
