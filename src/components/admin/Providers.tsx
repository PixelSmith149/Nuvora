"use client";

import {
	AlertCircle,
	Cpu,
	Key,
	Link2,
	Plus,
	RotateCw,
	Search,
	Trash2,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
	deleteProvider,
	fetchProviders,
	insertProvider,
	type ProviderRegistryRecord,
	updateProviderField,
} from "@/app/[tech]/admin-dashboard/providers/action";
import { cn } from "@/lib/utils";

export default function Providers() {
	const [providers, setProviders] = useState<ProviderRegistryRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [showInsertForm, setShowInsertForm] = useState(false);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Focus tracking reference frames for live inline editing
	const [editingCell, setEditingCell] = useState<{
		id: string;
		field: keyof ProviderRegistryRecord;
	} | null>(null);
	const [editValue, setEditValue] = useState("");

	// Creation State conforming exactly to column parameters
	const [form, setForm] = useState({
		name: "",
		api_url: "",
		api_key: "",
		active: true,
	});

	useEffect(() => {
		loadProvidersData();
	}, []);

	const loadProvidersData = async () => {
		setLoading(true);
		setErrorMessage(null);
		try {
			const data = await fetchProviders();
			setProviders(data);
		} catch (err: any) {
			setErrorMessage(
				err?.message ||
					"Critical connection error while querying backend schema matrix.",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setActionLoading("creating");
		setErrorMessage(null);

		// Strict validation strings check
		if (!form.name.trim() || !form.api_url.trim() || !form.api_key.trim()) {
			setErrorMessage(
				"All non-nullable database attributes must be explicitly supplied.",
			);
			setActionLoading(null);
			return;
		}

		const payload = {
			name: form.name.trim(),
			api_url: form.api_url.trim(),
			api_key: form.api_key.trim(),
			active: form.active,
		};

		try {
			const res = await insertProvider(payload);
			if (res.success && res.data) {
				setProviders((prev) => [res.data!, ...prev]);
				setShowInsertForm(false);
				setForm({ name: "", api_url: "", api_key: "", active: true });
			} else {
				setErrorMessage(
					res.error ||
						"Supabase rejected the database row insertion constraint layer.",
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
		field: keyof ProviderRegistryRecord,
		currentVal: boolean | null,
	) => {
		const newVal = !currentVal;
		setActionLoading(`${id}-${field}`);
		setErrorMessage(null);

		// Optimistic state swap
		setProviders((prev) =>
			prev.map((p) => (p.id === id ? { ...p, [field]: newVal } : p)),
		);

		try {
			const success = await updateProviderField(id, field, newVal);
			if (!success) {
				// Rollback state instantly on pipeline mismatch
				setProviders((prev) =>
					prev.map((p) => (p.id === id ? { ...p, [field]: currentVal } : p)),
				);
				setErrorMessage(
					`Operational pipeline failure: Could not update boolean property '${field}'.`,
				);
			}
		} catch (err) {
			setProviders((prev) =>
				prev.map((p) => (p.id === id ? { ...p, [field]: currentVal } : p)),
			);
			setErrorMessage(
				"Network context fault triggered an immediate data layer rollback sequence.",
			);
		} finally {
			setActionLoading(null);
		}
	};

	const startEditing = (
		id: string,
		field: keyof ProviderRegistryRecord,
		initialValue: any,
	) => {
		setEditingCell({ id, field });
		setEditValue(String(initialValue ?? ""));
	};

	const saveInlineEdit = async (
		id: string,
		field: keyof ProviderRegistryRecord,
	) => {
		if (!editingCell) return;
		const typedValue = editValue.trim();
		setErrorMessage(null);

		// Trap structural layout errors before blasting mutations to endpoints
		if (
			!typedValue &&
			(field === "name" || field === "api_url" || field === "api_key")
		) {
			setErrorMessage(
				`Validation Fault: The mandatory data attribute column '${field}' cannot be empty.`,
			);
			setEditingCell(null);
			return;
		}

		// Capture fallback rollback cache target reference state
		const originalRecord = providers.find((p) => p.id === id);
		if (!originalRecord || originalRecord[field] === typedValue) {
			setEditingCell(null);
			return;
		}

		setActionLoading(id);
		// Optimistic updates for clean UI reactivity transitions
		setProviders((prev) =>
			prev.map((p) => (p.id === id ? { ...p, [field]: typedValue } : p)),
		);
		setEditingCell(null);

		try {
			const success = await updateProviderField(id, field, typedValue);
			if (!success) {
				if (originalRecord)
					setProviders((prev) =>
						prev.map((p) =>
							p.id === id ? { ...p, [field]: originalRecord[field] } : p,
						),
					);
				setErrorMessage(
					`Unique value constraint violation or internal database failure editing column: ${field}`,
				);
			}
		} catch (err) {
			if (originalRecord)
				setProviders((prev) =>
					prev.map((p) =>
						p.id === id ? { ...p, [field]: originalRecord[field] } : p,
					),
				);
			setErrorMessage(
				"System state update pipeline disrupted. Reverting layout value grid inline.",
			);
		} finally {
			setActionLoading(null);
		}
	};

	const handleRowDelete = async (id: string) => {
		if (
			!confirm(
				"Are you sure you want to completely erase this provider connection instance? All cascading operations may be halted.",
			)
		)
			return;
		setActionLoading(`del-${id}`);
		setErrorMessage(null);

		try {
			const success = await deleteProvider(id);
			if (success) {
				setProviders((prev) => prev.filter((p) => p.id !== id));
			} else {
				setErrorMessage(
					"ForeignKey violation or permission mapping error: Cannot terminate target row.",
				);
			}
		} catch (err: any) {
			setErrorMessage(
				err?.message ||
					"Execution engine exception caught during cascade drops.",
			);
		} finally {
			setActionLoading(null);
		}
	};

	const filteredProviders = providers.filter(
		(p) =>
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.api_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.id.includes(searchQuery),
	);

	return (
		<div className="space-y-4">
			{/* Dynamic Security Boundary Error Banner Alert */}
			{errorMessage && (
				<div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 font-mono text-xs animate-in fade-in slide-in-from-top-1">
					<AlertCircle className="h-4 w-4 shrink-0" />
					<div className="flex-1">
						<span className="font-bold uppercase mr-1">
							System Exception Fault:
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

			{/* 1. Header Toolbar Assembly */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-white/[0.06]">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
					<input
						type="text"
						placeholder="Search providers by nickname, endpoint URL or key hash..."
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
						{showInsertForm ? "Close Drawer" : "Register API Endpoint"}
					</button>

					<button
						onClick={loadProvidersData}
						disabled={loading}
						className="p-2 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] rounded-xl text-zinc-400 hover:text-white transition-all"
					>
						<RotateCw
							className={cn("h-4 w-4", loading && "animate-spin text-red-400")}
						/>
					</button>
				</div>
			</div>

			{/* 2. Structured Connection Drawer Form */}
			{showInsertForm && (
				<form
					onSubmit={handleCreateSubmit}
					className="bg-zinc-950 border border-white/[0.06] p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
				>
					<div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
						<Cpu className="h-4 w-4 text-red-400" />
						<h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
							Register Wholesale API Node
						</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
						<div className="space-y-1">
							<label className="text-zinc-500">Provider Label Name</label>
							<input
								required
								type="text"
								placeholder="e.g. SMM_HQ_MAIN"
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 focus:outline-none text-zinc-300 font-sans text-xs"
							/>
						</div>
						<div className="space-y-1 md:col-span-2">
							<label className="text-zinc-500">
								API Endpoint target URL (Must be Unique)
							</label>
							<div className="relative">
								<Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
								<input
									required
									type="url"
									placeholder="https://api-provider-domain.com/v2"
									value={form.api_url}
									onChange={(e) =>
										setForm({ ...form, api_url: e.target.value })
									}
									className="w-full bg-black border border-white/[0.06] rounded-xl pl-9 pr-3 p-2.5 focus:outline-none text-zinc-300 font-mono text-xs"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-1 text-xs font-mono">
						<label className="text-zinc-500">
							Secret Connection Key / Auth Token Key Signature
						</label>
						<div className="relative">
							<Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
							<input
								required
								type="text"
								placeholder="your_secret_wholesaler_hex_token_sequence"
								value={form.api_key}
								onChange={(e) => setForm({ ...form, api_key: e.target.value })}
								className="w-full bg-black border border-white/[0.06] rounded-xl pl-9 pr-3 p-2.5 focus:outline-none text-zinc-300 font-mono text-xs"
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
							Mark Connection Active Immediately
						</label>
						<button
							type="submit"
							disabled={actionLoading === "creating"}
							className="px-5 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold text-xs uppercase tracking-wider transition-all"
						>
							{actionLoading === "creating"
								? "Establishing..."
								: "Establish Endpoint Pipeline"}
						</button>
					</div>
				</form>
			)}

			{/* 3. Main Data Spread Grid Layout Table */}
			<div className="border border-white/[0.06] bg-zinc-950/20 rounded-2xl overflow-hidden shadow-2xl">
				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left text-xs font-mono whitespace-nowrap">
						<thead>
							<tr className="border-b border-white/[0.06] bg-zinc-950 text-zinc-500 uppercase tracking-wider text-[10px]">
								<th className="p-4 font-bold">id (uuid)</th>
								<th className="p-4 font-bold">Provider Nickname Label</th>
								<th className="p-4 font-bold">API Gateway URL (Unique)</th>
								<th className="p-4 font-bold">
									API Key String Verification Token
								</th>
								<th className="p-4 font-bold text-center">Connection Active</th>
								<th className="p-4 font-bold">Established Timestamp</th>
								<th className="p-4 font-bold text-center">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/[0.04]">
							{loading ? (
								<tr>
									<td
										colSpan={7}
										className="p-12 text-center text-zinc-500 tracking-widest uppercase"
									>
										Piping live data from providers database layout...
									</td>
								</tr>
							) : filteredProviders.length === 0 ? (
								<tr>
									<td colSpan={7} className="p-12 text-center text-zinc-500">
										Zero vendor instances matching search parameters.
									</td>
								</tr>
							) : (
								filteredProviders.map((provider) => (
									<tr
										key={provider.id}
										className="hover:bg-white/[0.01] transition-colors group"
									>
										{/* Primary Key Identifier */}
										<td
											className="p-4 text-zinc-600 text-[10px] select-all"
											title={provider.id}
										>
											{provider.id.substring(0, 8)}...
										</td>

										{/* name column */}
										<td
											className="p-4 font-sans text-white font-bold"
											onDoubleClick={() =>
												startEditing(provider.id, "name", provider.name)
											}
										>
											{editingCell?.id === provider.id &&
											editingCell?.field === "name" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
														setEditValue(e.target.value)
													}
													onBlur={() => saveInlineEdit(provider.id, "name")}
													onKeyDown={(
														e: React.KeyboardEvent<HTMLInputElement>,
													) =>
														e.key === "Enter" &&
														saveInlineEdit(provider.id, "name")
													}
													autoFocus
													className="bg-black border border-red-500/40 rounded px-2 py-0.5 text-white outline-none"
												/>
											) : (
												<span className="group-hover:text-red-400 transition-colors uppercase tracking-wide">
													{provider.name}
												</span>
											)}
										</td>

										{/* api_url column */}
										<td
											className="p-4 text-zinc-300 font-mono"
											onDoubleClick={() =>
												startEditing(provider.id, "api_url", provider.api_url)
											}
										>
											{editingCell?.id === provider.id &&
											editingCell?.field === "api_url" ? (
												<input
													type="url"
													value={editValue}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
														setEditValue(e.target.value)
													}
													onBlur={() => saveInlineEdit(provider.id, "api_url")}
													onKeyDown={(
														e: React.KeyboardEvent<HTMLInputElement>,
													) =>
														e.key === "Enter" &&
														saveInlineEdit(provider.id, "api_url")
													}
													autoFocus
													className="w-80 bg-black border border-red-500/40 rounded px-2 py-0.5 text-white text-xs outline-none font-mono"
												/>
											) : (
												provider.api_url
											)}
										</td>

										{/* api_key credential column */}
										<td
											className="p-4 text-zinc-500 font-mono text-xs max-w-xs truncate"
											onDoubleClick={() =>
												startEditing(provider.id, "api_key", provider.api_key)
											}
										>
											{editingCell?.id === provider.id &&
											editingCell?.field === "api_key" ? (
												<input
													type="text"
													value={editValue}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
														setEditValue(e.target.value)
													}
													onBlur={() => saveInlineEdit(provider.id, "api_key")}
													onKeyDown={(
														e: React.KeyboardEvent<HTMLInputElement>,
													) =>
														e.key === "Enter" &&
														saveInlineEdit(provider.id, "api_key")
													}
													autoFocus
													className="w-64 bg-black border border-red-500/40 rounded px-2 py-0.5 text-red-400 text-xs outline-none font-mono"
												/>
											) : (
												<span className="font-mono text-[11px] tracking-wider text-zinc-700">
													••••••••••••{provider.api_key.slice(-4)}
												</span>
											)}
										</td>

										{/* active switch boolean control */}
										<td className="p-4 text-center">
											<input
												type="checkbox"
												checked={!!provider.active}
												disabled={actionLoading === `${provider.id}-active`}
												onChange={() =>
													handleToggleChange(
														provider.id,
														"active",
														provider.active,
													)
												}
												className="h-3.5 w-3.5 accent-emerald-500 bg-black cursor-pointer border-white/[0.1] disabled:opacity-40"
											/>
										</td>

										{/* created_at column */}
										<td className="p-4 text-zinc-600 font-mono text-[11px]">
											{provider.created_at
												? new Date(provider.created_at).toLocaleString([], {
														month: "short",
														day: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													})
												: "—"}
										</td>

										{/* Row Deletion Trigger Action */}
										<td className="p-4 text-center">
											<button
												onClick={() => handleRowDelete(provider.id)}
												disabled={actionLoading === `del-${provider.id}`}
												className="p-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-30"
												title="Sever API Endpoint Node Connection"
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
