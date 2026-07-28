import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server"; // FIXED: Use the server-side client config here

export default async function AuthGuard({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	return <>{children}</>;
}
