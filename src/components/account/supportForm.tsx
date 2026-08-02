"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiAlertCircle, FiCheckCircle, FiSend, FiTag, FiPackage } from "react-icons/fi";
import { createSupportTicket } from "@/app/account/support/action";

export default function SupportForm() {
    const searchParams = useSearchParams();

    // Auto-fill order metadata if coming directly from the order page link
    const orderId = searchParams.get("order_id") || "";
    const trackingCode = searchParams.get("code") || "";
    const defaultReason = searchParams.get("reason") || "order_issue";

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        const formData = new FormData(e.currentTarget);
        const res = await createSupportTicket(formData);

        setLoading(false);
        if (res.error) {
            setErrorMsg(res.error);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-8 text-center space-y-4">
                <FiCheckCircle className="mx-auto h-12 w-12 text-green-400" />
                <h2 className="text-xl font-bold text-white">Ticket Submitted Successfully</h2>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                    Our support team has received your inquiry. We will review your issue and update your ticket status shortly.
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition"
                >
                    Submit Another Ticket
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-medium text-rose-400">
                    <FiAlertCircle className="h-5 w-5 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Hidden Inputs for URL Params */}
            <input type="hidden" name="order_id" value={orderId} />
            <input type="hidden" name="tracking_code" value={trackingCode} />

            {orderId && (
                <div className="rounded-2xl border border-zinc-800 bg-black/60 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FiPackage className="text-zinc-400 h-5 w-5" />
                        <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                                Linked Order Reference
                            </p>
                            <p className="text-xs font-mono text-zinc-200 mt-0.5">
                                {trackingCode || orderId}
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20 px-3 py-1 rounded-full">
                        Priority Order Support
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Category
                    </label>
                    <select
                        name="category"
                        defaultValue={defaultReason}
                        className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-200 focus:border-zinc-600 focus:outline-none transition"
                    >
                        <option value="order_issue">Order Issue / Non-Delivery</option>
                        <option value="payment">Payment & Billing</option>
                        <option value="refill">Refill Request</option>
                        <option value="general">General Query</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Subject
                    </label>
                    <input
                        type="text"
                        name="subject"
                        required
                        placeholder="Brief description of the issue"
                        defaultValue={orderId ? `Issue with order #${trackingCode || orderId.substring(0, 8)}` : ""}
                        className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-200 focus:border-zinc-600 focus:outline-none transition"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Detailed Message
                </label>
                <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Provide details about your problem, including any errors or missing counts..."
                    className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-sm text-zinc-200 focus:border-zinc-600 focus:outline-none transition leading-relaxed resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition disabled:opacity-50"
            >
                {loading ? (
                    <span>Submitting...</span>
                ) : (
                    <>
                        <FiSend className="h-4 w-4" />
                        <span>Submit Ticket</span>
                    </>
                )}
            </button>
        </form>
    );
}