// components/NotificationWrapper.tsx
"use client";

import { NotificationProvider } from "@/components/NotificationProvider";
import { useAppSession } from "@/components/providers/AppSessionProvider";

export function NotificationWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userId } = useAppSession();

	return (
		<NotificationProvider userId={userId}>{children}</NotificationProvider>
	);
}
