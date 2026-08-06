// app/s/[siteId]/page.tsx

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSiteBySlug } from "@/lib/st/services/site.service";
import { getSitePublicUrl } from "@/lib/st/urls";

interface SitePageProps {
  params: Promise<{ siteId: string }>;
}

export async function generateMetadata({
  params,
}: SitePageProps): Promise<Metadata> {
  const { siteId } = await params;
  const site = await getSiteBySlug(siteId);

  if (!site) {
    return {
      title: "Site Not Found | Nu-vora",
    };
  }

  return {
    title: site.site_name || "Website | Nu-vora",
    description:
      site.blueprint?.brand_tagline ||
      `View ${site.site_name} on Nu-vora | Elite Home`,
    robots: "index, follow",
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const { siteId } = await params;
  const site = await getSiteBySlug(siteId);

  if (!site || site.status !== "published" || !site.site_slug) {
    notFound();
  }

  // Permanent redirect to the new subdomain
  redirect(getSitePublicUrl(site.site_slug));
}