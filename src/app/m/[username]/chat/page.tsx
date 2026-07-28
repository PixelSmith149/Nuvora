// app/m/[username]/chat/page.tsx

import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SellerMessagingPanel } from "@/components/market/SellerMessagingPanel";
import { createClient } from "@/lib/supabase/server";

interface ChatPageProps {
	params: Promise<{
		username: string;
	}>;
	searchParams: Promise<{
		user?: string;
	}>;
}

export const metadata: Metadata = {
	title: "Messages | PrimeBooster",
	description: "Chat with buyers and sellers on PrimeBooster.",
};

export default async function ChatPage({
	params,
	searchParams,
}: ChatPageProps) {
	const supabase = await createClient();

	const { username } = await params;
	const { user: targetUserId } = await searchParams;

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`/auth/login?redirect=/m/${username}/chat`);
	}

	const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select("id, username")
		.eq("id", user.id)
		.single();

	if (profileError || !profile) {
		redirect("/onboarding");
	}

	if (profile.username !== username) {
		redirect(`/m/${profile.username}/chat`);
	}

	return (
		<div className="h-screen bg-black">
			<Suspense
				fallback={
					<div className="flex h-full items-center justify-center bg-black">
						<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
					</div>
				}
			>
				<SellerMessagingPanel
					userId={user.id}
					authenticatedUserId={user.id}
					initialConversationId={targetUserId}
				/>
			</Suspense>
		</div>
	);
}
