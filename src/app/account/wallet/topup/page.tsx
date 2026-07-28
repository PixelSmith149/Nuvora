"use client";

import Link from "next/link";

export default function TopUpPage() {
	const depositMethods = [
		{
			title: "Paystack",
			description:
				"Secure localized checkout via Credit/Debit Cards or Bank Transfers.",
			href: "/account/wallet/topup/paystack",
			badge: "Popular",
			actionText: "Continue with Paystack",
		},
		{
			title: "Mobile Money (MoMo)",
			description: "Direct payment execution using your local MTN MoMo wallet.",
			href: "/account/wallet/topup/momo",
			badge: "Instant",
			actionText: "Pay with MoMo",
		},
		{
			title: "Crypto",
			description:
				"Non-custodial deposit processing via Bitcoin or Lightning Network.",
			href: "/account/wallet/topup/crypto",
			badge: "Web3",
			actionText: "Deposit Crypto",
		},
	];

	return (
		<main className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
			<section className="flex-1 mx-auto w-full max-w-4xl px-6 pt-32 pb-24">
				{/* Hero Header */}
				<div className="text-center mb-16">
					<div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1 text-xs uppercase tracking-[0.5em] text-white/60 mb-6">
						SECURE FUNDING VAULT
					</div>
				</div>

				{/* Premium Method Cards */}
				<div className="space-y-6">
					{depositMethods.map((method, idx) => (
						<Link key={idx} href={method.href} className="group block">
							<div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 to-black p-8 md:p-10 transition-all duration-700 hover:border-white/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10">
								<div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 relative z-10">
									<div className="flex-1">
										<div className="flex items-center gap-4 mb-4">
											<h3 className="text-3xl font-bold tracking-tight">
												{method.title}
											</h3>

											<span className="px-3 py-1 text-xs font-mono tracking-widest bg-white/10 text-white/70 rounded-full border border-white/10">
												{method.badge}
											</span>
										</div>

										<p className="text-white/60 text-[15.5px] leading-relaxed max-w-md">
											{method.description}
										</p>
									</div>

									<div className="flex-shrink-0 pt-2">
										<div className="group/btn relative inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-white text-black font-semibold text-sm tracking-widest overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95">
											<span className="relative z-10">{method.actionText}</span>

											<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-150%] group-hover/btn:translate-x-[150%] transition-transform duration-700" />
										</div>
									</div>
								</div>

								<div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
							</div>
						</Link>
					))}
				</div>

				{/* Trust Bar */}
				<div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-center text-xs font-mono text-white/40">
					<p>🔒 Bank-Grade Encryption</p>
					<p>⚡ Instant Crediting</p>
					<p>🌍 Multi-Currency Support</p>
					<p>🛡️ 256-Bit SSL Protected</p>
				</div>
			</section>
		</main>
	);
}
