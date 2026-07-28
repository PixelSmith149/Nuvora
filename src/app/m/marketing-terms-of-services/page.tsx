// app/m/marketing-terms-of-service/page.tsx

"use client";

import { ArrowLeft, Loader2, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MarketingTermsOfService } from "@/components/market/MarketingTermsOfService";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase/client";

export default function MarketingTermsPage() {
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<any>(null);
	const [profile, setProfile] = useState<any>(null);
	const [termsAlreadyAccepted, setTermsAlreadyAccepted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// ─── Check authentication and terms status ──────────────────
	useEffect(() => {
		async function checkAuthAndTerms() {
			try {
				// Get current user
				const {
					data: { user: currentUser },
				} = await supabase.auth.getUser();

				if (!currentUser) {
					router.push("/auth/login?redirect=/m/marketing-terms-of-service");
					return;
				}

				setUser(currentUser);

				// Get profile
				const { data: profileData } = await supabase
					.from("profiles")
					.select("username, display_name")
					.eq("id", currentUser.id)
					.single();

				setProfile(profileData);

				// Check if terms already accepted
				const { data: storeData } = await supabase
					.from("global_market_stores")
					.select("terms_accepted_at")
					.eq("user_id", currentUser.id)
					.single();

				if (storeData?.terms_accepted_at) {
					setTermsAlreadyAccepted(true);
					router.push("/account");
					return;
				}
			} catch (error) {
				console.error("Error checking auth:", error);
			} finally {
				setLoading(false);
			}
		}

		checkAuthAndTerms();
	}, [router]);

	// ─── Handle Accept ──────────────────────────────────────────
	const handleAccept = async () => {
		setIsSubmitting(true);

		try {
			// Update store with terms acceptance
			const { error } = await supabase
				.from("global_market_stores")
				.update({
					terms_accepted_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.eq("user_id", user?.id);

			if (error) {
				console.error("Error accepting terms:", error);
				alert("Failed to accept terms. Please try again.");
				return;
			}

			// Redirect to account page
			router.push("/account");
		} catch (error) {
			console.error("Error:", error);
			alert("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// ─── Handle Decline ──────────────────────────────────────────
	const handleDecline = () => {
		router.push("/account");
	};

	// ─── Loading State ───────────────────────────────────────────
	if (loading) {
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
					<p className="text-xs text-zinc-500 font-medium">Loading terms...</p>
				</div>
			</div>
		);
	}

	// ─── If terms already accepted ──────────────────────────────
	if (termsAlreadyAccepted) {
		return null; // Will redirect via useEffect
	}

	const displayName = profile?.display_name || "Seller";

	return (
		<div className="min-h-screen bg-black text-white">
			{/* ─── Header ────────────────────────────────────────────── */}
			<div className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<Link href="/account">
							<Button
								variant="ghost"
								className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl text-xs h-9"
							>
								<ArrowLeft className="h-4 w-4 mr-1.5" />
								Back
							</Button>
						</Link>
						<div className="flex items-center gap-2">
							<Store className="h-5 w-5 text-emerald-400" />
							<span className="text-sm font-bold text-white">
								Nu-vora
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* ─── Main Content ────────────────────────────────────── */}
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-6 shadow-2xl">
					{/* Welcome Banner */}
					<div className="mb-6 p-4 bg-gradient-to-r from-emerald-900/20 via-zinc-900/20 to-teal-900/20 rounded-xl border border-white/5">
						<h1 className="text-xl font-bold text-white">
							Welcome to Nu-vora, {displayName}! 👋
						</h1>
						<p className="text-sm text-zinc-400 mt-1">
							Before you start selling on{" "}
							<span className="text-emerald-400 font-medium">Elite Home</span>,
							please review and accept our seller terms.
						</p>
					</div>

					{/* Terms Component */}
					<div className="min-h-[500px]">
						<MarketingTermsOfService
							onAccept={handleAccept}
							onDecline={handleDecline}
							isLoading={isSubmitting}
						/>
					</div>

					{/* Footer */}
					<div className="mt-6 pt-4 border-t border-white/5 text-center">
						<p className="text-[10px] text-zinc-600">
							Nu-vora | Elite Home — Secure Digital Asset Marketplace
							<br />
							Need help?{" "}
							<a href="/support" className="text-emerald-400 hover:underline">
								Contact Support
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
