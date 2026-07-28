"use client";

import { useCallback, useEffect, useState } from "react";

export type WalletTransaction = {
	id: string;
	wallet_id: string;
	ledger_entry_id?: string;
	type: "deposit" | "withdraw" | "transfer";
	amount: number;
	status: "pending" | "success" | "failed";
	created_at: string;
	meta?: any;
};

export type WalletData = {
	balance: number;
	currency: "USD";
	transactions: WalletTransaction[];
};

export function useWallet() {
	const [wallet, setWallet] = useState<WalletData>({
		balance: 0,
		currency: "USD",
		transactions: [],
	});

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 🔄 Unified Fetch Routine
	const fetchWallet = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [balanceRes, txRes] = await Promise.all([
				fetch("/api/wallet/balance"),
				fetch("/api/wallet/transactions"),
			]);

			if (!balanceRes.ok || !txRes.ok) {
				throw new Error("Failed to synchronize ledger data.");
			}

			const balanceData = await balanceRes.json();
			const txData = await txRes.json();

			setWallet({
				balance: balanceData.balance ?? 0,
				currency: "USD",
				transactions: txData.transactions ?? [],
			});
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred while loading wallet data.",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	// 💸 Secure Withdrawal Routing
	async function withdraw(amount: number) {
		try {
			const res = await fetch("/api/wallet/withdraw", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount }),
			});

			if (res.ok) {
				await fetchWallet();
			}
			return res.json();
		} catch (err) {
			return { success: false, error: "Withdrawal communication failure" };
		}
	}

	// 🛡️ Secure Ledger Transfer Routing
	async function transfer(to_user_id: string, amount: number) {
		try {
			const res = await fetch("/api/wallet/transfer", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ to_user_id, amount }),
			});

			if (res.ok) {
				await fetchWallet();
			}
			return res.json();
		} catch (err) {
			return { success: false, error: "Transfer communication failure" };
		}
	}

	// 🎯 Integrated Core Top-Up Router
	// Inside your src/hooks/useWallet.ts file:
	async function topUp(amount: number): Promise<boolean> {
		if (amount <= 0) return false;
		try {
			const res = await fetch("/api/market-place/wallet/topup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount }),
			});

			if (res.ok) {
				const data = await res.json();
				if (data.success) {
					await fetchWallet(); // Synchronizes UI balance cleanly across all views
					return true;
				}
			}
			return false;
		} catch (err) {
			console.error("Market-specific allocation engine breakdown:", err);
			return false;
		}
	}

	useEffect(() => {
		fetchWallet();
	}, [fetchWallet]);

	return {
		wallet,
		loading,
		error,
		refresh: fetchWallet,
		withdraw,
		transfer,
		topUp, // Handed seamlessly over to GlobalMarketView.tsx
	};
}
