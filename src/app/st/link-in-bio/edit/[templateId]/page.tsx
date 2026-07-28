// app/st/link-in-bio/edit/[templateId]/page.tsx

import { notFound, redirect } from "next/navigation";
import { LinkInBioEditor } from "@/components/social-tenant/link-in-bio/LinkInBioEditor";
import {
	getLinks,
	getOrCreateProfile,
	getSocials,
} from "@/lib/st/services/link-in-bio.service";
import { getTemplate } from "@/lib/st/types/link-in-bio";
import { createClient } from "@/lib/supabase/server";

interface EditorPageProps {
	params: Promise<{
		templateId: string;
	}>;
}

export default async function LinkInBioEditorPage({ params }: EditorPageProps) {
	const { templateId } = await params;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/login?redirect=/st/link-in-bio");
	}

	const username =
		user?.user_metadata?.username || user?.email?.split("@")[0] || "user";

	// Check if template exists
	const template = getTemplate(templateId);
	if (!template) {
		notFound();
	}

	// ─── Fetch all data on the server ──────────────────────────
	const profile = await getOrCreateProfile(user.id, username);
	const [links, socials] = await Promise.all([
		getLinks(profile.id),
		getSocials(profile.id),
	]);

	// ─── Pass data as props to the Client Component ────────────
	return (
		<LinkInBioEditor
			userId={user.id}
			username={username}
			templateId={templateId}
			initialProfile={profile}
			initialLinks={links}
			initialSocials={socials}
		/>
	);
}
