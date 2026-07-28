import { createClient } from "@/lib/supabase/server";

/**
 * Returns users that current user is allowed to send money to
 * RULE:
 * - user must follow target OR be mutual friends (future expansion)
 */
export async function getTransferAllowedUsers(userId: string) {
	const supabase = await createClient();

	// 1. get following list
	const { data: following } = await supabase
		.from("follows")
		.select("following_id")
		.eq("follower_id", userId);

	const allowedIds = following?.map((f) => f.following_id) || [];

	if (allowedIds.length === 0) return [];

	// 2. fetch profiles of allowed users only
	const { data: profiles } = await supabase
		.from("profiles")
		.select("id, username, display_name, avatar_url")
		.in("id", allowedIds);

	return profiles || [];
}

/**
 * HARD RULE CHECK (SERVER SECURITY LAYER)
 */
export async function canTransferTo(senderId: string, receiverId: string) {
	const supabase = await createClient();

	const { data } = await supabase
		.from("follows")
		.select("id")
		.eq("follower_id", senderId)
		.eq("following_id", receiverId)
		.single();

	return !!data;
}
