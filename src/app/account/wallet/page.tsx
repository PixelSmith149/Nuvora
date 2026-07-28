import WalletPanel from "@/components/account/WalletPanel";
import AuthGuard from "@/components/auth/AuthGuard";

export default function WalletPage() {
	return (
		<main className="min-h-screen bg-black text-white px-6 py-24">
			<section className="mx-auto w-full max-w-5xl space-y-10">
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
