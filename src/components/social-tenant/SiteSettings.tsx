// components/social-tenant/SiteSettings.tsx

"use client";

import {
	AlertCircle,
	ArrowLeft,
	CheckCircle2,
	Clock,
	Copy,
	ExternalLink,
	Globe,
	Link as LinkIcon,
	Loader2,
	Lock,
	RefreshCw,
	Save,
	Settings as SettingsIcon,
	Trash2,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DomainGuide } from "@/components/social-tenant/DomainGuide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSocialTenant } from "@/lib/hooks/useSocialTenant";
import { getSitePublicUrl } from "@/lib/st/urls";

interface SiteSettingsProps {
	siteId: string;
	userId: string;
	username: string;
}

export function SiteSettings({ siteId, userId, username }: SiteSettingsProps) {
	const router = useRouter();
	const { getSite, updateSite, deleteSite } = useSocialTenant();

	const [site, setSite] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [copied, setCopied] = useState(false);

	// ─── Form State ──────────────────────────────────────────────
	const [siteName, setSiteName] = useState("");
	const [siteDescription, setSiteDescription] = useState("");
	const [isPublished, setIsPublished] = useState(false);
	const [customDomain, setCustomDomain] = useState("");
	const [analyticsId, setAnalyticsId] = useState("");

	// ─── Domain Verification State ──────────────────────────────
	const [domainVerifying, setDomainVerifying] = useState(false);
	const [domainVerified, setDomainVerified] = useState(false);
	const [domainVerificationError, setDomainVerificationError] = useState<
		string | null
	>(null);
	const [domainInstructions, setDomainInstructions] = useState<any>(null);
	const [showInstructions, setShowInstructions] = useState(false);

	// ─── Load Site ──────────────────────────────────────────────
	useEffect(() => {
		const loadSite = async () => {
			const siteData = await getSite(siteId);
			if (siteData) {
				setSite(siteData);
				setSiteName(siteData.site_name || "");
				setIsPublished(siteData.status === "published");
				setCustomDomain(siteData.blueprint?.custom_domain || "");
				setAnalyticsId(siteData.blueprint?.analytics_id || "");
				setDomainVerified(siteData.blueprint?.custom_domain_verified || false);
			}
			setLoading(false);
		};
		loadSite();
	}, [siteId, getSite]);

	// ─── Domain Verification ────────────────────────────────────
	const handleVerifyDomain = async () => {
		if (!customDomain) {
			setDomainVerificationError("Please enter a domain first");
			return;
		}

		setDomainVerifying(true);
		setDomainVerificationError(null);

		try {
			const response = await fetch("/api/st/domain/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ siteId, domain: customDomain }),
			});

			const result = await response.json();

			if (result.verified) {
				setDomainVerified(true);
				setSuccess(
					"Domain verified successfully! Your site will be available at your domain once DNS propagates.",
				);
				setShowInstructions(false);
			} else {
				setDomainVerified(false);
				setDomainVerificationError(
					"DNS records not found. Please add the records below and try again.",
				);

				const instrRes = await fetch(
					`/api/st/domain/instructions?siteId=${siteId}`,
				);
				const instrData = await instrRes.json();
				if (instrData.records) {
					setDomainInstructions(instrData);
					setShowInstructions(true);
				}
			}
		} catch (error: any) {
			setDomainVerificationError(error.message || "Failed to verify domain");
		} finally {
			setDomainVerifying(false);
		}
	};

	// ─── Handle Save ─────────────────────────────────────────────
	const handleSave = async () => {
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			const updatedBlueprint = {
				...site.blueprint,
				custom_domain: customDomain,
				custom_domain_verified: domainVerified,
				analytics_id: analyticsId,
				site_description: siteDescription,
			};

			const updatedSite = await updateSite(
				siteId,
				"blueprint",
				updatedBlueprint,
			);

			if (siteName !== site.site_name) {
				const response = await fetch(`/api/st/sites/${siteId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						type: "site_name",
						data: siteName,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to update site name");
				}
			}

			const newStatus = isPublished ? "published" : "draft";
			if (newStatus !== site.status) {
				await updateSite(siteId, "status", newStatus);
			}

			setSuccess("Settings saved successfully!");
			setTimeout(() => setSuccess(null), 3000);

			const refreshedSite = await getSite(siteId);
			if (refreshedSite) {
				setSite(refreshedSite);
			}
		} catch (err: any) {
			setError(err.message || "Failed to save settings");
			setTimeout(() => setError(null), 3000);
		} finally {
			setSaving(false);
		}
	};

	// ─── Handle Delete ───────────────────────────────────────────
	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteSite(siteId);
			router.push("/st");
		} catch (err: any) {
			setError(err.message || "Failed to delete site");
			setTimeout(() => setError(null), 3000);
			setIsDeleting(false);
		}
	};

	// ─── Copy URL ────────────────────────────────────────────────
	const handleCopyUrl = () => {
		if (!site?.site_slug) return;
		const url = `${window.location.origin}/s/${site.site_slug}`;
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	// ─── Loading State ──────────────────────────────────────────
	if (loading) {
		return (
			<div className="flex items-center justify-center h-[60vh]">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
					<p className="text-xs text-zinc-500">Loading settings...</p>
				</div>
			</div>
		);
	}

	if (!site) {
		return (
			<div className="flex items-center justify-center h-[60vh]">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
					<h2 className="text-xl font-bold text-white">Site not found</h2>
					<Button onClick={() => router.push("/st")} className="mt-4">
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	// ─── Main Render ────────────────────────────────────────────
	return (
		<div className="space-y-8">
			{/* ─── Header ───────────────────────────────────────────── */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<button
						onClick={() => router.push("/st")}
						className="p-2.5 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-white tracking-tight">
							Site Settings
						</h1>
						<p className="text-sm text-zinc-500">
							Manage your website configuration
						</p>
					</div>
				</div>
			</div>

			{/* ─── Status Messages ──────────────────────────────────── */}
			{error && (
				<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
					<AlertCircle className="h-5 w-5 flex-shrink-0" />
					<span>{error}</span>
				</div>
			)}
			{success && (
				<div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-3">
					<CheckCircle2 className="h-5 w-5 flex-shrink-0" />
					<span>{success}</span>
				</div>
			)}

			{/* ─── Card 1: General Settings ────────────────────────── */}
			<div className="bg-zinc-950/40 border border-white/5 rounded-2xl overflow-hidden">
				<div className="p-6 md:p-8">
					<div className="flex items-center gap-2.5 mb-6">
						<div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
							<SettingsIcon className="h-4 w-4 text-emerald-400" />
						</div>
						<h2 className="text-sm font-bold text-white">General Settings</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Label className="text-xs font-medium text-zinc-400">
								Site Name
							</Label>
							<Input
								value={siteName}
								onChange={(e) => setSiteName(e.target.value)}
								className="bg-black border-white/10 text-white rounded-xl h-11 text-sm focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10"
								placeholder="My Awesome Website"
							/>
						</div>

						<div className="space-y-2">
  <Label className="text-xs font-medium text-zinc-400">
    Public URL
  </Label>
  <div className="flex items-center gap-2">
    <div className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-400 truncate">
      {site?.site_slug && site.status === "published"
        ? getSitePublicUrl(site.site_slug)
        : "Not published yet"}
    </div>
    {site?.site_slug && site.status === "published" && (
      <>
        <button
          onClick={() => {
            navigator.clipboard.writeText(getSitePublicUrl(site.site_slug));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="p-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-white/5"
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
        <a
          href={getSitePublicUrl(site.site_slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-white/5"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </>
    )}
  </div>
</div>
					</div>

					<div className="mt-6 space-y-2">
						<Label className="text-xs font-medium text-zinc-400">
							Site Description
						</Label>
						<Textarea
							value={siteDescription}
							onChange={(e) => setSiteDescription(e.target.value)}
							className="bg-black border-white/10 text-white rounded-xl h-24 text-sm resize-none focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10"
							placeholder="Brief description of your website"
						/>
					</div>

					<div className="mt-6 flex items-center justify-between p-4 bg-zinc-900/30 rounded-xl border border-white/5">
						<div>
							<p className="text-sm font-medium text-white">Publish Site</p>
							<p className="text-xs text-zinc-500">
								{isPublished
									? "Your site is live and accessible"
									: "Your site is in draft mode"}
							</p>
						</div>
						<Switch
							checked={isPublished}
							onCheckedChange={setIsPublished}
							className="data-[state=checked]:bg-emerald-500"
						/>
					</div>
				</div>
			</div>

			{/* ─── Card 2: Domain & SEO ────────────────────────────── */}
			<div className="bg-zinc-950/40 border border-white/5 rounded-2xl overflow-hidden">
				<div className="p-6 md:p-8">
					<div className="flex items-center gap-2.5 mb-6">
						<div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
							<Globe className="h-4 w-4 text-sky-400" />
						</div>
						<h2 className="text-sm font-bold text-white">Domain & SEO</h2>
					</div>

					<div className="space-y-6">
						{/* Custom Domain */}
						<div className="space-y-2">
							<Label className="text-xs font-medium text-zinc-400">
								Custom Domain
							</Label>
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
								<Input
									value={customDomain}
									onChange={(e) => {
										setCustomDomain(
											e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ""),
										);
										setDomainVerified(false);
										setDomainVerificationError(null);
										setShowInstructions(false);
									}}
									className="flex-1 bg-black border-white/10 text-white rounded-xl h-11 text-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
									placeholder="www.yourdomain.com"
								/>
								<Button
									onClick={handleVerifyDomain}
									disabled={!customDomain || domainVerifying}
									className="bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl px-5 py-2.5 text-sm transition-all w-full sm:w-auto whitespace-nowrap"
								>
									{domainVerifying ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : domainVerified ? (
										<CheckCircle2 className="h-4 w-4" />
									) : (
										"Verify Domain"
									)}
								</Button>
							</div>

							{/* Domain Status */}
							{domainVerified && (
								<div className="flex items-center gap-2 text-sm text-emerald-400 mt-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
									<CheckCircle2 className="h-4 w-4 flex-shrink-0" />
									<span>Verified ✓ Your domain is connected</span>
								</div>
							)}

							{domainVerificationError && (
								<div className="flex items-start gap-2 text-sm text-red-400 mt-2 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
									<AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
									<span>{domainVerificationError}</span>
								</div>
							)}

							<p className="text-xs text-zinc-500 mt-1">
								Enter your custom domain. You'll need to configure DNS settings
								with your provider.
							</p>
						</div>

						{/* DNS Instructions */}
						{showInstructions && domainInstructions && (
							<div className="p-5 bg-zinc-900/30 border border-sky-500/10 rounded-xl space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<LinkIcon className="h-4 w-4 text-sky-400" />
										<h4 className="text-sm font-bold text-white">
											DNS Configuration
										</h4>
									</div>
									<button
										onClick={() => setShowInstructions(false)}
										className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
									>
										<X className="h-4 w-4" />
									</button>
								</div>

								<p className="text-sm text-zinc-400">
									Add these records to your DNS provider for{" "}
									<span className="text-white font-medium">
										{domainInstructions.domain}
									</span>
								</p>

								<div className="space-y-2">
									{domainInstructions.records
										?.filter((r: any) => r.required)
										.map((record: any, idx: number) => (
											<div
												key={idx}
												className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 bg-black/50 rounded-lg border border-white/5"
											>
												<span className="text-xs font-bold text-sky-400 w-14">
													{record.type}
												</span>
												<span className="text-xs text-zinc-400 flex-1 font-mono">
													{record.name}
												</span>
												<span className="text-xs text-emerald-400 font-mono truncate w-full sm:w-auto">
													{record.value}
												</span>
											</div>
										))}
								</div>

								<div className="flex items-center gap-2 text-xs text-zinc-500">
									<Clock className="h-4 w-4" />
									<span>DNS propagation may take 5-30 minutes</span>
								</div>

								<Button
									onClick={handleVerifyDomain}
									disabled={domainVerifying}
									className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl h-10 text-sm"
								>
									{domainVerifying ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<RefreshCw className="h-4 w-4 mr-2" />
									)}
									Retry Verification
								</Button>
							</div>
						)}

						{showInstructions && domainInstructions && (
							<DomainGuide
  domain={domainInstructions.domain}
  siteSlug={site.site_slug}
  provider={domainInstructions.provider}
  records={domainInstructions.records}
  onVerify={handleVerifyDomain}
/>
						)}

						{/* Analytics */}
						<div className="space-y-2 pt-4 border-t border-white/5">
							<Label className="text-xs font-medium text-zinc-400">
								Analytics ID
							</Label>
							<Input
								value={analyticsId}
								onChange={(e) => setAnalyticsId(e.target.value)}
								className="bg-black border-white/10 text-white rounded-xl h-11 text-sm focus:border-sky-500/30 focus:ring-2 focus:ring-sky-500/10"
								placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
							/>
							<p className="text-xs text-zinc-500">
								Enter your Google Analytics tracking ID for site analytics.
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="flex items-center w-full">
				<Button
					onClick={handleSave}
					disabled={saving}
					className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-6 py-3 text-sm flex items-center gap-2 transition-all w-full sm:w-auto"
				>
					{saving ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Save className="h-4 w-4" />
					)}
					Save Changes
				</Button>
			</div>

			{/* ─── Card 3: Session & Status ────────────────────────── */}
			<div className="bg-zinc-950/40 border border-white/5 rounded-2xl overflow-hidden">
				<div className="p-6 md:p-8">
					<div className="flex items-center gap-2.5 mb-6">
						<div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
							<Lock className="h-4 w-4 text-amber-400" />
						</div>
						<h2 className="text-sm font-bold text-white">Session & Status</h2>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="p-4 bg-zinc-900/30 rounded-xl border border-white/5">
							<p className="text-[10px] text-zinc-500 uppercase tracking-wider">
								Status
							</p>
							<p
								className={`text-base font-bold mt-1 ${
									site.status === "published"
										? "text-emerald-400"
										: "text-amber-400"
								}`}
							>
								{site.status.charAt(0).toUpperCase() + site.status.slice(1)}
							</p>
						</div>
						<div className="p-4 bg-zinc-900/30 rounded-xl border border-white/5">
							<p className="text-[10px] text-zinc-500 uppercase tracking-wider">
								Session
							</p>
							<p
								className={`text-base font-bold mt-1 ${
									site.is_session_active ? "text-emerald-400" : "text-zinc-500"
								}`}
							>
								{site.is_session_active ? "Active" : "Closed"}
							</p>
						</div>
						<div className="p-4 bg-zinc-900/30 rounded-xl border border-white/5">
							<p className="text-[10px] text-zinc-500 uppercase tracking-wider">
								Created
							</p>
							<p className="text-base font-bold text-white mt-1">
								{new Date(site.created_at).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</p>
						</div>
						<div className="p-4 bg-zinc-900/30 rounded-xl border border-white/5">
							<p className="text-[10px] text-zinc-500 uppercase tracking-wider">
								Last Updated
							</p>
							<p className="text-base font-bold text-white mt-1">
								{new Date(site.updated_at).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</p>
						</div>
					</div>

					{site.session_expires_at && site.is_session_active && (
						<div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
							<p className="text-sm text-zinc-400 flex items-center gap-2">
								<Clock className="h-4 w-4 text-amber-400" />
								<span>
									Session expires:{" "}
									<span className="text-white font-medium">
										{new Date(site.session_expires_at).toLocaleString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</span>
							</p>
						</div>
					)}
				</div>
			</div>

			{/* ─── Card 4: Danger Zone ──────────────────────────────── */}
			<div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
				<div className="p-6 md:p-8">
					<div className="flex items-center gap-2.5 mb-4">
						<div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
							<Trash2 className="h-4 w-4 text-red-400" />
						</div>
						<h2 className="text-sm font-bold text-red-400">Danger Zone</h2>
					</div>

					<p className="text-sm text-zinc-400 mb-6">
						Once you delete a site, there is no going back. All content and data
						will be permanently removed.
					</p>

					{!showDeleteConfirm ? (
						<Button
							onClick={() => setShowDeleteConfirm(true)}
							variant="destructive"
							className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl px-6 py-3 text-sm"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete Site
						</Button>
					) : (
						<div className="p-5 bg-red-950/30 border border-red-500/20 rounded-xl space-y-4">
							<p className="text-sm text-red-400 font-bold flex items-center gap-2">
								<AlertCircle className="h-5 w-5" />
								Are you sure?
							</p>
							<p className="text-sm text-zinc-400">
								This will permanently delete{" "}
								<span className="text-white font-medium">
									"{site.site_name}"
								</span>{" "}
								and all its content. This action cannot be undone.
							</p>
							<div className="flex flex-wrap gap-3">
								<Button
									onClick={handleDelete}
									disabled={isDeleting}
									className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl px-6 py-3 text-sm"
								>
									{isDeleting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										"Yes, Delete Permanently"
									)}
								</Button>
								<Button
									onClick={() => setShowDeleteConfirm(false)}
									variant="outline"
									className="border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl px-6 py-3 text-sm"
								>
									Cancel
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
