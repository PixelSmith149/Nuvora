import WalletPanel from "@/components/account/WalletPanel";
import AuthGuard from "@/components/auth/AuthGuard";
import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";

export default function WalletPage() {
	return (
		<main className="min-h-screen bg-black text-white px-6 py-8">
			<section className="mx-auto w-full max-w-5xl space-y-10">
				<Link
					href="/account"
					className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
				>
					<FiChevronLeft /> Back to Account
				</Link>
				<header>
					<p className="text-xs uppercase tracking-[0.5em] text-white/40">
						Secure Wallet
					</p>

					<p className="text-white/50 mt-3 max-w-xl">
						Manage your USD balance, deposits, transfers and withdrawals.
					</p>
				</header>

				<WalletPanel />
			</section>
		</main>
	);
}
