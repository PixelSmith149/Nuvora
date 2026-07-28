import { redirect } from "next/navigation";

interface PageProps {
	params: Promise<{ tech: string }>;
}

export default async function AdminDashboardPage({ params }: PageProps) {
	// 🎯 Await the promise before reading the dynamic segment string
	const resolvedParams = await params;
	const tech = resolvedParams.tech;

	redirect(`/${tech}/admin-dashboard/provider-services`);
}
