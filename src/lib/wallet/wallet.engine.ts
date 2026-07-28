import { createClient } from "@/lib/supabase/server";
import { Currency, convertToUSD } from "@/lib/wallet/currency/convert";

/**
 * -----------------------------
 * INTERNAL GUARDS
 * -----------------------------
 */

function assertPositiveAmount(amount: number) {
	if (!amount || amount <= 0) {
		throw new Error("Invalid transfer amount");
	}
}

function assertNotSelfTransfer(from: string, to: string) {
	if (from === to) {
		throw new Error("Self transfer is not allowed");
	}
}

/**
 * -----------------------------
 * BALANCE FETCH
 * -----------------------------
 */

async function getWalletAndBalance(supabase: any, userId: string) {
	const { data: wallet } = await supabase
		.from("wallets")
		.select("id")
		.eq("user_id", userId)
		.single();

	if (!wallet) throw new Error("Wallet not found");

	const { data: balanceRow } = await supabase
		.from("wallet_balances")
		.select("balance")
		.eq("wallet_id", wallet.id)
		.single();

	return {
		walletId: wallet.id,
		balance: balanceRow?.balance ?? 0,
	};
}

/**
 * -----------------------------
 * TRANSFER ENGINE (CORE)
 * -----------------------------
 */

export async function transfer(
	fromUserId: string,
	toUserId: string,
	amount: number,
) {
	const supabase = await createClient();

	// 🔒 BASIC SAFETY CHECKS
	assertPositiveAmount(amount);
	assertNotSelfTransfer(fromUserId, toUserId);

	// 🔍 FETCH WALLETS
	const sender = await getWalletAndBalance(supabase, fromUserId);
	const receiver = await getWalletAndBalance(supabase, toUserId);

	// 💰 FUNDS CHECK
	if (sender.balance < amount) {
		throw new Error("Insufficient balance");
	}

	// ⚠️ FRAUD / RISK HOOK (future expansion point)
	// Example: velocity checks, device checks, blacklist checks
	const fraudFlag = false;
	if (fraudFlag) {
		throw new Error("Transaction blocked by risk engine");
	}

	// 🧠 BEGIN "SOFT LEDGER TRANSACTION"
	const newSenderBalance = sender.balance - amount;
	const newReceiverBalance = receiver.balance + amount;

	// deduct sender
	const { error: senderErr } = await supabase
		.from("wallet_balances")
		.update({ balance: newSenderBalance })
		.eq("wallet_id", sender.walletId);

	if (senderErr) throw new Error("Sender balance update failed");

	// credit receiver
	const { error: receiverErr } = await supabase
		.from("wallet_balances")
		.update({ balance: newReceiverBalance })
		.eq("wallet_id", receiver.walletId);

	if (receiverErr) {
		// rollback sender if receiver fails
		await supabase
			.from("wallet_balances")
			.update({ balance: sender.balance })
			.eq("wallet_id", sender.walletId);

		throw new Error("Receiver balance update failed");
	}

	// 🧾 LEDGER LOG (atomic trace)
	const ledgerId = crypto.randomUUID();

	await supabase.from("wallet_transactions").insert([
		{
			wallet_id: sender.walletId,
			ledger_entry_id: ledgerId,
			type: "transfer",
			amount,
			status: "success",
			meta: { to_user: toUserId },
		},
		{
			wallet_id: receiver.walletId,
			ledger_entry_id: ledgerId,
			type: "deposit",
			amount,
			status: "success",
			meta: { from_user: fromUserId },
		},
	]);

	return {
		success: true,
		ledger_id: ledgerId,
	};
}

/**
 * -----------------------------
 * WITHDRAW ENGINE (SAFE CORE)
 * -----------------------------
 */

export async function withdraw(userId: string, amount: number) {
	const supabase = await createClient();

	assertPositiveAmount(amount);

	const { walletId, balance } = await getWalletAndBalance(supabase, userId);

	if (balance < amount) {
		throw new Error("Insufficient balance");
	}

	const newBalance = balance - amount;

	const { error } = await supabase
		.from("wallet_balances")
		.update({ balance: newBalance })
		.eq("wallet_id", walletId);

	if (error) throw new Error("Withdrawal failed");

	await supabase.from("wallet_transactions").insert({
		wallet_id: walletId,
		type: "withdraw",
		amount,
		status: "pending",
		meta: {
			source: "wallet.engine",
		},
	});

	return { success: true };
}
