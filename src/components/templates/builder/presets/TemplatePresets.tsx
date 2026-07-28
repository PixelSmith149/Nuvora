"use client";

import { AlertCircle, Check, Search, Sparkles, X } from "lucide-react";
import React, { useState } from "react";
import { useBuilder } from "../core/BuilderProvider";
import { PresetCard } from "./PresetCard";
import { PresetCategoryFilter } from "./PresetCategoryFilter";

// ─── Template Presets Data ─────────────────────────────────────────────
const TEMPLATE_PRESETS = [
	// ─── Business ─────────────────────────────────────────────────────────
	{
		id: "business-minimal",
		name: "Business Minimal",
		category: "business",
		description: "Clean, modern business website",
		preview: "🏢",
		tags: ["business", "minimal", "corporate"],
		html: `<section class="hero">
  <h1>Welcome to Our Company</h1>
  <p>We deliver excellence in everything we do</p>
  <button class="btn-primary">Get Started</button>
</section>
<section class="features">
  <div class="feature">
    <h3>Innovation</h3>
    <p>Cutting-edge solutions for modern challenges</p>
  </div>
  <div class="feature">
    <h3>Reliability</h3>
    <p>Trusted by thousands of businesses</p>
  </div>
  <div class="feature">
    <h3>Growth</h3>
    <p>Helping you scale your business</p>
  </div>
</section>`,
		css: `.hero { text-align: center; padding: 80px 20px; }
.hero h1 { font-size: 3rem; }
.features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 40px 20px; }
.feature { text-align: center; padding: 24px; background: #f8f9fa; border-radius: 12px; }`,
	},
	{
		id: "business-glass",
		name: "Business Glass",
		category: "business",
		description: "Glassmorphism business website",
		preview: "✨",
		tags: ["business", "glass", "premium"],
		html: `<section class="hero-glass">
  <h1>Elevate Your Brand</h1>
  <p>Premium solutions for forward-thinking businesses</p>
  <button class="btn-glass">Get Started</button>
</section>`,
		css: `.hero-glass { text-align: center; padding: 80px 20px; background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); }
.btn-glass { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); padding: 12px 32px; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; }`,
	},

	// ─── E-commerce ──────────────────────────────────────────────────────
	{
		id: "ecommerce-modern",
		name: "Modern Shop",
		category: "ecommerce",
		description: "Contemporary e-commerce store",
		preview: "🛍️",
		tags: ["ecommerce", "modern", "shop"],
		html: `<header class="shop-header">
  <h1>Premium Store</h1>
  <nav>
    <a href="#">Products</a>
    <a href="#">Cart</a>
    <a href="#">Account</a>
  </nav>
</header>
<section class="products">
  <div class="product">
    <div class="product-image">📦</div>
    <h4>Product Name</h4>
    <div class="price">$49.99</div>
    <button>Add to Cart</button>
  </div>
  <div class="product">
    <div class="product-image">📦</div>
    <h4>Product Name</h4>
    <div class="price">$49.99</div>
    <button>Add to Cart</button>
  </div>
  <div class="product">
    <div class="product-image">📦</div>
    <h4>Product Name</h4>
    <div class="price">$49.99</div>
    <button>Add to Cart</button>
  </div>
</section>`,
		css: `.shop-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #eee; }
.products { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px; padding: 40px 20px; }
.product { text-align: center; padding: 16px; border: 1px solid #eee; border-radius: 12px; }
.product-image { font-size: 4rem; margin-bottom: 12px; }
.price { font-size: 1.25rem; font-weight: bold; margin: 8px 0; }`,
	},

	// ─── Portfolio ──────────────────────────────────────────────────────
	{
		id: "portfolio-creative",
		name: "Creative Portfolio",
		category: "portfolio",
		description: "Showcase your work beautifully",
		preview: "🎨",
		tags: ["portfolio", "creative", "design"],
		html: `<section class="hero-portfolio">
  <h1>I Create Amazing Things</h1>
  <p>Design • Development • Innovation</p>
</section>
<section class="work-grid">
  <div class="work-item">Project 1</div>
  <div class="work-item">Project 2</div>
  <div class="work-item">Project 3</div>
  <div class="work-item">Project 4</div>
</section>`,
		css: `.hero-portfolio { text-align: center; padding: 80px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.work-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 40px 20px; }
.work-item { aspect-ratio: 1; background: #f0f0f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 600; }`,
	},

	// ─── Restaurant ──────────────────────────────────────────────────────
	{
		id: "restaurant-elegant",
		name: "Elegant Restaurant",
		category: "restaurant",
		description: "Fine dining website",
		preview: "🍽️",
		tags: ["restaurant", "elegant", "dining"],
		html: `<section class="hero-restaurant">
  <h1>La Maison</h1>
  <p>Fine Dining • Exquisite Cuisine</p>
  <button>Reserve a Table</button>
</section>
<section class="menu-preview">
  <h2>Our Menu</h2>
  <div class="menu-items">
    <div class="menu-item">🍣 Sushi • $28</div>
    <div class="menu-item">🥩 Steak • $45</div>
    <div class="menu-item">🍝 Pasta • $22</div>
  </div>
</section>`,
		css: `.hero-restaurant { text-align: center; padding: 100px 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; }
.menu-preview { padding: 40px 20px; text-align: center; }
.menu-items { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
.menu-item { padding: 12px 24px; background: #f8f9fa; border-radius: 8px; }`,
	},

	// ─── Healthcare ──────────────────────────────────────────────────────
	{
		id: "healthcare-caring",
		name: "Caring Healthcare",
		category: "healthcare",
		description: "Trustworthy medical practice",
		preview: "🏥",
		tags: ["healthcare", "medical", "caring"],
		html: `<section class="hero-health">
  <h1>Your Health Matters</h1>
  <p>Compassionate care for you and your family</p>
  <button>Book Appointment</button>
</section>
<section class="services">
  <div class="service">🩺 General Practice</div>
  <div class="service">❤️ Cardiology</div>
  <div class="service">🧠 Neurology</div>
</section>`,
		css: `.hero-health { text-align: center; padding: 80px 20px; background: linear-gradient(135deg, #0c3483 0%, #a2b6df 100%); color: white; }
.services { display: flex; justify-content: center; gap: 24px; padding: 40px 20px; flex-wrap: wrap; }
.service { padding: 16px 32px; background: #f0f4ff; border-radius: 12px; font-weight: 600; }`,
	},

	// ─── AI ──────────────────────────────────────────────────────────────
	{
		id: "ai-modern",
		name: "AI Platform",
		category: "ai",
		description: "Modern AI SaaS landing page",
		preview: "🤖",
		tags: ["ai", "saas", "modern"],
		html: `<section class="hero-ai">
  <h1>AI for Everyone</h1>
  <p>Intelligent solutions powered by cutting-edge AI</p>
  <button>Start Free Trial</button>
</section>
<section class="features-ai">
  <div class="feature-ai">⚡ Lightning Fast</div>
  <div class="feature-ai">🧠 Smart Learning</div>
  <div class="feature-ai">🔒 Secure & Private</div>
</section>`,
		css: `.hero-ai { text-align: center; padding: 80px 20px; background: linear-gradient(135deg, #1a1a2e 0%, #4a00e0 100%); color: white; }
.features-ai { display: flex; justify-content: center; gap: 24px; padding: 40px 20px; flex-wrap: wrap; }
.feature-ai { padding: 16px 32px; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }`,
	},

	// ─── Education ──────────────────────────────────────────────────────
	{
		id: "education-modern",
		name: "Modern Academy",
		category: "education",
		description: "Educational platform landing",
		preview: "📚",
		tags: ["education", "learning", "academy"],
		html: `<section class="hero-edu">
  <h1>Learn Without Limits</h1>
  <p>Empowering minds through education</p>
  <button>Explore Courses</button>
</section>
<section class="courses">
  <div class="course">💻 Web Development</div>
  <div class="course">📊 Data Science</div>
  <div class="course">🎨 UI/UX Design</div>
</section>`,
		css: `.hero-edu { text-align: center; padding: 80px 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
.courses { display: flex; justify-content: center; gap: 24px; padding: 40px 20px; flex-wrap: wrap; }
.course { padding: 16px 32px; background: #f8f9fa; border-radius: 12px; font-weight: 600; }`,
	},

	// ─── Landing ─────────────────────────────────────────────────────────
	{
		id: "landing-startup",
		name: "Startup Landing",
		category: "landing",
		description: "Launch your product with style",
		preview: "🚀",
		tags: ["landing", "startup", "launch"],
		html: `<section class="hero-startup">
  <h1>Launch Your Product</h1>
  <p>Everything you need to succeed</p>
  <button>Join Waitlist</button>
</section>
<section class="benefits">
  <div class="benefit">✨ Beautiful Design</div>
  <div class="benefit">⚡ Lightning Fast</div>
  <div class="benefit">🔒 Built-in Security</div>
</section>`,
		css: `.hero-startup { text-align: center; padding: 80px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.benefits { display: flex; justify-content: center; gap: 24px; padding: 40px 20px; flex-wrap: wrap; }
.benefit { padding: 16px 32px; background: #f8f9fa; border-radius: 12px; }`,
	},
];

export function TemplatePresets() {
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [pendingPreset, setPendingPreset] = useState<
		(typeof TEMPLATE_PRESETS)[0] | null
	>(null);

	const {
		setHtmlCode,
		setCssCode,
		setJsCode,
		setName,
		setCategory,
		isDirty,
		setIsDirty,
	} = useBuilder();

	const filteredPresets = TEMPLATE_PRESETS.filter((preset) => {
		const matchesCategory =
			selectedCategory === "all" || preset.category === selectedCategory;
		const matchesSearch =
			preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			preset.tags.some((tag) => tag.includes(searchQuery.toLowerCase()));
		return matchesCategory && matchesSearch;
	});

	// ─── Apply preset WITHOUT triggering auto-save ──────────────────────
	const applyPreset = (preset: (typeof TEMPLATE_PRESETS)[0]) => {
		setName(preset.name);
		setCategory(preset.category as any);
		setHtmlCode(preset.html);
		setCssCode(preset.css);
		setJsCode(""); // Reset JS
		setIsDirty(false); // ← CRITICAL: Prevents auto-save
	};

	// ─── Handle preset selection ────────────────────────────────────────
	const handleUsePreset = (preset: (typeof TEMPLATE_PRESETS)[0]) => {
		// ─── If there are unsaved changes, show confirmation ──────────────
		if (isDirty) {
			setPendingPreset(preset);
			setShowConfirmModal(true);
			return;
		}

		// ─── No unsaved changes, apply directly ──────────────────────────
		applyPreset(preset);
	};

	// ─── Confirm preset application ──────────────────────────────────────
	const confirmApply = () => {
		if (pendingPreset) {
			applyPreset(pendingPreset);
			setPendingPreset(null);
			setShowConfirmModal(false);
		}
	};

	// ─── Cancel preset application ──────────────────────────────────────
	const cancelApply = () => {
		setPendingPreset(null);
		setShowConfirmModal(false);
	};

	return (
		<div className="space-y-4">
			{/* ─── Header ────────────────────────────────────────────────── */}
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bold text-white flex items-center gap-2">
					<Sparkles className="h-4 w-4 text-amber-400" />
					Template Presets
				</h3>
				<span className="text-[10px] text-zinc-500">
					{filteredPresets.length} presets
				</span>
			</div>

			{/* ─── Search ────────────────────────────────────────────────── */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search presets..."
					className="w-full pl-9 pr-4 py-1.5 bg-black/50 border border-white/10 text-white rounded-lg text-xs focus:border-emerald-500/30 focus:outline-none transition-colors"
				/>
			</div>

			{/* ─── Category Filter ────────────────────────────────────────── */}
			<PresetCategoryFilter
				selected={selectedCategory}
				onSelect={setSelectedCategory}
			/>

			{/* ─── Presets Grid ────────────────────────────────────────────── */}
			<div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-1">
				{filteredPresets.length === 0 ? (
					<div className="text-center py-8 text-zinc-500 text-sm">
						No presets found matching your criteria
					</div>
				) : (
					filteredPresets.map((preset) => (
						<PresetCard
							key={preset.id}
							preset={preset}
							onUse={() => handleUsePreset(preset)}
							isDirty={isDirty}
						/>
					))
				)}
			</div>

			{/* ─── Confirmation Modal ────────────────────────────────────── */}
			{showConfirmModal && pendingPreset && (
				<div
					className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							cancelApply();
						}
					}}
				>
					<div
						className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6"
						onClick={(e) => e.stopPropagation()}
					>
						{/* ─── Icon ────────────────────────────────────────────── */}
						<div className="flex items-start gap-3 mb-4">
							<div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
								<AlertCircle className="h-5 w-5 text-amber-400" />
							</div>
							<div>
								<h4 className="text-sm font-bold text-white">Apply Preset?</h4>
								<p className="text-xs text-zinc-400 mt-1">
									You have unsaved changes. Applying a preset will replace your
									current work.
									<br />
									<span className="text-amber-400">
										This will NOT auto-save your current work.
									</span>
								</p>
							</div>
						</div>

						{/* ─── Preset Preview ────────────────────────────────────── */}
						<div className="mb-4 p-3 bg-black/50 border border-white/5 rounded-xl">
							<div className="flex items-center gap-2">
								<span className="text-2xl">{pendingPreset.preview}</span>
								<div>
									<p className="text-sm font-bold text-white">
										{pendingPreset.name}
									</p>
									<p className="text-[10px] text-zinc-500">
										{pendingPreset.description}
									</p>
								</div>
							</div>
						</div>

						{/* ─── Actions ────────────────────────────────────────────── */}
						<div className="flex items-center gap-3">
							<button
								onClick={cancelApply}
								className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
							>
								<X className="h-4 w-4 inline mr-1" />
								Cancel
							</button>
							<button
								onClick={confirmApply}
								className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-colors"
							>
								<Check className="h-4 w-4 inline mr-1" />
								Apply Preset
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
