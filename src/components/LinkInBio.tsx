// components/social-tenant/LinkInBio.tsx

"use client";

import React from "react";

export function LinkInBio({
	userId,
	username,
}: {
	userId: string;
	username: string;
}) {
	return (
		<div className="py-8 text-center">
			className="h-12 w-12 text-emerald-400 mx-auto mb-4"
			<h2 className="text-xl font-bold text-white">Link-in-Bio</h2>
			<p className="text-sm text-zinc-400 mt-2">
				Coming soon — Create your own link-in-bio page.
			</p>
		</div>
	);
}
