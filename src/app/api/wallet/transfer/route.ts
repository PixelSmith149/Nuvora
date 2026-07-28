import { NextResponse } from "next/server";
import { canTransferTo } from "@/lib/social/following";
import { createClient } from "@/lib/supabase/server";
import { transfer } from "@/lib/wallet/wallet.engine";

export async function POST(req: Request) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();

	const to_user_id = body?.to_user_id;
	const amount = Number(body?.amount);

	if (!to_user_id || !amount) {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}

	// 🔒 SELF TRANSFER BLOCK
	if (to_user_id === user.id) {
		return NextResponse.json(
			{ error: "Self transfer not allowed" },
			{ status: 400 },
		);
	}

	// 🔐 FOLLOWING GATE (NEW SECURITY LAYER)
	const allowed = await canTransferTo(user.id, to_user_id);

	if (!allowed) {
		return NextResponse.json(
			{ error: "You can only send money to users you follow" },
			{ status: 403 },
		);
	}

	try {
		const result = await transfer(user.id, to_user_id, amount);

		return NextResponse.json(result);
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message || "Transfer failed" },
			{ status: 400 },
		);
	}
}
