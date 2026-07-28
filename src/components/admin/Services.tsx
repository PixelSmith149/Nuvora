"use client";

import {
	AlertCircle,
	Globe,
	Plus,
	RotateCw,
	Search,
	ShoppingBag,
	Tag,
	Trash2,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
	type CatalogServiceRecord,
	deleteCatalogService,
	fetchCatalogServices,
	insertCatalogService,
	updateCatalogServiceField,
} from "@/app/[tech]/admin-dashboard/services-catalog/actions";
import { cn } from "@/lib/utils";

export default function Services() {
	const [services, setServices] = useState<CatalogServiceRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [showInsertForm, setShowInsertForm] = useState(false);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Focus reference trackers for double-click mutations
	const [editingCell, setEditingCell] = useState<{
		id: string;
		field: keyof CatalogServiceRecord;
	} | null>(null);
	const [editValue, setEditValue] = useState("");

	// Clean initialization payload states matching all target database columns
	const [form, setForm] = useState({
		provider_service_id: "",
		platform: "",
		service_type: "",
		title: "",
		description: "",
		price_per_1000: "",
		active: true,
	});

	useEffect(() => {
		loadCatalogData();
	}, []);

	const loadCatalogData = async () => {
		setLoading(true);
		setErrorMessage(null);
		try {
			const data = await fetchCatalogServices();
			setServices(data);
		} catch (err: any) {
			setErrorMessage(
				err?.message ||
					"Critical execution failure reading active services mapping registry.",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setActionLoading("creating");
		setErrorMessage(null);

		// Tight confirmation checks for mandatory non-nullable strings
		if (
			!form.platform.trim() ||
			!form.service_type.trim() ||
			!form.title.trim() ||
			!form.price_per_1000.trim()
		) {
			setErrorMessage(
				"Required field validation error: All core data attributes must be supplied.",
			);
			setActionLoading(null);
			return;
		}

		// Process linked UUID format parameters safely
		let linkedProviderServiceId: string | null =
			form.provider_service_id.trim();
		if (!linkedProviderServiceId) {
			linkedProviderServiceId = null;
		} else {
			const uuidRegex =
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
			if (!uuidRegex.test(linkedProviderServiceId)) {
				setErrorMessage(
					"Format Mismatch: provider_service_id must be a completely valid structured UUID configuration string, or left totally blank.",
				);
				setActionLoading(null);
				return;
			}
		}

		const payload = {
			provider_service_id: linkedProviderServiceId,
			platform: form.platform.trim(),
			service_type: form.service_type.trim(),
			title: form.title.trim(),
			description: form.description.trim() ? form.description.trim() : null,
			price_per_1000: Number(form.price_per_1000) || 0.0,
			active: form.active,
		};

		try {
			const res = await insertCatalogService(payload);
			if (res.success && res.data) {
				setServices((prev) => [res.data!, ...prev]);
				setShowInsertForm(false);
				setForm({
					provider_service_id: "",
					platform: "",
					service_type: "",
					title: "",
					description: "",
					price_per_1000: "",
					active: true,
				});
			} else {
				setErrorMessage(
					res.error ||
						"Supabase database transaction constraint layer rejected this configuration row.",
				);
			}
		} catch (err: any) {
			setErrorMessage(
				err?.message ||
					"An unhandled transaction crash occurred during insertion.",
			);
		} finally {
			setActionLoading(null);
		}
	};

	const handleToggleChange = async (
		id: string,
		field: keyof CatalogServiceRecord,
		currentVal: boolean | null,
	) => {
		const newVal = !currentVal;
		setActionLoading(`${id}-${field}`);
		setErrorMessage(null);

		// Optimistic mutation tracking
		setServices((prev) =>
			prev.map((s) => (s.id === id ? { ...s, [field]: newVal } : s)),
		);

		try {
			const success = await updateCatalogServiceField(id, field, newVal);
			if (!success) {
				setServices((prev) =>
					prev.map((s) => (s.id === id ? { ...s, [field]: currentVal } : s)),
				);
				setErrorMessage(
					`Operational execution error: Failed to modify database state parameters on column '${field}'.`,
				);
			}
		} catch (err) {
			setServices((prev) =>
				prev.map((s) => (s.id === id ? { ...s, [field]: currentVal } : s)),
			);
			setErrorMessage(
				"Network pipeline failure triggered an automated data layer structural rollback action.",
			);
		} finally {
			setActionLoading(null);
		}
	};

	const startEditing = (
		id: string,
		field: keyof CatalogServiceRecord,
		initialValue: any,
	) => {
		setEditingCell({ id, field });
		setEditValue(String(initialValue ?? ""));
	};

	const saveInlineEdit = async (
		id: string,
		field: keyof CatalogServiceRecord,
	) => {
		if (!editingCell) return;
		const typedValue = editValue.trim();
		setErrorMessage(null);

		// Stop empty strings processing on mandatory non-nullable schema columns
		if (
			!typedValue &&
			(field === "platform" ||
				field === "service_type" ||
				field === "title" ||
				field === "price_per_1000")
		) {
			setErrorMessage(
				`Validation Error: The structural table column configuration attribute '${field}' cannot be empty.`,
			);
			setEditingCell(null);
			return;
		}

		let dynamicPayloadValue: any = typedValue;
		if (field === "price_per_1000") {
			dynamicPayloadValue = Number(typedValue);
			if (isNaN(dynamicPayloadValue)) {
				setErrorMessage(
					"Format Abort: pricing structures require structural numeric items.",
				);
				setEditingCell(null);
				return;
			}
		} else if (
			(field === "description" || field === "provider_service_id") &&
			!typedValue
		) {
			dynamicPayloadValue = null;
		}

		const originalRecord = services.find((s) => s.id === id);
		if (!originalRecord || originalRecord[field] === dynamicPayloadValue) {
			setEditingCell(null);
			return;
		}

		setActionLoading(id);
		setServices((prev) =>
			prev.map((s) =>
				s.id === id ? { ...s, [field]: dynamicPayloadValue } : s,
			),
		);
		setEditingCell(null);

		try {
			const success = await updateCatalogServiceField(
				id,
				field,
				dynamicPayloadValue,
			);
			if (!success) {
				if (originalRecord)
					setServices((prev) =>
						prev.map((s) =>
							s.id === id ? { ...s, [field]: originalRecord[field] } : s,
						),
					);
				setErrorMessage(
					`Database write constraint violation mapping changes directly on column property: ${field}`,
				);
			}
		} catch (err) {
			if (originalRecord)
				setServices((prev) =>
					prev.map((s) =>
						s.id === id ? { ...s, [field]: originalRecord[field] } : s,
					),
				);
			setErrorMessage(
				"State update routing halted due to an active engine lifecycle anomaly.",
			);
		} finally {
			setActionLoading(null);
		}
	};

	const handleRowDelete = async (id: string) => {
		if (
			!confirm(
				"Are you sure you want to drop this consumer-facing service row completely out of the storefront engine?",
			)
		)
			return;
		setActionLoading(`del-${id}`);
		setErrorMessage(null);

		try {
			const success = await deleteCatalogService(id);
			if (success) {
				setServices((prev) => prev.filter((s) => s.id !== id));
			} else {
				setErrorMessage(
					"Database pipeline permission violation: Dropping target line entry aborted.",
				);
			}
		} catch (err: any) {
			setErrorMessage(
				err?.message ||
					"Execution engine exception caught during structural row deletion.",
			);
		} finally {
			setActionLoading(null);
		}
	};

	const filteredServices = services.filter(
		(s) =>
			s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(s.description &&
				s.description.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	return (
		<div className="space-y-4">
			{/* 1. Dynamic Boundary Alert Banner Container */}
			{errorMessage && (
				<div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 font-mono text-xs animate-in fade-in slide-in-from-top-1">
					<AlertCircle className="h-4 w-4 shrink-0" />
					<div className="flex-1">
						<span className="font-bold uppercase mr-1">
							Schema Transaction Fault:
						</span>{" "}
						{errorMessage}
					</div>
					<button
						onClick={() => setErrorMessage(null)}
						className="hover:text-white transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			)}

			{/* 2. Top-Level Command Control Frame */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-white/[0.06]">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
					<input
						type="text"
						placeholder="Search catalog by title, channel platform, or type..."
						value={searchQuery}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setSearchQuery(e.target.value)
						}
						className="w-full bg-black border border-white/[0.06] rounded-xl pl-10 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-red-500/40 text-zinc-200"
					/>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowInsertForm(!showInsertForm)}
						className="flex items-center gap-1.5 px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold transition-all"
					>
						{showInsertForm ? (
							<X className="h-3.5 w-3.5" />
						) : (
							<Plus className="h-3.5 w-3.5" />
						)}
						{showInsertForm ? "Close Panel" : "Create Store Service"}
					</button>

					<button
						onClick={loadCatalogData}
						disabled={loading}
						className="p-2 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] rounded-xl text-zinc-400 hover:text-white transition-all"
					>
						<RotateCw
							className={cn("h-4 w-4", loading && "animate-spin text-red-400")}
						/>
					</button>
				</div>
			</div>

			{/* 3. Catalog Service Injection Drawer Panel Container */}
			{showInsertForm && (
				<form
					onSubmit={handleCreateSubmit}
					className="bg-zinc-950 border border-white/[0.06] p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
				>
					<div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
						<ShoppingBag className="h-4 w-4 text-red-400" />
						<h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
							Deploy Storefront Catalog Row Definition
						</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
						<div className="space-y-1">
							<label className="text-zinc-500">platform (text *Required)</label>
							<input
								required
								type="text"
								placeholder="e.g. Instagram"
								value={form.platform}
								onChange={(e) => setForm({ ...form, platform: e.target.value })}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-300"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-zinc-500">
								service_type (text *Required)
							</label>
							<input
								required
								type="text"
								placeholder="e.g. Followers"
								value={form.service_type}
								onChange={(e) =>
									setForm({ ...form, service_type: e.target.value })
								}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-300"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-zinc-500">
								price_per_1000 (numeric *Required)
							</label>
							<input
								required
								type="text"
								placeholder="e.g. 3.50"
								value={form.price_per_1000}
								onChange={(e) =>
									setForm({ ...form, price_per_1000: e.target.value })
								}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-emerald-400 font-bold"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-zinc-500">
								provider_service_id (uuid Nullable)
							</label>
							<input
								type="text"
								placeholder="Linked API row UUID if active"
								value={form.provider_service_id}
								onChange={(e) =>
									setForm({ ...form, provider_service_id: e.target.value })
								}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-400 text-[11px]"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
						<div className="md:col-span-1 space-y-1">
							<label className="text-zinc-500">title (text *Required)</label>
							<input
								required
								type="text"
								placeholder="Premium High Retention Speed Followers"
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-white font-sans"
							/>
						</div>
						<div className="md:col-span-2 space-y-1">
							<label className="text-zinc-500">
								description (text Nullable)
							</label>
							<input
								type="text"
								placeholder="Provide consumer ordering disclosures, system speed parameters, drops tracking metrics..."
								value={form.description}
								onChange={(e) =>
									setForm({ ...form, description: e.target.value })
								}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-400 font-sans"
							/>
						</div>
					</div>

					<div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
						<label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-400">
							<input
								type="checkbox"
								checked={form.active}
								onChange={(e) => setForm({ ...form, active: e.target.checked })}
								className="accent-emerald-500"
							/>
							Set Storefront Visibility Active
						</label>
						<button
							type="submit"
							disabled={actionLoading === "creating"}
							className="px-5 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold text-xs uppercase tracking-wider transition-all"
						>
							{actionLoading === "creating"
								? "Deploying..."
								: "Commit Storefront Service Line"}
						</button>
					</div>
				</form>
			)}

			{/* 4. Complete Storefront Spread Grid Viewport Matrix */}
			<div className="border border-white/[0.06] bg-zinc-950/20 rounded-2xl overflow-hidden shadow-2xl">
				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left text-xs font-mono whitespace-nowrap">
						<thead>
							<tr className="border-b border-white/[0.06] bg-zinc-950 text-zinc-500 uppercase tracking-wider text-[10px]">
								<th className="p-4 font-bold">id (uuid)</th>
								<th className="p-4 font-bold">Platform</th>
								<th className="p-4 font-bold">Type Classification</th>
								<th className="p-4 font-bold">Consumer Display Title</th>
								<th className="p-4 font-bold">Catalog Description Line</th>
								<th className="p-4 font-bold">Price per 1k</th>
								<th className="p-4 font-bold text-center">Active Display</th>
								<th className="p-4 font-bold">provider_service_id reference</th>
								<th className="p-4 font-bold">Created Timestamp</th>
								<th className="p-4 font-bold text-center">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/[0.04]">
							{loading ? (
								<tr>
									<td
										colSpan={10}
										className="p-12 text-center text-zinc-500 tracking-widest uppercase"
									>
										Streaming live production storefront services...
									</td>
								</tr>
							) : filteredServices.length === 0 ? (
								<tr>
									<td colSpan={10} className="p-12 text-center text-zinc-500">
										Zero active service lines mapped into dashboard schema.
									</td>
								</tr>
							) : (
								filteredServices.map((service) => (
									<tr
										key={service.id}
										className="hover:bg-white/[0.01] transition-colors group"
									>
										{/* id (Static primary target reference) */}
										<td
											className="p-4 text-zinc-600 text-[10px] select-all"
											title={service.id}
										>
											{service.id.substring(0, 8)}...
										</td>

										{/* platform column */}
										<td
											className="p-4 text-white font-bold"
											onDoubleClick={() =>
												startEditing(service.id, "platform", service.platform)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "platform" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() => saveInlineEdit(service.id, "platform")}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "platform")
													}
													autoFocus
													className="bg-black border border-red-500/40 rounded px-1.5 py-0.5 text-white outline-none"
												/>
											) : (
												<span className="px-2 py-1 bg-white/[0.03] border border-white/[0.04] rounded-md text-zinc-300 text-[11px] uppercase tracking-wide">
													{service.platform}
												</span>
											)}
										</td>

										{/* service_type column */}
										<td
											className="p-4 text-zinc-400"
											onDoubleClick={() =>
												startEditing(
													service.id,
													"service_type",
													service.service_type,
												)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "service_type" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() =>
														saveInlineEdit(service.id, "service_type")
													}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "service_type")
													}
													autoFocus
													className="bg-black border border-red-500/40 rounded px-1.5 py-0.5 text-white outline-none"
												/>
											) : (
												service.service_type
											)}
										</td>

										{/* title column */}
										<td
											className="p-4 font-sans text-white font-medium max-w-xs truncate"
											onDoubleClick={() =>
												startEditing(service.id, "title", service.title)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "title" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() => saveInlineEdit(service.id, "title")}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "title")
													}
													autoFocus
													className="w-full bg-black border border-red-500/40 rounded px-2 py-0.5 text-white outline-none font-sans"
												/>
											) : (
												<span className="group-hover:text-red-400 transition-colors">
													{service.title}
												</span>
											)}
										</td>

										{/* description column (Nullable text block) */}
										<td
											className="p-4 font-sans text-zinc-500 max-w-xs truncate"
											onDoubleClick={() =>
												startEditing(
													service.id,
													"description",
													service.description || "",
												)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "description" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() =>
														saveInlineEdit(service.id, "description")
													}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "description")
													}
													autoFocus
													className="w-80 bg-black border border-red-500/40 rounded px-2 py-0.5 text-zinc-300 text-xs outline-none font-sans"
												/>
											) : (
												service.description || (
													<span className="text-zinc-800 italic font-mono text-[11px]">
														null
													</span>
												)
											)}
										</td>

										{/* price_per_1000 column */}
										<td
											className="p-4 text-emerald-400 font-bold"
											onDoubleClick={() =>
												startEditing(
													service.id,
													"price_per_1000",
													service.price_per_1000,
												)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "price_per_1000" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() =>
														saveInlineEdit(service.id, "price_per_1000")
													}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "price_per_1000")
													}
													autoFocus
													className="w-16 bg-black text-center border border-red-500/40 text-emerald-400 outline-none rounded"
												/>
											) : (
												`$${service.price_per_1000.toFixed(2)}`
											)}
										</td>

										{/* active boolean tracking control switch */}
										<td className="p-4 text-center">
											<input
												type="checkbox"
												checked={!!service.active}
												disabled={actionLoading === `${service.id}-active`}
												onChange={() =>
													handleToggleChange(
														service.id,
														"active",
														service.active,
													)
												}
												className="h-3.5 w-3.5 accent-emerald-500 bg-black cursor-pointer border-white/[0.1] disabled:opacity-30"
											/>
										</td>

										{/* provider_service_id column link reference (Nullable UUID mapping entry) */}
										<td
											className="p-4 text-zinc-600 text-[10px] font-mono"
											onDoubleClick={() =>
												startEditing(
													service.id,
													"provider_service_id",
													service.provider_service_id || "",
												)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "provider_service_id" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() =>
														saveInlineEdit(service.id, "provider_service_id")
													}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "provider_service_id")
													}
													autoFocus
													className="w-48 bg-black border border-red-500/40 rounded px-1.5 text-zinc-300 outline-none"
												/>
											) : service.provider_service_id ? (
												<span
													className="text-zinc-400 border border-white/[0.04] px-1.5 py-0.5 bg-white/[0.01] rounded"
													title={service.provider_service_id}
												>
													🔗 {service.provider_service_id.substring(0, 8)}...
												</span>
											) : (
												<span className="text-zinc-800 italic">unlinked</span>
											)}
										</td>

										{/* created_at timestamp column metadata */}
										<td className="p-4 text-zinc-600 text-[11px]">
											{service.created_at
												? new Date(service.created_at).toLocaleString([], {
														month: "short",
														day: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													})
												: "—"}
										</td>

										{/* Action Panel Delete Activation Trigger */}
										<td className="p-4 text-center">
											<button
												onClick={() => handleRowDelete(service.id)}
												disabled={actionLoading === `del-${service.id}`}
												className="p-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-30"
												title="Delete Storefront Catalog Service Line"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
