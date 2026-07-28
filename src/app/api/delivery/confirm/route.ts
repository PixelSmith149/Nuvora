// app/api/delivery/confirm/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { confirmDelivery } from "@/lib/services/delivery.service";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await req.json();
		console.log("🔍 [Delivery API] Received body:", body);

		const { order_id } = body;

		if (!order_id) {
			console.error("❌ [Delivery API] Missing order_id");
			return NextResponse.json({ error: "Order ID required" }, { status: 400 });
		}

		const result = await confirmDelivery(order_id, user.id);
		console.log("🔍 [Delivery API] Result:", result);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 400 });
		}

		return NextResponse.json({ success: true });
	} catch (err: any) {
		console.error("Delivery API error:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
