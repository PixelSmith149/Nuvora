// app/layout.tsx

import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist } from "next/font/google";
import "./globals.css";
import type React from "react";
import { SessionHydrator } from "@/components/market/SessionHydrator";
import { NotificationWrapper } from "@/components/NotificationWrapper";
import { Providers } from "./providers";
import { AppLockProvider } from '@/components/auth/AppLockProvider';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-playfair",
	weight: ["700"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "NuVora | Elite Platform",
	description: "Elite Access to Services, Global Markets & Tenant Management",
	other: {
    heleket: "596e4a79",
  },
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={cn(
				"dark",
				geist.variable
			)}
		>
			<body
				className="
					min-h-dvh
					w-full
					overflow-x-hidden
					bg-black
					text-white
					antialiased
				"
			>
				<AppLockProvider leaveTimeoutMs={0} idleTimeoutMs={2 * 60 * 1000}>
					<Providers>
						<SessionHydrator />

						<div className="
							flex
							min-h-dvh
							w-full
							flex-col
							overflow-x-hidden
						">
							<NotificationWrapper>
								{children}
							</NotificationWrapper>
						</div>

					</Providers>
				</AppLockProvider>
			</body>
		</html>
	);
}

