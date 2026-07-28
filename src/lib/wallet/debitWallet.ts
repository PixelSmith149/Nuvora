import { createLedgerEntry } from "./createLedgerEntry";
import { getWalletBalance } from "./getWalletBalance";

interface DebitWalletParams {
	walletId: string;
	amount: number;
	type: "withdrawal" | "purchase" | "transfer_out";

	description?: string;
	referenceId?: string;
	referenceType?: string;
}

export async function debitWallet(params: DebitWalletParams) {
	const currentBalance = await getWalletBalance(params.walletId);

	if (currentBalance < params.amount) {
		throw new Error("Insufficient balance");
	}

	const newBalance = currentBalance - params.amount;

	return createLedgerEntry({
		walletId: params.walletId,
		amount: -params.amount,
		type: params.type,
		description: params.description,
		referenceId: params.referenceId,
		referenceType: params.referenceType,
		balanceAfter: newBalance,
	});
}
