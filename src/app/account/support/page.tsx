import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiChevronLeft, FiMessageSquare } from "react-icons/fi";
import { createClient } from "@/lib/supabase/server";
import SupportForm from "@/components/account/supportForm";

export default async function SupportPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return notFound();

    // Fetch previous user tickets
    const { data: tickets } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <main className="min-h-screen bg-black text-white px-6 py-24">
            <div className="mx-auto w-full max-w-4xl space-y-10">
                <Link
                    href="/s/orders"
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition group"
                >
                    <FiChevronLeft className="transform group-hover:-translate-x-0.5 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Support & Help Desk</h1>
                    <p className="text-sm text-zinc-400">
                        Submit a ticket or report an issue with an order. Our team responds within 24 hours.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                    {/* Ticket Submission Form */}
                    <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-8 space-y-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FiMessageSquare className="text-zinc-400" />
                            Submit a Complaint / Report
                        </h2>
                        <Suspense fallback={<div className="p-8 text-center text-zinc-500 text-sm">Loading support form...</div>}>
                            <SupportForm />
                        </Suspense>
                    </div>

                    {/* Previous Tickets History Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/50 p-6 space-y-4">
                            <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-500">
                                Ticket History
                            </h3>

                            {!tickets || tickets.length === 0 ? (
                                <p className="text-xs text-zinc-500 py-4 text-center">
                                    No support tickets submitted yet.
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                    {tickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="p-4 rounded-2xl border border-zinc-850 bg-black/40 space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                                                    ticket.status === "open"
                                                        ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                                                        : ticket.status === "resolved"
                                                        ? "bg-green-400/10 text-green-400 border-green-400/20"
                                                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                                                }`}>
                                                    {ticket.status}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-mono">
                                                    {new Date(ticket.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs font-semibold text-zinc-200 line-clamp-1">
                                                {ticket.subject}
                                            </p>
                                            {ticket.admin_response && (
                                                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 mt-2">
                                                    <span className="font-bold text-white block mb-0.5">Admin Reply:</span>
                                                    {ticket.admin_response}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}