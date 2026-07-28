"use client";

import {
	AlertCircle,
	CheckCircle2,
	ChevronDown,
	Download,
	Loader2,
	RefreshCw,
	X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
	fetchProviders,
	type ProviderRegistryRecord,
} from "@/app/[tech]/admin-dashboard/providers/action";
import { useToast } from "@/lib/use-toast";

interface ImportServiceDataButtonProps {
	onImportComplete?: (result: ImportResult) => void;
	className?: string;
}

interface ImportResult {
	success: boolean;
	providerId: string;
	providerName: string;
	servicesAdded: number;
	servicesUpdated: number;
	totalServices: number;
	premium: number;
	standard: number;
	basic: number;
	errors: string[];
}

export function ImportServiceDataButton({
	onImportComplete,
	className = "",
}: ImportServiceDataButtonProps) {
	const { toast } = useToast();

	// ─── State ──────────────────────────────────────────────────────────
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [providers, setProviders] = useState<ProviderRegistryRecord[]>([]);
	const [selectedProviderId, setSelectedProviderId] = useState<string>("");
	const [progress, setProgress] = useState(0);
	const [statusMessage, setStatusMessage] = useState("");
	const [importResult, setImportResult] = useState<ImportResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	// ─── Load providers on mount ──────────────────────────────────────
	useEffect(() => {
		loadProviders();
	}, []);

	const loadProviders = async () => {
		setIsLoading(true);
		try {
			const data = await fetchProviders();
			setProviders(data);
			if (data.length > 0 && !selectedProviderId) {
				setSelectedProviderId(data[0].id);
			}
		} catch (err: any) {
			toast({
				title: "Error",
				description: "Failed to load providers: " + err.message,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// ─── Get selected provider ─────────────────────────────────────────
	const selectedProvider = providers.find((p) => p.id === selectedProviderId);

	// ─── Handle Import ─────────────────────────────────────────────────
	const handleImport = async () => {
		if (!selectedProviderId) {
			toast({
				title: "Selection Required",
				description: "Please select a provider first.",
				variant: "warning",
			});
			return;
		}

		const provider = providers.find((p) => p.id === selectedProviderId);
		if (!provider) {
			toast({
				title: "Provider Not Found",
				description: "Selected provider could not be found.",
				variant: "destructive",
			});
			return;
		}

		if (!provider.api_url || !provider.api_key) {
			toast({
				title: "Missing Credentials",
				description:
					"Provider API URL or API Key is missing. Please update the provider details.",
				variant: "destructive",
			});
			return;
		}

		setIsImporting(true);
		setProgress(0);
		setStatusMessage("Initializing import...");
		setImportResult(null);
		setError(null);

		try {
			// ─── Step 1: Fetch services from provider API ──────────────────
			setStatusMessage("Fetching services from provider...");
			setProgress(20);

			const fetchResponse = await fetch("/api/admin/providers/fetch-services", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					providerId: provider.id,
					apiUrl: provider.api_url,
					apiKey: provider.api_key,
				}),
			});

			const fetchData = await fetchResponse.json();

			if (!fetchResponse.ok) {
				throw new Error(
					fetchData.error || "Failed to fetch services from provider",
				);
			}

			setProgress(50);
			setStatusMessage(
				`Found ${fetchData.services?.length || 0} services. Importing...`,
			);

			// ─── Step 2: Upsert services to database ──────────────────────
			const upsertResponse = await fetch(
				"/api/admin/providers/upsert-services",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						providerId: provider.id,
						services: fetchData.services,
					}),
				},
			);

			const upsertData = await upsertResponse.json();

			if (!upsertResponse.ok) {
				throw new Error(upsertData.error || "Failed to import services");
			}

			setProgress(100);
			setStatusMessage("Import complete!");

			const result: ImportResult = {
				success: true,
				providerId: provider.id,
				providerName: provider.name,
				servicesAdded: upsertData.added || 0,
				servicesUpdated: upsertData.updated || 0,
				totalServices: upsertData.total || 0,
				premium: upsertData.premium || 0,
				standard: upsertData.standard || 0,
				basic: upsertData.basic || 0,
				errors: upsertData.errors || [],
			};

			setImportResult(result);

			toast({
				title: "✅ Import Successful",
				description: `Imported ${result.servicesAdded + result.servicesUpdated} services from ${provider.name}`,
				variant: "success",
			});

			if (onImportComplete) {
				onImportComplete(result);
			}
		} catch (err: any) {
			setError(err.message);
			toast({
				title: "Import Failed",
				description: err.message || "An unexpected error occurred",
				variant: "destructive",
			});
		} finally {
			setIsImporting(false);
		}
	};

	// ─── Reset state ───────────────────────────────────────────────────
	const handleClose = () => {
		setIsOpen(false);
		setImportResult(null);
		setError(null);
		setProgress(0);
		setStatusMessage("");
	};

	// ─── Render ─────────────────────────────────────────────────────────
	return (
		<>
			{/* ─── Trigger Button ──────────────────────────────────────────── */}
			<button
				onClick={() => setIsOpen(true)}
				className={`flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-colors ${className}`}
			>
				<Download className="h-4 w-4" />
				Import Services
			</button>

			{/* ─── Modal ────────────────────────────────────────────────────── */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
					onClick={(e) => {
						if (e.target === e.currentTarget && !isImporting) handleClose();
					}}
				>
					<div
						className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
						onClick={(e) => e.stopPropagation()}
					>
						{/* ─── Header ────────────────────────────────────────────── */}
						<div className="flex items-center justify-between p-4 border-b border-white/5">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
									<Download className="h-5 w-5 text-purple-400" />
								</div>
								<div>
									<h3 className="text-lg font-bold text-white">
										Import Provider Services
									</h3>
									<p className="text-sm text-zinc-500">
										Fetch and import services from a provider
									</p>
								</div>
							</div>
							<button
								onClick={handleClose}
								disabled={isImporting}
								className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="p-4 space-y-4">
							{/* ─── Provider Selector ────────────────────────────────── */}
							<div className="space-y-1.5">
								<label className="text-xs text-zinc-400 font-medium">
									Select Provider
								</label>
								<div className="relative">
									<select
										value={selectedProviderId}
										onChange={(e) => setSelectedProviderId(e.target.value)}
										disabled={isImporting || isLoading}
										className="w-full bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 pr-10 text-sm focus:border-purple-500/30 focus:outline-none transition-colors disabled:opacity-50 appearance-none"
									>
										{isLoading ? (
											<option value="">Loading providers...</option>
										) : providers.length === 0 ? (
											<option value="">No providers found</option>
										) : (
											providers.map((provider) => (
												<option key={provider.id} value={provider.id}>
													{provider.name} {!provider.active && "(Inactive)"}
												</option>
											))
										)}
									</select>
									<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
								</div>
							</div>

							{/* ─── Provider Details ────────────────────────────────── */}
							{selectedProvider && (
								<div className="p-3 bg-black/50 border border-white/5 rounded-xl space-y-1 text-xs">
									<div className="flex items-center justify-between">
										<span className="text-zinc-500">API URL:</span>
										<span className="text-zinc-300 truncate max-w-[200px]">
											{selectedProvider.api_url || "Not set"}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-zinc-500">API Key:</span>
										<span className="text-zinc-300">
											{selectedProvider.api_key ? "••••••••" : "Not set"}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-zinc-500">Status:</span>
										<span
											className={
												selectedProvider.active
													? "text-emerald-400"
													: "text-amber-400"
											}
										>
											{selectedProvider.active ? "Active" : "Inactive"}
										</span>
									</div>
								</div>
							)}

							{/* ─── Error Message ────────────────────────────────────── */}
							{error && (
								<div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
									<AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
									<span>{error}</span>
								</div>
							)}

							{/* ─── Progress ────────────────────────────────────────── */}
							{isImporting && (
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-zinc-400">{statusMessage}</span>
										<span className="text-zinc-500">{progress}%</span>
									</div>
									<div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
										<div
											className="h-full bg-purple-500 rounded-full transition-all duration-300"
											style={{ width: `${progress}%` }}
										/>
									</div>
								</div>
							)}

							{/* ─── Import Result ────────────────────────────────────── */}
							{importResult && !isImporting && (
								<div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
									<div className="flex items-center gap-2 text-emerald-400 mb-2">
										<CheckCircle2 className="h-4 w-4" />
										<span className="font-medium">Import Complete</span>
									</div>
									<div className="grid grid-cols-3 gap-2 text-xs">
										<div className="p-2 rounded bg-black/50 text-center">
											<span className="text-zinc-500">Added</span>
											<p className="text-white font-bold">
												{importResult.servicesAdded}
											</p>
										</div>
										<div className="p-2 rounded bg-black/50 text-center">
											<span className="text-zinc-500">Updated</span>
											<p className="text-white font-bold">
												{importResult.servicesUpdated}
											</p>
										</div>
										<div className="p-2 rounded bg-black/50 text-center">
											<span className="text-zinc-500">Total</span>
											<p className="text-white font-bold">
												{importResult.totalServices}
											</p>
										</div>
									</div>

									{/* ─── Quality Breakdown ────────────────────────────── */}
									<div className="mt-2 grid grid-cols-3 gap-2 text-xs">
										<div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-center">
											<span className="text-purple-400">⭐ Premium</span>
											<p className="text-white font-bold">
												{importResult.premium}
											</p>
										</div>
										<div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-center">
											<span className="text-blue-400">📦 Standard</span>
											<p className="text-white font-bold">
												{importResult.standard}
											</p>
										</div>
										<div className="p-2 rounded bg-zinc-500/10 border border-zinc-500/20 text-center">
											<span className="text-zinc-400">💰 Basic</span>
											<p className="text-white font-bold">
												{importResult.basic}
											</p>
										</div>
									</div>

									{importResult.errors && importResult.errors.length > 0 && (
										<div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
											<p className="text-[10px] text-red-400 font-medium">
												Errors:
											</p>
											{importResult.errors.slice(0, 5).map((err, i) => (
												<p
													key={i}
													className="text-[10px] text-red-400/70 truncate"
												>
													{err}
												</p>
											))}
											{importResult.errors.length > 5 && (
												<p className="text-[10px] text-zinc-500">
													+{importResult.errors.length - 5} more errors
												</p>
											)}
										</div>
									)}
								</div>
							)}

							{/* ─── Actions ──────────────────────────────────────────── */}
							<div className="flex items-center gap-3 pt-2 border-t border-white/5">
								<button
									onClick={handleClose}
									disabled={isImporting}
									className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
								>
									Close
								</button>
								<button
									onClick={handleImport}
									disabled={isImporting || !selectedProviderId || isLoading}
									className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
								>
									{isImporting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Importing...
										</>
									) : (
										<>
											<RefreshCw className="h-4 w-4" />
											Import Services
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
