import { createClient } from "@/lib/supabase/server";

interface AuditLogParams {
	userId?: string;
	action: string;
	entityType: string;
	entityId?: string;
	metadata?: Record<string, any>;
}

export async function createAuditLog({
	userId,
	action,
	entityType,
	entityId,
	metadata,
}: AuditLogParams) {
	const supabase = await createClient();

	const { error } = await supabase.from("audit_logs").insert({
		user_id: userId,
		action,
		entity_type: entityType,
		entity_id: entityId,
		metadata: metadata ?? {},
	});

	if (error) {
		throw error;
	}
}
