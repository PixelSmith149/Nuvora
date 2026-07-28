interface OrderStatsProps {
	total: number;
	pending: number;
	processing: number;
	completed: number;
	cancelled: number;

	totalRevenue?: number;
	totalProfit?: number;
}

export function OrderStats({
	total,
	pending,
	processing,
	completed,
	cancelled,
}: OrderStatsProps) {
	const stats = [
		{
			label: "Total Orders",
			value: total,
			description: "All orders",
		},
		{
			label: "Pending",
			value: pending,
			description: "Awaiting provider",
		},
		{
			label: "Processing",
			value: processing,
			description: "Currently running",
		},
		{
			label: "Completed",
			value: completed,
			description: "Successfully delivered",
		},
		{
			label: "Cancelled",
			value: cancelled,
			description: "Stopped or refunded",
		},
	];

	return (
		<section
			className="
        grid
        gap-4
        sm:grid-cols-2
        xl:grid-cols-5
      "
		>
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
					<p className="text-sm text-zinc-500">{stat.label}</p>

					<h3
						className="
              mt-3
              text-3xl
              font-bold
              text-white
            "
					>
						{stat.value.toLocaleString()}
					</h3>

					<p className="mt-2 text-xs text-zinc-500">{stat.description}</p>
				</article>
			))}
		</section>
	);
}
