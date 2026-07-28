// components/SupportPage.tsx

"use client";

import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	BookOpen,
	Building2,
	CheckCircle2,
	ChevronDown,
	Clock,
	CreditCard,
	ExternalLink,
	FileText,
	Globe,
	HelpCircle,
	Home,
	Loader2,
	Lock,
	Mail,
	MessageCircle,
	Minus,
	Package,
	Phone,
	Plus,
	RefreshCw,
	Search,
	Send,
	Settings,
	ShieldCheck,
	ShoppingBag,
	Sparkles,
	Star,
	Store,
	ThumbsDown,
	ThumbsUp,
	TrendingUp,
	Truck,
	Users,
	Video,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ──────────────────────────────────────────────────────

type Phase = "global-market" | "smm-panel" | "social-tenant" | "general" | null;
type SolutionType = "guide" | "troubleshoot" | "escalation";

interface ConversationStep {
	id: string;
	type:
		| "welcome"
		| "phase-select"
		| "topic-select"
		| "sub-topic"
		| "solution"
		| "ticket"
		| "confirmation";
	data: any;
}

interface Topic {
	id: string;
	label: string;
	icon: React.ReactNode;
	subTopics?: SubTopic[];
}

interface SubTopic {
	id: string;
	label: string;
	solutionType: SolutionType;
	guideContent?: GuideContent;
	troubleshootSteps?: TroubleshootStep[];
	escalationReason?: string;
	finalMessage?: string;
}

interface GuideContent {
	title: string;
	steps: string[];
	tips?: string[];
}

interface TroubleshootStep {
	question: string;
	options: { label: string; value: string; nextStep?: string }[];
	finalMessage?: string;
}

interface TicketData {
	email: string;
	subject: string;
	description: string;
	attachment?: File;
	priority: "low" | "medium" | "high";
	category: string;
}

// ─── Main Component ────────────────────────────────────────────

export function SupportPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentStep, setCurrentStep] = useState<ConversationStep | null>(null);
	const [history, setHistory] = useState<ConversationStep[]>([]);
	const [selectedPhase, setSelectedPhase] = useState<Phase>(null);
	const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
	const [selectedSubTopic, setSelectedSubTopic] = useState<string | null>(null);
	const [ticketData, setTicketData] = useState<TicketData>({
		email: "",
		subject: "",
		description: "",
		priority: "medium",
		category: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showLiveChat, setShowLiveChat] = useState(false);
	const [troubleshootState, setTroubleshootState] = useState<
		Record<string, string>
	>({});

	const chatContainerRef = useRef<HTMLDivElement>(null);

	// ─── Phase Configurations ──────────────────────────────────────

	const phases: Record<
		string,
		{ label: string; icon: React.ReactNode; color: string; topics: Topic[] }
	> = {
		"global-market": {
			label: "🌍 Global Market",
			icon: <Package className="h-6 w-6" />,
			color: "emerald",
			topics: [
				{
					id: "buying",
					label: "🛒 Buying & Purchases",
					icon: <ShoppingBag className="h-4 w-4" />,
					subTopics: [
						{
							id: "how-to-buy",
							label: "How do I buy an asset?",
							solutionType: "guide",
							guideContent: {
								title: "🛒 How to Buy an Asset on Nu-vora",
								steps: [
									"1. Browse or search for the asset you want",
									"2. Click the asset card to view full details",
									"3. Review the description, price, and seller information",
									'4. Click the "Purchase" button',
									"5. Confirm the payment from your wallet",
									"6. Asset is automatically delivered to your locker",
									"7. Check your locker to access the asset",
									"8. Confirm receipt to release payment to the seller",
								],
								tips: [
									"💡 Ensure your wallet has sufficient balance before purchasing",
									"💡 Read the asset description carefully before buying",
									"💡 Check seller reviews and ratings",
								],
							},
						},
						{
							id: "payment-deducted-no-asset",
							label: "Payment was deducted but asset not received",
							solutionType: "escalation",
							escalationReason: "Payment deducted with no asset delivery",
						},
						{
							id: "asset-not-in-locker",
							label: "Asset not in my locker",
							solutionType: "troubleshoot",
							troubleshootSteps: [
								{
									question: "Have you completed the purchase process?",
									options: [
										{ label: "✅ Yes, I completed the purchase", value: "yes" },
										{
											label: "❌ No, I didn't complete the purchase",
											value: "no",
										},
									],
								},
							],
							finalMessage:
								"If you completed the purchase and the asset is not in your locker within 30 minutes, please contact support immediately.",
						},
						{
							id: "how-does-delivery-work",
							label: "How does delivery work?",
							solutionType: "guide",
							guideContent: {
								title: "📦 Asset Delivery Process",
								steps: [
									"1. After purchase, the asset is automatically delivered to your locker",
									"2. You can access it anytime from your locker",
									"3. Confirm receipt to release payment to the seller",
									"4. For reusable assets, you can access them multiple times",
									"5. One-time assets are available immediately after purchase",
								],
							},
						},
						{
							id: "cancel-purchase",
							label: "Can I cancel my purchase?",
							solutionType: "guide",
							guideContent: {
								title: "❌ Purchase Cancellation Policy",
								steps: [
									"1. You can cancel within 24 hours of purchase",
									"2. Go to your orders and select the order",
									'3. Click the "Cancel Order" button',
									"4. Funds will be returned to your wallet",
									"5. Cancellations after 24 hours require seller approval",
								],
							},
						},
					],
				},
				{
					id: "selling",
					label: "💰 Selling & Listings",
					icon: <Store className="h-4 w-4" />,
					subTopics: [
						{
							id: "how-to-list",
							label: "How do I list an asset for sale?",
							solutionType: "guide",
							guideContent: {
								title: "💰 How to List an Asset on Nu-vora",
								steps: [
									"1. Complete your storefront verification",
									"2. Go to your seller dashboard",
									'3. Click "Create New Listing"',
									"4. Fill in asset details (title, description, price)",
									"5. Upload asset preview image",
									"6. Choose asset type (one-time, reusable, socio)",
									"7. Upload the asset file or provide credentials",
									"8. Review and publish your listing",
								],
								tips: [
									"💡 High-quality images attract more buyers",
									"💡 Clear descriptions help buyers understand what they're getting",
									"💡 Competitive pricing increases your chances of selling",
								],
							},
						},
						{
							id: "listing-not-visible",
							label: "My listing is not visible",
							solutionType: "troubleshoot",
							troubleshootSteps: [
								{
									question: "What is the status of your listing?",
									options: [
										{ label: "📝 Draft", value: "draft" },
										{ label: "🔄 Pending Approval", value: "pending" },
										{ label: "✅ Active", value: "active" },
										{ label: "❌ Sold", value: "sold" },
									],
								},
							],
						},
						{
							id: "verification-needed",
							label: "Verification required to sell",
							solutionType: "guide",
							guideContent: {
								title: "✅ Complete Storefront Verification",
								steps: [
									"1. Go to your storefront settings",
									'2. Click "Start Verification"',
									"3. Complete the biometric verification (15-second video)",
									"4. Enter your contact email and social media handles",
									"5. Accept the marketing terms of service",
									"6. Wait for approval (usually within 24 hours)",
									"7. Once verified, you can start listing assets",
								],
								tips: [
									"💡 Use a well-lit environment for the verification video",
									"💡 Ensure your face is clearly visible",
									"💡 Have your ID ready if additional verification is needed",
								],
							},
						},
					],
				},
				{
					id: "escrow",
					label: "🔒 Escrow & Payments",
					icon: <Lock className="h-4 w-4" />,
					subTopics: [
						{
							id: "how-escrow-works",
							label: "How does escrow work?",
							solutionType: "guide",
							guideContent: {
								title: "🔒 Escrow Protection Explained",
								steps: [
									"1. When you purchase, funds are held in escrow",
									"2. The asset is delivered to your locker",
									"3. You have 7 days to confirm receipt",
									"4. Once confirmed, funds are released to the seller",
									"5. If you don't confirm, funds are auto-released after 7 days",
									"6. Escrow protects both buyers and sellers",
								],
							},
						},
						{
							id: "funds-not-released",
							label: "Funds not released to seller",
							solutionType: "escalation",
							escalationReason: "Escrow funds not releasing",
						},
					],
				},
				{
					id: "verification-global",
					label: "✅ Store Verification",
					icon: <ShieldCheck className="h-4 w-4" />,
					subTopics: [
						{
							id: "verify-storefront",
							label: "How to verify my storefront?",
							solutionType: "guide",
							guideContent: {
								title: "✅ Storefront Verification Guide",
								steps: [
									"1. Navigate to your account settings",
									'2. Click "Complete Verification"',
									"3. Record a 15-second video with face detection",
									"4. Enter your contact email and marketing email",
									"5. Add your TikTok and Snapchat handles",
									"6. Accept the marketing terms of service",
									"7. Submit for review",
									"8. Storefront is unlocked upon approval",
								],
								tips: [
									"💡 Verification usually takes 24-48 hours",
									"💡 Ensure your video is clear and well-lit",
									"💡 Provide accurate contact information",
								],
							},
						},
						{
							id: "verification-failed",
							label: "Verification failed, what now?",
							solutionType: "troubleshoot",
							troubleshootSteps: [
								{
									question: "What was the error message?",
									options: [
										{ label: "📷 Camera access denied", value: "camera" },
										{ label: "👤 Face not detected", value: "face" },
										{ label: "⏳ Video too short", value: "short" },
										{ label: "❌ General error", value: "general" },
									],
								},
							],
							finalMessage:
								"If verification continues to fail, please contact support for manual verification.",
						},
					],
				},
			],
		},
		"smm-panel": {
			label: "📱 SMM Panel",
			icon: <Users className="h-6 w-6" />,
			color: "purple",
			topics: [
				{
					id: "delivery",
					label: "📤 Service Delivery",
					icon: <Truck className="h-4 w-4" />,
					subTopics: [
						{
							id: "how-long-delivery",
							label: "How long does delivery take?",
							solutionType: "guide",
							guideContent: {
								title: "⏱️ Service Delivery Times",
								steps: [
									"1. Delivery time varies by service type",
									"2. Followers: 24-72 hours",
									"3. Likes & Views: 12-48 hours",
									"4. Comments: 24-48 hours",
									"5. You can track status in your orders",
									"6. Contact support if delivery exceeds estimated time",
								],
							},
						},
						{
							id: "order-not-delivered",
							label: "Order not delivered",
							solutionType: "escalation",
							escalationReason: "SMM order not delivered",
						},
						{
							id: "partial-delivery",
							label: "Partial delivery received",
							solutionType: "troubleshoot",
							troubleshootSteps: [
								{
									question: "What percentage of your order was delivered?",
									options: [
										{ label: "📊 25% or less", value: "25" },
										{ label: "📊 50%", value: "50" },
										{ label: "📊 75%", value: "75" },
										{ label: "📊 90%+", value: "90" },
									],
								},
							],
						},
					],
				},
				{
					id: "refill",
					label: "🔄 Refill & Replacement",
					icon: <RefreshCw className="h-4 w-4" />,
					subTopics: [
						{
							id: "request-refill",
							label: "How to request a refill?",
							solutionType: "guide",
							guideContent: {
								title: "🔄 Requesting a Refill",
								steps: [
									"1. Go to your orders",
									"2. Select the order you need a refill for",
									'3. Click "Request Refill"',
									"4. Specify the quantity needed",
									"5. Refills are processed within 24-48 hours",
									"6. You'll be notified when the refill is complete",
								],
								tips: [
									"💡 Refills are free within 30 days of purchase",
									"💡 Provide accurate details to ensure quick processing",
								],
							},
						},
						{
							id: "refill-not-processed",
							label: "Refill request not processed",
							solutionType: "escalation",
							escalationReason: "Refill request not processed",
						},
					],
				},
				{
					id: "tracking",
					label: "📊 Order Tracking",
					icon: <TrendingUp className="h-4 w-4" />,
					subTopics: [
						{
							id: "track-order",
							label: "How to track my order?",
							solutionType: "guide",
							guideContent: {
								title: "📊 Tracking Your Order",
								steps: [
									"1. Go to your orders section",
									"2. Click on the order you want to track",
									"3. View the status: Pending, Processing, Completed",
									"4. Check delivery progress in real-time",
									"5. Contact support if status hasn't changed in 48 hours",
								],
							},
						},
					],
				},
			],
		},
		"social-tenant": {
			label: "🌐 Social Tenant",
			icon: <Building2 className="h-6 w-6" />,
			color: "sky",
			topics: [
				{
					id: "building",
					label: "🏗️ Website Building",
					icon: <Home className="h-4 w-4" />,
					subTopics: [
						{
							id: "start-building",
							label: "How to start building my site?",
							solutionType: "guide",
							guideContent: {
								title: "🏗️ Getting Started with Social Tenant",
								steps: [
									"1. Go to your Social Tenant dashboard",
									'2. Click "Create New Website"',
									"3. Choose a template that fits your needs",
									"4. Customize the template with your content",
									"5. Add your social links and branding",
									"6. Preview your site before publishing",
									'7. Click "Publish" to make it live',
								],
								tips: [
									"💡 Start with a template close to your vision",
									"💡 Use high-quality images for better results",
									"💡 Preview on mobile before publishing",
								],
							},
						},
						{
							id: "site-not-loading",
							label: "My site is not loading",
							solutionType: "escalation",
							escalationReason: "Site not loading",
						},
						{
							id: "changes-not-saving",
							label: "Changes not saving",
							solutionType: "troubleshoot",
							troubleshootSteps: [
								{
									question: "What happens when you try to save?",
									options: [
										{
											label: "⏳ Loading spinner spins forever",
											value: "spinner",
										},
										{ label: "❌ Error message appears", value: "error" },
										{
											label: "📄 Page refreshes but changes lost",
											value: "refresh",
										},
										{
											label: "✅ No error, but changes don't appear",
											value: "silent",
										},
									],
								},
							],
						},
					],
				},
				{
					id: "templates",
					label: "🎨 Templates & Customization",
					icon: <FileText className="h-4 w-4" />,
					subTopics: [
						{
							id: "use-templates",
							label: "How to use templates?",
							solutionType: "guide",
							guideContent: {
								title: "🎨 Working with Templates",
								steps: [
									"1. Browse available templates in your dashboard",
									'2. Select a template and click "Use Template"',
									"3. Replace placeholder content with your own",
									"4. Customize colors, fonts, and layout",
									"5. Add your social links and store products",
									"6. Preview and publish",
								],
								tips: [
									"💡 Templates are fully customizable",
									"💡 You can switch templates anytime",
									"💡 Premium templates available for Pro users",
								],
							},
						},
						{
							id: "template-customization-help",
							label: "Need help with customization",
							solutionType: "guide",
							guideContent: {
								title: "🎨 Template Customization Guide",
								steps: [
									'1. Click the "Customize" button on your selected template',
									"2. Use the visual editor to make changes",
									"3. Edit text directly on the page",
									"4. Upload your own images",
									"5. Add custom CSS if needed (advanced)",
									"6. Save your changes",
								],
								tips: [
									"💡 Use the drag-and-drop editor for easy changes",
									"💡 Preview changes in real-time",
									"💡 Reset customization if needed",
								],
							},
						},
					],
				},
				{
					id: "ai-design",
					label: "🤖 AI Design Services",
					icon: <Sparkles className="h-4 w-4" />,
					subTopics: [
						{
							id: "how-ai-design-works",
							label: "How does AI design work?",
							solutionType: "guide",
							guideContent: {
								title: "🤖 AI Design Process",
								steps: [
									"1. Describe your design vision in plain text",
									"2. AI generates multiple design options",
									"3. Select your preferred design",
									"4. Request modifications if needed",
									"5. Finalize and download your design",
									"6. Design is added to your assets",
								],
								tips: [
									"💡 Be specific in your description for better results",
									"💡 You can request multiple iterations",
									"💡 Designs are unique to your request",
								],
							},
						},
						{
							id: "design-not-as-expected",
							label: "AI design not as expected",
							solutionType: "troubleshoot",
							troubleshootSteps: [
								{
									question: "What went wrong?",
									options: [
										{ label: "🎨 Design style is wrong", value: "style" },
										{ label: "📝 Content is incorrect", value: "content" },
										{ label: "📐 Layout is off", value: "layout" },
										{ label: "⚠️ Design is unusable", value: "useless" },
									],
								},
							],
						},
					],
				},
			],
		},
		general: {
			label: "⚙️ General Account",
			icon: <Settings className="h-6 w-6" />,
			color: "amber",
			topics: [
				{
					id: "login",
					label: "🔑 Login & Password",
					icon: <Lock className="h-4 w-4" />,
					subTopics: [
						{
							id: "reset-password",
							label: "How to reset password?",
							solutionType: "guide",
							guideContent: {
								title: "🔑 Resetting Your Password",
								steps: [
									'1. Click "Forgot Password" on the login page',
									"2. Enter your email address",
									"3. Check your email for a reset link",
									"4. Click the link and enter a new password",
									"5. Use your new password to login",
								],
								tips: [
									"💡 Use a strong password with at least 8 characters",
									"💡 Include uppercase, lowercase, numbers, and symbols",
									"💡 Don't reuse passwords from other sites",
								],
							},
						},
						{
							id: "cannot-login",
							label: "Can't log in to my account",
							solutionType: "troubleshoot",
							troubleshootSteps: [
								{
									question: "What happens when you try to log in?",
									options: [
										{ label: "🔑 Incorrect password error", value: "password" },
										{ label: "📧 Email not found", value: "email" },
										{ label: "🚫 Account locked", value: "locked" },
										{ label: "⚠️ Unexpected error", value: "error" },
									],
								},
							],
						},
					],
				},
				{
					id: "profile",
					label: "👤 Profile Updates",
					icon: <Users className="h-4 w-4" />,
					subTopics: [
						{
							id: "update-profile",
							label: "How to update profile?",
							solutionType: "guide",
							guideContent: {
								title: "👤 Updating Your Profile",
								steps: [
									"1. Go to Account Settings",
									'2. Click "Edit Profile"',
									"3. Update your display name, bio, or avatar",
									"4. Save your changes",
									"5. Changes appear across the platform",
								],
							},
						},
						{
							id: "profile-not-saving",
							label: "Profile changes not saving",
							solutionType: "escalation",
							escalationReason: "Profile updates not saving",
						},
					],
				},
				{
					id: "security-2fa",
					label: "🔒 Security & 2FA",
					icon: <ShieldCheck className="h-4 w-4" />,
					subTopics: [
						{
							id: "enable-2fa",
							label: "How to enable 2FA?",
							solutionType: "guide",
							guideContent: {
								title: "🔒 Enabling Two-Factor Authentication",
								steps: [
									"1. Go to Security Settings",
									'2. Click "Enable 2FA"',
									"3. Scan the QR code with your authenticator app",
									"4. Enter the 6-digit code from your app",
									"5. Confirm and save",
									"6. 2FA is now active on your account",
								],
								tips: [
									"💡 Use Google Authenticator, Authy, or similar apps",
									"💡 Save your backup codes in a safe place",
									"💡 2FA adds an extra layer of security",
								],
							},
						},
						{
							id: "security-concern",
							label: "I have a security concern",
							solutionType: "escalation",
							escalationReason: "Account security concern",
						},
					],
				},
				{
					id: "wallet",
					label: "💳 Wallet & Payments",
					icon: <CreditCard className="h-4 w-4" />,
					subTopics: [
						{
							id: "how-to-withdraw",
							label: "How to withdraw funds?",
							solutionType: "guide",
							guideContent: {
								title: "💳 Withdrawing Funds",
								steps: [
									"1. Go to your Wallet",
									'2. Click "Withdraw"',
									"3. Select your withdrawal method",
									"4. Enter the amount you want to withdraw",
									"5. Confirm the transaction",
									"6. Funds will be processed within 3-5 business days",
								],
								tips: [
									"💡 Minimum withdrawal amount varies by method",
									"💡 Withdrawals are subject to verification",
									"💡 Keep your wallet information up to date",
								],
							},
						},
						{
							id: "withdrawal-failed",
							label: "Withdrawal failed",
							solutionType: "escalation",
							escalationReason: "Withdrawal failed",
						},
					],
				},
			],
		},
	};

	// ─── Helpers ────────────────────────────────────────────────────

	const getPhaseTopics = (phase: Phase) => {
		if (!phase) return [];
		return phases[phase]?.topics || [];
	};

	const getTopicSubTopics = (phase: Phase, topicId: string) => {
		if (!phase) return [];
		const topics = getPhaseTopics(phase);
		const topic = topics.find((t) => t.id === topicId);
		return topic?.subTopics || [];
	};

	const getSubTopic = (phase: Phase, topicId: string, subTopicId: string) => {
		const subTopics = getTopicSubTopics(phase, topicId);
		return subTopics.find((st) => st.id === subTopicId);
	};

	// ─── Navigation ─────────────────────────────────────────────────

	const goToWelcome = () => {
		setCurrentStep({ id: "welcome", type: "welcome", data: {} });
		setHistory([]);
		setSelectedPhase(null);
		setSelectedTopic(null);
		setSelectedSubTopic(null);
		setTroubleshootState({});
	};

	const goToPhaseSelect = () => {
		setCurrentStep({ id: "phase-select", type: "phase-select", data: {} });
		setHistory((prev) => [...prev, currentStep!]);
		setSelectedPhase(null);
		setSelectedTopic(null);
		setSelectedSubTopic(null);
	};

	const goToTopicSelect = (phase: Phase) => {
		setSelectedPhase(phase);
		setCurrentStep({
			id: "topic-select",
			type: "topic-select",
			data: { phase },
		});
		setHistory((prev) => [...prev, currentStep!]);
		setSelectedTopic(null);
		setSelectedSubTopic(null);
	};

	const goToSubTopicSelect = (phase: Phase, topicId: string) => {
		setSelectedTopic(topicId);
		setCurrentStep({
			id: "sub-topic",
			type: "sub-topic",
			data: { phase, topicId },
		});
		setHistory((prev) => [...prev, currentStep!]);
		setSelectedSubTopic(null);
	};

	const goToSolution = (phase: Phase, topicId: string, subTopicId: string) => {
		setSelectedSubTopic(subTopicId);
		const subTopic = getSubTopic(phase, topicId, subTopicId);
		setCurrentStep({
			id: "solution",
			type: "solution",
			data: { phase, topicId, subTopicId, subTopic },
		});
		setHistory((prev) => [...prev, currentStep!]);
	};

	const goToTicket = (phase: Phase, topicId: string, subTopicId: string) => {
		const subTopic = getSubTopic(phase, topicId, subTopicId);
		setCurrentStep({
			id: "ticket",
			type: "ticket",
			data: { phase, topicId, subTopicId, subTopic },
		});
		setHistory((prev) => [...prev, currentStep!]);
	};

	const goToConfirmation = (ticketData: TicketData) => {
		setCurrentStep({
			id: "confirmation",
			type: "confirmation",
			data: { ticketData },
		});
		setHistory((prev) => [...prev, currentStep!]);
	};

	const goBack = () => {
		if (history.length > 0) {
			const previous = history[history.length - 1];
			setHistory(history.slice(0, -1));
			setCurrentStep(previous);
		}
	};

	// ─── Render: Welcome Step ──────────────────────────────────────

	const renderWelcome = () => (
		<div className="space-y-6">
			<div className="text-center space-y-3">
				<div className="flex items-center justify-center gap-3">
					<ShieldCheck className="h-12 w-12 text-emerald-400" />
					<div>
						<h1 className="text-2xl font-bold text-white">
							How can we help you?
						</h1>
						<p className="text-sm text-zinc-400">
							Select the area you need assistance with
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{Object.entries(phases).map(([key, phase]) => (
					<button
						key={key}
						onClick={() => goToTopicSelect(key as Phase)}
						className={`p-4 rounded-xl border bg-zinc-950/40 hover:border-${phase.color}-500/30 transition-all text-center group`}
					>
						<div className="flex justify-center mb-2">
							<div
								className={`p-2 rounded-full bg-${phase.color}-500/10 border border-${phase.color}-500/20 group-hover:scale-110 transition-transform`}
							>
								{phase.icon}
							</div>
						</div>
						<p className="text-xs font-bold text-white">{phase.label}</p>
					</button>
				))}
			</div>

			<div className="relative">
				<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
				<Input
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search for help topics..."
					className="h-12 pl-11 rounded-xl bg-zinc-950/40 border-white/10 text-white placeholder:text-zinc-500"
				/>
			</div>

			<div className="grid grid-cols-3 gap-3 text-center text-xs text-zinc-500">
				<div>
					<p className="font-bold text-white">📋 24/7</p>
					<p>Support Available</p>
				</div>
				<div>
					<p className="font-bold text-white">⚡ 2-4 hrs</p>
					<p>Avg Response Time</p>
				</div>
				<div>
					<p className="font-bold text-white">🎯 98%</p>
					<p>Satisfaction Rate</p>
				</div>
			</div>

			<div className="flex gap-3">
				<button
					onClick={() => {}} // Live chat
					className="flex-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
				>
					<MessageCircle className="h-4 w-4" />
					Live Chat
				</button>
				<button
					onClick={() =>
						(window.location.href = "mailto:support@nu-vora.com")
					}
					className="flex-1 bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
				>
					<Mail className="h-4 w-4" />
					Email Support
				</button>
			</div>
		</div>
	);

	// ─── Render: Phase Select ──────────────────────────────────────

	const renderPhaseSelect = () => (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<button
					onClick={goBack}
					className="p-2 rounded-lg hover:bg-white/5 transition-colors"
				>
					<ArrowLeft className="h-5 w-5 text-zinc-400" />
				</button>
				<h2 className="text-lg font-bold text-white">Select Your Area</h2>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{Object.entries(phases).map(([key, phase]) => (
					<button
						key={key}
						onClick={() => goToTopicSelect(key as Phase)}
						className={`p-4 rounded-xl border bg-zinc-950/40 hover:border-${phase.color}-500/30 transition-all text-left group`}
					>
						<div className="flex items-center gap-3">
							<div
								className={`p-2 rounded-full bg-${phase.color}-500/10 border border-${phase.color}-500/20 group-hover:scale-110 transition-transform`}
							>
								{phase.icon}
							</div>
							<div>
								<p className="text-sm font-bold text-white">{phase.label}</p>
								<p className="text-xs text-zinc-500">Click to explore</p>
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	);

	// ─── Render: Topic Select ──────────────────────────────────────

	const renderTopicSelect = (phase: Phase) => {
		const topics = getPhaseTopics(phase);

		return (
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<button
						onClick={goBack}
						className="p-2 rounded-lg hover:bg-white/5 transition-colors"
					>
						<ArrowLeft className="h-5 w-5 text-zinc-400" />
					</button>
					<h2 className="text-lg font-bold text-white">
						{phases[phase!].label}
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-2">
					{topics.map((topic) => (
						<button
							key={topic.id}
							onClick={() => goToSubTopicSelect(phase, topic.id)}
							className="p-4 rounded-xl border border-white/5 bg-zinc-950/30 hover:border-white/15 transition-all text-left group"
						>
							<div className="flex items-center gap-3">
								<span className="text-lg">{topic.icon}</span>
								<span className="text-sm font-bold text-white">
									{topic.label}
								</span>
								<ArrowRight className="ml-auto h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
							</div>
						</button>
					))}
				</div>
			</div>
		);
	};

	// ─── Render: Sub-Topic Select ──────────────────────────────────

	const renderSubTopicSelect = (phase: Phase, topicId: string) => {
		const subTopics = getTopicSubTopics(phase, topicId);
		const topic = getPhaseTopics(phase).find((t) => t.id === topicId);

		return (
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<button
						onClick={goBack}
						className="p-2 rounded-lg hover:bg-white/5 transition-colors"
					>
						<ArrowLeft className="h-5 w-5 text-zinc-400" />
					</button>
					<div>
						<h2 className="text-sm font-bold text-white">{topic?.label}</h2>
						<p className="text-xs text-zinc-500">What's your specific issue?</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-2">
					{subTopics.map((subTopic) => (
						<button
							key={subTopic.id}
							onClick={() => goToSolution(phase, topicId, subTopic.id)}
							className="p-3 rounded-xl border border-white/5 bg-zinc-950/30 hover:border-white/15 transition-all text-left group"
						>
							<div className="flex items-center gap-3">
								<span className="text-sm text-zinc-300">{subTopic.label}</span>
								<ArrowRight className="ml-auto h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
							</div>
						</button>
					))}
				</div>
			</div>
		);
	};

	// ─── Render: Solution Step ─────────────────────────────────────

	const renderSolution = (
		phase: Phase,
		topicId: string,
		subTopicId: string,
		subTopic: SubTopic,
	) => {
		const { solutionType, guideContent, troubleshootSteps, escalationReason } =
			subTopic;

		if (solutionType === "guide" && guideContent) {
			return renderGuide(guideContent);
		}

		if (solutionType === "troubleshoot" && troubleshootSteps) {
			return renderTroubleshoot(
				phase,
				topicId,
				subTopicId,
				troubleshootSteps,
				subTopic,
			);
		}

		if (solutionType === "escalation") {
			return renderEscalation(
				phase,
				topicId,
				subTopicId,
				escalationReason || "",
			);
		}

		return null;
	};

	const renderGuide = (content: GuideContent) => (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<button
					onClick={goBack}
					className="p-2 rounded-lg hover:bg-white/5 transition-colors"
				>
					<ArrowLeft className="h-5 w-5 text-zinc-400" />
				</button>
				<div>
					<h2 className="text-sm font-bold text-white">Guide</h2>
					<p className="text-xs text-zinc-500">Step-by-step instructions</p>
				</div>
			</div>

			<div className="p-4 rounded-xl border border-white/5 bg-zinc-950/30">
				<h3 className="text-base font-bold text-white mb-3">{content.title}</h3>
				<div className="space-y-2">
					{content.steps.map((step, index) => (
						<div
							key={index}
							className="flex items-start gap-3 text-sm text-zinc-300"
						>
							<CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
							<span>{step}</span>
						</div>
					))}
				</div>
				{content.tips && content.tips.length > 0 && (
					<div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
						<p className="text-xs font-bold text-emerald-400">💡 Tips</p>
						{content.tips.map((tip, index) => (
							<p key={index} className="text-xs text-zinc-400">
								{tip}
							</p>
						))}
					</div>
				)}
			</div>

			<div className="flex gap-3">
				<button
					onClick={() => {}}
					className="flex-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
				>
					<MessageCircle className="h-4 w-4" />
					Chat with Support
				</button>
				<button
					onClick={() =>
						(window.location.href = "mailto:support@nu-vora.com")
					}
					className="flex-1 bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
				>
					<Mail className="h-4 w-4" />
					Email Support
				</button>
			</div>
		</div>
	);

	const renderTroubleshoot = (
		phase: Phase,
		topicId: string,
		subTopicId: string,
		steps: TroubleshootStep[],
		subTopic: SubTopic,
	) => {
		const currentStepIndex = Object.keys(troubleshootState).length;
		const currentStep = steps[currentStepIndex];
		const isComplete = !currentStep || currentStepIndex >= steps.length;

		const handleOptionSelect = (value: string) => {
			setTroubleshootState((prev) => ({
				...prev,
				[`step${currentStepIndex}`]: value,
			}));
		};

		if (isComplete) {
			return (
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<button
							onClick={goBack}
							className="p-2 rounded-lg hover:bg-white/5 transition-colors"
						>
							<ArrowLeft className="h-5 w-5 text-zinc-400" />
						</button>
						<div>
							<h2 className="text-sm font-bold text-white">Troubleshooting</h2>
							<p className="text-xs text-zinc-500">Issue resolved</p>
						</div>
					</div>

					<div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
						<CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
						<h3 className="text-base font-bold text-white text-center">
							Troubleshooting Complete ✅
						</h3>
						{subTopic.finalMessage && (
							<p className="text-sm text-zinc-400 text-center mt-2">
								{subTopic.finalMessage}
							</p>
						)}
						<p className="text-xs text-zinc-500 text-center mt-4">
							If you're still experiencing issues, please contact support.
						</p>
					</div>

					<div className="flex gap-3">
						<button
							onClick={() => goToTicket(phase, topicId, subTopicId)}
							className="flex-1 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
						>
							<AlertCircle className="h-4 w-4" />
							Still having issues?
						</button>
					</div>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<button
						onClick={goBack}
						className="p-2 rounded-lg hover:bg-white/5 transition-colors"
					>
						<ArrowLeft className="h-5 w-5 text-zinc-400" />
					</button>
					<div>
						<h2 className="text-sm font-bold text-white">Troubleshooting</h2>
						<p className="text-xs text-zinc-500">
							Step {currentStepIndex + 1} of {steps.length}
						</p>
					</div>
				</div>

				<div className="p-4 rounded-xl border border-white/5 bg-zinc-950/30">
					<p className="text-sm font-medium text-white mb-3">
						{currentStep.question}
					</p>
					<div className="space-y-2">
						{currentStep.options.map((option) => (
							<button
								key={option.value}
								onClick={() => handleOptionSelect(option.value)}
								className="w-full p-3 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all text-left text-sm text-zinc-300 hover:text-white"
							>
								{option.label}
							</button>
						))}
					</div>
				</div>

				<div className="flex gap-3">
					<button
						onClick={() => goToTicket(phase, topicId, subTopicId)}
						className="flex-1 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
					>
						<AlertCircle className="h-4 w-4" />
						Report Issue
					</button>
				</div>
			</div>
		);
	};

	const renderEscalation = (
		phase: Phase,
		topicId: string,
		subTopicId: string,
		reason: string,
	) => (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<button
					onClick={goBack}
					className="p-2 rounded-lg hover:bg-white/5 transition-colors"
				>
					<ArrowLeft className="h-5 w-5 text-zinc-400" />
				</button>
				<div>
					<h2 className="text-sm font-bold text-white">Critical Issue</h2>
					<p className="text-xs text-zinc-500">Immediate attention required</p>
				</div>
			</div>

			<div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
				<AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
				<h3 className="text-base font-bold text-white text-center">
					🚨 This requires immediate attention
				</h3>
				<p className="text-sm text-zinc-400 text-center mt-2">{reason}</p>
				<p className="text-xs text-zinc-500 text-center mt-4">
					Our support team will prioritize this issue.
				</p>
			</div>

			<button
				onClick={() => goToTicket(phase, topicId, subTopicId)}
				className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-white rounded-xl p-4 text-sm font-bold flex items-center justify-center gap-3 transition-all"
			>
				<FileText className="h-5 w-5" />
				Create Support Ticket
			</button>

			<div className="flex gap-3">
				<button
					onClick={() =>
						(window.location.href = "mailto:support@nu-vora.com")
					}
					className="flex-1 bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
				>
					<Mail className="h-4 w-4" />
					Email Support
				</button>
				<button
					onClick={() => (window.location.href = "/support")}
					className="flex-1 bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-white rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all"
				>
					<BookOpen className="h-4 w-4" />
					Knowledge Base
				</button>
			</div>
		</div>
	);

	// ─── Render: Ticket Step ──────────────────────────────────────

	const renderTicket = (phase: Phase, topicId: string, subTopicId: string) => {
		const subTopic = getSubTopic(phase, topicId, subTopicId);
		const phaseLabel = phase ? phases[phase]?.label : "General";

		const handleSubmit = () => {
			setIsSubmitting(true);
			setTimeout(() => {
				setIsSubmitting(false);
				goToConfirmation(ticketData);
			}, 1500);
		};

		return (
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<button
						onClick={goBack}
						className="p-2 rounded-lg hover:bg-white/5 transition-colors"
					>
						<ArrowLeft className="h-5 w-5 text-zinc-400" />
					</button>
					<div>
						<h2 className="text-sm font-bold text-white">
							Create Support Ticket
						</h2>
						<p className="text-xs text-zinc-500">
							We'll get back to you within 24 hours
						</p>
					</div>
				</div>

				<div className="p-4 rounded-xl border border-white/5 bg-zinc-950/30 space-y-4">
					<div className="text-xs text-zinc-500 space-y-1">
						<p>
							<span className="text-white">Category:</span> {phaseLabel}
						</p>
						<p>
							<span className="text-white">Issue:</span> {subTopic?.label}
						</p>
					</div>

					<div>
						<label className="text-xs font-bold text-zinc-400 mb-1.5 block">
							Email Address
						</label>
						<Input
							type="email"
							value={ticketData.email}
							onChange={(e) =>
								setTicketData({ ...ticketData, email: e.target.value })
							}
							placeholder="your@email.com"
							className="bg-black border-white/10 text-white rounded-xl"
						/>
					</div>

					<div>
						<label className="text-xs font-bold text-zinc-400 mb-1.5 block">
							Subject
						</label>
						<Input
							value={ticketData.subject}
							onChange={(e) =>
								setTicketData({ ...ticketData, subject: e.target.value })
							}
							placeholder="Brief description of your issue"
							className="bg-black border-white/10 text-white rounded-xl"
						/>
					</div>

					<div>
						<label className="text-xs font-bold text-zinc-400 mb-1.5 block">
							Description
						</label>
						<Textarea
							value={ticketData.description}
							onChange={(e) =>
								setTicketData({ ...ticketData, description: e.target.value })
							}
							placeholder="Please provide details about your issue..."
							rows={4}
							className="bg-black border-white/10 text-white rounded-xl resize-none"
						/>
					</div>

					<div>
						<label className="text-xs font-bold text-zinc-400 mb-1.5 block">
							Priority
						</label>
						<div className="flex gap-2">
							{["low", "medium", "high"].map((priority) => (
								<button
									key={priority}
									onClick={() =>
										setTicketData({ ...ticketData, priority: priority as any })
									}
									className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
										ticketData.priority === priority
											? priority === "high"
												? "border-red-500/30 bg-red-500/10 text-red-400"
												: priority === "medium"
													? "border-amber-500/30 bg-amber-500/10 text-amber-400"
													: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
											: "border-white/10 text-zinc-500 hover:border-white/20"
									}`}
								>
									{priority.toUpperCase()}
								</button>
							))}
						</div>
					</div>

					<div>
						<label className="text-xs font-bold text-zinc-400 mb-1.5 block">
							Screenshots (Optional)
						</label>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => {
								if (e.target.files && e.target.files[0]) {
									setTicketData({
										...ticketData,
										attachment: e.target.files[0],
									});
								}
							}}
							className="text-xs text-zinc-400 bg-black border border-white/10 rounded-xl p-2 w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/5 file:text-white hover:file:bg-white/10"
						/>
					</div>
				</div>

				<button
					onClick={handleSubmit}
					disabled={
						!ticketData.email ||
						!ticketData.subject ||
						!ticketData.description ||
						isSubmitting
					}
					className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-12 text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
				>
					{isSubmitting ? (
						<Loader2 className="h-5 w-5 animate-spin" />
					) : (
						<>
							<Send className="h-4 w-4" />
							Submit Ticket
						</>
					)}
				</button>
			</div>
		);
	};

	// ─── Render: Confirmation Step ────────────────────────────────

	const renderConfirmation = (data: { ticketData: TicketData }) => (
		<div className="space-y-4">
			<div className="text-center py-8">
				<div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
					<CheckCircle2 className="h-8 w-8 text-emerald-400" />
				</div>
				<h2 className="text-xl font-bold text-white">Ticket Submitted! ✅</h2>
				<p className="text-sm text-zinc-400 mt-2">
					Your support ticket has been received.
				</p>
				<p className="text-xs text-zinc-500 mt-1">
					We'll respond within 24 hours.
				</p>
			</div>

			<div className="p-4 rounded-xl border border-white/5 bg-zinc-950/30 space-y-1">
				<p className="text-xs text-zinc-500">
					<span className="text-white">Reference:</span> #
					{Date.now().toString().slice(-6)}
				</p>
				<p className="text-xs text-zinc-500">
					<span className="text-white">Email:</span> {data.ticketData.email}
				</p>
				<p className="text-xs text-zinc-500">
					<span className="text-white">Priority:</span>{" "}
					{data.ticketData.priority.toUpperCase()}
				</p>
			</div>

			<div className="flex gap-3">
				<button
					onClick={() => (window.location.href = "/")}
					className="flex-1 bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-white rounded-xl p-3 text-xs font-bold transition-all"
				>
					Return Home
				</button>
				<button
					onClick={() => (window.location.href = "/support")}
					className="flex-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-white rounded-xl p-3 text-xs font-bold transition-all"
				>
					Back to Support
				</button>
			</div>
		</div>
	);

	// ─── Main Render ──────────────────────────────────────────────

	return (
		<div className="min-h-screen bg-black text-white">
			<div className="max-w-3xl mx-auto px-4 py-8">
				<div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-6 shadow-2xl">
					{!currentStep ? (
						renderWelcome()
					) : (
						<>
							{currentStep.type === "welcome" && renderWelcome()}
							{currentStep.type === "phase-select" && renderPhaseSelect()}
							{currentStep.type === "topic-select" &&
								renderTopicSelect(currentStep.data.phase)}
							{currentStep.type === "sub-topic" &&
								renderSubTopicSelect(
									currentStep.data.phase,
									currentStep.data.topicId,
								)}
							{currentStep.type === "solution" &&
								renderSolution(
									currentStep.data.phase,
									currentStep.data.topicId,
									currentStep.data.subTopicId,
									currentStep.data.subTopic,
								)}
							{currentStep.type === "ticket" &&
								renderTicket(
									currentStep.data.phase,
									currentStep.data.topicId,
									currentStep.data.subTopicId,
								)}
							{currentStep.type === "confirmation" &&
								renderConfirmation(currentStep.data)}
						</>
					)}

					{/* Footer */}
					<div className="mt-6 pt-4 border-t border-white/5 text-center">
						<p className="text-[10px] text-zinc-600">
							Need immediate help?{" "}
							<span className="text-emerald-400">Live Chat</span> available 24/7
							<br />
							Or email us at{" "}
							<a
								href="mailto:support@nu-vora.com"
								className="text-emerald-400 hover:underline"
							>
								support@nu-vora.com
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SupportPage;
