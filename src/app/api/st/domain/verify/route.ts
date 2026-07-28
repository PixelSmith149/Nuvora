// app/api/st/domain/verify/route.ts

import dns from "dns/promises";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface VerificationResult {
	verified: boolean;
	records: {
		type: string;
		name: string;
		value: string;
		found: boolean;
		expected: string;
	}[];
	error?: string;
}

export async function POST(req: NextRequest) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await req.json();
		const { siteId, domain } = body;

		if (!siteId || !domain) {
			return NextResponse.json(
				{ error: "Site ID and domain are required" },
				{ status: 400 },
			);
		}

		// Verify site ownership
		const { data: site } = await supabase
			.from("user_sites")
			.select("id, blueprint")
			.eq("id", siteId)
			.eq("user_id", user.id)
			.single();

		if (!site) {
			return NextResponse.json({ error: "Site not found" }, { status: 404 });
		}

		// Clean domain
		const cleanDomain = domain
			.replace(/^https?:\/\//, "")
			.replace(/\/.*$/, "")
			.toLowerCase();

		// Verify DNS
		const result = await verifyDomainDNS(cleanDomain);

		// Update site
		const updatedBlueprint = {
			...site.blueprint,
			custom_domain: cleanDomain,
			custom_domain_verified: result.verified,
			custom_domain_verified_at: result.verified
				? new Date().toISOString()
				: null,
			custom_domain_verification_error: result.error || null,
		};

		await supabase
			.from("user_sites")
			.update({ blueprint: updatedBlueprint })
			.eq("id", siteId);

		return NextResponse.json({
			success: true,
			domain: cleanDomain,
			verified: result.verified,
			records: result.records,
			error: result.error,
		});
	} catch (error: any) {
		console.error("Domain verification error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to verify domain" },
			{ status: 500 },
		);
	}
}

async function verifyDomainDNS(domain: string): Promise<VerificationResult> {
	// Get platform domain and IP from environment variables
	const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN;
	const platformIP = process.env.PLATFORM_IP;

	if (!platformDomain || !platformIP) {
		throw new Error(
			"Platform domain or IP not configured in environment variables",
		);
	}

	const records: VerificationResult["records"] = [];
	let verified = true;

	// 1. Check CNAME for www subdomain
	try {
		const cnameResult = await dns.resolveCname(`www.${domain}`);
		const found = cnameResult.some(
			(record: string) => record === platformDomain,
		);
		records.push({
			type: "CNAME",
			name: `www.${domain}`,
			value: cnameResult.join(", "),
			found,
			expected: platformDomain,
		});
		if (!found) verified = false;
	} catch (error: any) {
		// CNAME not found
		records.push({
			type: "CNAME",
			name: `www.${domain}`,
			value: "Not found",
			found: false,
			expected: platformDomain,
		});
		verified = false;
	}

	// 2. Check A record for apex domain
	try {
		const aResult = await dns.resolve4(domain);
		const found = aResult.some((ip: string) => ip === platformIP);
		records.push({
			type: "A",
			name: domain,
			value: aResult.join(", "),
			found,
			expected: platformIP,
		});
		if (!found) verified = false;
	} catch (error: any) {
		// A record not found
		records.push({
			type: "A",
			name: domain,
			value: "Not found",
			found: false,
			expected: platformIP,
		});
		verified = false;
	}

	return {
		verified,
		records,
		error: verified ? undefined : "DNS records not properly configured",
	};
}

export async function GET(req: NextRequest) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const url = new URL(req.url);
		const siteId = url.searchParams.get("siteId");

		if (!siteId) {
			return NextResponse.json(
				{ error: "Site ID is required" },
				{ status: 400 },
			);
		}

		const { data: site } = await supabase
			.from("user_sites")
			.select("blueprint")
			.eq("id", siteId)
			.eq("user_id", user.id)
			.single();

		if (!site) {
			return NextResponse.json({ error: "Site not found" }, { status: 404 });
		}

		return NextResponse.json({
			domain: site.blueprint?.custom_domain || null,
			verified: site.blueprint?.custom_domain_verified || false,
			verifiedAt: site.blueprint?.custom_domain_verified_at || null,
			error: site.blueprint?.custom_domain_verification_error || null,
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
