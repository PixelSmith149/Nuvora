// components/social-tenant/link-in-bio/LinkInBioSkeleton.tsx

"use client";

import React from "react";

export function LinkInBioSkeleton() {
	return (
		<div className="min-h-screen bg-black text-white p-4 md:p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header Skeleton */}
				<div className="flex items-center justify-between mb-8">
					<div className="space-y-2">
						<div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" />
						<div className="h-4 w-64 bg-zinc-800 rounded-lg animate-pulse" />
					</div>
					<div className="h-10 w-32 bg-zinc-800 rounded-xl animate-pulse" />
				</div>

				{/* Stats Skeleton */}
				<div className="grid grid-cols-3 gap-4 mb-8">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="p-4 bg-zinc-800 rounded-xl animate-pulse h-16"
						/>
					))}
				</div>

				{/* Templates Skeleton */}
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="bg-zinc-800/50 rounded-2xl animate-pulse h-48"
						/>
					))}
				</div>
			</div>
		</div>
	);
}
