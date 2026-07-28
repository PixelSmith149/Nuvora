export type Service = {
	id: string;

	platform: string;
	service_type: string;

	title: string;
	description: string | null;

	price_per_1000: number;

	active: boolean;

	created_at: string;

	provider_service_id: string | null;
};

export type PlatformGroup = {
	platform: string;
	total_services: number;
};
