import { createLedgerEntry } from "./createLedgerEntry";
import { getWalletBalance } from "./getWalletBalance";

interface CreditWalletParams {
	walletId: string;
	amount: number;
	type: "deposit" | "refund" | "bonus" | "adjustment" | "transfer_in";

	description?: string;
	referenceId?: string;
	referenceType?: string;
}

export async function creditWallet(params: CreditWalletParams) {
	const currentBalance = await getWalletBalance(params.walletId);

	const newBalance = currentBalance + params.amount;

	return createLedgerEntry({
		walletId: params.walletId,
		amount: params.amount,
		type: params.type,
		description: params.description,
		referenceId: params.referenceId,
		referenceType: params.referenceType,
		balanceAfter: newBalance,
	});
}
