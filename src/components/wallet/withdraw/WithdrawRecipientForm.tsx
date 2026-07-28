"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	type CountryOption,
	GLOBAL_COUNTRIES,
} from "@/lib/wallet/countriesData";
import type { WithdrawDraft } from "@/lib/wallet/types";
// Import your exact backend fee utility helper here
import { getExactPaystackFee } from "@/lib/wallet/withdraw/fee.resolver";

type Props = {
	value: WithdrawDraft;
	onBack: () => void;
	onNext: (draft: Partial<WithdrawDraft>) => void;
};

export default function WithdrawRecipientForm({
	value,
	onBack,
	onNext,
}: Props) {
	const [country, setCountry] = useState(value.country ?? "");
	const [provider, setProvider] = useState(value.provider ?? "");
	const [phone, setPhone] = useState(value.account_number ?? "");
	const [accountName, setAccountName] = useState(value.account_name ?? "");
	const [bankCode, setBankCode] = useState(value.bank_code ?? "");

	// Custom Selector Dropdown View Management State States
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedCountry = useMemo(
		() => GLOBAL_COUNTRIES.find((c) => c.code === country),
		[country],
	);

	// Filter country records dynamically matching text query inputs
	const filteredCountries = useMemo(() => {
		return GLOBAL_COUNTRIES.filter(
			(c) =>
				c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.currency.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [searchQuery]);

	const providers = useMemo(() => {
		if (!selectedCountry || !value.method) return [];
		const methodsBlock =
			selectedCountry.methods[
				value.method as keyof typeof selectedCountry.methods
			];
		return methodsBlock ?? [];
	}, [selectedCountry, value.method]);

	// Dynamically resolve Paystack fees using your exact utility function
	const resolvedFeeInfo = useMemo(() => {
		if (!selectedCountry) return { fee: 0, formatted: "0.00" };

		const currencyCode = selectedCountry.currency.toUpperCase();
		const amount = Number(value.payoutAmount) || 0;

		// Call the exact fee resolver
		const calculatedFee = getExactPaystackFee(amount, currencyCode);

		// Custom label for CFA currencies
		const suffix =
			currencyCode === "XOF" || currencyCode === "XAF" ? "CFA" : currencyCode;

		return {
			fee: calculatedFee,
			formatted: `${calculatedFee.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${suffix}`,
		};
	}, [selectedCountry, value.payoutAmount]);

	// Handle clicking outside custom menu boundaries to close view safely
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		setProvider("");
	}, [country]);

	function continueNext() {
		if (!selectedCountry) {
			alert("Please choose a destination country.");
			return;
		}

		if (!phone) {
			const fieldLabel =
				value.method === "crypto"
					? "wallet address"
					: "account destination string";
			alert(`Please input a valid recipient ${fieldLabel}.`);
			return;
		}

		if (
			(value.method === "momo" ||
				value.method === "bank" ||
				value.method === "crypto") &&
			providers.length > 0 &&
			!provider
		) {
			alert("Please select a specific network provider option.");
			return;
		}

		onNext({
			country: selectedCountry.code,
			currency: selectedCountry.currency,
			provider: provider || undefined,
			account_number: phone,
			account_name: accountName || undefined,
			bank_code: bankCode || undefined,
			// Pass along the newly evaluated pipeline fee parameter
			fee: resolvedFeeInfo.fee,
		});
	}

	return (
		<section className="space-y-8 max-w-xl mx-auto">
			<div>
				<h2 className="text-3xl font-black uppercase tracking-tight">Payout</h2>
				<p className="mt-2 text-zinc-400 text-sm">
					Setup destination parameters for your active{" "}
					<span className="text-white font-bold underline uppercase">
						{value.method}
					</span>{" "}
					processing channel.
				</p>
			</div>

			<div className="rounded-3xl border border-white/10 bg-zinc-950 p-6 space-y-6">
				{/* CUSTOM SEARCHABLE BEAUTIFUL DROPDOWN SELECTOR BLOCK */}
				<div className="relative space-y-2" ref={dropdownRef}>
					<label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider">
						Destination Jurisdiction
					</label>

					<button
						type="button"
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black px-4 py-3.5 text-sm font-bold transition hover:border-white/20 text-left outline-none focus:border-white/40"
					>
						{selectedCountry ? (
							<div className="flex items-center gap-3">
								<span className="text-xl leading-none">
									{selectedCountry.flag}
								</span>
								<span>{selectedCountry.name}</span>
								<span className="text-xs text-zinc-500 font-mono">
									({selectedCountry.currency})
								</span>
							</div>
						) : (
							<span className="text-zinc-500 font-normal">
								Choose target regional routing destination...
							</span>
						)}

						<svg
							className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2.5}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>

					{/* DYNAMIC DROPDOWN MODAL WINDOW MATRIX CONTAINER */}
					{isDropdownOpen && (
						<div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-white/10 bg-zinc-950 p-2 shadow-2xl backdrop-blur-md transition-all">
							<div className="sticky top-0 pb-2 bg-zinc-950">
								<input
									type="text"
									autoFocus
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Type country name, currency code, token..."
									className="w-full rounded-lg border border-white/5 bg-black px-3 py-2 text-xs font-medium text-white outline-none focus:border-white/20 font-mono"
								/>
							</div>

							<div className="space-y-1 pt-1">
								{filteredCountries.length > 0 ? (
									filteredCountries.map((c) => (
										<button
											key={c.code}
											type="button"
											onClick={() => {
												setCountry(c.code);
												setIsDropdownOpen(false);
												setSearchQuery("");
											}}
											className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold uppercase transition text-left ${
												country === c.code
													? "bg-white text-black"
													: "text-zinc-400 hover:bg-white/5 hover:text-white"
											}`}
										>
											<span className="text-lg leading-none">{c.flag}</span>
											<span className="flex-1 truncate">{c.name}</span>
											<span
												className={`font-mono text-[10px] ${country === c.code ? "text-zinc-700" : "text-zinc-500"}`}
											>
												{c.currency}
											</span>
										</button>
									))
								) : (
									<p className="p-3 text-center text-xs text-zinc-600 font-medium">
										No operational regions matched.
									</p>
								)}
							</div>
						</div>
					)}
				</div>

				{/* NETWORK & PROVIDER LAYER */}
				{selectedCountry && providers.length > 0 && (
					<div>
						<label className="mb-2 block text-xs font-bold uppercase text-zinc-500 tracking-wider">
							{value.method === "momo" && "Network Carrier"}
							{value.method === "bank" && "Banking Institution"}
							{value.method === "crypto" && "Asset Settlement Sub-Rail"}
							{value.method === "card" && "Card Network Processor"}
						</label>
						<select
							value={provider}
							onChange={(e) => setProvider(e.target.value)}
							className="w-full rounded-xl border border-white/10 bg-black px-4 py-3.5 text-sm font-bold uppercase focus:border-white/30 outline-none"
						>
							<option value="">Select Option</option>
							{providers.map((p) => (
								<option key={p} value={p}>
									{p}
								</option>
							))}
						</select>
					</div>
				)}

				{/* ACCOUNT DESTINATION PARAMETERS LAYOUTS MATRIX */}
				{selectedCountry && (
					<div className="space-y-4">
						<div>
							<label className="mb-2 block text-xs font-bold uppercase text-zinc-500 tracking-wider">
								{value.method === "momo" && "Mobile Money Phone Number"}
								{value.method === "bank" && "Account Core Number"}
								{value.method === "crypto" && "Target Destination Hash Address"}
								{value.method === "card" && "16 Digit Plastic Card Identifier"}
							</label>
							<input
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className="w-full rounded-xl border border-white/10 bg-black px-4 py-3.5 text-sm font-mono outline-none focus:border-white/30"
								placeholder={
									value.method === "crypto"
										? "Paste secure address string hex..."
										: "Enter destination account identification string..."
								}
							/>
						</div>

						{/* BANK SPECIFIC PARAMETERS CONDITIONAL FRAMEWORK */}
						{value.method === "bank" && (
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label className="mb-2 block text-xs font-bold uppercase text-zinc-500 tracking-wider">
										Account Holder Name
									</label>
									<input
										value={accountName}
										onChange={(e) => setAccountName(e.target.value)}
										placeholder="e.g., John Doe"
										className="w-full rounded-xl border border-white/10 bg-black px-4 py-3.5 text-sm outline-none focus:border-white/30"
									/>
								</div>
								<div>
									<label className="mb-2 block text-xs font-bold uppercase text-zinc-500 tracking-wider">
										Routing Sort / Bank Code
									</label>
									<input
										value={bankCode}
										onChange={(e) => setBankCode(e.target.value)}
										placeholder="e.g., Swift or Sort Code"
										className="w-full rounded-xl border border-white/10 bg-black px-4 py-3.5 text-sm font-mono outline-none focus:border-white/30"
									/>
								</div>
							</div>
						)}
					</div>
				)}

				{/* DYNAMIC TRANSACTION BREAKDOWN SUMMARY CARD (FEE DEBIT TRANSPARENCY NOTICE) */}
				{selectedCountry && (
					<div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4 text-xs space-y-2.5">
						<div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wide">
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2.5}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>Ledger Fee Notice</span>
						</div>
						<p className="text-zinc-400 leading-relaxed font-medium">
							To deliver exactly{" "}
							<span className="text-white font-bold">
								{(Number(value.payoutAmount) || 0).toLocaleString()}{" "}
								{selectedCountry.currency}
							</span>{" "}
							to your destination account, our gateway processes an add-on
							network processing fee.
						</p>
						<div className="pt-2 border-t border-white/5 font-mono space-y-1.5 text-zinc-400">
							<div className="flex justify-between">
								<span>Requested Transfer Net Payout:</span>
								<span className="text-white font-bold">
									+{(Number(value.payoutAmount) || 0).toLocaleString()}{" "}
									{selectedCountry.currency}
								</span>
							</div>
							<div className="flex justify-between text-amber-400/90">
								<span>Network Corridor Processing Charge:</span>
								<span>+{resolvedFeeInfo.formatted}</span>
							</div>
							<div className="flex justify-between pt-1.5 border-t border-white/10 text-white font-bold text-sm">
								<span className="uppercase font-sans tracking-tight">
									Total Wallet Balance Drop:
								</span>
								<span>
									{(
										(Number(value.payoutAmount) || 0) + resolvedFeeInfo.fee
									).toLocaleString()}{" "}
									{selectedCountry.currency}
								</span>
							</div>
						</div>
					</div>
				)}

				{/* NAVIGATIONAL FOOTER TERMINALS */}
				<div className="flex justify-between pt-4 gap-4">
					<button
						type="button"
						onClick={onBack}
						className="rounded-xl border border-white/10 px-6 py-3.5 text-sm font-bold tracking-wide transition active:scale-[0.98] hover:bg-white/5 text-zinc-400 hover:text-white"
					>
						Back
					</button>

					<button
						type="button"
						onClick={continueNext}
						className="flex-1 rounded-xl bg-white px-8 py-3.5 font-black text-black text-sm tracking-wide transition active:scale-[0.99] hover:bg-zinc-200"
					>
						Validate & Continue
					</button>
				</div>
			</div>
		</section>
	);
}
