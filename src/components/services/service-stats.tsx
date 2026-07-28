interface ServiceStatsProps {
	totalServices: number;
	totalCategories: number;
	totalProviders: number;
	activeProviders: number;
}

export function ServiceStats({
	totalServices,
	totalCategories,
	totalProviders,
	activeProviders,
}: ServiceStatsProps) {
	const stats = [
		{
			label: "Total Services",
			value: totalServices.toLocaleString(),
		},
		{
			label: "Categories",
			value: totalCategories.toLocaleString(),
		},
		{
			label: "Providers",
			value: totalProviders.toLocaleString(),
		},
		{
			label: "Active Providers",
			value: activeProviders.toLocaleString(),
		},
	];

	return (
		<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{stats.map((stat) => (
				<article
					key={stat.label}
					className="
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-6
          "
				>
					<div className="text-sm text-zinc-500">{stat.label}</div>

					<div className="mt-3 text-3xl font-bold text-white">{stat.value}</div>
				</article>
			))}
		</section>
	);
}
