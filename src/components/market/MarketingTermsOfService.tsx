// components/market/MarketingTermsOfService.tsx

"use client";

import {
	AlertCircle,
	Check,
	ChevronDown,
	ChevronUp,
	DollarSign,
	FileText,
	Lock,
	Package,
	Shield,
	Users,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarketingTermsOfServiceProps {
	onAccept: () => void;
	onDecline: () => void;
	isLoading?: boolean;
}

export function MarketingTermsOfService({
	onAccept,
	onDecline,
	isLoading = false,
}: MarketingTermsOfServiceProps) {
	const [expandedSection, setExpandedSection] = useState<string | null>(null);
	const [accepted, setAccepted] = useState(false);

	const toggleSection = (section: string) => {
		setExpandedSection(expandedSection === section ? null : section);
	};

	const sections = [
		{
			id: "fees",
			icon: DollarSign,
			title: "Platform Fee & Payment Terms",
			content: (
				<div className="space-y-2 text-sm text-zinc-300">
					<p>
						<span className="font-bold text-emerald-400">4.0%</span> platform
						fee applies to all successful sales.
					</p>
					<p>
						You receive{" "}
						<span className="font-bold text-emerald-400">96.0%</span> of the
						sale price.
					</p>
					<p>Fees are automatically deducted at delivery confirmation.</p>
					<p className="text-xs text-zinc-500">
						✓ No listing fees • No hidden charges • Escrow protection included
					</p>
				</div>
			),
		},
		{
			id: "listings",
			icon: Package,
			title: "Asset Listing Requirements",
			content: (
				<div className="space-y-2 text-sm text-zinc-300">
					<p>
						All listed assets must be{" "}
						<span className="font-bold text-white">original and legal</span>.
					</p>
					<p>No counterfeit, stolen, or unauthorized content.</p>
					<p>Accurate descriptions and representations required.</p>
					<p>
						Assets must be deliverable{" "}
						<span className="font-bold text-white">digitally</span> (no physical
						goods).
					</p>
					<div className="mt-2 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
						<p className="text-xs text-red-400 font-semibold">⛔ Prohibited:</p>
						<p className="text-xs text-zinc-400">
							Illegal content • Malware • Phishing tools • Stolen credentials
						</p>
					</div>
				</div>
			),
		},
		{
			id: "delivery",
			icon: Users,
			title: "Delivery Obligations",
			content: (
				<div className="space-y-2 text-sm text-zinc-300">
					<p>
						Assets must be delivered{" "}
						<span className="font-bold text-white">instantly</span> upon
						purchase.
					</p>
					<p>
						Our{" "}
						<span className="font-bold text-emerald-400">automated system</span>{" "}
						handles delivery to buyer's locker.
					</p>
					<p>
						Failed delivery results in{" "}
						<span className="font-bold text-amber-400">automatic refund</span>{" "}
						to buyer.
					</p>
					<p>You are responsible for asset quality and functionality.</p>
				</div>
			),
		},
		{
			id: "ip",
			icon: FileText,
			title: "Intellectual Property Rights",
			content: (
				<div className="space-y-2 text-sm text-zinc-300">
					<p>
						You affirm you have{" "}
						<span className="font-bold text-white">full rights</span> to sell
						the asset.
					</p>
					<p>
						You grant Nu-vora license to{" "}
						<span className="font-bold text-emerald-400">
							display, package, and deliver
						</span>{" "}
						the asset.
					</p>
					<p>
						We may format/enhance asset presentation for better buyer
						experience.
					</p>
					<p className="text-xs text-zinc-500">
						You retain full ownership of your intellectual property.
					</p>
				</div>
			),
		},
		{
			id: "conduct",
			icon: AlertCircle,
			title: "Prohibited Conduct",
			content: (
				<div className="space-y-2 text-sm text-zinc-300">
					<p>❌ No fraudulent or misleading listings</p>
					<p>❌ No fake reviews, ratings, or engagement manipulation</p>
					<p>❌ No harassment of buyers or other sellers</p>
					<p>❌ No selling of assets that violate third-party rights</p>
					<p>
						❌ No use of platform for money laundering or illegal activities
					</p>
				</div>
			),
		},
		{
			id: "privacy",
			icon: Lock,
			title: "Data Privacy & Security",
			content: (
				<div className="space-y-2 text-sm text-zinc-300">
					<p>
						You must handle buyer information with{" "}
						<span className="font-bold text-white">strict confidentiality</span>
						.
					</p>
					<p>No sharing of buyer data with third parties.</p>
					<p>
						You comply with applicable privacy laws (
						<span className="font-bold text-emerald-400">GDPR, CCPA</span>,
						etc.).
					</p>
					<p className="text-xs text-zinc-500">
						Our Privacy Policy applies to all transactions.
					</p>
				</div>
			),
		},
		{
			id: "verification",
			icon: Shield,
			title: "Account Verification",
			content: (
				<div className="space-y-2 text-sm text-zinc-300">
					<p>
						<span className="font-bold text-emerald-400">
							Biometric verification
						</span>{" "}
						required for storefront activation.
					</p>
					<p>Ongoing compliance with verification requirements.</p>
					<p>We may request re-verification at any time.</p>
					<p className="text-xs text-zinc-500">
						Failure to comply may result in account restrictions.
					</p>
				</div>
			),
		},
	];

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="text-center space-y-2 pb-4 border-b border-white/5">
				<div className="flex items-center justify-center gap-2">
					<Shield className="h-6 w-6 text-emerald-400" />
					<h2 className="text-xl font-bold text-white">
						Seller Marketing Terms
					</h2>
					<span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
						Nu-vora | Elite Home
					</span>
				</div>
				<p className="text-xs text-zinc-400">
					By activating your storefront, you agree to these terms. Review
					carefully before proceeding.
				</p>
			</div>

			{/* Sections */}
			<ScrollArea className="flex-1 py-4 pr-2">
				<div className="space-y-2">
					{sections.map((section) => {
						const isExpanded = expandedSection === section.id;
						const Icon = section.icon;

						return (
							<div
								key={section.id}
								className="border border-white/5 rounded-xl overflow-hidden bg-zinc-950/30"
							>
								<button
									onClick={() => toggleSection(section.id)}
									className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
								>
									<Icon className="h-4 w-4 text-emerald-400 flex-shrink-0" />
									<span className="text-xs font-bold text-white flex-1">
										{section.title}
									</span>
									{isExpanded ? (
										<ChevronUp className="h-4 w-4 text-zinc-500" />
									) : (
										<ChevronDown className="h-4 w-4 text-zinc-500" />
									)}
								</button>
								{isExpanded && (
									<div className="px-4 pb-4 pt-1 border-t border-white/5">
										{section.content}
									</div>
								)}
							</div>
						);
					})}

					{/* Quick Summary Box */}
					<div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
						<div className="flex items-center gap-2 mb-2">
							<Shield className="h-4 w-4 text-emerald-400" />
							<span className="text-xs font-bold text-white">
								Quick Summary
							</span>
						</div>
						<div className="grid grid-cols-2 gap-2 text-xs">
							<div className="p-2 bg-zinc-900/50 rounded-lg text-center">
								<p className="text-emerald-400 font-bold">4.0%</p>
								<p className="text-zinc-500">Platform Fee</p>
							</div>
							<div className="p-2 bg-zinc-900/50 rounded-lg text-center">
								<p className="text-emerald-400 font-bold">96.0%</p>
								<p className="text-zinc-500">Your Payout</p>
							</div>
							<div className="p-2 bg-zinc-900/50 rounded-lg text-center">
								<p className="text-white font-bold">⚡ Instant</p>
								<p className="text-zinc-500">Delivery</p>
							</div>
							<div className="p-2 bg-zinc-900/50 rounded-lg text-center">
								<p className="text-white font-bold">🔒 Escrow</p>
								<p className="text-zinc-500">Protection</p>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>

			{/* Footer */}
			<div className="pt-4 border-t border-white/5 space-y-4">
				<div className="flex items-start gap-3 p-3 bg-zinc-900/30 rounded-xl border border-white/5">
					<input
						type="checkbox"
						id="terms-accept"
						checked={accepted}
						onChange={(e) => setAccepted(e.target.checked)}
						className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0"
					/>
					<label
						htmlFor="terms-accept"
						className="text-xs text-zinc-400 leading-relaxed"
					>
						I confirm that I have read and agree to the{" "}
						<span className="text-white font-medium">
							Seller Marketing Terms
						</span>{" "}
						for
						<span className="text-emerald-400 font-medium">
							{" "}
							Nu-vora | Elite Home
						</span>
						. I understand that a{" "}
						<span className="text-emerald-400 font-medium">
							4.0% platform fee
						</span>{" "}
						applies to all sales.
					</label>
				</div>

				<div className="flex gap-3">
					<Button
						onClick={onDecline}
						disabled={isLoading}
						variant="outline"
						className="flex-1 border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl h-11 text-xs font-bold"
					>
						Decline
					</Button>
					<Button
						onClick={onAccept}
						disabled={!accepted || isLoading}
						className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-11 text-xs transition-all disabled:opacity-40"
					>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
								Processing...
							</div>
						) : (
							<div className="flex items-center gap-2">
								<Check className="h-4 w-4" />
								Accept & Continue
							</div>
						)}
					</Button>
				</div>

				<p className="text-[10px] text-center text-zinc-600">
					By accepting, you agree to our full Terms of Service and Privacy
					Policy.
					<br />
					<span className="text-zinc-700">
						Last updated:{" "}
						{new Date().toLocaleDateString("en-US", {
							month: "long",
							year: "numeric",
						})}
					</span>
				</p>
			</div>
		</div>
	);
}
