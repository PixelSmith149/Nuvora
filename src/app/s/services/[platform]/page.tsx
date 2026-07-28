import { ServiceCatalog } from "@/components/services/service-catalog";
import { getMarketplaceServicesPlatform } from "@/lib/services/getMarketplaceServices";
import { getPlatformConfig } from "@/lib/services/platform-config";

export default async function PlatformPage({
	params,
}: {
	params: Promise<{ platform: string }>;
}) {
	const { platform } = await params;

	// Fetch services (supports both slug and real platform name)
	const services = (await getMarketplaceServicesPlatform(platform)) ?? [];

	// Use the smart config resolver (handles traffic, country, aliases, etc.)
	const config = getPlatformConfig(platform);

	const Icon = config.icon;
	const iconColor = config.color || "text-zinc-400";
	const label = config.label || platform;

	return (
		<div className="container mx-auto py-8 px-6 text-white">
			<div className="space-y-4 mb-8">
				<h1 className="text-4xl font-bold flex items-center gap-3">
					<Icon className={`h-9 w-9 ${iconColor}`} />
					<span className={iconColor}>{label} Services</span>
				</h1>

				<p className="text-zinc-400">
					Browse available {label} growth services.
				</p>
			</div>

			<ServiceCatalog services={services} categories={[]} />
		</div>
	);
}
