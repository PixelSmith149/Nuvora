import { createClient } from "@/lib/supabase/server";

export async function getOrderStats(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("user_id", userId);

    if (error || !data) {
        return { total: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 };
    }

    return {
        total: data.length,
        pending: data.filter((o) => o.status === "pending").length,
        processing: data.filter((o) => o.status === "processing" || o.status === "in_progress").length,
        completed: data.filter((o) => o.status === "completed").length,
        cancelled: data.filter(
            (o) => o.status === "canceled" || o.status === "cancelled" || o.status === "refunded"
        ).length,
    };
}