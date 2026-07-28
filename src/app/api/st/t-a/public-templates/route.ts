// app/api/st/t-a/public-templates/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get("limit") || "50");
		const order = url.searchParams.get("order") || "random";

		// ─── CRITICAL: Query with correct filters ────────────────────────
		let query = supabase
			.from("ta_templates")
			.select("*")
			.eq("is_public", true) // ← MUST be true
			.eq("is_published", true); // ← MUST be true

		// ─── Random Ordering ──────────────────────────────────────────────
		if (order === "random") {
			// ─── Fetch all then shuffle on server ──────────────────────────
			const { data, error } = await query.limit(200);

			if (error) {
				console.error("Public templates query error:", error);
				return NextResponse.json({ error: error.message }, { status: 500 });
			}

			// ─── Log for debugging ──────────────────────────────────────────
			console.log(`📊 Found ${data?.length || 0} public templates`);

			// ─── Shuffle and limit ──────────────────────────────────────────
			const shuffled = data ? shuffleArray(data) : [];
			const limited = shuffled.slice(0, limit);

			// ─── Increment view counts (async) ──────────────────────────────
			if (user && limited.length > 0) {
				for (const template of limited) {
					await supabase.rpc("increment_template_views", {
						template_id: template.id,
					});
				}
			}

			return NextResponse.json({ templates: limited });
		}

		// ─── Other ordering options ──────────────────────────────────────
		if (order === "recent") {
			query = query.order("created_at", { ascending: false });
		} else if (order === "popular") {
			query = query.order("view_count", { ascending: false });
		} else if (order === "most-cloned") {
			query = query.order("clone_count", { ascending: false });
		} else {
			query = query.order("created_at", { ascending: false });
		}

		const { data, error } = await query.limit(limit);

		if (error) {
			console.error("Public templates query error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		console.log(`📊 Found ${data?.length || 0} public templates`);

		if (user && data && data.length > 0) {
			for (const template of data) {
				await supabase.rpc("increment_template_views", {
					template_id: template.id,
				});
			}
		}

		return NextResponse.json({ templates: data || [] });
	} catch (error: any) {
		console.error("Public templates error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// ─── Helper: Shuffle array ────────────────────────────────────────────
function shuffleArray<T>(array: T[]): T[] {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
