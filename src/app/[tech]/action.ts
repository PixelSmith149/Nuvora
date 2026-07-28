"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Validates the admin signature hash completely on the server side.
 * The secret key never leaves the hosting environment.
 */
export async function verifyAdminPasskey(
	inputPasskey: string,
): Promise<boolean> {
	const secureServerHash = process.env.ADMIN_GATEWAY_HASH;

	if (!secureServerHash) {
		console.error(
			"Configuration Error: ADMIN_GATEWAY_HASH is missing from the server environment.",
		);
		return false;
	}

	// Direct server-side equality comparison
	const isValid = inputPasskey === secureServerHash;

	// ✅ If valid, set the cookie for middleware
	if (isValid) {
		const cookieStore = await cookies();
		cookieStore.set("admin_portal_handshake_token", "verified", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: "/",
			sameSite: "lax",
		});
	}

	return isValid;
}
