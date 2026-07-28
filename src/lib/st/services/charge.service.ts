// lib/st/services/charge.service.ts

import { trackRevenue } from "@/lib/services/revenue.service";
import { BUILD_COST, SYSTEM_WALLET_ID } from "@/lib/st/types";
import { createClient } from "@/lib/supabase/server";
import { transfer } from "@/lib/wallet/wallet.engine";

export interface ChargeResult {
	success: boolean;
	error?: string;
	transactionId?: string;
}

export async function chargeForBuild(
	userId: string,
	siteId: string,
): Promise<ChargeResult> {
	const supabase = await createClient();

	try {
		// 1. Check if already charged for this site
		const { data: existingCharge, error: checkError } = await supabase
			.from("site_charges")
			.select("id, status")
			.eq("site_id", siteId)
			.eq("status", "success")
			.maybeSingle();

		if (checkError) {
			console.error("Charge check error:", checkError);
		}

		if (existingCharge) {
			return {
				success: true,
				transactionId: existingCharge.id,
				error: "Site already charged",
			};
		}

		// 2. Create pending charge record
		const { data: charge, error: chargeError } = await supabase
			.from("site_charges")
			.insert({
				site_id: siteId,
				user_id: userId,
				amount: BUILD_COST,
				status: "pending",
				meta: { service: "social-tenant-build" },
			})
			.select()
			.single();

		if (chargeError) {
			throw new Error(`Failed to create charge record: ${chargeError.message}`);
		}

		// 3. Attempt transfer using wallet.engine.ts
		let transferResult;
		try {
			transferResult = await transfer(userId, SYSTEM_WALLET_ID, BUILD_COST);
		} catch (transferErr: any) {
			// Update charge as failed
			await supabase
				.from("site_charges")
				.update({
					status: "failed",
					meta: { error: transferErr.message },
				})
				.eq("id", charge.id);

			return {
				success: false,
				error: transferErr.message || "Transfer failed",
			};
		}

		// 4. Update charge as success
		const { error: updateError } = await supabase
			.from("site_charges")
			.update({
				status: "success",
				transaction_id: transferResult.ledger_id,
			})
			.eq("id", charge.id);

		if (updateError) {
			console.error("Failed to update charge:", updateError);
		}

		if (!updateError) {
			// ✅ Track website build revenue
			await trackRevenue({
				source: "website_build",
				amount: BUILD_COST,
				userId: userId,
				referenceId: siteId,
				referenceType: "site_build",
				meta: {
					site_id: siteId,
					charge_id: charge.id,
				},
			});
		}

		return {
			success: true,
			transactionId: transferResult.ledger_id,
		};
	} catch (err: any) {
		console.error("Charge error:", err);
		return {
			success: false,
			error: err.message || "Failed to process charge",
		};
	}
}

export async function getSiteChargeStatus(
	siteId: string,
): Promise<"pending" | "success" | "refunded" | "failed" | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("site_charges")
		.select("status")
		.eq("site_id", siteId)
		.eq("status", "success")
		.maybeSingle();

	if (error || !data) return null;
	return data.status as "pending" | "success" | "refunded" | "failed";
}

export async function refundCharge(siteId: string): Promise<boolean> {
	const supabase = await createClient();

	const { error } = await supabase
		.from("site_charges")
		.update({
			status: "refunded",
			meta: { refunded_at: new Date().toISOString() },
		})
		.eq("site_id", siteId)
		.eq("status", "success");

	if (error) {
		console.error("Refund error:", error);
		return false;
	}

	return true;
}
