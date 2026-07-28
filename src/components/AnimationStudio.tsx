// components/social-tenant/AnimationStudio.tsx

"use client";

import React from "react";

export function AnimationStudio({
	userId,
	username,
}: {
	userId: string;
	username: string;
}) {
	return (
		<div className="py-8 text-center">
			className="h-12 w-12 text-amber-400 mx-auto mb-4"
			<h2 className="text-xl font-bold text-white">Animation Studio</h2>
			<p className="text-sm text-zinc-400 mt-2">
				Coming soon — Create custom animations for your sites.
			</p>
		</div>
	);
}
