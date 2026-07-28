// app/api/st/health/route.ts

import { NextResponse } from "next/server";
import { getAIService } from "@/lib/st/services/ai.service";

export async function GET() {
	try {
		const ai = getAIService();
		const health = await ai.healthCheck();

		return NextResponse.json({
			status: health.healthy ? "healthy" : "degraded",
			provider: health.provider,
			error: health.error || null,
			timestamp: new Date().toISOString(),
		});
	} catch (error: any) {
		return NextResponse.json(
			{
				status: "unhealthy",
				error: error.message,
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		);
	}
}
