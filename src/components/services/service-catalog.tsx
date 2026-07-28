"use client";

import { useMemo, useState } from "react";
import { OrderSheet } from "./order-sheet";
import { ServiceCard } from "./service-card";
import { ServiceFilters } from "./service-filters";

export interface MarketplaceService {
	id: string;
	name: string;
	category: string;
	retailRate: number;
	minQuantity: number;
	maxQuantity: number;
	platform?: string; // Optional properties to mirror your clean DB mappings
	type?: string;
	description?: string;
}

interface ServiceCatalogProps {
	services: MarketplaceService[];
	categories: string[]; // Handled as fallback or initial catalog context lists
}

export function ServiceCatalog({
	services,
	categories: initialCategories,
}: ServiceCatalogProps) {
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedService, setSelectedService] =
		useState<MarketplaceService | null>(null);

	// 1. Memoize dynamic data properties safely to avoid repetitive processing
	const categories = useMemo(
		() => [
			...new Set(services.map((service) => service.category).filter(Boolean)),
		],
		[services],
	);

	// 2. Memoize catalog filtering processes
	const filteredServices = useMemo(() => {
		return services.filter((service) => {
			const matchesCategory =
				selectedCategory === "all"
					? true
					: service.category === selectedCategory;

			const matchesSearch =
				service.name.toLowerCase().includes(search.toLowerCase()) ||
				service.category.toLowerCase().includes(search.toLowerCase());

			return matchesCategory && matchesSearch;
		});
	}, [services, search, selectedCategory]);

	return (
		<>
			<section className="space-y-8">
				{/* Hero Segment */}

				{/* Dashboard Catalog Headers & Metrics Modules */}
				<div className="space-y-6">
					{/* Single Unified Filter Control Layout Bar */}
					<ServiceFilters
						search={search}
						selectedCategory={selectedCategory}
						categories={categories}
						onSearchChange={setSearch}
						onCategoryChange={setSelectedCategory}
					/>
				</div>

				{/* Dynamic Count State Indicators */}
				<div className="flex items-center justify-between">
					<p className="text-sm text-zinc-400">
						{filteredServices.length}{" "}
						{filteredServices.length === 1 ? "service" : "services"} found
					</p>
				</div>

				{/* Services Render Processing Grid Matrix */}
				{filteredServices.length > 0 ? (
					<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
						{filteredServices.map((service) => (
							<ServiceCard
								key={service.id}
								service={service}
								onOrder={() => setSelectedService(service)}
							/>
						))}
					</div>
				) : (
					<div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
						<h3 className="text-lg font-semibold text-white">
							No services found
						</h3>
						<p className="mt-2 text-zinc-400">
							Try another category or search term.
						</p>
					</div>
				)}
			</section>

			{/* Target Interaction Capture Slider Drawer Sheet */}
			<OrderSheet
				service={selectedService}
				open={!!selectedService}
				onClose={() => setSelectedService(null)}
			/>
		</>
	);
}
