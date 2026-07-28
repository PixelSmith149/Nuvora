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

	const { data: wallet } = await supabase
		.from("wallets")
		.select("id")
		.eq("user_id", user.id)
		.single();

	const { data: balance } = await supabase
		.from("wallet_balances")
		.select("balance")
		.eq("wallet_id", wallet?.id)
		.single();

	return NextResponse.json({
		balance: balance?.balance ?? 0,
		currency: "USD",
	});
}
