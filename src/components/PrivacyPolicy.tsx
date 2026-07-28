// components/PrivacyPolicy.tsx

"use client";

import {
	AlertCircle,
	BookOpen,
	Building2,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Clock,
	Cookie,
	Database,
	Download,
	Edit,
	ExternalLink,
	Eye,
	FileText,
	Globe,
	HeartHandshake,
	Info,
	Key,
	Layers,
	Lock,
	Mail,
	MapPin,
	MessageSquare,
	Package,
	Phone,
	RefreshCw,
	Scale,
	Send,
	Server,
	Shield,
	ShieldCheck,
	Smartphone,
	Star,
	Trash2,
	UserCheck,
	Users,
} from "lucide-react";
import React, { useState } from "react";

interface PrivacyPolicyProps {
	onAccept?: () => void;
	onDecline?: () => void;
	isLoading?: boolean;
	variant?: "modal" | "page";
}

export function PrivacyPolicy({
	onAccept,
	onDecline,
	isLoading = false,
	variant = "page",
}: PrivacyPolicyProps) {
	const [expandedSection, setExpandedSection] = useState<string | null>(null);
	const [accepted, setAccepted] = useState(false);

	const toggleSection = (sectionId: string) => {
		setExpandedSection(expandedSection === sectionId ? null : sectionId);
	};

	const sections = [
		// ─── 1. INTRODUCTION & OVERVIEW ──────────────────────────────
		{
			id: "intro",
			icon: Info,
			title: "1. Introduction & Overview",
			color: "emerald",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">Who We Are:</p>
					<p className="text-zinc-400 leading-relaxed">
						Prime Boostage | Elite Home is a comprehensive digital ecosystem
						offering three integrated services:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white font-medium">Global Market</span> —
							Digital asset marketplace for buying and selling
						</li>
						<li>
							<span className="text-white font-medium">SMM Panel</span> — Social
							media marketing services
						</li>
						<li>
							<span className="text-white font-medium">Social Tenant</span> —
							Website builder and design services
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						What This Policy Covers:
					</p>
					<p className="text-zinc-400 leading-relaxed">
						This Privacy Policy explains how we collect, use, store, share, and
						protect your personal information across all phases of our platform.
						It covers every interaction you have with Prime Boostage | Elite
						Home.
					</p>

					<p className="font-semibold text-white mt-4">Scope of This Policy:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							All platform users (buyers, sellers, service providers, clients)
						</li>
						<li>All phases (Global Market, SMM Panel, Social Tenant)</li>
						<li>All services (listing, purchasing, marketing, design)</li>
						<li>All interactions (web, mobile, API)</li>
					</ul>

					<p className="font-semibold text-white mt-4">Your Acceptance:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>By using our platform, you consent to this Privacy Policy</li>
						<li>
							If you disagree with any part, please do not use our services
						</li>
						<li>Continued use after updates constitutes acceptance</li>
					</ul>

					<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5 mt-2">
						<p className="text-xs text-zinc-500">
							<span className="text-emerald-400">📅 Last Updated:</span>{" "}
							{new Date().toLocaleDateString("en-US", {
								month: "long",
								year: "numeric",
							})}
						</p>
						<p className="text-xs text-zinc-500 mt-1">
							<span className="text-emerald-400">📧 Privacy Team:</span>{" "}
							privacy@primeboostage.com
						</p>
					</div>
				</div>
			),
		},

		// ─── 2. INFORMATION WE COLLECT ───────────────────────────────
		{
			id: "collect",
			icon: Database,
			title: "2. Information We Collect",
			color: "sky",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">Personal Information:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Name:</span> Full name, display name,
							username
						</li>
						<li>
							<span className="text-white">Contact:</span> Email address, phone
							number
						</li>
						<li>
							<span className="text-white">Profile:</span> Avatar, bio, store
							description
						</li>
						<li>
							<span className="text-white">Social:</span> TikTok, Snapchat, and
							other social handles
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Account & Authentication Data:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Credentials:</span> Password (hashed
							and salted)
						</li>
						<li>
							<span className="text-white">Authentication:</span> Login tokens,
							session data
						</li>
						<li>
							<span className="text-white">Biometric:</span> 15-second facial
							recognition video (sellers only)
						</li>
						<li>
							<span className="text-white">Verification:</span> Identity
							verification documents
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Payment & Financial Data:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Wallet:</span> Balances, transaction
							history
						</li>
						<li>
							<span className="text-white">Payments:</span> Purchase records,
							escrow holdings
						</li>
						<li>
							<span className="text-white">Withdrawals:</span> Payout history,
							withdrawal methods
						</li>
						<li>
							<span className="text-white">Fees:</span> Platform fees collected
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Usage & Technical Data:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Device:</span> IP address, device
							type, browser
						</li>
						<li>
							<span className="text-white">Location:</span> Geographic location
							(country/region)
						</li>
						<li>
							<span className="text-white">Activity:</span> Pages visited,
							features used
						</li>
						<li>
							<span className="text-white">Performance:</span> Loading times,
							error logs
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">Phase-Specific Data:</p>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
						<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
							<p className="text-xs font-bold text-emerald-400">
								Global Market
							</p>
							<ul className="text-[10px] text-zinc-400 space-y-1 mt-1 list-disc list-inside">
								<li>Asset listings and descriptions</li>
								<li>Sales and purchase history</li>
								<li>Reviews and ratings</li>
								<li>Locker contents</li>
							</ul>
						</div>
						<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
							<p className="text-xs font-bold text-purple-400">SMM Panel</p>
							<ul className="text-[10px] text-zinc-400 space-y-1 mt-1 list-disc list-inside">
								<li>Social media account details</li>
								<li>Service order history</li>
								<li>Engagement metrics</li>
								<li>Account growth data</li>
							</ul>
						</div>
						<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
							<p className="text-xs font-bold text-sky-400">Social Tenant</p>
							<ul className="text-[10px] text-zinc-400 space-y-1 mt-1 list-disc list-inside">
								<li>Website content and designs</li>
								<li>AI generation prompts</li>
								<li>Template customizations</li>
								<li>Storefront data</li>
							</ul>
						</div>
					</div>

					<div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
						<p className="text-xs text-amber-400 font-medium">
							🔒 Biometric Data Protection:
						</p>
						<p className="text-xs text-zinc-400 mt-1">
							Your biometric video is encrypted and stored securely. It is used
							solely for identity verification and is not shared with third
							parties. You can request deletion at any time.
						</p>
					</div>
				</div>
			),
		},

		// ─── 3. HOW WE USE YOUR INFORMATION ──────────────────────────
		{
			id: "use",
			icon: Eye,
			title: "3. How We Use Your Information",
			color: "purple",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">Platform Functionality:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Processing Purchases:</span> Orders,
							payments, escrow management
						</li>
						<li>
							<span className="text-white">Delivering Assets:</span> Locker
							delivery and management
						</li>
						<li>
							<span className="text-white">Account Management:</span>{" "}
							Registration, login, profile updates
						</li>
						<li>
							<span className="text-white">Verification:</span> Identity and age
							verification
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">Communication:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Notifications:</span> Purchase
							confirmations, delivery updates
						</li>
						<li>
							<span className="text-white">Support:</span> Responding to
							inquiries and tickets
						</li>
						<li>
							<span className="text-white">Marketing:</span> Promotional
							materials (opt-in required)
						</li>
						<li>
							<span className="text-white">Updates:</span> Platform
							announcements and policy changes
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Analytics & Improvement:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Platform Optimization:</span>{" "}
							Performance improvements
						</li>
						<li>
							<span className="text-white">User Experience:</span> Feature
							enhancements
						</li>
						<li>
							<span className="text-white">Trend Analysis:</span> Understanding
							user behavior
						</li>
						<li>
							<span className="text-white">Testing:</span> A/B testing and
							experiments
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Fraud Prevention & Security:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Identity Verification:</span>{" "}
							Preventing fake accounts
						</li>
						<li>
							<span className="text-white">Fraud Detection:</span> Identifying
							suspicious activity
						</li>
						<li>
							<span className="text-white">Risk Assessment:</span> Evaluating
							transaction risk
						</li>
						<li>
							<span className="text-white">Compliance:</span> Meeting legal and
							regulatory requirements
						</li>
					</ul>

					<div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
						<p className="text-xs text-emerald-400 font-medium">
							✅ Data Use Principles:
						</p>
						<ul className="text-xs text-zinc-400 mt-1 space-y-1 list-disc list-inside">
							<li>We only use data for purposes stated in this policy</li>
							<li>We minimize data collection to what's necessary</li>
							<li>We anonymize data where possible</li>
							<li>We never sell your personal information</li>
						</ul>
					</div>
				</div>
			),
		},

		// ─── 4. INFORMATION SHARING & DISCLOSURE ─────────────────────
		{
			id: "share",
			icon: Users,
			title: "4. Information Sharing & Disclosure",
			color: "amber",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">
						Third-Party Service Providers:
					</p>
					<p className="text-zinc-400 leading-relaxed">
						We share data with trusted third parties who help us operate our
						platform:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Payment Processors:</span> Stripe,
							PayPal, crypto gateways
						</li>
						<li>
							<span className="text-white">Cloud Providers:</span> Supabase
							(database), AWS (storage)
						</li>
						<li>
							<span className="text-white">Analytics:</span> Google Analytics
							for usage insights
						</li>
						<li>
							<span className="text-white">Support:</span> Customer service
							tools
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">Legal Requirements:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Law enforcement requests with proper legal process</li>
						<li>Court orders and subpoenas</li>
						<li>Regulatory authority requirements</li>
						<li>Enforcement of our Terms of Service</li>
					</ul>

					<p className="font-semibold text-white mt-4">Business Transfers:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Sale, merger, or acquisition of the company</li>
						<li>Bankruptcy or insolvency proceedings</li>
						<li>Asset transfers to other parties</li>
						<li>Users notified of material changes</li>
					</ul>

					<p className="font-semibold text-white mt-4">With Your Consent:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Explicit consent for additional sharing</li>
						<li>Opt-in marketing communications</li>
						<li>Third-party integrations you enable</li>
						<li>You can withdraw consent anytime</li>
					</ul>

					<div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
						<p className="text-xs text-red-400 font-medium">
							🚫 What We Do NOT Share:
						</p>
						<ul className="text-xs text-zinc-400 mt-1 space-y-1 list-disc list-inside">
							<li>Biometric verification videos</li>
							<li>Wallet passwords or payment credentials</li>
							<li>Private messages between users</li>
							<li>Data without proper legal basis</li>
						</ul>
					</div>
				</div>
			),
		},

		// ─── 5. DATA STORAGE & SECURITY ──────────────────────────────
		{
			id: "security",
			icon: Shield,
			title: "5. Data Storage & Security",
			color: "emerald",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">Data Storage:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Primary Database:</span> Supabase
							PostgreSQL (encrypted)
						</li>
						<li>
							<span className="text-white">File Storage:</span> Supabase Storage
							(encrypted)
						</li>
						<li>
							<span className="text-white">Backups:</span> Automated daily
							backups
						</li>
						<li>
							<span className="text-white">Location:</span> Data stored in
							secure data centers
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">Encryption Standards:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">In Transit:</span> TLS 1.3 encryption
							for all data
						</li>
						<li>
							<span className="text-white">At Rest:</span> AES-256 encryption
							for stored data
						</li>
						<li>
							<span className="text-white">Passwords:</span> Hashed and salted
							with bcrypt
						</li>
						<li>
							<span className="text-white">Biometric:</span> Encrypted with
							user-specific keys
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">Security Measures:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Authentication:</span> JWT tokens
							with short expiry
						</li>
						<li>
							<span className="text-white">Access Control:</span> Role-based
							access (RBAC)
						</li>
						<li>
							<span className="text-white">Monitoring:</span> Real-time security
							monitoring
						</li>
						<li>
							<span className="text-white">Audits:</span> Regular security
							audits and penetration testing
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">Data Retention:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Active Accounts:</span> Data retained
							while account is active
						</li>
						<li>
							<span className="text-white">Inactive Accounts:</span> 30 days
							after inactivity
						</li>
						<li>
							<span className="text-white">Deleted Accounts:</span> Data deleted
							within 30 days
						</li>
						<li>
							<span className="text-white">Transaction History:</span> Retained
							for legal compliance
						</li>
					</ul>

					<div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
						<p className="text-xs text-emerald-400 font-medium">
							🔐 Security Incident Response:
						</p>
						<ul className="text-xs text-zinc-400 mt-1 space-y-1 list-disc list-inside">
							<li>Immediate containment procedures</li>
							<li>User notification within 72 hours (if applicable)</li>
							<li>Forensic investigation by security team</li>
							<li>Remediation and prevention measures</li>
						</ul>
					</div>
				</div>
			),
		},

		// ─── 6. YOUR RIGHTS ──────────────────────────────────────────
		{
			id: "rights",
			icon: UserCheck,
			title: "6. Your Rights",
			color: "purple",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">Right to Access:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>View all personal data we hold about you</li>
						<li>Request a copy of your data</li>
						<li>Access your transaction history</li>
						<li>View your profile and account settings</li>
					</ul>

					<p className="font-semibold text-white mt-4">Right to Correction:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Update inaccurate or incomplete data</li>
						<li>Change profile information anytime</li>
						<li>Correct transaction records (if applicable)</li>
						<li>Update contact information</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Right to Deletion (Right to be Forgotten):
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Request permanent data deletion</li>
						<li>Deleted data removed within 30 days</li>
						<li>Some data may be retained for legal compliance</li>
						<li>Secure deletion methods used</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Right to Data Portability:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Receive data in portable format (JSON)</li>
						<li>Transfer data to another service</li>
						<li>Export transaction history</li>
						<li>Export account data</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Right to Restrict Processing:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Request limited data processing</li>
						<li>Opt-out of marketing communications</li>
						<li>Restrict certain data uses</li>
						<li>Withdraw consent at any time</li>
					</ul>

					<p className="font-semibold text-white mt-4">Right to Object:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Object to automated decision-making</li>
						<li>Object to data processing for marketing</li>
						<li>Object to data sharing with third parties</li>
						<li>Object to profiling and analytics</li>
					</ul>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
						<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5 text-center">
							<Mail className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
							<p className="text-[10px] text-zinc-400">Submit Requests To:</p>
							<p className="text-xs text-white font-medium">
								privacy@primeboostage.com
							</p>
						</div>
						<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5 text-center">
							<Clock className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
							<p className="text-[10px] text-zinc-400">Response Time:</p>
							<p className="text-xs text-white font-medium">Within 30 days</p>
						</div>
					</div>
				</div>
			),
		},

		// ─── 7. COOKIES & TRACKING ──────────────────────────────────
		{
			id: "cookies",
			icon: Cookie,
			title: "7. Cookies & Tracking",
			color: "amber",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">What Are Cookies:</p>
					<p className="text-zinc-400 leading-relaxed">
						Cookies are small text files stored on your device that help us
						remember your preferences, maintain sessions, and improve your
						experience on our platform.
					</p>

					<p className="font-semibold text-white mt-4">
						Types of Cookies We Use:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Essential:</span> Login sessions,
							security, basic functionality
						</li>
						<li>
							<span className="text-white">Functional:</span> Preferences,
							language, region
						</li>
						<li>
							<span className="text-white">Analytics:</span> Usage patterns,
							performance metrics
						</li>
						<li>
							<span className="text-white">Marketing:</span> Campaign
							effectiveness (opt-in only)
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">Cookie Management:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Change cookie settings in your browser</li>
						<li>Delete existing cookies anytime</li>
						<li>Opt-out of non-essential cookies</li>
						<li>Cookie preferences saved locally</li>
					</ul>

					<p className="font-semibold text-white mt-4">Third-Party Cookies:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Analytics providers (Google Analytics)</li>
						<li>Payment processors (Stripe, PayPal)</li>
						<li>Social media integrations</li>
						<li>CDN and performance providers</li>
					</ul>

					<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
						<p className="text-xs text-zinc-400">
							<span className="text-white">🔧 Cookie Preferences:</span> You can
							manage cookie settings anytime in your browser preferences.
							Essential cookies cannot be disabled as they ensure platform
							functionality.
						</p>
					</div>
				</div>
			),
		},

		// ─── 8. PHASE-SPECIFIC PRIVACY ──────────────────────────────
		{
			id: "phase-specific",
			icon: Layers,
			title: "8. Phase-Specific Privacy Considerations",
			color: "sky",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
						<div className="flex items-center gap-2 mb-2">
							<Package className="h-4 w-4 text-emerald-400" />
							<p className="font-semibold text-white">Global Market Privacy</p>
						</div>
						<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2 text-xs">
							<li>
								<span className="text-white">Seller Data:</span> Listing
								details, sales history, verified status
							</li>
							<li>
								<span className="text-white">Buyer Data:</span> Purchase
								history, locker contents, reviews
							</li>
							<li>
								<span className="text-white">Transaction Data:</span> Escrow
								holdings, payment records
							</li>
							<li>
								<span className="text-white">Reviews:</span> Public ratings and
								feedback
							</li>
							<li>
								<span className="text-white">Data Sharing:</span> Seller name
								visible to buyers, buyer name visible to sellers
							</li>
						</ul>
					</div>

					<div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
						<div className="flex items-center gap-2 mb-2">
							<Send className="h-4 w-4 text-purple-400" />
							<p className="font-semibold text-white">SMM Panel Privacy</p>
						</div>
						<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2 text-xs">
							<li>
								<span className="text-white">Service Data:</span> Order history,
								delivery status
							</li>
							<li>
								<span className="text-white">Social Accounts:</span> Platform
								names, usernames, metrics
							</li>
							<li>
								<span className="text-white">Engagement Data:</span> Likes,
								views, comments, shares
							</li>
							<li>
								<span className="text-white">Data Sharing:</span> Service
								providers see order details
							</li>
							<li>
								<span className="text-white">Account Safety:</span> We never
								store social passwords
							</li>
						</ul>
					</div>

					<div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl">
						<div className="flex items-center gap-2 mb-2">
							<Building2 className="h-4 w-4 text-sky-400" />
							<p className="font-semibold text-white">Social Tenant Privacy</p>
						</div>
						<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2 text-xs">
							<li>
								<span className="text-white">Design Data:</span> AI prompts,
								generated designs, customizations
							</li>
							<li>
								<span className="text-white">Website Content:</span> Page
								content, images, copy
							</li>
							<li>
								<span className="text-white">Template Usage:</span> Selected
								templates and modifications
							</li>
							<li>
								<span className="text-white">Data Sharing:</span> Designs not
								shared with third parties
							</li>
							<li>
								<span className="text-white">Ownership:</span> You own final
								designs and content
							</li>
						</ul>
					</div>

					<div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
						<p className="text-xs text-amber-400 font-medium">
							⚠️ Cross-Phase Data:
						</p>
						<p className="text-xs text-zinc-400 mt-1">
							Data across phases may be used for platform-wide analytics and
							fraud prevention. We do not cross-share data with third parties
							without explicit consent.
						</p>
					</div>
				</div>
			),
		},

		// ─── 9. CHILDREN'S PRIVACY ──────────────────────────────────
		{
			id: "children",
			icon: Shield,
			title: "9. Children's Privacy",
			color: "rose",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">Age Restriction:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Platform is strictly for users aged 18 and older</li>
						<li>Age verification required during account creation</li>
						<li>Parental consent not accepted for under-18 users</li>
						<li>We do not knowingly collect data from minors</li>
					</ul>

					<p className="font-semibold text-white mt-4">COPPA Compliance:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							Fully compliant with Children's Online Privacy Protection Act
						</li>
						<li>No targeted advertising to minors</li>
						<li>No collection of child data</li>
						<li>Prompt deletion of any accidental minor data</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Minor Data Protection:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>If we discover data from a minor, we delete it immediately</li>
						<li>Report suspected minor accounts to support</li>
						<li>Additional verification for age-sensitive features</li>
						<li>Enhanced monitoring for underage activity</li>
					</ul>

					<div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
						<p className="text-xs text-amber-400 font-medium">
							📢 Reporting Minor Accounts:
						</p>
						<p className="text-xs text-zinc-400 mt-1">
							If you believe a minor is using our platform, please report it to:
							<span className="text-white font-medium">
								{" "}
								support@primeboostage.com
							</span>
						</p>
					</div>
				</div>
			),
		},

		// ─── 10. INTERNATIONAL DATA TRANSFERS ──────────────────────
		{
			id: "transfers",
			icon: Globe,
			title: "10. International Data Transfers",
			color: "emerald",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">Cross-Border Data Flow:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Data may be processed in countries outside your residence</li>
						<li>Data centers located globally for performance</li>
						<li>All data transfers comply with applicable laws</li>
						<li>Standard Contractual Clauses in place</li>
					</ul>

					<p className="font-semibold text-white mt-4">Legal Frameworks:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">GDPR:</span> EU General Data
							Protection Regulation compliance
						</li>
						<li>
							<span className="text-white">CCPA:</span> California Consumer
							Privacy Act compliance
						</li>
						<li>
							<span className="text-white">UK GDPR:</span> UK data protection
							compliance
						</li>
						<li>
							<span className="text-white">Privacy Shield:</span> EU-US Data
							Privacy Framework
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">Data Localization:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Primary data stored in secure locations</li>
						<li>Backups in geographically distributed locations</li>
						<li>User data may be stored in multiple regions</li>
						<li>We respect regional data sovereignty laws</li>
					</ul>

					<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
						<p className="text-xs text-zinc-400">
							<span className="text-white">🌍 Data Protection Officer:</span>{" "}
							Our DPO ensures compliance with international data protection
							laws. Contact:{" "}
							<span className="text-emerald-400">dpo@primeboostage.com</span>
						</p>
					</div>
				</div>
			),
		},

		// ─── 11. AUTOMATED DECISION-MAKING ──────────────────────────
		{
			id: "automated",
			icon: RefreshCw,
			title: "11. Automated Decision-Making",
			color: "purple",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">Automated Systems:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Escrow Auto-Release:</span> Funds
							automatically released after 7 days without confirmation
						</li>
						<li>
							<span className="text-white">Fraud Detection:</span> Automated
							systems flag suspicious activity
						</li>
						<li>
							<span className="text-white">Risk Assessment:</span> Transaction
							risk scoring for security
						</li>
						<li>
							<span className="text-white">Content Moderation:</span>{" "}
							AI-assisted content review
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						User Rights Regarding Automation:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Right to contest automated decisions</li>
						<li>Right to human review of automated decisions</li>
						<li>Right to understand how decisions are made</li>
						<li>Right to opt-out of automated processing</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Transparency in Automation:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Clear explanation of automated processes</li>
						<li>Regular audits of automated systems</li>
						<li>Bias detection and mitigation measures</li>
						<li>Human oversight for critical decisions</li>
					</ul>

					<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
						<p className="text-xs text-zinc-400">
							<span className="text-white">⚖️ Human Review:</span> Automated
							decisions can be reviewed by our team upon request. Contact
							support for manual review of any automated decision.
						</p>
					</div>
				</div>
			),
		},

		// ─── 12. THIRD-PARTY LINKS & SERVICES ──────────────────────
		{
			id: "third-party",
			icon: ExternalLink,
			title: "12. Third-Party Links & Services",
			color: "amber",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">External Links:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Platform may contain links to third-party websites</li>
						<li>Third-party sites have their own privacy policies</li>
						<li>We are not responsible for third-party practices</li>
						<li>Use third-party links at your own risk</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Third-Party Integrations:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Payment processors (Stripe, PayPal, crypto)</li>
						<li>Social media platforms (TikTok, Snapchat)</li>
						<li>Analytics providers (Google Analytics)</li>
						<li>Cloud service providers (Supabase, AWS)</li>
					</ul>

					<p className="font-semibold text-white mt-4">Integration Privacy:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Third-party services have their own data practices</li>
						<li>We only share necessary data with providers</li>
						<li>Providers are contractually bound to data protection</li>
						<li>We review third-party security regularly</li>
					</ul>

					<div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
						<p className="text-xs text-amber-400 font-medium">
							⚠️ Privacy on External Sites:
						</p>
						<p className="text-xs text-zinc-400 mt-1">
							When you click external links or use third-party integrations,
							their privacy policies apply. We encourage you to review their
							privacy practices.
						</p>
					</div>
				</div>
			),
		},

		// ─── 13. DATA BREACH NOTIFICATION ──────────────────────────
		{
			id: "breach",
			icon: AlertCircle,
			title: "13. Data Breach Notification",
			color: "rose",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">Our Commitment:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Prompt investigation of any security incidents</li>
						<li>Immediate containment measures</li>
						<li>24/7 security monitoring</li>
						<li>Regular security audits and penetration testing</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Notification Timeline:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Affected users notified within 72 hours</li>
						<li>Regulatory authorities notified as required</li>
						<li>Detailed breach report provided</li>
						<li>Remediation plan shared with affected users</li>
					</ul>

					<p className="font-semibold text-white mt-4">Breach Response Team:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Dedicated incident response team</li>
						<li>External security experts engagement</li>
						<li>Forensic investigation procedures</li>
						<li>Continuous improvement of security measures</li>
					</ul>

					<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
						<p className="text-xs text-zinc-400">
							<span className="text-white">📱 Report Security Concerns:</span>{" "}
							If you discover a security vulnerability, please report it
							immediately to:{" "}
							<span className="text-emerald-400">
								security@primeboostage.com
							</span>
						</p>
					</div>
				</div>
			),
		},

		// ─── 14. POLICY UPDATES ─────────────────────────────────────
		{
			id: "updates",
			icon: RefreshCw,
			title: "14. Policy Updates",
			color: "emerald",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">Notification of Updates:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Users notified of significant policy changes</li>
						<li>Email notification for major updates</li>
						<li>In-app notification on login</li>
						<li>Policy clearly marked with effective date</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						Acceptance of Updates:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Continued use implies acceptance of updated policy</li>
						<li>Users can review changes before accepting</li>
						<li>Option to decline updates (may affect service)</li>
						<li>Previous versions archived for reference</li>
					</ul>

					<p className="font-semibold text-white mt-4">Change Log:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Summary of significant changes provided</li>
						<li>Previous policy versions accessible</li>
						<li>Date of each update tracked</li>
						<li>Reason for changes explained</li>
					</ul>

					<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
						<p className="text-xs text-zinc-400">
							<span className="text-white">📋 Current Version:</span> v
							{new Date().getFullYear()}.1
						</p>
						<p className="text-xs text-zinc-400 mt-1">
							<span className="text-white">📅 Effective Date:</span>{" "}
							{new Date().toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
								year: "numeric",
							})}
						</p>
					</div>
				</div>
			),
		},

		// ─── 15. CONTACT INFORMATION ──────────────────────────────
		{
			id: "contact",
			icon: Mail,
			title: "15. Contact Information",
			color: "purple",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">Data Protection Officer:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Name:</span> Data Protection Officer
						</li>
						<li>
							<span className="text-white">Email:</span> dpo@primeboostage.com
						</li>
						<li>
							<span className="text-white">Response Time:</span> Within 48 hours
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">Privacy Team:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>
							<span className="text-white">Email:</span>{" "}
							privacy@primeboostage.com
						</li>
						<li>
							<span className="text-white">Support:</span>{" "}
							support@primeboostage.com
						</li>
						<li>
							<span className="text-white">Response Time:</span> Within 24-48
							hours
						</li>
					</ul>

					<p className="font-semibold text-white mt-4">Mailing Address:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Prime Boostage | Elite Home</li>
						<li>Privacy Department</li>
						<li>Available upon request</li>
					</ul>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
						<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
							<p className="text-xs font-bold text-emerald-400">
								📧 Privacy Inquiries
							</p>
							<p className="text-xs text-zinc-400 mt-1">
								privacy@primeboostage.com
							</p>
							<p className="text-[10px] text-zinc-500">
								For data-related questions
							</p>
						</div>
						<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
							<p className="text-xs font-bold text-emerald-400">
								🔒 Security Reports
							</p>
							<p className="text-xs text-zinc-400 mt-1">
								security@primeboostage.com
							</p>
							<p className="text-[10px] text-zinc-500">
								For vulnerability reports
							</p>
						</div>
					</div>
				</div>
			),
		},

		// ─── 16. COMPLAINT PROCEDURE ──────────────────────────────
		{
			id: "complaints",
			icon: Scale,
			title: "16. Complaint Procedure",
			color: "amber",
			content: (
				<div className="space-y-3 text-sm text-zinc-300">
					<p className="font-semibold text-white">
						Internal Complaint Process:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Submit complaint via support system</li>
						<li>Acknowledgment within 48 hours</li>
						<li>Investigation completed within 30 days</li>
						<li>Resolution and explanation provided</li>
					</ul>

					<p className="font-semibold text-white mt-4">Escalation Process:</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Unresolved complaints escalated to DPO</li>
						<li>DPO review within 15 days</li>
						<li>Final decision by Privacy Committee</li>
						<li>Appeal process available</li>
					</ul>

					<p className="font-semibold text-white mt-4">
						External Supervisory Authorities:
					</p>
					<ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
						<li>Right to complain to data protection authorities</li>
						<li>Contact information for authorities available</li>
						<li>Cross-border complaint handling</li>
						<li>Resolution through legal channels</li>
					</ul>

					<div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
						<p className="text-xs text-zinc-400">
							<span className="text-white">📋 Complaint Tracking:</span> All
							complaints are tracked and resolved systematically. You will
							receive updates throughout the process.
						</p>
					</div>
				</div>
			),
		},
	];

	const getColorClasses = (color: string) => {
		const colors: Record<string, { border: string; bg: string; text: string }> =
			{
				emerald: {
					border: "border-emerald-500/30",
					bg: "bg-emerald-500/10",
					text: "text-emerald-400",
				},
				purple: {
					border: "border-purple-500/30",
					bg: "bg-purple-500/10",
					text: "text-purple-400",
				},
				sky: {
					border: "border-sky-500/30",
					bg: "bg-sky-500/10",
					text: "text-sky-400",
				},
				amber: {
					border: "border-amber-500/30",
					bg: "bg-amber-500/10",
					text: "text-amber-400",
				},
				rose: {
					border: "border-rose-500/30",
					bg: "bg-rose-500/10",
					text: "text-rose-400",
				},
			};
		return colors[color] || colors.emerald;
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
				<p className="text-xs text-zinc-500 mt-3">Loading privacy policy...</p>
			</div>
		);
	}

	return (
		<div
			className={`flex flex-col h-full ${variant === "modal" ? "max-h-[80vh]" : ""}`}
		>
			{/* Header */}
			<div className="text-center space-y-2 pb-4 border-b border-white/5">
				<div className="flex items-center justify-center gap-2">
					<ShieldCheck className="h-6 w-6 text-emerald-400" />
					<h2 className="text-xl font-bold text-white">Privacy Policy</h2>
					<span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
						Prime Boostage | Elite Home
					</span>
				</div>
				<p className="text-xs text-zinc-400">
					Your privacy matters. Review how we handle your data across all
					platform phases.
				</p>
				<p className="text-[10px] text-zinc-500">
					Last Updated:{" "}
					{new Date().toLocaleDateString("en-US", {
						month: "long",
						year: "numeric",
					})}
				</p>
			</div>

			{/* Sections */}
			<div className="flex-1 overflow-y-auto py-4 space-y-4">
				{sections.map((section) => {
					const isExpanded = expandedSection === section.id;
					const Icon = section.icon;
					const colors = getColorClasses(section.color);

					return (
						<div
							key={section.id}
							className="border border-white/5 rounded-xl overflow-hidden bg-zinc-950/20"
						>
							<button
								onClick={() => toggleSection(section.id)}
								className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${colors.bg}`}
							>
								<Icon className={`h-5 w-5 ${colors.text} flex-shrink-0`} />
								<span className="text-sm font-bold text-white flex-1">
									{section.title}
								</span>
								{isExpanded ? (
									<ChevronUp className="h-4 w-4 text-zinc-500" />
								) : (
									<ChevronDown className="h-4 w-4 text-zinc-500" />
								)}
							</button>
							{isExpanded && (
								<div className="px-4 pb-4 pt-3 border-t border-white/5">
									{section.content}
								</div>
							)}
						</div>
					);
				})}

				{/* Quick Summary Box */}
				<div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
					<div className="flex items-center gap-2 mb-2">
						<HeartHandshake className="h-4 w-4 text-emerald-400" />
						<span className="text-xs font-bold text-white">
							Privacy at a Glance
						</span>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
						<div className="p-2 bg-zinc-900/50 rounded-lg text-center">
							<p className="text-emerald-400 font-bold">🔒 Encrypted</p>
							<p className="text-zinc-500">All Data</p>
						</div>
						<div className="p-2 bg-zinc-900/50 rounded-lg text-center">
							<p className="text-emerald-400 font-bold">✅ Control</p>
							<p className="text-zinc-500">Your Rights</p>
						</div>
						<div className="p-2 bg-zinc-900/50 rounded-lg text-center">
							<p className="text-emerald-400 font-bold">🚫 No Selling</p>
							<p className="text-zinc-500">Your Data</p>
						</div>
						<div className="p-2 bg-zinc-900/50 rounded-lg text-center">
							<p className="text-emerald-400 font-bold">🛡️ Secure</p>
							<p className="text-zinc-500">Storage</p>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="pt-4 border-t border-white/5 space-y-4">
				<div className="flex items-start gap-3 p-3 bg-zinc-900/30 rounded-xl border border-white/5">
					<input
						type="checkbox"
						id="privacy-accept"
						checked={accepted}
						onChange={(e) => setAccepted(e.target.checked)}
						className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0"
					/>
					<label
						htmlFor="privacy-accept"
						className="text-xs text-zinc-400 leading-relaxed"
					>
						I confirm that I have read and agree to the{" "}
						<span className="text-white font-medium">Privacy Policy</span> for
						<span className="text-emerald-400 font-medium">
							{" "}
							Prime Boostage | Elite Home
						</span>
						. I understand how my data is collected, used, and protected.
					</label>
				</div>

				<div className="flex gap-3">
					{onDecline && (
						<button
							onClick={onDecline}
							className="flex-1 border border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl h-11 text-xs font-bold transition-all"
						>
							Decline
						</button>
					)}
					{onAccept && (
						<button
							onClick={onAccept}
							disabled={!accepted}
							className={`flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-11 text-xs transition-all flex items-center justify-center gap-2 ${
								!accepted ? "opacity-40 cursor-not-allowed" : ""
							}`}
						>
							<CheckCircle2 className="h-4 w-4" />
							Accept & Continue
						</button>
					)}
				</div>

				<p className="text-[10px] text-center text-zinc-600">
					By accepting, you agree to our Privacy Policy and Terms of Service.
					<br />
					Need help?{" "}
					<a href="/support" className="text-emerald-400 hover:underline">
						Contact Support
					</a>
				</p>
			</div>
		</div>
	);
}

export default PrivacyPolicy;
