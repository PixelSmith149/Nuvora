import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { convertFromUSD } from "@/lib/wallet/currency/convert";

export async function POST(req: Request) {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();

		const usdAmount = Number(body.usd_amount);

		if (Number.isNaN(usdAmount) || usdAmount <= 0) {
			return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
		}

		if (!body.currency) {
			return NextResponse.json(
				{ error: "Currency required." },
				{ status: 400 },
			);
		}

		/*
      Wallet lookup
    */

		const { data: wallet } = await supabase
			.from("wallets")
			.select("id")
			.eq("user_id", user.id)
			.single();

		if (!wallet) {
			return NextResponse.json({ error: "Wallet not found." }, { status: 404 });
		}

		/*
      Current balance
    */

		const { data: balanceRow } = await supabase
			.from("wallet_balances")
			.select("balance")
			.eq("wallet_id", wallet.id)
			.single();

		const balance = Number(balanceRow?.balance ?? 0);

		if (usdAmount > balance) {
			return NextResponse.json(
				{
					error: "Insufficient wallet balance.",
				},
				{
					status: 400,
				},
			);
		}

		/*
      Live conversion
      (comes from ONE centralized service)
    */

		const converted = await convertFromUSD(usdAmount, body.currency);

		/*
      Withdrawal fee
      (placeholder—replace later with your fee engine)
    */

		const fee = 0;

		const totalReceived = converted.amount - fee;

		return NextResponse.json({
			usd_amount: usdAmount,

			payout_currency: body.currency,

			payout_amount: converted.amount,

			exchange_rate: converted.rate,

			fee,

			total_received: totalReceived,
		});
	} catch (error) {
		console.error(error);

		return NextResponse.json(
			{
				error: "Unable to generate withdrawal quote.",
			},
			{
				status: 500,
			},
		);
	}
}
