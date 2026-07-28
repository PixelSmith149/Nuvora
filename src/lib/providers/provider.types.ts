export interface ProviderConfig {
	id: string;
	apiUrl: string;
	apiKey: string;
}

export interface ProviderService {
	service: string;
	name: string;
	category: string;
	rate: string;
	min: string;
	max: string;
	refill?: boolean;
	cancel?: boolean;
}
