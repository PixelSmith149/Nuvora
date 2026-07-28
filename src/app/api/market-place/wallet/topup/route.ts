import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
	const supabase = await createClient();

	// 1. Authenticate Requesting Actor via Session Core
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json(
			{ success: false, error: "Unauthorized access attempt" },
			{ status: 401 },
		);
	}

	// 2. Parse and Validate Explicit Allocation Payload
	try {
		const { amount } = (await req.json()) as { amount: number };

		if (!amount || typeof amount !== "number" || amount <= 0) {
			return NextResponse.json(
				{
					success: false,
					error: "Malformed or non-positive transaction allocation value",
				},
				{ status: 400 },
			);
		}

		// 3. Resolve Target Wallet & Core Current Balance Entity Link
		const { data: wallet, error: walletError } = await supabase
			.from("wallet_balances")
			.select("wallet_id, balance")
			.eq("user_id", user.id)
			.single();

		if (walletError || !wallet) {
			return NextResponse.json(
				{
					success: false,
					error: "Secure ledger target node mapping resolution failed",
				},
				{ status: 404 },
			);
		}

		const currentBalance = Number(wallet.balance);
		const targetBalance = currentBalance + amount;

		// 4. Atomic Execution State Update: Mutate Core Balance Ledger Node
		const { error: balanceUpdateError } = await supabase
			.from("wallet_balances")
			.update({
				balance: targetBalance,
			})
			.eq("wallet_id", wallet.wallet_id);

		if (balanceUpdateError) {
			return NextResponse.json(
				{
					success: false,
					error:
						"State allocation failed: Balance mutation rejected by database engine",
				},
				{ status: 500 },
			);
		}

		// 5. Audit Logging: Record Atomic Success Tracer inside Core Transaction Ledger Table
		const trackingReference = `gm-alloc-${crypto.randomUUID()}`;
		const { error: transactionLoggingError } = await supabase
			.from("wallet_transactions")
			.insert({
				wallet_id: wallet.wallet_id,
				reference: trackingReference,
				amount: amount,
				type: "deposit",
				status: "success",
				provider: "global_market_allocation",
				meta: {
					currency: "USD",
					origin_panel: "global_market_dashboard",
					allocated_by_user_id: user.id,
					prior_balance: currentBalance,
					updated_balance: targetBalance,
				},
			});

		if (transactionLoggingError) {
			// Note: In case audit logging itself fails, you can handle rollback here if desired,
			// but if your balance tracking table relies on sequential transactional mutations,
			// logging the trace event is mission-critical.
			return NextResponse.json(
				{
					success: false,
					error: "Ledger writing synchronization error occurred post-mutation",
				},
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			reference: trackingReference,
			updated_balance: targetBalance,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: "Internal platform engine parsing error processing allocation",
			},
			{ status: 500 },
		);
	}
}
