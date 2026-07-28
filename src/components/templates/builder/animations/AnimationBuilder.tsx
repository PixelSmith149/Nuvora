"use client";

import {
	AlertCircle,
	AlignCenter,
	ArrowDown,
	ArrowLeft,
	ArrowLeft as ArrowLeftIcon,
	ArrowRight as ArrowRightIcon,
	ArrowUp,
	Box,
	Check,
	ChevronDown,
	ChevronUp,
	Clock,
	Cloud,
	Code,
	Copy,
	Droplet,
	Droplets,
	Eye,
	Flame,
	FlipHorizontal,
	FlipVertical,
	Grid,
	Heart,
	Layers,
	Loader2,
	Maximize,
	Minimize,
	Moon,
	Move,
	MoveHorizontal,
	MoveVertical,
	Palette,
	Pause,
	Play,
	Plus,
	RefreshCw,
	RotateCw,
	Save,
	Sliders,
	Sparkles,
	Star,
	Sun,
	Timer,
	Type,
	Wind,
	X,
	Zap,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
	createAnimationClient,
	updateAnimationClient,
} from "@/lib/st/services/animation.client";
import { useToast } from "@/lib/use-toast";

// ─── Types ──────────────────────────────────────────────────────────────
export interface AnimationFormData {
	id?: string;
	name: string;
	description: string;
	type: "fade" | "slide" | "bounce" | "rotate" | "scale" | "custom";
	duration: number;
	delay: number;
	easing: string;
	direction: "normal" | "reverse" | "alternate";
	iterationCount: string;
	fillMode: "forwards" | "backwards" | "both" | "none";
	trigger: "load" | "scroll" | "hover" | "click";
	keyframes: Record<string, Record<string, string>>;
	isPreset?: boolean;
}

interface AnimationBuilderProps {
	initialData?: AnimationFormData;
	userId: string;
	isEditMode?: boolean;
	onSuccess?: (animation: any) => void;
	onCancel?: () => void;
}

// ─── Constants ──────────────────────────────────────────────────────────
const ANIMATION_TYPES = [
	{ id: "fade", label: "Fade", icon: Eye, description: "Opacity transitions" },
	{
		id: "slide",
		label: "Slide",
		icon: MoveHorizontal,
		description: "Movement in any direction",
	},
	{
		id: "bounce",
		label: "Bounce",
		icon: ArrowUp,
		description: "Spring-like bouncing",
	},
	{
		id: "rotate",
		label: "Rotate",
		icon: RotateCw,
		description: "Rotation effects",
	},
	{ id: "scale", label: "Scale", icon: ZoomIn, description: "Size changes" },
	{
		id: "custom",
		label: "Custom",
		icon: Sparkles,
		description: "Full control",
	},
];

const EASING_OPTIONS = [
	{ id: "linear", label: "Linear" },
	{ id: "ease-in", label: "Ease In" },
	{ id: "ease-out", label: "Ease Out" },
	{ id: "ease-in-out", label: "Ease In Out" },
	{ id: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", label: "Bounce" },
	{ id: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", label: "Smooth" },
	{ id: "cubic-bezier(0.23, 1, 0.32, 1)", label: "Elastic" },
];

const TRIGGER_OPTIONS = [
	{ id: "load", label: "On Load" },
	{ id: "scroll", label: "On Scroll" },
	{ id: "hover", label: "On Hover" },
	{ id: "click", label: "On Click" },
];

const DIRECTION_OPTIONS = [
	{ id: "normal", label: "Normal" },
	{ id: "reverse", label: "Reverse" },
	{ id: "alternate", label: "Alternate" },
];

const ITERATION_OPTIONS = [
	{ id: "1", label: "Once" },
	{ id: "2", label: "2x" },
	{ id: "3", label: "3x" },
	{ id: "infinite", label: "Infinite" },
];

const FILL_MODE_OPTIONS = [
	{ id: "forwards", label: "Forwards" },
	{ id: "backwards", label: "Backwards" },
	{ id: "both", label: "Both" },
	{ id: "none", label: "None" },
];

// ─── Presets ────────────────────────────────────────────────────────────
const ANIMATION_PRESETS: Array<{
	id: string;
	name: string;
	type: string;
	duration: number;
	easing: string;
	keyframes: Record<string, Record<string, string>>;
	description: string;
	category: "entrance" | "exit" | "attention" | "interaction";
}> = [
	// ─── Entrance ──────────────────────────────────────────────────────
	{
		id: "fade-in",
		name: "Fade In",
		type: "fade",
		duration: 400,
		easing: "ease-out",
		keyframes: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
		description: "Smooth fade from transparent",
		category: "entrance",
	},
	{
		id: "fade-up",
		name: "Fade Up",
		type: "fade",
		duration: 500,
		easing: "ease-out",
		keyframes: {
			"0%": { opacity: "0", transform: "translateY(20px)" },
			"100%": { opacity: "1", transform: "translateY(0)" },
		},
		description: "Fade in while sliding up",
		category: "entrance",
	},
	{
		id: "slide-in",
		name: "Slide In",
		type: "slide",
		duration: 500,
		easing: "ease-out",
		keyframes: {
			"0%": { transform: "translateX(40px)", opacity: "0" },
			"100%": { transform: "translateX(0)", opacity: "1" },
		},
		description: "Slide in from the right",
		category: "entrance",
	},
	{
		id: "bounce-in",
		name: "Bounce In",
		type: "bounce",
		duration: 600,
		easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
		keyframes: {
			"0%": { transform: "scale(0.5)", opacity: "0" },
			"60%": { transform: "scale(1.1)" },
			"100%": { transform: "scale(1)", opacity: "1" },
		},
		description: "Bounce in with spring effect",
		category: "entrance",
	},
	{
		id: "scale-in",
		name: "Scale In",
		type: "scale",
		duration: 400,
		easing: "ease-out",
		keyframes: {
			"0%": { transform: "scale(0.8)", opacity: "0" },
			"100%": { transform: "scale(1)", opacity: "1" },
		},
		description: "Scale up from smaller size",
		category: "entrance",
	},
	{
		id: "rotate-in",
		name: "Rotate In",
		type: "rotate",
		duration: 600,
		easing: "ease-out",
		keyframes: {
			"0%": { transform: "rotate(-15deg)", opacity: "0" },
			"100%": { transform: "rotate(0deg)", opacity: "1" },
		},
		description: "Rotate in from slight angle",
		category: "entrance",
	},
	// ─── Attention ────────────────────────────────────────────────────
	{
		id: "pulse",
		name: "Pulse",
		type: "scale",
		duration: 1000,
		easing: "ease-in-out",
		keyframes: {
			"0%": { transform: "scale(1)" },
			"50%": { transform: "scale(1.05)" },
			"100%": { transform: "scale(1)" },
		},
		description: "Gentle pulsing effect",
		category: "attention",
	},
	{
		id: "float",
		name: "Float",
		type: "slide",
		duration: 2000,
		easing: "ease-in-out",
		keyframes: {
			"0%": { transform: "translateY(0px)" },
			"50%": { transform: "translateY(-10px)" },
			"100%": { transform: "translateY(0px)" },
		},
		description: "Gentle floating motion",
		category: "attention",
	},
	{
		id: "glow",
		name: "Glow Pulse",
		type: "custom",
		duration: 1500,
		easing: "ease-in-out",
		keyframes: {
			"0%": { boxShadow: "0 0 0px rgba(16,185,129,0)" },
			"50%": { boxShadow: "0 0 30px rgba(16,185,129,0.3)" },
			"100%": { boxShadow: "0 0 0px rgba(16,185,129,0)" },
		},
		description: "Glowing pulse effect",
		category: "attention",
	},
	// ─── Exit ─────────────────────────────────────────────────────────
	{
		id: "fade-out",
		name: "Fade Out",
		type: "fade",
		duration: 400,
		easing: "ease-in",
		keyframes: { "0%": { opacity: "1" }, "100%": { opacity: "0" } },
		description: "Smooth fade to transparent",
		category: "exit",
	},
	// ─── Interaction ──────────────────────────────────────────────────
	{
		id: "flip",
		name: "Flip",
		type: "custom",
		duration: 500,
		easing: "ease-out",
		keyframes: {
			"0%": { transform: "rotateY(0deg)" },
			"100%": { transform: "rotateY(180deg)" },
		},
		description: "Flip horizontally",
		category: "interaction",
	},
	{
		id: "shake",
		name: "Shake",
		type: "custom",
		duration: 400,
		easing: "ease-in-out",
		keyframes: {
			"0%": { transform: "translateX(0)" },
			"25%": { transform: "translateX(-10px)" },
			"50%": { transform: "translateX(10px)" },
			"75%": { transform: "translateX(-5px)" },
			"100%": { transform: "translateX(0)" },
		},
		description: "Side to side shake",
		category: "interaction",
	},
];

// ─── Helper Functions ──────────────────────────────────────────────────
const generateDefaultKeyframes = (
	type: string,
): Record<string, Record<string, string>> => {
	switch (type) {
		case "fade":
			return { "0%": { opacity: "0" }, "100%": { opacity: "1" } };
		case "slide":
			return {
				"0%": { transform: "translateX(40px)", opacity: "0" },
				"100%": { transform: "translateX(0)", opacity: "1" },
			};
		case "bounce":
			return {
				"0%": { transform: "scale(0.5)", opacity: "0" },
				"60%": { transform: "scale(1.1)" },
				"100%": { transform: "scale(1)", opacity: "1" },
			};
		case "rotate":
			return {
				"0%": { transform: "rotate(-15deg)", opacity: "0" },
				"100%": { transform: "rotate(0deg)", opacity: "1" },
			};
		case "scale":
			return {
				"0%": { transform: "scale(0.8)", opacity: "0" },
				"100%": { transform: "scale(1)", opacity: "1" },
			};
		default:
			return { "0%": { opacity: "0" }, "100%": { opacity: "1" } };
	}
};

const generateKeyframeName = (name: string): string => {
	return name.toLowerCase().replace(/\s/g, "-") || "animation";
};

const generatePreviewStyle = (
	name: string,
	keyframes: Record<string, Record<string, string>>,
	duration: number,
	easing: string,
	delay: number,
	fillMode: string,
	iterationCount: string,
	direction: string,
): string => {
	const keyframeName = generateKeyframeName(name);
	const keyframeStyles = Object.entries(keyframes)
		.map(([key, value]) => {
			const props = Object.entries(value)
				.map(([prop, val]) => `${prop}: ${val};`)
				.join(" ");
			return `  ${key} { ${props} }`;
		})
		.join("\n");

	return `
@keyframes ${keyframeName} {
${keyframeStyles}
}
.preview-animation {
  animation: ${keyframeName} ${duration}ms ${easing} ${delay}ms;
  animation-fill-mode: ${fillMode};
  animation-iteration-count: ${iterationCount};
  animation-direction: ${direction};
  animation-timing-function: ${easing};
}
`;
};

// ─── Component ──────────────────────────────────────────────────────────
export function AnimationBuilder({
	initialData,
	userId,
	isEditMode = false,
	onSuccess,
	onCancel,
}: AnimationBuilderProps) {
	const router = useRouter();
	const { toast } = useToast();

	// ─── State ──────────────────────────────────────────────────────────
	const [formData, setFormData] = useState<AnimationFormData>(() => {
		if (initialData) {
			return initialData;
		}
		return {
			name: "",
			description: "",
			type: "fade",
			duration: 400,
			delay: 0,
			easing: "ease-out",
			direction: "normal",
			iterationCount: "1",
			fillMode: "forwards",
			trigger: "load",
			keyframes: generateDefaultKeyframes("fade"),
		};
	});

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [showKeyframeEditor, setShowKeyframeEditor] = useState(true);
	const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [previewSpeed, setPreviewSpeed] = useState(1);

	// ─── Update state helpers ──────────────────────────────────────────
	const updateField = useCallback(
		<K extends keyof AnimationFormData>(
			field: K,
			value: AnimationFormData[K],
		) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
		},
		[],
	);

	// ─── Generate preview style ────────────────────────────────────────
	const getPreviewStyle = useCallback(() => {
		return generatePreviewStyle(
			formData.name,
			formData.keyframes,
			formData.duration,
			formData.easing,
			formData.delay,
			formData.fillMode,
			formData.iterationCount,
			formData.direction,
		);
	}, [formData]);

	// ─── Handlers ──────────────────────────────────────────────────────
	const handleTypeChange = (newType: string) => {
		const typedType = newType as AnimationFormData["type"];
		updateField("type", typedType);
		updateField("keyframes", generateDefaultKeyframes(newType));
		setSelectedPreset(null);
	};

	const handlePresetApply = (presetId: string) => {
		const preset = ANIMATION_PRESETS.find((p) => p.id === presetId);
		if (!preset) return;

		setSelectedPreset(presetId);
		updateField("type", preset.type as AnimationFormData["type"]);
		updateField("duration", preset.duration);
		updateField("easing", preset.easing);
		updateField("keyframes", preset.keyframes);
		updateField("name", preset.name);
		updateField("description", preset.description);
	};

	const handleKeyframeChange = (key: string, prop: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			keyframes: {
				...prev.keyframes,
				[key]: {
					...prev.keyframes[key],
					[prop]: value,
				},
			},
		}));
	};

	const handleAddKeyframe = () => {
		const keys = Object.keys(formData.keyframes);
		const lastKey = keys[keys.length - 1] || "0%";
		const newKey = lastKey === "100%" ? `${parseInt(lastKey) + 50}%` : "100%";
		setFormData((prev) => ({
			...prev,
			keyframes: {
				...prev.keyframes,
				[newKey]: { opacity: "1", transform: "scale(1)" },
			},
		}));
	};

	const handleRemoveKeyframe = (key: string) => {
		if (key === "0%" || key === "100%") {
			toast({
				title: "Cannot Remove",
				description: "0% and 100% keyframes are required.",
				variant: "warning",
			});
			return;
		}
		setFormData((prev) => {
			const newKeyframes = { ...prev.keyframes };
			delete newKeyframes[key];
			return { ...prev, keyframes: newKeyframes };
		});
	};

	const handleAddProperty = (key: string) => {
		const currentProps = formData.keyframes[key] || {};
		const propName = `prop${Object.keys(currentProps).length + 1}`;
		setFormData((prev) => ({
			...prev,
			keyframes: {
				...prev.keyframes,
				[key]: {
					...currentProps,
					[propName]: "",
				},
			},
		}));
	};

	const handleRemoveProperty = (key: string, prop: string) => {
		setFormData((prev) => {
			const newProps = { ...prev.keyframes[key] };
			delete newProps[prop];
			return {
				...prev,
				keyframes: {
					...prev.keyframes,
					[key]: newProps,
				},
			};
		});
	};

	const handleCopyCSS = () => {
		navigator.clipboard.writeText(getPreviewStyle());
		setCopied(true);
		toast({
			title: "Copied!",
			description: "CSS code copied to clipboard",
			variant: "success",
		});
		setTimeout(() => setCopied(false), 2000);
	};

	const handleSave = async () => {
		if (!formData.name.trim()) {
			toast({
				title: "Validation Error",
				description: "Animation name is required",
				variant: "destructive",
			});
			return;
		}

		if (Object.keys(formData.keyframes).length < 2) {
			toast({
				title: "Validation Error",
				description: "At least 2 keyframes are required (0% and 100%)",
				variant: "destructive",
			});
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const payload = {
				name: formData.name.trim(),
				description: formData.description.trim() || null,
				type: formData.type,
				duration: formData.duration,
				delay: formData.delay,
				easing: formData.easing,
				direction: formData.direction,
				iteration_count: formData.iterationCount,
				fill_mode: formData.fillMode,
				trigger: formData.trigger,
				keyframes: formData.keyframes,
				css_code: getPreviewStyle(),
				is_preset: false,
			};

			let result;
			if (isEditMode && formData.id) {
				result = await updateAnimationClient(formData.id, userId, payload);
			} else {
				result = await createAnimationClient(userId, payload);
			}

			toast({
				title: isEditMode ? "✅ Animation Updated!" : "✅ Animation Created!",
				description: isEditMode
					? "Your animation has been updated successfully."
					: "Your animation has been saved successfully.",
				variant: "success",
			});

			if (onSuccess) {
				onSuccess(result);
			} else {
				router.push(`/social-tenant/t-a/animations/${result.id}`);
			}
		} catch (err: any) {
			setError(err.message);
			toast({
				title: "Error",
				description: err.message || "Failed to save animation",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	// ─── Keyboard Shortcuts ────────────────────────────────────────────
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				handleSave();
			}
			if (e.key === " " && e.target === document.body) {
				e.preventDefault();
				setIsPlaying(!isPlaying);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isPlaying, handleSave]);

	// ─── Auto-name from type ───────────────────────────────────────────
	useEffect(() => {
		if (!formData.name && formData.type) {
			const suggestions: Record<string, string> = {
				fade: "Fade In",
				slide: "Slide In",
				bounce: "Bounce In",
				rotate: "Rotate In",
				scale: "Scale In",
				custom: "Custom Animation",
			};
			updateField("name", suggestions[formData.type] || "");
		}
	}, [formData.type]);

	return (
		<div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
			{/* ─── Header ────────────────────────────────────────────────── */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<button
						onClick={() =>
							onCancel
								? onCancel()
								: router.push("/social-tenant/t-a/animations")
						}
						className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
					<div>
						<h1 className="text-xl font-bold text-white flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-purple-400" />
							{isEditMode ? "Edit Animation" : "Create New Animation"}
						</h1>
						<p className="text-sm text-zinc-500">
							{isEditMode
								? "Modify your animation properties"
								: "Build custom animations with a visual editor"}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<button
						onClick={handleSave}
						disabled={saving}
						className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
					>
						{saving ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						{saving
							? "Saving..."
							: isEditMode
								? "Update Animation"
								: "Create Animation"}
					</button>
				</div>
			</div>

			{/* ─── Error ────────────────────────────────────────────────────── */}
			{error && (
				<div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
					<AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
					<span>{error}</span>
				</div>
			)}

			{/* ─── Preview ────────────────────────────────────────────────── */}
			<div className="bg-zinc-950/40 border border-white/5 rounded-xl p-6 text-center">
				<div
					className="inline-block p-12 bg-purple-500/10 border border-purple-500/20 rounded-xl transition-all preview-animation"
					style={{
						animationName: isPlaying
							? generateKeyframeName(formData.name)
							: "none",
						animationDuration: isPlaying
							? `${formData.duration / previewSpeed}ms`
							: "0ms",
						animationTimingFunction: isPlaying ? formData.easing : "ease",
						animationDelay: isPlaying ? `${formData.delay}ms` : "0ms",
						animationFillMode: isPlaying ? formData.fillMode : "none",
						animationIterationCount: isPlaying ? formData.iterationCount : "1",
						animationDirection: isPlaying ? formData.direction : "normal",
					}}
				>
					<div className="text-5xl mb-3">✨</div>
					<p className="text-sm text-zinc-400">
						{formData.name || "Animation Preview"}
					</p>
					{formData.duration && (
						<p className="text-xs text-zinc-500 mt-1">
							{formData.duration}ms • {formData.easing}
						</p>
					)}
				</div>

				<div className="flex flex-wrap items-center justify-center gap-4 mt-4">
					<div className="flex items-center gap-2">
						<button
							onClick={() => setIsPlaying(!isPlaying)}
							className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
						>
							{isPlaying ? (
								<Pause className="h-4 w-4" />
							) : (
								<Play className="h-4 w-4" />
							)}
							{isPlaying ? "Pause" : "Play"}
						</button>
						<button
							onClick={() => {
								setIsPlaying(false);
								setTimeout(() => setIsPlaying(true), 50);
							}}
							className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
						>
							<RefreshCw className="h-4 w-4" />
						</button>
					</div>

					<div className="flex items-center gap-2">
						<span className="text-xs text-zinc-500">Speed:</span>
						{[0.5, 1, 2].map((speed) => (
							<button
								key={speed}
								onClick={() => setPreviewSpeed(speed)}
								className={`px-2 py-0.5 rounded text-xs transition-colors ${
									previewSpeed === speed
										? "bg-purple-500/20 text-purple-400 border border-purple-500/20"
										: "text-zinc-500 hover:text-white"
								}`}
							>
								{speed}x
							</button>
						))}
					</div>

					<button
						onClick={handleCopyCSS}
						className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs transition-colors text-zinc-400 hover:text-white"
					>
						{copied ? (
							<Check className="h-3.5 w-3.5 text-emerald-400" />
						) : (
							<Copy className="h-3.5 w-3.5" />
						)}
						{copied ? "Copied!" : "Copy CSS"}
					</button>
				</div>

				{isPlaying && (
					<style dangerouslySetInnerHTML={{ __html: getPreviewStyle() }} />
				)}
			</div>

			{/* ─── Presets ────────────────────────────────────────────────── */}
			<div className="bg-zinc-950/40 border border-white/5 rounded-xl p-4">
				<h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
					<Zap className="h-4 w-4 text-amber-400" />
					Quick Presets
				</h3>
				<div className="flex flex-wrap gap-2">
					{ANIMATION_PRESETS.map((preset) => (
						<button
							key={preset.id}
							onClick={() => handlePresetApply(preset.id)}
							className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
								selectedPreset === preset.id
									? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
									: "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
							}`}
						>
							{preset.name}
						</button>
					))}
				</div>
			</div>

			{/* ─── Form ────────────────────────────────────────────────────── */}
			<div className="bg-zinc-950/40 border border-white/5 rounded-xl p-6 space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* ─── Name ────────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-xs text-zinc-400">Name *</label>
						<input
							value={formData.name}
							onChange={(e) => updateField("name", e.target.value)}
							placeholder="My Animation"
							className="w-full bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-purple-500/30 focus:outline-none transition-colors"
						/>
					</div>

					{/* ─── Description ──────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-xs text-zinc-400">Description</label>
						<input
							value={formData.description}
							onChange={(e) => updateField("description", e.target.value)}
							placeholder="What does this animation do?"
							className="w-full bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-purple-500/30 focus:outline-none transition-colors"
						/>
					</div>

					{/* ─── Type ────────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-xs text-zinc-400">Type</label>
						<div className="flex flex-wrap gap-1.5">
							{ANIMATION_TYPES.map((t) => (
								<button
									key={t.id}
									onClick={() => handleTypeChange(t.id)}
									className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
										formData.type === t.id
											? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
											: "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
									}`}
									title={t.description}
								>
									<t.icon className="h-3 w-3" />
									{t.label}
								</button>
							))}
						</div>
					</div>

					{/* ─── Trigger ────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-xs text-zinc-400">Trigger</label>
						<div className="flex flex-wrap gap-1.5">
							{TRIGGER_OPTIONS.map((t) => (
								<button
									key={t.id}
									onClick={() => updateField("trigger", t.id as any)}
									className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
										formData.trigger === t.id
											? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
											: "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
									}`}
								>
									{t.label}
								</button>
							))}
						</div>
					</div>

					{/* ─── Duration ────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-xs text-zinc-400">Duration (ms)</label>
						<div className="flex items-center gap-3">
							<input
								type="range"
								value={formData.duration}
								onChange={(e) =>
									updateField("duration", parseInt(e.target.value))
								}
								min="100"
								max="3000"
								step="50"
								className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
							/>
							<span className="text-sm font-mono text-white w-12">
								{formData.duration}
							</span>
						</div>
					</div>

					{/* ─── Delay ────────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-xs text-zinc-400">Delay (ms)</label>
						<div className="flex items-center gap-3">
							<input
								type="range"
								value={formData.delay}
								onChange={(e) => updateField("delay", parseInt(e.target.value))}
								min="0"
								max="2000"
								step="50"
								className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
							/>
							<span className="text-sm font-mono text-white w-12">
								{formData.delay}
							</span>
						</div>
					</div>

					{/* ─── Easing ────────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-xs text-zinc-400">Easing</label>
						<div className="flex flex-wrap gap-1.5">
							{EASING_OPTIONS.map((e) => (
								<button
									key={e.id}
									onClick={() => updateField("easing", e.id)}
									className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
										formData.easing === e.id
											? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
											: "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
									}`}
								>
									{e.label}
								</button>
							))}
						</div>
					</div>

					{/* ─── Direction ────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-xs text-zinc-400">Direction</label>
						<div className="flex flex-wrap gap-1.5">
							{DIRECTION_OPTIONS.map((d) => (
								<button
									key={d.id}
									onClick={() => updateField("direction", d.id as any)}
									className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
										formData.direction === d.id
											? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
											: "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
									}`}
								>
									{d.label}
								</button>
							))}
						</div>
					</div>

					{/* ─── Iterations ────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-xs text-zinc-400">Iterations</label>
						<div className="flex flex-wrap gap-1.5">
							{ITERATION_OPTIONS.map((i) => (
								<button
									key={i.id}
									onClick={() => updateField("iterationCount", i.id)}
									className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
										formData.iterationCount === i.id
											? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
											: "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
									}`}
								>
									{i.label}
								</button>
							))}
						</div>
					</div>

					{/* ─── Fill Mode ────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-xs text-zinc-400">Fill Mode</label>
						<div className="flex flex-wrap gap-1.5">
							{FILL_MODE_OPTIONS.map((f) => (
								<button
									key={f.id}
									onClick={() => updateField("fillMode", f.id as any)}
									className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
										formData.fillMode === f.id
											? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
											: "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
									}`}
								>
									{f.label}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* ─── Keyframe Editor ────────────────────────────────────── */}
				<div className="border-t border-white/5 pt-4">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-bold text-white flex items-center gap-2">
							<Code className="h-4 w-4 text-zinc-400" />
							Keyframes
							<span className="text-[10px] text-zinc-500 font-normal">
								({Object.keys(formData.keyframes).length} frames)
							</span>
						</h3>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={handleAddKeyframe}
								className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
							>
								<Plus className="h-3 w-3" />
								Add Keyframe
							</button>
							<button
								type="button"
								onClick={() => setShowKeyframeEditor(!showKeyframeEditor)}
								className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
							>
								{showKeyframeEditor ? (
									<Minimize className="h-4 w-4" />
								) : (
									<Maximize className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					{showKeyframeEditor && (
						<div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
							{Object.entries(formData.keyframes).map(([key, props]) => (
								<div
									key={key}
									className="flex items-start gap-2 bg-black border border-white/5 rounded-xl p-3"
								>
									<input
										value={key}
										onChange={(e) => {
											const newKey = e.target.value;
											setFormData((prev) => {
												const newKeyframes = { ...prev.keyframes };
												const value = newKeyframes[key];
												delete newKeyframes[key];
												newKeyframes[newKey] = value;
												return { ...prev, keyframes: newKeyframes };
											});
										}}
										className="w-16 bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1 text-xs font-mono focus:border-purple-500/30 focus:outline-none flex-shrink-0"
										placeholder="50%"
									/>
									<div className="flex-1 flex flex-wrap gap-1.5">
										{Object.entries(props).map(([prop, val]) => (
											<div
												key={prop}
												className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1"
											>
												<input
													value={prop}
													onChange={(e) => {
														const oldProp = prop;
														const newProp = e.target.value;
														setFormData((prev) => {
															const newProps = { ...prev.keyframes[key] };
															const value = newProps[oldProp];
															delete newProps[oldProp];
															newProps[newProp] = value;
															return {
																...prev,
																keyframes: {
																	...prev.keyframes,
																	[key]: newProps,
																},
															};
														});
													}}
													className="w-16 bg-transparent border border-white/10 text-white rounded px-1.5 py-0.5 text-[10px] font-mono focus:border-purple-500/30 focus:outline-none"
													placeholder="opacity"
												/>
												<span className="text-zinc-500 text-[10px]">:</span>
												<input
													value={val}
													onChange={(e) =>
														handleKeyframeChange(key, prop, e.target.value)
													}
													className="w-20 bg-transparent border border-white/10 text-white rounded px-1.5 py-0.5 text-[10px] font-mono focus:border-purple-500/30 focus:outline-none"
													placeholder="1"
												/>
												<button
													type="button"
													onClick={() => handleRemoveProperty(key, prop)}
													className="p-0.5 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
												>
													<X className="h-3 w-3" />
												</button>
											</div>
										))}
										<button
											type="button"
											onClick={() => handleAddProperty(key)}
											className="flex items-center gap-0.5 px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-zinc-500 hover:text-white transition-colors"
										>
											<Plus className="h-2.5 w-2.5" />
											Prop
										</button>
									</div>
									<button
										type="button"
										onClick={() => handleRemoveKeyframe(key)}
										className={`p-1 rounded-lg transition-colors ${
											key === "0%" || key === "100%"
												? "text-zinc-600 cursor-not-allowed"
												: "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
										}`}
										disabled={key === "0%" || key === "100%"}
									>
										<X className="h-3.5 w-3.5" />
									</button>
								</div>
							))}
						</div>
					)}

					{/* ─── Generated CSS ────────────────────────────────────── */}
					<div className="mt-3 p-3 bg-black border border-white/5 rounded-xl">
						<div className="flex items-center justify-between">
							<p className="text-[10px] text-zinc-500 font-mono truncate flex-1">
								@keyframes {generateKeyframeName(formData.name)} {"{ "}
								{Object.entries(formData.keyframes)
									.map(
										([key, props]) =>
											`${key} { ${Object.entries(props)
												.map(([p, v]) => `${p}: ${v};`)
												.join(" ")} }`,
									)
									.join(" ")}
								{" }"}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* ─── Quick Tips ────────────────────────────────────────────── */}
			<div className="bg-zinc-950/40 border border-white/5 rounded-xl p-4">
				<div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
					<Sparkles className="h-4 w-4 text-purple-400" />
					<span>Pro Tips:</span>
					<ul className="flex flex-wrap gap-2 text-zinc-400">
						<li>• Use presets to get started quickly</li>
						<li>• Add multiple keyframes for complex animations</li>
						<li>• Test with different easing options</li>
						<li>
							• Press{" "}
							<kbd className="px-1 py-0.5 bg-white/5 rounded text-zinc-300">
								Space
							</kbd>{" "}
							to play/pause
						</li>
						<li>
							• Press{" "}
							<kbd className="px-1 py-0.5 bg-white/5 rounded text-zinc-300">
								Ctrl+S
							</kbd>{" "}
							to save
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
