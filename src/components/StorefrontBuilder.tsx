// components/social-tenant/StorefrontBuilder.tsx

"use client";

import React from "react";

export function StorefrontBuilder({
	userId,
	username,
}: {
	userId: string;
	username: string;
}) {
	return (
		<div className="py-8 text-center">
			className="h-12 w-12 text-sky-400 mx-auto mb-4"
			<h2 className="text-xl font-bold text-white">Storefront Builder</h2>
			<p className="text-sm text-zinc-400 mt-2">
				Coming soon — Build and manage your online store.
			</p>
		</div>
	);
}
