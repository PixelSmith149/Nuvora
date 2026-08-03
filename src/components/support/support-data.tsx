import type React from "react";
import {
  Building2, CreditCard, FileText, Home, Lock, Package,
  RefreshCw, Settings, ShieldCheck, ShoppingBag, Sparkles,
  Store, TrendingUp, Truck, Users,
} from "lucide-react";

export type Phase = "global-market" | "smm-panel" | "social-tenant" | "general" | null;
export type SolutionType = "guide" | "troubleshoot" | "escalation";

export interface ConversationStep {
  id: string;
  type: "welcome" | "phase-select" | "topic-select" | "sub-topic" | "solution" | "ticket" | "confirmation";
  data: any;
}

export interface Topic {
  id: string;
  label: string;
  icon: React.ReactNode;
  subTopics?: SubTopic[];
}

export interface SubTopic {
  id: string;
  label: string;
  solutionType: SolutionType;
  guideContent?: GuideContent;
  troubleshootSteps?: TroubleshootStep[];
  escalationReason?: string;
  finalMessage?: string;
}

export interface GuideContent {
  title: string;
  steps: string[];
  tips?: string[];
}

export interface TroubleshootStep {
  question: string;
  options: { label: string; value: string; nextStep?: string }[];
  finalMessage?: string;
}

export interface TicketData {
  email: string;
  subject: string;
  description: string;
  attachment?: File;
  priority: "low" | "medium" | "high";
  category: string;
}

export interface PhaseConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  topics: Topic[];
}

export const phases: Record<string, PhaseConfig> = {
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
                  { label: "❌ No, I didn't complete the purchase", value: "no" },
                ],
              },
            ],
            finalMessage: "If you completed the purchase and the asset is not in your locker within 30 minutes, please contact support immediately.",
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
            finalMessage: "If verification continues to fail, please contact support for manual verification.",
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
                  { label: "⏳ Loading spinner spins forever", value: "spinner" },
                  { label: "❌ Error message appears", value: "error" },
                  { label: "📄 Page refreshes but changes lost", value: "refresh" },
                  { label: "✅ No error, but changes don't appear", value: "silent" },
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

export const getPhaseTopics = (phase: Phase) => {
  if (!phase) return [];
  return phases[phase]?.topics || [];
};

export const getTopicSubTopics = (phase: Phase, topicId: string) => {
  if (!phase) return [];
  const topics = getPhaseTopics(phase);
  const topic = topics.find((t) => t.id === topicId);
  return topic?.subTopics || [];
};

export const getSubTopic = (phase: Phase, topicId: string, subTopicId: string) => {
  const subTopics = getTopicSubTopics(phase, topicId);
  return subTopics.find((st) => st.id === subTopicId);
};