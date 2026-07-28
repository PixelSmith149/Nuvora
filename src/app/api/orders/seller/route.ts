// app/api/orders/seller/route.ts

import { NextResponse } from "next/server";
import { getSellerOrders } from "@/lib/services/delivery.service";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const orders = await getSellerOrders(user.id);
		return NextResponse.json({ orders });
	} catch (err: any) {
		console.error("Get seller orders error:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
