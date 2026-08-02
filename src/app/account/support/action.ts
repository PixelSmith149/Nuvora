"use server"; // MUST be strictly "use server" at the very top

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSupportTicket(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to submit a ticket." };
    }

    const orderId = formData.get("order_id") as string;
    const trackingCode = formData.get("tracking_code") as string;
    const category = (formData.get("category") as string) || "general";
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!subject || !message) {
        return { error: "Please fill out all required fields." };
    }

    const { error } = await supabase.from("tickets").insert({
        user_id: user.id,
        order_id: orderId || null,
        tracking_code: trackingCode || null,
        category,
        subject,
        message,
        status: "open",
        priority: orderId ? "high" : "medium",
    });

    if (error) {
        console.error("Error creating ticket:", error);
        return { error: "Failed to submit ticket. Please try again." };
    }

    revalidatePath("/account/support");
    return { success: true };
}