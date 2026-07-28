// app/api/st/domain/instructions/route.ts

import { type NextRequest, NextResponse } from "next/server";
import whois from "whois-json";
import { createClient } from "@/lib/supabase/server";

interface DNSProvider {
	id: string;
	name: string;
	docsUrl: string;
	logo?: string;
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

		const domain = site.blueprint?.custom_domain;

		if (!domain) {
			return NextResponse.json(
				{ error: "No custom domain configured" },
				{ status: 400 },
			);
		}

		const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN;
		const platformIP = process.env.PLATFORM_IP;

		if (!platformDomain || !platformIP) {
			throw new Error(
				"Platform domain or IP not configured in environment variables",
			);
		}

		// Detect DNS provider
		const provider = await detectDNSProvider(domain);

		// Generate provider-specific instructions
		const providerInstructions = getProviderInstructions(
			provider,
			domain,
			platformDomain,
			platformIP,
		);

		const instructions = {
			domain,
			provider: {
				id: provider.id,
				name: provider.name,
				docsUrl: provider.docsUrl,
			},
			records: [
				{
					type: "CNAME",
					name: "www",
					value: platformDomain,
					description: "Points www subdomain to your platform",
					required: true,
				},
				{
					type: "A",
					name: "@",
					value: platformIP,
					description: "Points the root domain to your platform",
					required: true,
				},
				{
					type: "CNAME",
					name: "*",
					value: platformDomain,
					description: "Catch-all for any subdomain (optional)",
					required: false,
				},
			],
			steps: providerInstructions.steps,
			providerSpecific: providerInstructions.specific,
			platformDomain,
			platformIP,
		};

		return NextResponse.json(instructions);
	} catch (error: any) {
		console.error("DNS instructions error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to generate DNS instructions" },
			{ status: 500 },
		);
	}
}

async function detectDNSProvider(domain: string): Promise<DNSProvider> {
	try {
		const whoisData = await whois(domain, {
			follow: 2,
			timeout: 10000,
		});

		// Combine all WHOIS text into one string for searching
		const whoisText = JSON.stringify(whoisData).toLowerCase();

		// Detect provider based on WHOIS data
		if (whoisText.includes("cloudflare") || whoisText.includes("cf-")) {
			return {
				id: "cloudflare",
				name: "Cloudflare",
				docsUrl:
					"https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/",
			};
		}
		if (whoisText.includes("namecheap")) {
			return {
				id: "namecheap",
				name: "Namecheap",
				docsUrl:
					"https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-to-add-dns-records-in-namecheap/",
			};
		}
		if (whoisText.includes("godaddy")) {
			return {
				id: "godaddy",
				name: "GoDaddy",
				docsUrl: "https://www.godaddy.com/help/add-a-dns-record-19230",
			};
		}
		if (whoisText.includes("google")) {
			return {
				id: "google",
				name: "Google Domains / Cloud DNS",
				docsUrl: "https://support.google.com/domains/answer/3290350",
			};
		}
		if (
			whoisText.includes("amazon") ||
			whoisText.includes("route53") ||
			whoisText.includes("aws")
		) {
			return {
				id: "aws",
				name: "Amazon Route 53",
				docsUrl:
					"https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html",
			};
		}
		if (whoisText.includes("azure")) {
			return {
				id: "azure",
				name: "Azure DNS",
				docsUrl:
					"https://learn.microsoft.com/en-us/azure/dns/dns-operations-recordsets-portal",
			};
		}
		if (whoisText.includes("digitalocean")) {
			return {
				id: "digitalocean",
				name: "DigitalOcean DNS",
				docsUrl:
					"https://docs.digitalocean.com/products/networking/dns/how-to/manage-records/",
			};
		}
		if (whoisText.includes("bluehost")) {
			return {
				id: "bluehost",
				name: "Bluehost",
				docsUrl: "https://www.bluehost.com/help/article/dns-management",
			};
		}
		if (whoisText.includes("hostgator")) {
			return {
				id: "hostgator",
				name: "HostGator",
				docsUrl: "https://www.hostgator.com/help/article/dns-records",
			};
		}

		// Fallback: try to detect from nameservers
		const nameservers = whoisData?.nameservers || [];
		const nsText = JSON.stringify(nameservers).toLowerCase();

		if (nsText.includes("cloudflare")) {
			return {
				id: "cloudflare",
				name: "Cloudflare",
				docsUrl:
					"https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/",
			};
		}

		// Unknown provider
		return {
			id: "unknown",
			name: "Your DNS Provider",
			docsUrl: "https://www.google.com/search?q=how+to+add+dns+records+",
		};
	} catch (error) {
		// If WHOIS lookup fails, return unknown
		return {
			id: "unknown",
			name: "Your DNS Provider",
			docsUrl: "https://www.google.com/search?q=how+to+add+dns+records+",
		};
	}
}

function getProviderInstructions(
	provider: DNSProvider,
	domain: string,
	platformDomain: string,
	platformIP: string,
): {
	steps: string[];
	specific: Record<string, any>;
} {
	const baseSteps = [
		`Log in to your ${provider.name} account`,
		`Navigate to the DNS or Domain Management section for ${domain}`,
		"Add the following DNS records:",
		"Wait 5-30 minutes for DNS propagation",
		'Return to your site settings and click "Verify Domain"',
	];

	const providerSpecific: Record<string, any> = {};

	// Provider-specific instructions
	switch (provider.id) {
		case "cloudflare":
			providerSpecific.proxyNote =
				"Make sure the orange cloud proxy is disabled (set to gray cloud) for the A and CNAME records";
			providerSpecific.dashboardLink = `https://dash.cloudflare.com/?to=/:zone/${domain}`;
			break;
		case "namecheap":
			providerSpecific.dashboardLink = `https://www.namecheap.com/domains/domainmanager/advanced/?domain=${domain}`;
			break;
		case "godaddy":
			providerSpecific.dashboardLink = `https://dcc.godaddy.com/domains/${domain}`;
			break;
		case "google":
			providerSpecific.dashboardLink = `https://domains.google.com/registrar/${domain}/dns`;
			break;
		case "aws":
			providerSpecific.dashboardLink = `https://console.aws.amazon.com/route53/v2/hostedzones#`;
			break;
		default:
			providerSpecific.generalNote =
				"If you need help, contact your DNS provider's support";
	}

	return {
		steps: baseSteps,
		specific: providerSpecific,
	};
}
