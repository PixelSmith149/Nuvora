import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders/createOrder";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{
					error: "Unauthorized",
				},
				{ status: 401 },
			);
		}

		const body = await req.json();

		// FIXED: Removed 'userId' parameter argument to match your createOrder interface signature perfectly
		const order = await createOrder({
			serviceId: body.serviceId,
			quantity: Number(body.quantity),
			target: body.target,
		});

		return NextResponse.json(order);
	} catch (error: any) {
		return NextResponse.json(
			{
				error: error?.message || "Failed to create order",
			},
			{
				status: 400,
			},
		);
	}
}
