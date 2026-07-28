"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import WithdrawAmountPanel from "@/components/wallet/withdraw/WithdrawAmountPanel";

import WithdrawBalanceCard from "@/components/wallet/withdraw/WithdrawBalanceCard";
import WithdrawMethodPicker from "@/components/wallet/withdraw/WithdrawMethodPicker";
import WithdrawRecipientForm from "@/components/wallet/withdraw/WithdrawRecipientForm";
import WithdrawReviewPanel from "@/components/wallet/withdraw/WithdrawReviewPanel";
import type { WithdrawDraft } from "@/lib/wallet/types"; // 🎯 Clean Centralized Import

type Step = "method" | "recipient" | "amount" | "review";

export default function WithdrawPage() {
	const router = useRouter();
	const [step, setStep] = useState<Step>("method");
	const [draft, setDraft] = useState<WithdrawDraft>({});

	const handleWithdrawSuccess = () => {
		// Take them cleanly back to the main wallet page once confirmed
		router.push("/account/wallet");
		router.refresh(); // Refresh layout to update real-time wallet balances
	};

	return (
		<main className="min-h-screen bg-black text-white">
			<section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
				<WithdrawBalanceCard />

				<div className="mt-8">
					{step === "method" && (
						<WithdrawMethodPicker
							value={draft}
							onNext={(data) => {
								setDraft((prev) => ({ ...prev, ...data }));
								setStep("recipient");
							}}
						/>
					)}

					{step === "recipient" && (
						<WithdrawRecipientForm
							value={draft}
							onBack={() => setStep("method")}
							onNext={(data) => {
								setDraft((prev) => ({ ...prev, ...data }));
								setStep("amount");
							}}
						/>
					)}

					{step === "amount" && (
						<WithdrawAmountPanel
							value={draft}
							onBack={() => setStep("recipient")}
							onNext={(data) => {
								setDraft((prev) => ({ ...prev, ...data }));
								setStep("review");
							}}
						/>
					)}

					{step === "review" && (
						<WithdrawReviewPanel
							draft={draft}
							onBack={() => setStep("amount")}
							onSuccess={handleWithdrawSuccess}
						/>
					)}
				</div>
			</section>
		</main>
	);
}
