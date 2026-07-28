"use client";

import React from "react";
import { TEMPLATE_CATEGORIES } from "@/lib/st/types/templates-animation";
import { useBuilder } from "../core/BuilderProvider";

// ─── Group Categories ──────────────────────────────────────────────────
const CATEGORY_GROUPS = [
	{
		label: "Business",
		items: [
			"business",
			"corporate",
			"startup",
			"saas",
			"agency",
			"consulting",
			"lawfirm",
			"accounting",
			"insurance",
			"construction",
			"logistics",
			"manufacturing",
		],
	},
	{
		label: "E-commerce",
		items: [
			"ecommerce",
			"fashion",
			"electronics",
			"grocery",
			"pharmacy",
			"furniture",
			"jewelry",
			"beauty",
			"marketplace",
			"digitalproducts",
		],
	},
	{
		label: "Portfolio",
		items: [
			"portfolio",
			"designer",
			"photographer",
			"videographer",
			"artist",
			"musician",
			"architect",
			"developer",
			"resume",
		],
	},
	{
		label: "Restaurant & Hospitality",
		items: [
			"restaurant",
			"fastfood",
			"coffee",
			"bakery",
			"hotel",
			"resort",
			"airbnb",
			"eventvenue",
			"catering",
		],
	},
	{
		label: "Healthcare",
		items: [
			"healthcare",
			"hospital",
			"clinic",
			"dentist",
			"veterinary",
			"therapist",
			"fitness",
			"gym",
			"yoga",
		],
	},
	{
		label: "Education",
		items: [
			"education",
			"school",
			"university",
			"onlinecourse",
			"lms",
			"coaching",
			"tutoring",
			"training",
		],
	},
	{
		label: "Real Estate",
		items: [
			"realestate",
			"realtor",
			"propertymanagement",
			"rental",
			"constructionprojects",
		],
	},
	{
		label: "Finance",
		items: [
			"finance",
			"banking",
			"investment",
			"fintech",
			"crypto",
			"loans",
			"tax",
		],
	},
	{
		label: "Travel",
		items: [
			"travel",
			"travelagency",
			"tourbooking",
			"visa",
			"airline",
			"carrental",
			"cruise",
		],
	},
	{
		label: "Entertainment",
		items: [
			"entertainment",
			"streaming",
			"music",
			"podcast",
			"gaming",
			"moviereviews",
			"eventtickets",
		],
	},
	{
		label: "Core",
		items: [
			"website",
			"link-in-bio",
			"social",
			"email",
			"landing",
			"dashboard",
			"blog",
			"booking",
			"ai",
			"mobileapp",
			"presentation",
			"document",
			"marketing",
			"cms",
			"industry",
			"internal",
			"authentication",
			"web3",
			"nonprofit",
			"church",
			"mosque",
			"community",
			"fundraising",
		],
	},
];

export function CategoryDropdown() {
	const { category, setCategory } = useBuilder();

	return (
		<div className="space-y-1.5">
			<label className="text-xs text-zinc-400">Category</label>
			<select
				value={category}
				onChange={(e) => setCategory(e.target.value as any)}
				className="w-full bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500/30 focus:outline-none transition-colors capitalize"
			>
				{CATEGORY_GROUPS.map((group) => (
					<optgroup
						key={group.label}
						label={group.label}
						className="text-zinc-400"
					>
						{group.items.map((cat) => (
							<option key={cat} value={cat} className="capitalize">
								{cat.replace(/([A-Z])/g, " $1").trim()}
							</option>
						))}
					</optgroup>
				))}
			</select>
		</div>
	);
}
