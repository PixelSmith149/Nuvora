"use client";

import {
	Database,
	Layers,
	Plus,
	RotateCw,
	Search,
	ShieldAlert,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	deleteProviderService,
	fetchProviderServices,
	insertProviderService,
	type ProviderServiceRecord,
	updateProviderServiceField,
} from "@/app/[tech]/admin-dashboard/provider-services/action";
import { cn } from "@/lib/utils";

export function AdminServiceSync() {
	const [services, setServices] = useState<ProviderServiceRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [showInsertForm, setShowInsertForm] = useState(false);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	// Focus reference anchors for cell-by-cell live editing
	const [editingCell, setEditingCell] = useState<{
		id: string;
		field: string;
	} | null>(null);
	const [editValue, setEditValue] = useState("");

	// Creation Form state matching the exact database schema column structures
	const [form, setForm] = useState({
		provider_id: "",
		external_service_id: "",
		name: "",
		category: "",
		rate: "",
		min_qty: "",
		max_qty: "",
		refill: false,
		cancel: false,
		active: true,
		raw: "",
	});

	useEffect(() => {
		loadTableData();
	}, []);

	const loadTableData = async () => {
		setLoading(true);
		try {
			const data = await fetchProviderServices();
			setServices(data);
		} catch (err) {
		} finally {
			setLoading(false);
		}
	};

	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setActionLoading("creating");

		// Form inputs strict schema conversion sequence
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(form.provider_id.trim())) {
			alert(
				"Database Write Aborted: 'provider_id' column must be a valid structured UUID format.",
			);
			setActionLoading(null);
			return;
		}

		let parsedRaw = null;
		if (form.raw.trim()) {
			try {
				parsedRaw = JSON.parse(form.raw);
			} catch (err) {
				alert(
					"Syntax Error: 'raw' jsonb block failed valid structural JSON object compilation.",
				);
				setActionLoading(null);
				return;
			}
		}

		// Explicit payload structural layout matching exact constraints
		const payload = {
			provider_id: form.provider_id.trim(),
			external_service_id: form.external_service_id.trim(),
			name: form.name.trim(),
			category: form.category.trim() ? form.category.trim() : null, // Nullable conversion
			rate: Number(form.rate) || 0.0,
			min_qty: parseInt(form.min_qty, 10) || 0,
			max_qty: parseInt(form.max_qty, 10) || 0,
			refill: form.refill, // Nullable boolean safely passing explicit state
			cancel: form.cancel,
			active: form.active,
			raw: parsedRaw, // Nullable jsonb pass-through
		};

		const res = await insertProviderService(payload);
		if (res.success && res.data) {
			setServices((prev) => [res.data!, ...prev]);
			setShowInsertForm(false);
			setForm({
				provider_id: "",
				external_service_id: "",
				name: "",
				category: "",
				rate: "",
				min_qty: "",
				max_qty: "",
				refill: false,
				cancel: false,
				active: true,
				raw: "",
			});
		} else {
			alert(`Supabase Schema Rejection Error: ${res.error}`);
		}
		setActionLoading(null);
	};

	const handleToggleChange = async (
		id: string,
		field: keyof ProviderServiceRecord,
		currentVal: boolean | null,
	) => {
		const newVal = !currentVal;
		setActionLoading(`${id}-${field}`);
		setServices((prev) =>
			prev.map((s) => (s.id === id ? { ...s, [field]: newVal } : s)),
		);

		const success = await updateProviderServiceField(id, field, newVal);
		if (!success) {
			setServices((prev) =>
				prev.map((s) => (s.id === id ? { ...s, [field]: currentVal } : s)),
			);
		}
		setActionLoading(null);
	};

	const startEditing = (id: string, field: string, initialValue: any) => {
		setEditingCell({ id, field });
		setEditValue(
			field === "raw" && initialValue
				? JSON.stringify(initialValue)
				: String(initialValue ?? ""),
		);
	};

	const saveInlineEdit = async (
		id: string,
		field: keyof ProviderServiceRecord,
	) => {
		if (!editingCell) return;
		let typedValue: any = editValue;

		if (field === "rate" || field === "min_qty" || field === "max_qty") {
			typedValue = Number(editValue);
			if (isNaN(typedValue)) return setEditingCell(null);
		} else if (field === "category" && !editValue.trim()) {
			typedValue = null;
		} else if (field === "raw") {
			try {
				typedValue = editValue.trim() ? JSON.parse(editValue) : null;
			} catch (e) {
				alert(
					"Syntax Error: 'raw' jsonb target requires strict structural objects.",
				);
				return setEditingCell(null);
			}
		}

		setActionLoading(id);
		const success = await updateProviderServiceField(id, field, typedValue);
		if (success) {
			setServices((prev) =>
				prev.map((s) => (s.id === id ? { ...s, [field]: typedValue } : s)),
			);
		}
		setEditingCell(null);
		setActionLoading(null);
	};

	const handleRowDelete = async (id: string) => {
		if (
			!confirm(
				"Are you sure you want to drop this row completely out of the database table?",
			)
		)
			return;
		setActionLoading(`del-${id}`);
		const success = await deleteProviderService(id);
		if (success) {
			setServices((prev) => prev.filter((s) => s.id !== id));
		}
		setActionLoading(null);
	};

	const filteredServices = services.filter(
		(s) =>
			s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(s.category &&
				s.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
			s.external_service_id.includes(searchQuery) ||
			s.provider_id.includes(searchQuery),
	);

	return (
		<div className="space-y-4">
			{/* 1. Header Global Control Module */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-white/[0.06]">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
					<input
						type="text"
						placeholder="Search provider_id, external_id, name, or category..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
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
						{showInsertForm ? "Close Panel" : "Insert Table Row"}
					</button>

					<button
						onClick={loadTableData}
						disabled={loading}
						className="p-2 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] rounded-xl text-zinc-400 hover:text-white transition-all"
					>
						<RotateCw
							className={cn("h-4 w-4", loading && "animate-spin text-red-400")}
						/>
					</button>
				</div>
			</div>

			{/* 2. Supabase Aligned Insertion Form Panel Drawer */}
			{showInsertForm && (
				<form
					onSubmit={handleCreateSubmit}
					className="bg-zinc-950 border border-white/[0.06] p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
				>
					<div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
						<Database className="h-4 w-4 text-red-400" />
						<h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
							New Record Schema Context Injection
						</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
						<div className="space-y-1">
							<label className="text-zinc-500">
								provider_id (uuid *Required)
							</label>
							<input
								required
								type="text"
								placeholder="00000000-0000-0000-0000-000000000000"
								value={form.provider_id}
								onChange={(e) =>
									setForm({ ...form, provider_id: e.target.value })
								}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-300 font-mono text-xs"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-zinc-500">
								external_service_id (text *Required)
							</label>
							<input
								required
								type="text"
								placeholder="e.g. 1042"
								value={form.external_service_id}
								onChange={(e) =>
									setForm({ ...form, external_service_id: e.target.value })
								}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-300"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-zinc-500">category (text Nullable)</label>
							<input
								type="text"
								placeholder="e.g. TikTok Views"
								value={form.category}
								onChange={(e) => setForm({ ...form, category: e.target.value })}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-300"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
						<div className="md:col-span-2 space-y-1">
							<label className="text-zinc-500">name (text *Required)</label>
							<input
								required
								type="text"
								placeholder="Organic Interface Reach Protocol Engine"
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-300 font-sans"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-zinc-500">rate (numeric *Required)</label>
							<input
								required
								type="text"
								placeholder="0.2450"
								value={form.rate}
								onChange={(e) => setForm({ ...form, rate: e.target.value })}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-300"
							/>
						</div>
						<div className="flex gap-2">
							<div className="flex-1 space-y-1">
								<label className="text-zinc-500">min_qty (int4)</label>
								<input
									required
									type="number"
									value={form.min_qty}
									onChange={(e) =>
										setForm({ ...form, min_qty: e.target.value })
									}
									className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-300 text-center"
								/>
							</div>
							<div className="flex-1 space-y-1">
								<label className="text-zinc-500">max_qty (int4)</label>
								<input
									required
									type="number"
									value={form.max_qty}
									onChange={(e) =>
										setForm({ ...form, max_qty: e.target.value })
									}
									className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-300 text-center"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-1 text-xs font-mono">
						<label className="text-zinc-500">raw (jsonb Object Nullable)</label>
						<textarea
							placeholder='{"custom_pipe": true, "speed": "instant"}'
							value={form.raw}
							onChange={(e) => setForm({ ...form, raw: e.target.value })}
							className="w-full h-16 bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-400 font-mono text-[11px]"
						/>
					</div>

					<div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
						<div className="flex gap-6 text-xs font-mono">
							<label className="flex items-center gap-2 cursor-pointer text-zinc-400">
								<input
									type="checkbox"
									checked={form.refill}
									onChange={(e) =>
										setForm({ ...form, refill: e.target.checked })
									}
									className="accent-red-500"
								/>{" "}
								refill
							</label>
							<label className="flex items-center gap-2 cursor-pointer text-zinc-400">
								<input
									type="checkbox"
									checked={form.cancel}
									onChange={(e) =>
										setForm({ ...form, cancel: e.target.checked })
									}
									className="accent-red-500"
								/>{" "}
								cancel
							</label>
							<label className="flex items-center gap-2 cursor-pointer text-zinc-400">
								<input
									type="checkbox"
									checked={form.active}
									onChange={(e) =>
										setForm({ ...form, active: e.target.checked })
									}
									className="accent-emerald-500"
								/>{" "}
								active
							</label>
						</div>
						<button
							type="submit"
							disabled={actionLoading === "creating"}
							className="px-5 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold text-xs uppercase tracking-wider transition-all"
						>
							Commit Row Matrix
						</button>
					</div>
				</form>
			)}

			{/* 3. Comprehensive Spread Grid Matrix Display */}
			<div className="border border-white/[0.06] bg-zinc-950/20 rounded-2xl overflow-hidden shadow-2xl">
				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left text-xs font-mono whitespace-nowrap">
						<thead>
							<tr className="border-b border-white/[0.06] bg-zinc-950 text-zinc-500 uppercase tracking-wider text-[10px]">
								<th className="p-4 font-bold">id (uuid)</th>
								<th className="p-4 font-bold">provider_id (uuid)</th>
								<th className="p-4 font-bold">external_service_id</th>
								<th className="p-4 font-bold">name (text)</th>
								<th className="p-4 font-bold">category (text)</th>
								<th className="p-4 font-bold">rate (numeric)</th>
								<th className="p-4 font-bold">min_qty</th>
								<th className="p-4 font-bold">max_qty</th>
								<th className="p-4 font-bold text-center">refill</th>
								<th className="p-4 font-bold text-center">cancel</th>
								<th className="p-4 font-bold text-center">active</th>
								<th className="p-4 font-bold">raw (jsonb)</th>
								<th className="p-4 font-bold">created_at</th>
								<th className="p-4 font-bold text-center">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/[0.04]">
							{loading ? (
								<tr>
									<td
										colSpan={14}
										className="p-12 text-center text-zinc-500 tracking-widest uppercase"
									>
										Querying active database table lines...
									</td>
								</tr>
							) : filteredServices.length === 0 ? (
								<tr>
									<td colSpan={14} className="p-12 text-center text-zinc-500">
										Zero database matching results discovered.
									</td>
								</tr>
							) : (
								filteredServices.map((service) => (
									<tr
										key={service.id}
										className="hover:bg-white/[0.01] transition-colors group"
									>
										{/* Primary Key ID (uuid, Static) */}
										<td
											className="p-4 text-zinc-600 font-mono text-[10px] select-all"
											title={service.id}
										>
											{service.id.substring(0, 8)}...
										</td>

										{/* provider_id (uuid, Inline editable) */}
										<td
											className="p-4 text-zinc-400 font-mono text-[10px]"
											onDoubleClick={() =>
												startEditing(
													service.id,
													"provider_id",
													service.provider_id,
												)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "provider_id" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() =>
														saveInlineEdit(service.id, "provider_id")
													}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "provider_id")
													}
													autoFocus
													className="bg-black border border-red-500/40 rounded px-1 font-mono text-[10px] text-white outline-none"
												/>
											) : (
												service.provider_id
											)}
										</td>

										{/* external_service_id (text) */}
										<td
											className="p-4 text-zinc-300 font-bold font-mono"
											onDoubleClick={() =>
												startEditing(
													service.id,
													"external_service_id",
													service.external_service_id,
												)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "external_service_id" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() =>
														saveInlineEdit(service.id, "external_service_id")
													}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "external_service_id")
													}
													autoFocus
													className="bg-black border border-red-500/40 rounded px-1 text-center text-white outline-none"
												/>
											) : (
												service.external_service_id
											)}
										</td>

										{/* name (text) */}
										<td
											className="p-4 font-sans text-white max-w-xs truncate"
											onDoubleClick={() =>
												startEditing(service.id, "name", service.name)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "name" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() => saveInlineEdit(service.id, "name")}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "name")
													}
													autoFocus
													className="w-full bg-black border border-red-500/40 rounded px-2 text-white outline-none"
												/>
											) : (
												<span className="group-hover:text-red-400 transition-colors">
													{service.name}
												</span>
											)}
										</td>

										{/* category (text, Nullable) */}
										<td
											className="p-4 text-zinc-400"
											onDoubleClick={() =>
												startEditing(
													service.id,
													"category",
													service.category || "",
												)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "category" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() => saveInlineEdit(service.id, "category")}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "category")
													}
													autoFocus
													className="bg-black border border-red-500/40 rounded px-1 text-white outline-none"
												/>
											) : (
												service.category || (
													<span className="text-zinc-700 italic">null</span>
												)
											)}
										</td>

										{/* rate (numeric) */}
										<td
											className="p-4 text-emerald-400 font-bold font-mono"
											onDoubleClick={() =>
												startEditing(service.id, "rate", service.rate)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "rate" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() => saveInlineEdit(service.id, "rate")}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "rate")
													}
													autoFocus
													className="w-16 bg-black text-center border border-red-500/40 text-emerald-400 outline-none rounded"
												/>
											) : (
												`$${service.rate.toFixed(4)}`
											)}
										</td>

										{/* min_qty (int4) */}
										<td
											className="p-4 text-zinc-500"
											onDoubleClick={() =>
												startEditing(service.id, "min_qty", service.min_qty)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "min_qty" ? (
												<input
													type="number"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() => saveInlineEdit(service.id, "min_qty")}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "min_qty")
													}
													autoFocus
													className="w-16 bg-black border border-red-500/40 rounded text-center text-white"
												/>
											) : (
												service.min_qty.toLocaleString()
											)}
										</td>

										{/* max_qty (int4) */}
										<td
											className="p-4 text-zinc-500"
											onDoubleClick={() =>
												startEditing(service.id, "max_qty", service.max_qty)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "max_qty" ? (
												<input
													type="number"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() => saveInlineEdit(service.id, "max_qty")}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "max_qty")
													}
													autoFocus
													className="w-20 bg-black border border-red-500/40 rounded text-center text-white"
												/>
											) : (
												service.max_qty.toLocaleString()
											)}
										</td>

										{/* refill (bool, Nullable switch) */}
										<td className="p-4 text-center">
											<input
												type="checkbox"
												checked={!!service.refill}
												onChange={() =>
													handleToggleChange(
														service.id,
														"refill",
														service.refill,
													)
												}
												className="h-3.5 w-3.5 accent-red-500 bg-black cursor-pointer border-white/[0.1]"
											/>
										</td>

										{/* cancel (bool, Nullable switch) */}
										<td className="p-4 text-center">
											<input
												type="checkbox"
												checked={!!service.cancel}
												onChange={() =>
													handleToggleChange(
														service.id,
														"cancel",
														service.cancel,
													)
												}
												className="h-3.5 w-3.5 accent-red-500 bg-black cursor-pointer border-white/[0.1]"
											/>
										</td>

										{/* active (bool, Nullable switch) */}
										<td className="p-4 text-center">
											<input
												type="checkbox"
												checked={!!service.active}
												onChange={() =>
													handleToggleChange(
														service.id,
														"active",
														service.active,
													)
												}
												className="h-3.5 w-3.5 accent-emerald-500 bg-black cursor-pointer border-white/[0.1]"
											/>
										</td>

										{/* raw (jsonb, Nullable string object block) */}
										<td
											className="p-4 text-zinc-600 max-w-xs truncate font-mono text-[11px]"
											onDoubleClick={() =>
												startEditing(service.id, "raw", service.raw)
											}
										>
											{editingCell?.id === service.id &&
											editingCell?.field === "raw" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={() => saveInlineEdit(service.id, "raw")}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														saveInlineEdit(service.id, "raw")
													}
													autoFocus
													className="w-full bg-black border border-red-500/40 rounded text-[11px] px-1 text-zinc-400 outline-none"
												/>
											) : service.raw ? (
												JSON.stringify(service.raw)
											) : (
												<span className="text-zinc-800 italic font-sans text-xs">
													null
												</span>
											)}
										</td>

										{/* created_at (timestamptz) */}
										<td className="p-4 text-zinc-600 font-mono text-[11px]">
											{service.created_at
												? new Date(service.created_at).toLocaleString([], {
														hour: "2-digit",
														minute: "2-digit",
														month: "short",
														day: "numeric",
													})
												: "—"}
										</td>

										{/* Action Row Delete Trigger */}
										<td className="p-4 text-center">
											<button
												onClick={() => handleRowDelete(service.id)}
												disabled={actionLoading === `del-${service.id}`}
												className="p-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
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
