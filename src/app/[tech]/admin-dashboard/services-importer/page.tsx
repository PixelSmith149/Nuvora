// app/[tech]/admin-dashboard/services-importer/page.tsx
"use client";

import {
	AlertCircle,
	Check,
	CheckCircle2,
	Edit,
	Loader2,
	RefreshCw,
	Save,
	Trash2,
	X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "@/lib/use-toast";

interface ServicePreview {
	id: string;
	provider_service_id: string;
	name: string;
	category: string;
	rate: number;
	min_qty: number;
	max_qty: number;
	avg_time: string | null;
	quality_tier: string | null;
	price_per_1000: number;
	selected: boolean;
}

export default function ServicesImporterPage() {
	const { toast } = useToast();

	// ─── State ──────────────────────────────────────────────────────────
	const [services, setServices] = useState<ServicePreview[]>([]);
	const [loading, setLoading] = useState(false);
	const [importing, setImporting] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editData, setEditData] = useState<Partial<ServicePreview>>({});
	const [totalAvailable, setTotalAvailable] = useState(0);
	const [totalImported, setTotalImported] = useState(0);
	const [error, setError] = useState<string | null>(null);

	// ─── Fetch 50 services ──────────────────────────────────────────────
	const fetchServices = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/admin/services/fetch-50", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch services");
			}

			setServices(data.services || []);
			setTotalAvailable(data.total_available || 0);
			setTotalImported(data.total_imported || 0);

			toast({
				title: "✅ Loaded",
				description: `Found ${data.services?.length || 0} services to import`,
				variant: "success",
			});
		} catch (err: any) {
			setError(err.message);
			toast({
				title: "Error",
				description: err.message || "Failed to fetch services",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// ─── Load on mount ──────────────────────────────────────────────────
	useEffect(() => {
		fetchServices();
	}, []);

	// ─── Toggle selection ──────────────────────────────────────────────
	const toggleSelection = (id: string) => {
		setServices((prev) =>
			prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)),
		);
	};

	// ─── Select all ─────────────────────────────────────────────────────
	const toggleSelectAll = () => {
		const allSelected = services.every((s) => s.selected);
		setServices((prev) => prev.map((s) => ({ ...s, selected: !allSelected })));
	};

	// ─── Start editing ──────────────────────────────────────────────────
	const startEditing = (service: ServicePreview) => {
		setEditingId(service.id);
		setEditData({
			name: service.name,
			category: service.category,
			rate: service.rate,
			min_qty: service.min_qty,
			max_qty: service.max_qty,
			price_per_1000: service.price_per_1000,
			avg_time: service.avg_time,
			quality_tier: service.quality_tier,
		});
	};

	// ─── Save edit ──────────────────────────────────────────────────────
	const saveEdit = (id: string) => {
		setServices((prev) =>
			prev.map((s) =>
				s.id === id
					? {
							...s,
							...editData,
							name: editData.name || s.name,
							category: editData.category || s.category,
							rate: editData.rate ?? s.rate,
							min_qty: editData.min_qty ?? s.min_qty,
							max_qty: editData.max_qty ?? s.max_qty,
							price_per_1000: editData.price_per_1000 ?? s.price_per_1000,
							avg_time: editData.avg_time ?? s.avg_time,
							quality_tier: editData.quality_tier ?? s.quality_tier,
						}
					: s,
			),
		);
		setEditingId(null);
		setEditData({});

		toast({
			title: "✅ Updated",
			description: "Service updated successfully",
			variant: "success",
		});
	};

	// ─── Delete from list ──────────────────────────────────────────────
	const deleteService = (id: string) => {
		setServices((prev) => prev.filter((s) => s.id !== id));
		toast({
			title: "🗑️ Removed",
			description: "Service removed from import list",
			variant: "warning",
		});
	};

	// ─── Confirm import ────────────────────────────────────────────────
	const confirmImport = async () => {
		const selected = services.filter((s) => s.selected);

		if (selected.length === 0) {
			toast({
				title: "⚠️ No Selection",
				description: "Please select at least one service to import",
				variant: "warning",
			});
			return;
		}

		setImporting(true);
		setError(null);

		try {
			const response = await fetch("/api/admin/services/confirm-import", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					services: selected.map((s) => ({
						provider_service_id: s.provider_service_id,
						platform: s.category,
						service_type: s.category,
						title: s.name,
						description: s.name,
						price_per_1000: s.price_per_1000,
						avg_time_delivery: s.avg_time,
					})),
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to import services");
			}

			toast({
				title: "✅ Import Successful",
				description: `Imported ${data.total_inserted} services`,
				variant: "success",
			});

			// ─── Refresh the list ────────────────────────────────────────────
			await fetchServices();
		} catch (err: any) {
			setError(err.message);
			toast({
				title: "Import Failed",
				description: err.message || "Failed to import services",
				variant: "destructive",
			});
		} finally {
			setImporting(false);
		}
	};

	// ─── Render ─────────────────────────────────────────────────────────
	const selectedCount = services.filter((s) => s.selected).length;

	return (
		<div className="space-y-6 p-6">
			{/* ─── Header ────────────────────────────────────────────────────── */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-white">Services Importer</h1>
					<p className="text-sm text-zinc-400">
						{totalAvailable} available • {totalImported} already imported
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={fetchServices}
						disabled={loading}
						className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition-colors disabled:opacity-50"
					>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</button>
					<button
						onClick={confirmImport}
						disabled={importing || selectedCount === 0}
						className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
					>
						{importing ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Check className="h-4 w-4" />
						)}
						Import Selected ({selectedCount})
					</button>
				</div>
			</div>

			{/* ─── Error ────────────────────────────────────────────────────── */}
			{error && (
				<div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
					<AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
					<span>{error}</span>
				</div>
			)}

			{/* ─── Table ────────────────────────────────────────────────────── */}
			<div className="bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden">
				<div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
					<table className="w-full text-sm">
						<thead className="sticky top-0 bg-zinc-950 border-b border-white/5">
							<tr>
								<th className="px-4 py-3 text-left">
									<input
										type="checkbox"
										checked={
											services.every((s) => s.selected) && services.length > 0
										}
										onChange={toggleSelectAll}
										className="w-4 h-4 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20"
									/>
								</th>
								<th className="px-4 py-3 text-left text-zinc-400 font-medium">
									Service Name
								</th>
								<th className="px-4 py-3 text-left text-zinc-400 font-medium">
									Category
								</th>
								<th className="px-4 py-3 text-left text-zinc-400 font-medium">
									Rate
								</th>
								<th className="px-4 py-3 text-left text-zinc-400 font-medium">
									Min
								</th>
								<th className="px-4 py-3 text-left text-zinc-400 font-medium">
									Max
								</th>
								<th className="px-4 py-3 text-left text-zinc-400 font-medium">
									Delivery
								</th>
								<th className="px-4 py-3 text-left text-zinc-400 font-medium">
									Your Price
								</th>
								<th className="px-4 py-3 text-left text-zinc-400 font-medium">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={9} className="text-center py-8 text-zinc-500">
										<Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
										Loading...
									</td>
								</tr>
							) : services.length === 0 ? (
								<tr>
									<td colSpan={9} className="text-center py-8 text-zinc-500">
										No services available to import
									</td>
								</tr>
							) : (
								services.map((service) => {
									const isEditing = editingId === service.id;
									return (
										<tr
											key={service.id}
											className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
												service.selected ? "bg-emerald-500/5" : ""
											}`}
										>
											<td className="px-4 py-3">
												<input
													type="checkbox"
													checked={service.selected}
													onChange={() => toggleSelection(service.id)}
													className="w-4 h-4 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20"
												/>
											</td>
											<td className="px-4 py-3">
												{isEditing ? (
													<input
														value={editData.name || ""}
														onChange={(e) =>
															setEditData({ ...editData, name: e.target.value })
														}
														className="bg-black border border-white/10 text-white rounded px-2 py-1 text-sm w-full"
													/>
												) : (
													<span
														className="text-white truncate max-w-[200px] block"
														title={service.name}
													>
														{service.name}
													</span>
												)}
											</td>
											<td className="px-4 py-3">
												{isEditing ? (
													<input
														value={editData.category || ""}
														onChange={(e) =>
															setEditData({
																...editData,
																category: e.target.value,
															})
														}
														className="bg-black border border-white/10 text-white rounded px-2 py-1 text-sm w-full"
													/>
												) : (
													<span className="text-zinc-300 truncate max-w-[150px] block">
														{service.category}
													</span>
												)}
											</td>
											<td className="px-4 py-3">
												{isEditing ? (
													<input
														type="number"
														value={editData.rate ?? ""}
														onChange={(e) =>
															setEditData({
																...editData,
																rate: parseFloat(e.target.value),
															})
														}
														className="bg-black border border-white/10 text-white rounded px-2 py-1 text-sm w-20"
													/>
												) : (
													<span className="text-zinc-300">
														${service.rate.toFixed(2)}
													</span>
												)}
											</td>
											<td className="px-4 py-3">
												{isEditing ? (
													<input
														type="number"
														value={editData.min_qty ?? ""}
														onChange={(e) =>
															setEditData({
																...editData,
																min_qty: parseInt(e.target.value),
															})
														}
														className="bg-black border border-white/10 text-white rounded px-2 py-1 text-sm w-16"
													/>
												) : (
													<span className="text-zinc-300">
														{service.min_qty}
													</span>
												)}
											</td>
											<td className="px-4 py-3">
												{isEditing ? (
													<input
														type="number"
														value={editData.max_qty ?? ""}
														onChange={(e) =>
															setEditData({
																...editData,
																max_qty: parseInt(e.target.value),
															})
														}
														className="bg-black border border-white/10 text-white rounded px-2 py-1 text-sm w-16"
													/>
												) : (
													<span className="text-zinc-300">
														{service.max_qty}
													</span>
												)}
											</td>
											<td className="px-4 py-3">
												{isEditing ? (
													<input
														value={editData.avg_time || ""}
														onChange={(e) =>
															setEditData({
																...editData,
																avg_time: e.target.value,
															})
														}
														className="bg-black border border-white/10 text-white rounded px-2 py-1 text-sm w-24"
													/>
												) : (
													<span className="text-zinc-400 text-xs">
														{service.avg_time || "N/A"}
													</span>
												)}
											</td>
											<td className="px-4 py-3">
												{isEditing ? (
													<input
														type="number"
														value={editData.price_per_1000 ?? ""}
														onChange={(e) =>
															setEditData({
																...editData,
																price_per_1000: parseFloat(e.target.value),
															})
														}
														className="bg-black border border-white/10 text-white rounded px-2 py-1 text-sm w-20"
													/>
												) : (
													<span className="text-emerald-400 font-bold">
														${service.price_per_1000.toFixed(2)}
													</span>
												)}
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center gap-1">
													{isEditing ? (
														<>
															<button
																onClick={() => saveEdit(service.id)}
																className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
																title="Save"
															>
																<Save className="h-3.5 w-3.5" />
															</button>
															<button
																onClick={() => {
																	setEditingId(null);
																	setEditData({});
																}}
																className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
																title="Cancel"
															>
																<X className="h-3.5 w-3.5" />
															</button>
														</>
													) : (
														<>
															<button
																onClick={() => startEditing(service)}
																className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
																title="Edit"
															>
																<Edit className="h-3.5 w-3.5" />
															</button>
															<button
																onClick={() => deleteService(service.id)}
																className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
																title="Delete"
															>
																<Trash2 className="h-3.5 w-3.5" />
															</button>
														</>
													)}
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* ─── Footer Stats ────────────────────────────────────────────── */}
			<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
				<div className="flex items-center gap-4">
					<span>
						Total: <span className="text-white">{services.length}</span>
					</span>
					<span>
						Selected: <span className="text-emerald-400">{selectedCount}</span>
					</span>
					<span>
						Already imported:{" "}
						<span className="text-zinc-400">{totalImported}</span>
					</span>
				</div>
				<span className="text-zinc-600">
					{services.filter((s) => s.selected).length} services ready for import
				</span>
			</div>
		</div>
	);
}
