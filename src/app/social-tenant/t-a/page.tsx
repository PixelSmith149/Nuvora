// /app/social-tenant/t-a/page.tsx

import { redirect } from "next/navigation";
import { TADashboard } from "@/components/templates-animation/TADashboard";
import { createClient } from "@/lib/supabase/server";

export default async function TemplatesAnimationPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/login?redirect=/social-tenant/t-a");
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select("username")
		.eq("id", user.id)
		.single();

	const username = profile?.username || "user";

	return (
		<div className="min-h-screen bg-black text-white p-4 md:p-6">
			<div className="max-w-7xl mx-auto">
				<TADashboard userId={user.id} username={username} />
			</div>
		</div>
	);
}
