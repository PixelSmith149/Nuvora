"use client";

import { getPlatformConfig } from "@/lib/services/platform-config";
import type { MarketplaceService } from "./service-catalog";

interface ServiceCardProps {
	service: MarketplaceService;
	onOrder: () => void;
}

function formatRate(retailRate: number) {
	return `$${retailRate.toFixed(2)}`;
}

export function ServiceCard({ service, onOrder }: ServiceCardProps) {
	const platformSource =
		(service as any).platform || service.category || "generic";

	const config = getPlatformConfig(platformSource);

	const Icon = config.icon;
	const brandTextColor = config.color || "text-zinc-400";
	const brandBg = config.bg || "bg-zinc-500/10";
	const brandBorder = config.border || "hover:border-zinc-500/50";

	const description =
		(service as any).description?.trim?.() ||
		service.description?.trim?.() ||
		"";

	return (
		<article
			className={`
        group relative overflow-hidden rounded-3xl
        border border-zinc-800 bg-zinc-950
        transition-all duration-300
        hover:-translate-y-1 hover:border-zinc-700
        hover:shadow-2xl hover:shadow-black/30
        ${brandBorder}
      `}
		>
			<div
				className={`
          absolute inset-0 opacity-0 transition-opacity duration-300
          group-hover:opacity-100 ${brandBg}
        `}
			/>

			<div className="relative p-6">
				{/* Category + Icon */}
				<div className="mb-4 flex items-center justify-between gap-3">
					<div className="inline-flex max-w-[75%] truncate rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300">
						{service.category}
					</div>

					<div
						className={`shrink-0 text-xl ${brandTextColor} opacity-80 transition-opacity group-hover:opacity-100`}
					>
						<Icon className="h-5 w-5" />
					</div>
				</div>

				{/* Name */}
				<h3 className="line-clamp-2 min-h-[56px] text-lg font-semibold text-white">
					{service.name}
				</h3>

				{/* Description — single line, shrinks/truncates cleanly */}
				{description ? (
					<p
						className="
              mt-2
              block
              w-full
              overflow-hidden
              text-ellipsis
              whitespace-nowrap
              text-[13px]
              leading-5
              text-zinc-400
              sm:text-sm
            "
						title={description}
					>
						{description}
					</p>
				) : (
					<p className="mt-2 h-5 text-sm text-transparent select-none">.</p>
				)}

				{/* Pricing */}
				<div className="mt-6">
					<div className="text-3xl font-bold text-white">
						{formatRate(service.retailRate)}
					</div>
					<div className="mt-1 text-sm text-zinc-400">per 1,000 quantity</div>
				</div>

				{/* Limits */}
				<div className="mt-6 grid grid-cols-2 gap-3">
					<div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
						<div className="text-xs uppercase tracking-wide text-zinc-500">
							Minimum
						</div>
						<div className="mt-1 text-sm font-semibold text-white">
							{service.minQuantity.toLocaleString()}
						</div>
					</div>

					<div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
						<div className="text-xs uppercase tracking-wide text-zinc-500">
							Maximum
						</div>
						<div className="mt-1 text-sm font-semibold text-white">
							{service.maxQuantity.toLocaleString()}
						</div>
					</div>
				</div>

				{/* CTA */}
				<button
					onClick={onOrder}
					className="
            mt-6 w-full rounded-2xl bg-white px-4 py-3
            text-sm font-semibold text-black transition
            hover:opacity-90 active:scale-[0.98]
          "
				>
					Check In
				</button>
			</div>
		</article>
	);
}
