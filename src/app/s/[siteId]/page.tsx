// app/s/[siteId]/page.tsx

import { createClient as createClientAdmin } from "@supabase/supabase-js";
import DOMPurify from "isomorphic-dompurify";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteBySlug } from "@/lib/st/services/site.service";
import { createClient } from "@/lib/supabase/server";

interface SitePageProps {
	params: Promise<{ siteId: string }>; // ← FIXED
}

export async function generateMetadata({
	params,
}: SitePageProps): Promise<Metadata> {
	const { siteId } = await params;
	const site = await getSiteBySlug(siteId);

	if (!site) {
		return {
			title: "Site Not Found | Nuvora",
		};
	}

	return {
		title: site.site_name || "Website | Nuvora",
		description:
			site.blueprint?.brand_tagline ||
			`View ${site.site_name} on Nuvora | Elite Home`,
		robots: "index, follow",
	};
}

export default async function SitePage({ params }: SitePageProps) {
	const { siteId } = await params;
	const supabase = await createClient();

	const { data: site, error } = await supabase
		.from("user_sites")
		.select("html_code, site_name, status, site_slug")
		.eq("site_slug", siteId)
		.eq("status", "published")
		.single();

	if (error || !site || !site.html_code) {
		notFound();
	}

	const sanitizedHtml = DOMPurify.sanitize(site.html_code, {
		ADD_TAGS: ["style", "link", "meta", "script"],
		ADD_ATTR: ["rel", "href", "type", "media", "crossorigin"],
		FORCE_BODY: true,
	});

	const globalScript = `
    <script>
      (function() {
        'use strict';
        const footer = document.querySelector('footer');
        if (footer) {
          const attribution = document.createElement('div');
          attribution.style.cssText = 'text-align: center; padding: 10px; font-size: 12px; color: #71717a;';
          attribution.innerHTML = 'Built with ❤️ on <a href="https://nu-vora.com" style="color: #10b981; text-decoration: none;">Nuvora</a>';
          footer.appendChild(attribution);
        }
        document.addEventListener('submit', function(e) {
          if (e.target && e.target.matches('form[data-form="contact"]')) {
            e.preventDefault();
            const formData = new FormData(e.target);
            fetch('/api/st/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(Object.fromEntries(formData))
            }).then(response => {
              if (response.ok) {
                alert('Message sent successfully!');
                e.target.reset();
              }
            });
          }
        });
      })();
    </script>
  `;

	const finalHtml = sanitizedHtml.replace("</body>", `${globalScript}</body>`);

	return <div dangerouslySetInnerHTML={{ __html: finalHtml }} />;
}

export async function generateStaticParams() {
	const supabaseAdmin = createClientAdmin(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{ auth: { autoRefreshToken: false, persistSession: false } },
	);

	const { data: sites } = await supabaseAdmin
		.from("user_sites")
		.select("site_slug")
		.eq("status", "published")
		.not("site_slug", "is", null);

	return (
		sites?.map((site) => ({
			siteId: site.site_slug,
		})) || []
	);
}
