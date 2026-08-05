import type { NextConfig } from "next";

const ContentSecurityPolicy = `
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
style-src 'self' 'unsafe-inline' https:;
img-src 'self' data: blob: https:;
font-src 'self' https:;
connect-src
  'self'
  https://*.supabase.co
  wss://*.supabase.co
  https://api.paystack.co
  https://*.paystack.co
  https://open.er-api.com
  https://api.exchangerate.host
  https://api.frankfurter.app
  https:;
frame-src
  https://*.paystack.co;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
`
	.replace(/\n/g, "")
	.replace(/\s{2,}/g, " ")
	.trim();

const securityHeaders = [
	{
		key: "Content-Security-Policy",
		value: ContentSecurityPolicy,
	},
	{
		key: "X-Content-Type-Options",
		value: "nosniff",
	},
	{
		key: "X-Frame-Options",
		value: "DENY",
	},
	{
		key: "Referrer-Policy",
		value: "strict-origin-when-cross-origin",
	},
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), payment=(self)",
	},
];

const nextConfig: NextConfig = {
	reactStrictMode: true,

	 async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'admin.nu-vora.app',
          },
        ],
        destination: '/[tech]/:path*',
      },
    ];
  },


	// ─── Compiler ──────────────────────────────────────────────────────
	compiler: {
		removeConsole:
			process.env.NODE_ENV === "production"
				? {
						exclude: ["error", "warn"],
				  }
				: false,
	},

	// ─── Images ──────────────────────────────────────────────────────
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
		],
	},

	// ─── Headers ──────────────────────────────────────────────────────
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;