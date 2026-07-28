// app/api/st/generate/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getAIService } from "@/lib/st/services/ai.service";
import { chargeForBuild } from "@/lib/st/services/charge.service";
import {
	generateWebsiteStream,
	resumeGeneration,
} from "@/lib/st/services/generator.service";
import { startSession, updateSiteHtml } from "@/lib/st/services/site.service";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return new Response("Unauthorized", { status: 401 });
	}

	try {
		const body = await req.json();
		const { siteId, blueprint, resume = false, partialHtml = "" } = body;

		if (!siteId || !blueprint) {
			return new Response("Site ID and blueprint are required", {
				status: 400,
			});
		}

		// Verify site exists and belongs to user
		const { data: site } = await supabase
			.from("user_sites")
			.select("*")
			.eq("id", siteId)
			.eq("user_id", user.id)
			.single();

		if (!site) {
			return new Response("Site not found or unauthorized", { status: 404 });
		}

		// Check if already charged
		const { data: existingCharge } = await supabase
			.from("site_charges")
			.select("status")
			.eq("site_id", siteId)
			.eq("status", "success")
			.maybeSingle();

		if (!existingCharge && !resume) {
			const chargeResult = await chargeForBuild(user.id, siteId);
			if (!chargeResult.success) {
				return new Response(
					JSON.stringify({
						error: chargeResult.error || "Insufficient balance",
					}),
					{ status: 400 },
				);
			}
		}

		// Check AI health before starting
		const ai = getAIService();
		const health = await ai.healthCheck();

		// ✅ Specific "Server Busy" card
		if (!health.healthy) {
			return NextResponse.json(
				{
					error:
						"🚧 Architect is taking a quick breath! Our AI engine is currently experiencing heavy traffic. We've saved your website progress—click Resume to try generating the rest of your pages.",
					type: "server_busy",
					canResume: true,
				},
				{ status: 503 },
			);
		}
		// Start session
		if (!resume) {
			await startSession(siteId);
		}

		// Create SSE stream
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				let fullHtml = "";

				try {
					// Send initial status
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ type: "start", message: resume ? "Resuming generation..." : "Generating your website..." })}\n\n`,
						),
					);

					// Generate or resume website
					const generator = resume
						? resumeGeneration(blueprint, partialHtml)
						: generateWebsiteStream(blueprint);

					for await (const chunk of generator) {
						if (chunk.type === "chunk") {
							fullHtml += chunk.content;
							controller.enqueue(
								encoder.encode(
									`data: ${JSON.stringify({ type: "chunk", content: chunk.content, progress: chunk.progress })}\n\n`,
								),
							);
						} else if (chunk.type === "complete") {
							// Save complete HTML to database
							const completeHtml = chunk.content;
							await updateSiteHtml(siteId, completeHtml, "published");
							controller.enqueue(
								encoder.encode(
									`data: ${JSON.stringify({ type: "complete", message: "Website generated successfully!" })}\n\n`,
								),
							);
						} else if (chunk.type === "error") {
							controller.enqueue(
								encoder.encode(
									`data: ${JSON.stringify({ type: "error", message: chunk.content, canResume: true })}\n\n`,
								),
							);
						}
					}

					controller.close();
				} catch (error: any) {
					console.error("Generation error:", error);
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({
								type: "error",
								message: error.message || "Generation failed",
								canResume: true,
								partialHtml: fullHtml,
							})}\n\n`,
						),
					);
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error: any) {
		console.error("Generation route error:", error);
		return new Response(
			JSON.stringify({ error: error.message || "Generation failed" }),
			{ status: 500 },
		);
	}
}
