// app/[tech]/s/services/page.tsx

import { ReceiptText } from "lucide-react";
import Link from "next/link";
import { CatalogHeader } from "@/components/services/catalog-header";
import { ServicesFilterCatalog } from "@/components/services/services-filter-catalog";
import {
	getMarketplacePlatforms,
	getMarketplaceServices,
} from "@/lib/services/getMarketplaceServices";
import { getPlatformConfig } from "@/lib/services/platform-config";

export default async function ServicesPage() {
	const platforms = await getMarketplacePlatforms();
	const allServices = (await getMarketplaceServices()) ?? [];

	const uniqueCategories = [
		...new Set(allServices.map((s: any) => s.category).filter(Boolean)),
	];

	const uniqueProviderCount = 1;

	const computedMetrics = {
		categoriesList: uniqueCategories,
		totalProviders: uniqueProviderCount,
		activeProviders: uniqueProviderCount,
	};

	return (
		<div className="container mx-auto py-8 px-6 text-white">
			<div className="mb-10">
				<div className="flex items-start justify-between">
					<div className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium tracking-wide text-cyan-400">
						NuVora • ELITE PLATFORM
					</div>

					<Link
						href="/s/orders"
						title="My Orders"
						aria-label="My Orders"
						className="
              flex h-11 w-11 shrink-0 items-center justify-center
              rounded-2xl border border-zinc-800 bg-zinc-900/70 text-zinc-300
              transition-all duration-300
              hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400
              hover:shadow-lg hover:shadow-cyan-500/10
            "
					>
						<ReceiptText className="h-5 w-5" />
					</Link>
				</div>

				<h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
					Social Media Services
				</h1>

				<p className="mt-4 max-w-3xl leading-7 text-zinc-400">
					Purchase premium engagement services across TikTok, Instagram,
					Facebook, YouTube, X, Telegram and dozens of other social platforms
					from one unified marketplace.
				</p>
			</div>

			<CatalogHeader
				totalServices={allServices.length}
				totalCategories={computedMetrics.categoriesList.length}
			/>
			<ServicesFilterCatalog
                platforms={platforms}
                services={allServices}
                categories={computedMetrics.categoriesList}
            />

			<div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
				{platforms.map((platform) => {
					const config = getPlatformConfig(platform.slug);
					const Icon = config.icon;
					const color = config.color || "text-white";
					const border = config.border || "";
					const label = config.label || platform.name;

					return (
						<Link
							key={platform.slug}
							href={`/s/services/${platform.slug}`}
							className={`
                rounded-3xl border border-zinc-800 bg-zinc-950 p-8
                transition-all duration-300 hover:-translate-y-1
                ${border}
              `}
						>
							<div className="flex items-center gap-4">
								{Icon ? (
									<Icon className={`h-8 w-8 ${color}`} />
								) : (
									<div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
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
		</div>
	);
}

