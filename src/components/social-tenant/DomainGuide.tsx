// components/social-tenant/DomainGuide.tsx

"use client";

import {
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	ExternalLink,
	Mail,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getSiteHostname } from "@/lib/st/urls";

interface DomainGuideProps {
	domain: string;
	siteSlug: string; // ← now required so we can point to the correct subdomain
	provider: {
		id: string;
		name: string;
		docsUrl: string;
	};
	records: {
		type: string;
		name: string;
		value: string;
		required: boolean;
	}[];
	onVerify: () => void;
}

export function DomainGuide({
	domain,
	siteSlug,
	provider,
	records,
	onVerify,
}: DomainGuideProps) {
	const [expanded, setExpanded] = useState(true);

	const targetHostname = getSiteHostname(siteSlug); // e.g. bakery.nu-vora.app

	const providerSteps: Record<string, { title: string; steps: string[] }> = {
		cloudflare: {
			title: "Cloudflare",
			steps: [
				"Log in to Cloudflare at https://dash.cloudflare.com",
				`Select your domain: ${domain}`,
				'Click the "DNS" tab in the left sidebar',
				`Add CNAME record: Name: www (or @), Target: ${targetHostname}, Proxy: OFF (gray cloud)`,
				'Click "Save"',
			],
		},
		namecheap: {
			title: "Namecheap",
			steps: [
				"Log in to Namecheap",
				`Go to Domain List → ${domain} → Manage → Advanced DNS`,
				`Add CNAME record: Host: www (or @), Value: ${targetHostname}, TTL: Automatic`,
				"Click the checkmark to save",
			],
		},
		godaddy: {
			title: "GoDaddy",
			steps: [
				"Log in to GoDaddy",
				`Go to My Products → ${domain} → DNS`,
				'Click "Add New Record"',
				`Type: CNAME, Name: www (or @), Value: ${targetHostname}, TTL: 1 Hour`,
				'Click "Save"',
			],
		},
		google: {
			title: "Google Domains / Cloud DNS",
			steps: [
				"Log in to Google Domains",
				`Select ${domain}`,
				"Go to DNS → Custom resource records",
				`Add CNAME: Name: www (or @), Data: ${targetHostname}, TTL: 300`,
				'Click "Save"',
			],
		},
		aws: {
			title: "Amazon Route 53",
			steps: [
				"Log in to AWS Console",
				"Go to Route 53 → Hosted Zones",
				`Select ${domain}`,
				'Click "Create Record"',
				`Record name: www (or leave blank for @), Record type: CNAME, Value: ${targetHostname}`,
				'Click "Create"',
			],
		},
		azure: {
			title: "Azure DNS",
			steps: [
				"Log in to Azure Portal",
				"Go to DNS Zones",
				`Select ${domain}`,
				'Click "+ Record Set"',
				`Name: www (or @), Type: CNAME, Value: ${targetHostname}, TTL: 300`,
				'Click "OK"',
			],
		},
		unknown: {
			title: "Your DNS Provider",
			steps: [
				"Log in to your DNS provider or domain registrar",
				`Find the DNS management section for ${domain}`,
				`Add a CNAME record: Name: www (or @), Points to: ${targetHostname}`,
				"Save your changes and wait 5-30 minutes for propagation",
				'Return here and click "Verify Domain"',
			],
		},
	};

	const providerInfo = providerSteps[provider.id] || providerSteps.unknown;

	// Canonical records we recommend
	const recommendedRecords = [
		{
			type: "CNAME",
			name: "www",
			value: targetHostname,
			required: true,
		},
		{
			type: "CNAME",
			name: "@",
			value: targetHostname,
			required: false, // some providers don't allow CNAME on apex
		},
	];

	return (
		<div className="mt-4 border border-sky-500/20 rounded-xl overflow-hidden bg-zinc-900/30">
			{/* Header */}
			<button
				onClick={() => setExpanded(!expanded)}
				className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
			>
				<div className="flex items-center gap-3">
					<div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
						<ExternalLink className="h-4 w-4 text-sky-400" />
					</div>
					<div>
						<h4 className="text-sm font-bold text-white">
							Step-by-Step DNS Configuration
						</h4>
						<p className="text-xs text-zinc-500">
							Provider: {providerInfo.title}
						</p>
					</div>
				</div>
				{expanded ? (
					<ChevronDown className="h-4 w-4 text-zinc-500" />
				) : (
					<ChevronRight className="h-4 w-4 text-zinc-500" />
				)}
			</button>

			{/* Content */}
			{expanded && (
				<div className="p-4 pt-0 border-t border-white/5 space-y-4">
					{/* Required Records */}
					<div className="space-y-1.5">
						<p className="text-xs font-medium text-zinc-400">
							DNS Records to Add:
						</p>
						<div className="space-y-1.5">
							{recommendedRecords
								.filter((r) => r.required)
								.map((record, idx) => (
									<div
										key={idx}
										className="flex items-center gap-3 p-2 bg-black/50 rounded-lg border border-white/5"
									>
										<span className="text-xs font-bold text-sky-400 w-14">
											{record.type}
										</span>
										<span className="text-xs text-zinc-400 flex-1">
											{record.name}
										</span>
										<span className="text-xs text-emerald-400 font-mono truncate">
											{record.value}
										</span>
									</div>
								))}
						</div>
					</div>

					{/* Provider-Specific Steps */}
					<div className="space-y-1.5">
						<p className="text-xs font-medium text-zinc-400">
							Instructions for {providerInfo.title}:
						</p>
						<div className="space-y-1.5">
							{providerInfo.steps.map((stepText, idx) => (
								<div
									key={idx}
									className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
								>
									<span className="text-xs font-bold text-emerald-400 w-6 flex-shrink-0">
										{idx + 1}.
									</span>
									<span className="text-xs text-zinc-300 leading-relaxed">
										{stepText}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Important Notes */}
					<div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg space-y-1.5">
						<p className="text-xs font-bold text-amber-400">
							⚠️ Important Notes
						</p>
						<ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
							<li>Turn OFF proxy (gray cloud) if using Cloudflare</li>
							<li>DNS changes can take 5-30 minutes to propagate</li>
							<li>
								Point your domain to{" "}
								<span className="text-emerald-400 font-mono">
									{targetHostname}
								</span>
							</li>
						</ul>
					</div>

					{/* Actions */}
					<div className="flex flex-wrap items-center gap-3 pt-2">
						<Button
							onClick={onVerify}
							className="bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl px-5 py-2 text-xs"
						>
							<CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
							I've Added Them — Verify Now
						</Button>
						<a
							href={provider.docsUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
						>
							<ExternalLink className="h-3.5 w-3.5" />
							Official Documentation
						</a>
						<button
							onClick={() => {
								const subject = `DNS Configuration for ${domain}`;
								const body = `Here are the DNS records to add for ${domain}:\n\nCNAME: www → ${targetHostname}\n\nProvider: ${providerInfo.title}`;
								window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
							}}
							className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
						>
							<Mail className="h-3.5 w-3.5" />
							Email These Instructions
						</button>
					</div>

					<p className="text-[10px] text-zinc-600 border-t border-white/5 pt-3 mt-2">
						Need personalized help? Contact your DNS provider's support.
					</p>
				</div>
			)}
		</div>
	);
}