// components/social-tenant/TemplateDesigner.tsx

"use client";

import React from "react";

export function TemplateDesigner({
	userId,
	username,
}: {
	userId: string;
	username: string;
}) {
	return (
		<div className="py-8 text-center">
			className="h-12 w-12 text-purple-400 mx-auto mb-4"
			<h2 className="text-xl font-bold text-white">Template Designer</h2>
			<p className="text-sm text-zinc-400 mt-2">
				Coming soon — Design and customize templates.
			</p>
		</div>
	);
}
