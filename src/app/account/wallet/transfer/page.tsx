"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
	id: string;
	username: string;
	display_name: string | null;
	avatar_url: string | null;
};

export default function TransferPage() {
	const supabase = createClient();
	const router = useRouter();

	const [user, setUser] = useState<any>(null);
	const [users, setUsers] = useState<Profile[]>([]);
	const [toUserId, setToUserId] = useState("");
	const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
	const [amount, setAmount] = useState("");
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const dropdownRef = useRef<HTMLDivElement>(null);

	// 🔐 GET CURRENT USER
	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => {
			setUser(data.user);
		});
	}, []);

	// 🔍 TARGET SECURE RECIPIENTS API WITH DEBOUNCE
	useEffect(() => {
		const fetchRecipients = async () => {
			// Even if query is empty, let's fetch their initial followings so they can see options immediately on click
			try {
				const res = await fetch(
					`/api/wallet/transfer/recipients?q=${encodeURIComponent(query.trim())}`,
				);
				if (!res.ok) throw new Error("Failed to load network connections");

				const data = await res.json();
				setUsers(data.recipients || []);
			} catch (err) {
				console.error("Error fetching allowed recipients:", err);
				setUsers([]);
			}
		};

		const delay = setTimeout(fetchRecipients, 250);
		return () => clearTimeout(delay);
	}, [query]);

	// 🖱️ CLOSE DROPDOWN ON OUTSIDE CLICK
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

	// 💸 P2P TRANSFER ACTION
	const handleTransfer = async () => {
		if (!user) return;

		if (!toUserId || !amount) {
			alert("Please select a user from your network and input an amount.");
			return;
		}

		if (toUserId === user.id) {
			alert("You cannot transfer to yourself");
			return;
		}

		setLoading(true);

		try {
			const res = await fetch("/api/wallet/transfer", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					to_user_id: toUserId,
					amount: Number(amount),
				}),
			});

			const data = await res.json();

			if (!res.ok) throw new Error(data.error);

			alert("Transfer successful");
			router.push("/account");
		} catch (err: any) {
			alert(err.message || "Transfer failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen bg-black text-white px-6 py-24">
			<div className="mx-auto max-w-xl space-y-6">
				{/* HEADER */}
				<div>
					<h1 className="text-3xl font-black uppercase tracking-tight">
						Send Money
					</h1>
					<p className="text-sm text-zinc-400 mt-1">
						Transfer instantly to users in your network
					</p>
				</div>

				{/* RECIPIENT SEARCH SECTION */}
				<div className="relative space-y-2" ref={dropdownRef}>
					<label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider">
						Recipient (Network Following Only)
					</label>

					<div className="relative flex items-center">
						<input
							value={query}
							onFocus={() => setIsDropdownOpen(true)}
							onChange={(e) => {
								setQuery(e.target.value);
								setIsDropdownOpen(true);
							}}
							placeholder="Search by username or display name..."
							className="w-full p-4 rounded-xl bg-zinc-950 border border-white/10 outline-none text-sm font-medium focus:border-white/30 transition pr-12"
						/>
						{selectedUser && (
							<span className="absolute right-4 text-xs font-bold uppercase bg-white text-black px-2 py-1 rounded-md">
								Selected
							</span>
						)}
					</div>

					{/* DYNAMIC FOLLOWING MODAL DROPDOWN */}
					{isDropdownOpen && (
						<div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-white/10 bg-zinc-950 p-2 shadow-2xl backdrop-blur-md transition-all">
							{users.length > 0 ? (
								<div className="space-y-1">
									<p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 py-1">
										Connections Found ({users.length})
									</p>
									{users.map((u) => (
										<button
											key={u.id}
											type="button"
											onClick={() => {
												setToUserId(u.id);
												setSelectedUser(u);
												setQuery(u.username); // Populates field with the user handle
												setIsDropdownOpen(false);
											}}
											className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition text-left ${
												toUserId === u.id
													? "bg-white text-black font-bold"
													: "text-zinc-400 hover:bg-white/5 hover:text-white"
											}`}
										>
											<div>
												<p className="font-semibold text-sm">
													{u.display_name || u.username}
												</p>
												<p
													className={`text-xs font-mono ${toUserId === u.id ? "text-zinc-700" : "text-zinc-500"}`}
												>
													@{u.username}
												</p>
											</div>
											<span
												className={`text-[10px] font-mono ${toUserId === u.id ? "text-zinc-600" : "text-zinc-600"}`}
											>
												{u.id.substring(0, 8)}...
											</span>
										</button>
									))}
								</div>
							) : (
								<div className="p-4 text-center">
									<p className="text-xs text-zinc-500 font-medium">
										{query.trim() === ""
											? "You are not following anyone yet."
											: "No matching connections found in your network."}
									</p>
								</div>
							)}
						</div>
					)}
				</div>

				{/* VISUAL SELECTION CARD ACKNOWLEDGEMENT */}
				{selectedUser && (
					<div className="rounded-xl border border-white/5 bg-zinc-950/40 p-4 flex items-center justify-between">
						<div className="space-y-0.5">
							<span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
								Target Destination
							</span>
							<p className="text-sm font-bold text-white">
								{selectedUser.display_name || selectedUser.username}
							</p>
							<p className="text-xs font-mono text-zinc-400">
								@{selectedUser.username}
							</p>
						</div>
						<button
							onClick={() => {
								setToUserId("");
								setSelectedUser(null);
								setQuery("");
							}}
							className="text-xs font-bold text-zinc-500 hover:text-white uppercase transition tracking-tight"
						>
							Clear
						</button>
					</div>
				)}

				{/* AMOUNT */}
				<div className="space-y-2">
					<label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider">
						Transfer Amount
					</label>
					<div className="relative flex items-center">
						<span className="absolute left-4 font-mono font-bold text-sm text-zinc-500">
							USD
						</span>
						<input
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							className="w-full p-4 pl-14 rounded-xl bg-zinc-950 border border-white/10 outline-none text-sm font-mono focus:border-white/30 transition"
						/>
					</div>
				</div>

				{/* SEND BUTTON TERMINAL */}
				<button
					onClick={handleTransfer}
					disabled={loading}
					className="w-full bg-white text-black font-black uppercase text-sm tracking-wider py-4 rounded-xl transition active:scale-[0.99] hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none"
				>
					{loading ? "Processing Ledger Debit..." : "Initiate Instant Transfer"}
				</button>
			</div>
		</main>
	);
}
