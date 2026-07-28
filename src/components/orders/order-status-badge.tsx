interface OrderStatusBadgeProps {
	status:
		| "pending"
		| "processing"
		| "completed"
		| "partial"
		| "cancelled"
		| "refunded";
}

const STATUS_STYLES = {
	pending: {
		label: "Pending",
		className: `
      border-amber-500/20
      bg-amber-500/10
      text-amber-400
    `,
	},

	processing: {
		label: "Processing",
		className: `
      border-blue-500/20
      bg-blue-500/10
      text-blue-400
    `,
	},

	completed: {
		label: "Completed",
		className: `
      border-green-500/20
      bg-green-500/10
      text-green-400
    `,
	},

	partial: {
		label: "Partial",
		className: `
      border-purple-500/20
      bg-purple-500/10
      text-purple-400
    `,
	},

	cancelled: {
		label: "Cancelled",
		className: `
      border-red-500/20
      bg-red-500/10
      text-red-400
    `,
	},

	refunded: {
		label: "Refunded",
		className: `
      border-zinc-500/20
      bg-zinc-500/10
      text-zinc-300
    `,
	},
} as const;

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
	const config = STATUS_STYLES[status];

	return (
		<span
			className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        tracking-wide
        ${config.className}
      `}
		>
			<span
				className="
          h-2
          w-2
          rounded-full
          bg-current
        "
			/>

			{config.label}
		</span>
	);
}
