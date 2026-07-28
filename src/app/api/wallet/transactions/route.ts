import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data: wallet, error: walletError } = await supabase
		.from("wallets")
		.select("id")
		.eq("user_id", user.id)
		.single();

	if (walletError || !wallet) {
		return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
	}

	const { data: transactions, error: txError } = await supabase
		.from("wallet_transactions")
		.select("*")
		.eq("wallet_id", wallet.id)
		.order("created_at", {
			ascending: false,
		});

	if (txError) {
		return NextResponse.json({ error: txError.message }, { status: 500 });
	}

	return NextResponse.json({
		transactions: transactions ?? [],
	});
}
