// types/whois-json.d.ts

declare module "whois-json" {
	interface WhoisOptions {
		follow?: number;
		timeout?: number;
		server?: string;
		verbose?: boolean;
	}

	interface WhoisResult {
		domainName?: string;
		registrant?: string;
		registrar?: string;
		creationDate?: string;
		expirationDate?: string;
		nameservers?: string[];
		[key: string]: any;
	}

	function whois(domain: string, options?: WhoisOptions): Promise<WhoisResult>;
	function whois(
		domain: string,
		callback?: (err: Error | null, data: WhoisResult) => void,
	): void;
	function whois(
		domain: string,
		options: WhoisOptions,
		callback: (err: Error | null, data: WhoisResult) => void,
	): void;

	export = whois;
}
