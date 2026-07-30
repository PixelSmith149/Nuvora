import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import EditProfilePanel from "@/components/account/EditProfilePanel";

export default function ProfileEditPage() {
	return (
		<main className="min-h-screen bg-black text-white px-6 py-6">
			<div className="mx-auto w-full max-w-2xl space-y-6">
				{/* Back Navigation Shortcut */}
				<Link
					href="/account"
					className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
				>
					<FiChevronLeft /> Back to Account
				</Link>

				<header className="space-y-1">
					<h1 className="text-3xl font-black tracking-tight">
						Profile Settings
					</h1>
					
				</header>

				{/* Mounted Client panel component */}
				<EditProfilePanel />
			</div>
		</main>
	);
}
