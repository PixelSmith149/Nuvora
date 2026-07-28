// app/api/purchase/confirm/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { processPurchase } from "@/lib/services/purchase.service";
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
		const { listing_id } = body;

		if (!listing_id) {
			return NextResponse.json(
				{ error: "Listing ID required" },
				{ status: 400 },
			);
		}

		const result = await processPurchase(listing_id, user.id);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 401 });
		}

		return NextResponse.json({
			success: true,
			order_id: result.order_id,
			escrow_id: result.escrow_id,
		});
	} catch (err: any) {
		console.error("Purchase API error:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
