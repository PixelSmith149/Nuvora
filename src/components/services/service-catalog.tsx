"use client";

import { useEffect, useMemo, useState } from "react";
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
	platform?: string;
	type?: string;
	description?: string;
	isAuto?: boolean;
}

interface ServiceCatalogProps {
	services: MarketplaceService[];
	categories: string[];
}

/**
 * Production-safe Fisher-Yates shuffle.
 * Does not mutate the original array.
 */
function shuffleServices<T>(items: T[]): T[] {
	const shuffled = [...items];

	for (let i = shuffled.length - 1; i > 0; i--) {
		const randomIndex = Math.floor(Math.random() * (i + 1));

		[shuffled[i], shuffled[randomIndex]] = [
			shuffled[randomIndex],
			shuffled[i],
		];
	}

	return shuffled;
}

export function ServiceCatalog({
	services,
	categories: initialCategories,
}: ServiceCatalogProps) {
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedService, setSelectedService] =
		useState<MarketplaceService | null>(null);

	/**
	 * Initial render uses server data.
	 * After hydration, randomize once.
	 */
	const [displayServices, setDisplayServices] =
		useState<MarketplaceService[]>(services);

	useEffect(() => {
		setDisplayServices(shuffleServices(services));
	}, [services]);

	/**
	 * Dynamic category generation.
	 */
	const categories = useMemo(() => {
		return [
			...new Set(
				displayServices
					.map((service) => service.category)
					.filter(Boolean)
			),
		];
	}, [displayServices]);

	/**
	 * Filtering happens AFTER shuffle.
	 * Order stays randomized but stable.
	 */
	const filteredServices = useMemo(() => {
		const query = search.trim().toLowerCase();

		return displayServices.filter((service) => {
			const matchesCategory =
				selectedCategory === "all" ||
				service.category === selectedCategory;

			const matchesSearch =
				!query ||
				service.name.toLowerCase().includes(query) ||
				service.category.toLowerCase().includes(query);

			return matchesCategory && matchesSearch;
		});
	}, [
		displayServices,
		search,
		selectedCategory,
	]);

	return (
		<>
			<section className="space-y-8">
				<div className="space-y-6">
					<ServiceFilters
						search={search}
						selectedCategory={selectedCategory}
						categories={categories}
						onSearchChange={setSearch}
						onCategoryChange={setSelectedCategory}
					/>
				</div>

				<div className="flex items-center justify-between">
					<p className="text-sm text-zinc-400">
						{filteredServices.length}{" "}
						{filteredServices.length === 1
							? "service"
							: "services"}{" "}
						found
					</p>
				</div>

				{filteredServices.length > 0 ? (
					<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
						{filteredServices.map((service) => (
							<ServiceCard
								key={service.id}
								service={service}
								onOrder={() =>
									setSelectedService(service)
								}
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

			<OrderSheet
				service={selectedService}
				open={Boolean(selectedService)}
				onClose={() => setSelectedService(null)}
			/>
		</>
	);
}