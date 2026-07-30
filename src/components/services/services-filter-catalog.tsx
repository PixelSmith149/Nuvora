"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X, Layers } from "lucide-react";
import { getPlatformConfig } from "@/lib/services/platform-config";

interface Platform {
    slug: string;
    name: string;
}

interface Service {
    id: string;
    platformSlug?: string;
    platform?: string;
    category?: string;
    name?: string;
}

interface ServicesFilterCatalogProps {
    platforms: Platform[];
    services: Service[];
    categories: string[];
}

export function ServicesFilterCatalog({
    platforms,
    services,
    categories,
}: ServicesFilterCatalogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Filter platforms in real-time based on query and selected category
    const filteredPlatforms = useMemo(() => {
        return platforms.filter((platform) => {
            // Find services belonging to this platform
            const platformServices = services.filter(
                (s) =>
                    (s.platformSlug || s.platform || "").toLowerCase() ===
                    platform.slug.toLowerCase()
            );

            // Category match check
            const matchesCategory =
                selectedCategory === "all" ||
                platformServices.some(
                    (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
                );

            // Text query match check (matches platform name, slug, or contained services)
            const query = searchQuery.trim().toLowerCase();
            const matchesQuery =
                !query ||
                platform.name.toLowerCase().includes(query) ||
                platform.slug.toLowerCase().includes(query) ||
                platformServices.some(
                    (s) =>
                        s.name?.toLowerCase().includes(query) ||
                        s.category?.toLowerCase().includes(query)
                );

            return matchesCategory && matchesQuery;
        });
    }, [platforms, services, searchQuery, selectedCategory]);

    return (
        <div className="mt-8 space-y-6">
            {/* Smart Search Bar & Category Filter Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                {/* Search Input Box */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search platforms, categories, or services (e.g. TikTok, Likes, Views)..."
                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-3 pl-11 pr-10 text-sm text-white placeholder-zinc-500 transition-all focus:border-cyan-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Category Dropdown Filter */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-56">
                        <SlidersHorizontal className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 Pointer-events-none" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-zinc-800 bg-zinc-900/80 py-3 pl-10 pr-8 text-sm text-zinc-300 transition-all focus:border-cyan-500/50 focus:outline-none"
                        >
                            <option value="all">All Categories ({categories.length})</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(searchQuery || selectedCategory !== "all") && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("all");
                            }}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-xs font-semibold text-cyan-400 transition-all hover:bg-cyan-500/10 hover:border-cyan-500/30"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Filtered Grid Display */}
            {filteredPlatforms.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {filteredPlatforms.map((platform) => {
                        const config = getPlatformConfig(platform.slug);
                        const Icon = config.icon;
                        const color = config.color || "text-white";
                        const border = config.border || "";
                        const label = config.label || platform.name;

                        return (
                            <Link
                                key={platform.slug}
                                href={`/s/services/${platform.slug}`}
                                className={`rounded-3xl border border-zinc-800 bg-zinc-950 p-8 transition-all duration-300 hover:-translate-y-1 ${border}`}
                            >
                                <div className="flex items-center gap-4">
                                    {Icon ? (
                                        <Icon className={`h-8 w-8 ${color}`} />
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400">
                                            {platform.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <h2 className={`text-xl font-semibold capitalize ${color}`}>
                                        {label}
                                    </h2>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/50 py-16 text-center">
                    <Layers className="h-10 w-10 text-zinc-600 mb-3" />
                    <h3 className="text-lg font-semibold text-zinc-300">No platforms found</h3>
                    <p className="mt-1 text-sm text-zinc-500 max-w-sm">
                        Try adjusting your search query or reset the category filters.
                    </p>
                </div>
            )}
        </div>
    );
}