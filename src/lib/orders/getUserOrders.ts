import { createClient } from "@/lib/supabase/server";

export interface GetUserOrdersParams {
    userId: string;
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}

export interface GetUserOrdersResponse {
    data: any[];
    totalCount: number;
    totalPages: number;
}

export async function getUserOrders({
    userId,
    page = 1,
    limit = 10,
    status,
    search,
}: GetUserOrdersParams): Promise<GetUserOrdersResponse> {
    const supabase = await createClient();

    // 1. Build base query with exact row counting enabled
    let query = supabase
        .from("orders")
        .select(
            `
      *,
      services (
        title,
        platform,
        service_type
      )
    `,
            { count: "exact" }
        )
        .eq("user_id", userId);

    // 2. Status Filtering directly in SQL
    if (status) {
        if (status === "cancelled" || status === "canceled") {
            query = query.in("status", ["canceled", "cancelled"]);
        } else {
            query = query.eq("status", status);
        }
    }

    // 3. Search Filtering (matches order ID, tracking code, or target link)
    if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`id.ilike.${term},target.ilike.${term},tracking_code.ilike.${term}`);
    }

    // 4. Ordering & Range Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
        throw error;
    }

    const totalCount = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return {
        data: data ?? [],
        totalCount,
        totalPages,
    };
}