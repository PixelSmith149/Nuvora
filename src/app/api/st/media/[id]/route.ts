// app/api/st/media/[id]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// ─── Get media record ─────────────────────────────────────────────
		const { data: media, error: findError } = await supabase
			.from("user_media")
			.select("*")
			.eq("id", id)
			.eq("user_id", user.id)
			.single();

		if (findError || !media) {
			return NextResponse.json({ error: "Media not found" }, { status: 404 });
		}

		// ─── Extract file path from URL ──────────────────────────────────
		const urlParts = media.url.split("/");
		const filePath = urlParts.slice(-2).join("/");

		// ─── Delete from storage ──────────────────────────────────────────
		await supabase.storage.from("template-media").remove([filePath]);

		// ─── Delete from database ─────────────────────────────────────────
		const { error } = await supabase
			.from("user_media")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			console.error("Delete error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("Delete error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
