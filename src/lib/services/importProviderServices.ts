import { fetchProviderServices } from "@/lib/providers/provider.service";
import { createClient } from "@/lib/supabase/server";

interface ImportParams {
	providerId: string;
	apiUrl: string;
	apiKey: string;
}

export async function importProviderServices(params: ImportParams) {
	// Initialize your server-side Supabase client
	const supabase = await createClient();

	// Fetch external services from the wholesaler API
	const services = await fetchProviderServices(params.apiUrl, params.apiKey);

	let imported = 0;

	for (const service of services) {
		// 1. Check if this provider service mapping already exists in provider_services
		const { data: existing, error: fetchError } = await supabase
			.from("provider_services")
			.select("id")
			.eq("provider_id", params.providerId)
			.eq("external_service_id", service.service.toString())
			.maybeSingle(); // Safe lookup: won't throw an error if missing

		if (fetchError) {
			console.error(`Error checking service existence: ${fetchError.message}`);
			continue;
		}

		if (existing) {
			// 2. If it exists, update it with fresh rates/rules
			const { error: updateError } = await supabase
				.from("provider_services")
				.update({
					name: service.name,
					category: service.category,
					rate: Number(service.rate),
					min_qty: Number(service.min),
					max_qty: Number(service.max),
					raw: service, // Save the full object payload for auditing
				})
				.eq("id", existing.id);

			if (updateError) {
				console.error(
					`Error updating service ${service.service}: ${updateError.message}`,
				);
			}
			continue;
		}

		// 3. If it doesn't exist, insert it into provider_services catalog
		const { error: insertError } = await supabase
			.from("provider_services")
			.insert({
				provider_id: params.providerId,
				external_service_id: service.service.toString(),
				name: service.name,
				category: service.category,
				rate: Number(service.rate),
				min_qty: Number(service.min),
				max_qty: Number(service.max),
				active: false, // Keep it hidden until manually approved or audited
				raw: service,
			});

		if (insertError) {
			console.error(
				`Error inserting service ${service.service}: ${insertError.message}`,
			);
			continue;
		}

		imported++;
	}

	return {
		imported,
		total: services.length,
	};
}
