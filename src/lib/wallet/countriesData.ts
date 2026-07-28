export type CountryOption = {
	code: string;
	name: string;
	currency: string;
	flag: string;
	methods: {
		momo: string[];
		bank: string[];
		card: string[];
		crypto: string[];
	};
};

export const GLOBAL_COUNTRIES: CountryOption[] = [
	{
		code: "GH",
		name: "Ghana",
		currency: "GHS",
		flag: "🇬🇭",
		methods: {
			momo: ["mtn", "telecel", "at"],
			bank: [
				"Ghana Commercial Bank",
				"Absa Bank",
				"Ecobank",
				"Standard Chartered",
			],
			card: ["Visa", "Mastercard"],
			crypto: [
				"BTC-OnChain",
				"BTC-LightningNetwork",
				"USDT-TRC20",
				"LTC-OnChain",
			],
		},
	},
	{
		code: "NG",
		name: "Nigeria",
		currency: "NGN",
		flag: "🇳🇬",
		methods: {
			momo: [],
			bank: ["Access Bank", "GTBank", "Zenith Bank", "UBA", "Sterling Bank"],
			card: ["Visa", "Mastercard", "Verve"],
			crypto: ["BTC-OnChain", "BTC-LightningNetwork", "USDT-TRC20"],
		},
	},
	{
		code: "CI",
		name: "Côte d'Ivoire",
		currency: "XOF",
		flag: "🇨🇮",
		methods: {
			momo: ["mtn", "orange", "moov"],
			bank: ["SGBCI", "Ecobank", "BACCI"],
			card: ["Visa", "Mastercard"],
			crypto: ["BTC-OnChain", "USDT-TRC20"],
		},
	},
	{
		code: "CM",
		name: "Cameroon",
		currency: "XAF",
		flag: "🇨🇲",
		methods: {
			momo: ["mtn", "orange"],
			bank: ["Afriland First Bank", "BICEC", "SGBC"],
			card: ["Visa"],
			crypto: ["BTC-OnChain", "USDT-TRC20"],
		},
	},
	{
		code: "KE",
		name: "Kenya",
		currency: "KES",
		flag: "🇰🇪",
		methods: {
			momo: ["mpesa", "airtel-money"],
			bank: ["KCB Bank", "Equity Bank", "Co-operative Bank"],
			card: ["Visa", "Mastercard"],
			crypto: ["BTC-OnChain", "USDT-TRC20"],
		},
	},
	{
		code: "UG",
		name: "Uganda",
		currency: "UGX",
		flag: "🇺🇬",
		methods: {
			momo: ["mtn", "airtel"],
			bank: ["Stanbic Bank", "Centenary Bank", "Standard Chartered"],
			card: ["Visa", "Mastercard"],
			crypto: ["BTC-OnChain", "USDT-TRC20"],
		},
	},
	{
		code: "US",
		name: "United States",
		currency: "USD",
		flag: "🇺🇸",
		methods: {
			momo: [],
			bank: ["FedWire ACH", "Bank of America", "Chase", "Wells Fargo"],
			card: ["Visa", "Mastercard", "Amex", "Discover"],
			crypto: [
				"BTC-OnChain",
				"BTC-LightningNetwork",
				"USDT-ERC20",
				"USDC-Solana",
			],
		},
	},
	{
		code: "GB",
		name: "United Kingdom",
		currency: "GBP",
		flag: "🇬🇧",
		methods: {
			momo: [],
			bank: ["FPS Faster Payments", "Barclays", "HSBC", "Lloyds"],
			card: ["Visa", "Mastercard"],
			crypto: ["BTC-OnChain", "BTC-LightningNetwork", "USDT-ERC20"],
		},
	},
	{
		code: "ZA",
		name: "South Africa",
		currency: "ZAR",
		flag: "🇿🇦",
		methods: {
			momo: ["Capitec Pay"],
			bank: ["Standard Bank", "FNB", "Absa", "Nedbank"],
			card: ["Visa", "Mastercard"],
			crypto: ["BTC-OnChain", "USDT-TRC20"],
		},
	},
];
