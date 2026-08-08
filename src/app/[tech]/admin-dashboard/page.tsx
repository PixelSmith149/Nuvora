import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ tech: string }>;
}

export default async function AdminDashboardPage({ params }: PageProps) {
  const resolvedParams = await params;
  const tech = resolvedParams.tech;

  // Relative redirect → works on both apex and subdomain
  redirect(`/admin-dashboard/provider-services`);
}