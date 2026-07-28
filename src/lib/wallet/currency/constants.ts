export type GlobalCurrency = {
	code: string;
	flag: string;
	name: string;
	region: "Africa" | "Americas" | "Europe" | "Asia-Pacific";
};

export const GLOBAL_SUPPORTED_CURRENCIES: GlobalCurrency[] = [
	// 🇺🇸 Americas
	{ code: "USD", flag: "🇺🇸", name: "US Dollar", region: "Americas" },
	{ code: "CAD", flag: "🇨🇦", name: "Canadian Dollar", region: "Americas" },
	{ code: "BRL", flag: "🇧🇷", name: "Brazilian Real", region: "Americas" },
	{ code: "MXN", flag: "🇲🇽", name: "Mexican Peso", region: "Americas" },

	// 🌍 Africa
	{ code: "GHS", flag: "🇬🇭", name: "Ghanaian Cedi", region: "Africa" },
	{ code: "NGN", flag: "🇳🇬", name: "Nigerian Naira", region: "Africa" },
	{ code: "KES", flag: "🇰🇪", name: "Kenyan Shilling", region: "Africa" },
	{ code: "ZAR", flag: "🇿🇦", name: "South African Rand", region: "Africa" },
	{ code: "EGP", flag: "🇪🇬", name: "Egyptian Pound", region: "Africa" },
	{ code: "XOF", flag: "🇨🇮", name: "CFA Franc (West)", region: "Africa" },
	{ code: "XAF", flag: "🇨🇲", name: "CFA Franc (Central)", region: "Africa" },

	// 🇪🇺 Europe & UK
	{ code: "EUR", flag: "🇪🇺", name: "Euro", region: "Europe" },
	{ code: "GBP", flag: "🇬🇧", name: "British Pound", region: "Europe" },

	// 🌏 Asia-Pacific
	{ code: "INR", flag: "🇮🇳", name: "Indian Rupee", region: "Asia-Pacific" },
	{
		code: "AUD",
		flag: "🇦🇺",
		name: "Australian Dollar",
		region: "Asia-Pacific",
	},
	{ code: "AED", flag: "🇦🇪", name: "UAE Dirham", region: "Asia-Pacific" },
];
