"use client";

import React, {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import { BACKGROUND_PATTERNS } from "@/components/templates/builder/design/BackgroundPatternSelector";
import { COLOR_PALETTES } from "@/components/templates/builder/design/ColorPaletteSelector";
import { FONT_PAIRS } from "@/components/templates/builder/design/FontPairSelector";
// ─── Import Data Arrays (not components) ──────────────────────────────
import { DESIGN_THEMES } from "@/components/templates/builder/design/ThemeSelector";
import {
	Template,
	type TemplateCategory,
} from "@/lib/st/types/templates-animation";

// ─── Types ──────────────────────────────────────────────────────────────
export type DeviceView = "desktop" | "tablet" | "mobile";
export type EditorTab = "html" | "css" | "js";
export type SidebarTab = "settings" | "design" | "components" | "presets";

export interface BuilderState {
	// Template Data
	name: string;
	description: string;
	category: TemplateCategory;
	htmlCode: string;
	cssCode: string;
	jsCode: string;
	previewImage: string;
	isPublished: boolean;
	isPublic: boolean;
	tags: string[];

	// Design Settings
	selectedTheme: string;
	selectedFontPair: string;
	selectedPalette: string;
	selectedPattern: string;

	// UI State
	activeTab: EditorTab;
	sidebarTab: SidebarTab;
	deviceView: DeviceView;
	showPreview: boolean;
	showThemePanel: boolean;
	fullscreenPreview: boolean;
	autoRefresh: boolean;

	// Loading/Status
	isSaving: boolean;
	isDirty: boolean;
	error: string | null;
}

export interface BuilderContextType extends BuilderState {
	// Template Actions
	setName: (value: string) => void;
	setDescription: (value: string) => void;
	setCategory: (value: TemplateCategory) => void;
	setHtmlCode: (value: string) => void;
	setCssCode: (value: string) => void;
	setJsCode: (value: string) => void;
	setPreviewImage: (value: string) => void;
	setIsPublished: (value: boolean) => void;
	setIsPublic: (value: boolean) => void;
	setTags: (value: string[]) => void;
	addTag: (tag: string) => void;
	removeTag: (tag: string) => void;

	// Design Actions
	setSelectedTheme: (value: string) => void;
	setSelectedFontPair: (value: string) => void;
	setSelectedPalette: (value: string) => void;
	setSelectedPattern: (value: string) => void;

	// UI Actions
	setActiveTab: (value: EditorTab) => void;
	setSidebarTab: (value: SidebarTab) => void;
	setDeviceView: (value: DeviceView) => void;
	setShowPreview: (value: boolean) => void;
	setShowThemePanel: (value: boolean) => void;
	setFullscreenPreview: (value: boolean) => void;
	setAutoRefresh: (value: boolean) => void;
	setIsDirty: (value: boolean) => void;
	setError: (value: string | null) => void;

	// Computed
	getFullCss: () => string;
	getFullHtml: () => string;
	resetState: () => void;
}

// ─── Default State ─────────────────────────────────────────────────────
const defaultState: BuilderState = {
	name: "",
	description: "",
	category: "business",
	htmlCode: `<div class="container">
  <h1>Welcome to Your Template</h1>
  <p>Start editing to make it your own.</p>
  <button class="btn-primary">Get Started</button>
</div>`,
	cssCode: `.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.125rem;
  color: #666;
  margin-bottom: 2rem;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}`,
	jsCode: `console.log('Template ready!');`,
	previewImage: "",
	isPublished: false,
	isPublic: false,
	tags: [],
	selectedTheme: "glassmorphism",
	selectedFontPair: "inter",
	selectedPalette: "emerald",
	selectedPattern: "none",
	activeTab: "html",
	sidebarTab: "settings",
	deviceView: "desktop",
	showPreview: true,
	showThemePanel: false,
	fullscreenPreview: false,
	autoRefresh: true,
	isSaving: false,
	isDirty: false,
	error: null,
};

// ─── Context ────────────────────────────────────────────────────────────
const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<BuilderState>(defaultState);

	// ─── Template Actions ──────────────────────────────────────────────
	const setName = useCallback((value: string) => {
		setState((prev) => ({ ...prev, name: value, isDirty: true }));
	}, []);

	const setDescription = useCallback((value: string) => {
		setState((prev) => ({ ...prev, description: value, isDirty: true }));
	}, []);

	const setCategory = useCallback((value: TemplateCategory) => {
		setState((prev) => ({ ...prev, category: value, isDirty: true }));
	}, []);

	const setHtmlCode = useCallback((value: string) => {
		setState((prev) => ({ ...prev, htmlCode: value, isDirty: true }));
	}, []);

	const setCssCode = useCallback((value: string) => {
		setState((prev) => ({ ...prev, cssCode: value, isDirty: true }));
	}, []);

	const setJsCode = useCallback((value: string) => {
		setState((prev) => ({ ...prev, jsCode: value, isDirty: true }));
	}, []);

	const setPreviewImage = useCallback((value: string) => {
		setState((prev) => ({ ...prev, previewImage: value, isDirty: true }));
	}, []);

	const setIsPublished = useCallback((value: boolean) => {
		setState((prev) => ({ ...prev, isPublished: value, isDirty: true }));
	}, []);

	const setIsPublic = useCallback((value: boolean) => {
		setState((prev) => ({ ...prev, isPublic: value, isDirty: true }));
	}, []);

	const setTags = useCallback((value: string[]) => {
		setState((prev) => ({ ...prev, tags: value, isDirty: true }));
	}, []);

	const addTag = useCallback((tag: string) => {
		if (!tag.trim()) return;
		setState((prev) => {
			if (prev.tags.includes(tag.trim())) return prev;
			return { ...prev, tags: [...prev.tags, tag.trim()], isDirty: true };
		});
	}, []);

	const removeTag = useCallback((tag: string) => {
		setState((prev) => ({
			...prev,
			tags: prev.tags.filter((t) => t !== tag),
			isDirty: true,
		}));
	}, []);

	// ─── Design Actions ─────────────────────────────────────────────────
	const setSelectedTheme = useCallback((value: string) => {
		setState((prev) => ({ ...prev, selectedTheme: value, isDirty: true }));
	}, []);

	const setSelectedFontPair = useCallback((value: string) => {
		setState((prev) => ({ ...prev, selectedFontPair: value, isDirty: true }));
	}, []);

	const setSelectedPalette = useCallback((value: string) => {
		setState((prev) => ({ ...prev, selectedPalette: value, isDirty: true }));
	}, []);

	const setSelectedPattern = useCallback((value: string) => {
		setState((prev) => ({ ...prev, selectedPattern: value, isDirty: true }));
	}, []);

	// ─── UI Actions ─────────────────────────────────────────────────────
	const setActiveTab = useCallback((value: EditorTab) => {
		setState((prev) => ({ ...prev, activeTab: value }));
	}, []);

	const setSidebarTab = useCallback((value: SidebarTab) => {
		setState((prev) => ({ ...prev, sidebarTab: value }));
	}, []);

	const setDeviceView = useCallback((value: DeviceView) => {
		setState((prev) => ({ ...prev, deviceView: value }));
	}, []);

	const setShowPreview = useCallback((value: boolean) => {
		setState((prev) => ({ ...prev, showPreview: value }));
	}, []);

	const setShowThemePanel = useCallback((value: boolean) => {
		setState((prev) => ({ ...prev, showThemePanel: value }));
	}, []);

	const setFullscreenPreview = useCallback((value: boolean) => {
		setState((prev) => ({ ...prev, fullscreenPreview: value }));
	}, []);

	const setAutoRefresh = useCallback((value: boolean) => {
		setState((prev) => ({ ...prev, autoRefresh: value }));
	}, []);

	const setIsDirty = useCallback((value: boolean) => {
		setState((prev) => ({ ...prev, isDirty: value }));
	}, []);

	const setError = useCallback((value: string | null) => {
		setState((prev) => ({ ...prev, error: value }));
	}, []);

	// ─── Computed ───────────────────────────────────────────────────────
	const getFullCss = useCallback(() => {
		const theme = DESIGN_THEMES.find((t) => t.id === state.selectedTheme);
		const palette = COLOR_PALETTES.find((p) => p.id === state.selectedPalette);
		const fontPair = FONT_PAIRS.find((f) => f.id === state.selectedFontPair);
		const pattern = BACKGROUND_PATTERNS.find(
			(p) => p.id === state.selectedPattern,
		);

		let css = state.cssCode;

		// ─── Inject theme styles ──────────────────────────────────────
		if (theme) {
			const themeCss = Object.entries(theme.css)
				.map(([key, value]) => `${key}: ${value};`)
				.join(" ");
			css = `.theme-wrapper { ${themeCss} }\n` + css;
		}

		// ─── Inject font ──────────────────────────────────────────────
		if (fontPair) {
			css =
				`/* Font: ${fontPair.name} */\n@import url('${fontPair.url}');\n\n* { font-family: '${fontPair.body}', system-ui, -apple-system, sans-serif; }\nh1, h2, h3, h4, h5, h6 { font-family: '${fontPair.heading}', serif; }\n\n` +
				css;
		}

		// ─── Inject palette ────────────────────────────────────────────
		if (palette) {
			css =
				`:root {\n  --primary: ${palette.primary};\n  --secondary: ${palette.secondary};\n  --accent: ${palette.accent};\n}\n\n` +
				css;
		}

		// ─── Inject pattern ────────────────────────────────────────────
		if (pattern && pattern.css) {
			css = `.pattern-bg { ${pattern.css} }\n` + css;
		}

		return css;
	}, [
		state.cssCode,
		state.selectedTheme,
		state.selectedFontPair,
		state.selectedPalette,
		state.selectedPattern,
	]);
	const getFullHtml = useCallback(() => {
		const fullCss = getFullCss();
		return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.name || "Template"}</title>
  <style>${fullCss}</style>
</head>
<body>
  <div class="theme-wrapper pattern-bg">
    ${state.htmlCode}
  </div>
  <script>${state.jsCode}</script>
</body>
</html>`;
	}, [state.name, state.htmlCode, state.jsCode, getFullCss]);

	const resetState = useCallback(() => {
		setState(defaultState);
	}, []);

	const value: BuilderContextType = {
		...state,
		setName,
		setDescription,
		setCategory,
		setHtmlCode,
		setCssCode,
		setJsCode,
		setPreviewImage,
		setIsPublished,
		setIsPublic,
		setTags,
		addTag,
		removeTag,
		setSelectedTheme,
		setSelectedFontPair,
		setSelectedPalette,
		setSelectedPattern,
		setActiveTab,
		setSidebarTab,
		setDeviceView,
		setShowPreview,
		setShowThemePanel,
		setFullscreenPreview,
		setAutoRefresh,
		setIsDirty,
		setError,
		getFullCss,
		getFullHtml,
		resetState,
	};

	return (
		<BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
	);
}

// ─── Hook ──────────────────────────────────────────────────────────────
export function useBuilder() {
	const context = useContext(BuilderContext);
	if (!context) {
		throw new Error("useBuilder must be used within a BuilderProvider");
	}
	return context;
}
