// app/providers.tsx

"use client";

import type React from "react";
import { AppSessionProvider } from "@/components/providers/AppSessionProvider";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<AppSessionProvider>
			{children}
			<Toaster />
		</AppSessionProvider>
	);
}
