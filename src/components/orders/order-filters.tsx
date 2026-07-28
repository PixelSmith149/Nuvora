"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface OrderFiltersProps {
	currentStatus?: string;
	currentSearch?: string;
}

const STATUS_OPTIONS = [
	{
		value: "",
		label: "All Statuses",
	},
	{
		value: "pending",
		label: "Pending",
	},
	{
		value: "processing",
		label: "Processing",
	},
	{
		value: "completed",
		label: "Completed",
	},
	{
		value: "partial",
		label: "Partial",
	},
	{
		value: "cancelled",
		label: "Cancelled",
	},
	{
		value: "refunded",
		label: "Refunded",
	},
];

export function OrderFilters({
	currentStatus,
	currentSearch,
}: OrderFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isPending, startTransition] = useTransition();

	const [search, setSearch] = useState(currentSearch ?? "");

	const [status, setStatus] = useState(currentStatus ?? "");

	function updateFilters(nextSearch: string, nextStatus: string) {
		const params = new URLSearchParams(searchParams.toString());

		if (nextSearch.trim()) {
			params.set("search", nextSearch.trim());
		} else {
			params.delete("search");
		}

		if (nextStatus) {
			params.set("status", nextStatus);
		} else {
			params.delete("status");
		}

		params.delete("page");

		startTransition(() => {
			router.push(`/orders?${params.toString()}`);
		});
	}

	function handleSearchSubmit(e: React.FormEvent) {
		e.preventDefault();

		updateFilters(search, status);
	}

	function handleStatusChange(value: string) {
		setStatus(value);

		updateFilters(search, value);
	}

	function clearFilters() {
		setSearch("");
		setStatus("");

		startTransition(() => {
			router.push("/orders");
		});
	}

	return (
		<section
			className="
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-950
        p-6
      "
		>
			<div
				className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
        "
			>
				{/* Search */}

				<form onSubmit={handleSearchSubmit} className="flex-1">
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="
              Search order ID,
              service,
              target URL...
            "
						className="
              w-full
              rounded-2xl
              border
              border-zinc-800
              bg-black
              px-4
              py-3
              text-sm
              text-white
              outline-none
              placeholder:text-zinc-500
              focus:border-zinc-700
            "
					/>
				</form>

				{/* Status */}

				<select
					value={status}
					onChange={(e) => handleStatusChange(e.target.value)}
					className="
            rounded-2xl
            border
            border-zinc-800
            bg-black
            px-4
            py-3
            text-sm
            text-white
            outline-none
            focus:border-zinc-700
          "
				>
					{STATUS_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>

				{/* Search Button */}

				<button
					onClick={() => updateFilters(search, status)}
					disabled={isPending}
					className="
            rounded-2xl
            bg-white
            px-5
            py-3
            text-sm
            font-semibold
            text-black
            transition
            hover:opacity-90
          "
				>
					Search
				</button>

				{/* Reset */}

				<button
					onClick={clearFilters}
					className="
            rounded-2xl
            border
            border-zinc-800
            px-5
            py-3
            text-sm
            text-zinc-300
            transition
            hover:border-zinc-700
            hover:text-white
          "
				>
					Reset
				</button>
			</div>
		</section>
	);
}
