"use client";

import React, { useEffect, useState } from "react";
import { TEMPLATE_CATEGORIES } from "@/lib/st/types/templates-animation";
import { useBuilder } from "../core/BuilderProvider";

// ─── Category-specific preview templates ──────────────────────────────
const CATEGORY_PREVIEWS: Record<
	string,
	{ heading: string; subheading: string; cta: string }
> = {
	business: {
		heading: "Your Business, Elevated",
		subheading: "Professional solutions for modern enterprises",
		cta: "Get Started",
	},
	ecommerce: {
		heading: "Shop Smarter",
		subheading: "Discover our curated collection",
		cta: "Browse Products",
	},
	portfolio: {
		heading: "See My Work",
		subheading: "Creative projects that tell a story",
		cta: "View Portfolio",
	},
	restaurant: {
		heading: "Experience Fine Dining",
		subheading: "Where flavor meets excellence",
		cta: "Reserve a Table",
	},
	healthcare: {
		heading: "Your Health, Our Priority",
		subheading: "Compassionate care for every patient",
		cta: "Book Appointment",
	},
	education: {
		heading: "Learn Without Limits",
		subheading: "Empowering minds through education",
		cta: "Enroll Now",
	},
	realestate: {
		heading: "Find Your Dream Home",
		subheading: "Properties that inspire",
		cta: "Browse Listings",
	},
	finance: {
		heading: "Secure Your Future",
		subheading: "Smart financial solutions for everyone",
		cta: "Start Investing",
	},
	travel: {
		heading: "Explore the World",
		subheading: "Adventure awaits around every corner",
		cta: "Plan Your Trip",
	},
	entertainment: {
		heading: "Experience the Magic",
		subheading: "Where entertainment comes alive",
		cta: "Get Tickets",
	},
	// ─── Default for all other categories ──────────────────────────────
	default: {
		heading: "Welcome to Your Template",
		subheading: "Customize this template to match your brand",
		cta: "Get Started",
	},
};

export function CategoryTemplatePreview() {
	const { category, htmlCode, setHtmlCode, name } = useBuilder();
	const [prevCategory, setPrevCategory] = useState<string | null>(null);

	// ─── Update preview content when category changes ──────────────────
	useEffect(() => {
		// Only update if category changed and user hasn't customized
		if (
			prevCategory !== category &&
			htmlCode.includes("Welcome to Your Template")
		) {
			const preview = CATEGORY_PREVIEWS[category] || CATEGORY_PREVIEWS.default;

			// Generate category-specific HTML
			const categoryHtml = `<div class="container">
  <h1>${preview.heading}</h1>
  <p>${preview.subheading}</p>
  <button class="btn-primary">${preview.cta}</button>
</div>`;

			setHtmlCode(categoryHtml);
			setPrevCategory(category);
		}
	}, [category, htmlCode, setHtmlCode, prevCategory]);

	// ─── Don't render anything; this is a logic-only component ─────────
	return null;
}
