interface CatalogHeaderProps {
	totalServices: number;
	totalCategories: number;
}

export function CatalogHeader({
	totalServices,
	totalCategories,
}: CatalogHeaderProps) {
	return (
		<section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]" />

			<div className="relative p-6 sm:p-8 md:p-12">
				<div className="max-w-3xl">
					<div className="mb-4 inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
						Boostage Panel
					</div>

					<h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
						Fast-Trusted-Secure
					</h1>

					<p className="mt-4 max-w-2xl text-sm sm:text-base leading-7 text-zinc-400">
						Boost your social media, engagement, growth, streaming, community
						and marketing services now ⚡⚡⚡
					</p>

					{/* 🎯 LIQUID GRID LAYOUT: Enforces uniform horizontal alignment on all screen sizes */}
					<div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
						<div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:px-5 sm:py-3 min-w-0">
							<div className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 truncate">
								Services
							</div>
							<div className="mt-1 text-xl sm:text-2xl font-bold text-white truncate">
								{totalServices.toLocaleString()}
							</div>
						</div>

						<div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:px-5 sm:py-3 min-w-0">
							<div className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 truncate">
								Categories
							</div>
							<div className="mt-1 text-xl sm:text-2xl font-bold text-white truncate">
								{totalCategories.toLocaleString()}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
