"use client";

interface ServiceFiltersProps {
	search: string;
	selectedCategory: string;
	categories: string[];

	onSearchChange: (value: string) => void;

	onCategoryChange: (category: string) => void;
}

export function ServiceFilters({
	search,
	selectedCategory,
	categories,
	onSearchChange,
	onCategoryChange,
}: ServiceFiltersProps) {
	return (
		<section className="space-y-5">
			{/* Search */}

			<div className="relative">
				<input
					type="text"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Search services..."
					className="
            w-full
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            px-4
            py-3
            text-sm
            text-white
            outline-none
            transition
            placeholder:text-zinc-500
            focus:border-zinc-600
          "
				/>
			</div>

			{/* Categories */}

			<div
				className="
          flex
          gap-3
          overflow-x-auto
          pb-2
          scrollbar-none
        "
			>
				<CategoryButton
					active={selectedCategory === "all"}
					label="All"
					onClick={() => onCategoryChange("all")}
				/>

				{categories.map((category) => (
					<CategoryButton
						key={category}
						label={category}
						active={selectedCategory === category}
						onClick={() => onCategoryChange(category)}
					/>
				))}
			</div>
		</section>
	);
}

interface CategoryButtonProps {
	label: string;
	active: boolean;
	onClick: () => void;
}

function CategoryButton({ label, active, onClick }: CategoryButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`
        shrink-0
        rounded-full
        border
        px-4
        py-2
        text-sm
        font-medium
        transition

        ${
					active
						? `
              border-white
              bg-white
              text-black
            `
						: `
              border-zinc-800
              bg-zinc-950
              text-zinc-300
              hover:border-zinc-700
              hover:text-white
            `
				}
      `}
		>
			{label}
		</button>
	);
}
