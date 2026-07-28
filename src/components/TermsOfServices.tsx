// components/TermsOfService.tsx

"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import React, { useState } from "react";

interface TermsOfServiceProps {
	onAccept?: () => void;
	onDecline?: () => void;
	isLoading?: boolean;
}

export function TermsOfService({
	onAccept,
	onDecline,
	isLoading = false,
}: TermsOfServiceProps) {
	const [accepted, setAccepted] = useState(false);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
				<p className="text-xs text-zinc-500 mt-3">Loading terms...</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-8 bg-black text-white">
			{/* Header */}
			<div className="text-center space-y-3 pb-8 border-b border-white/10">
				<div className="flex items-center justify-center gap-3">
					<ShieldCheck className="h-8 w-8 text-emerald-400" />
					<h1 className="text-2xl font-bold text-white">Terms of Service</h1>
				</div>
				<p className="text-sm text-zinc-400 max-w-2xl mx-auto">
					Nu-vora | Elite Home — Last Updated:{" "}
					{new Date().toLocaleDateString("en-US", {
						month: "long",
						year: "numeric",
					})}
				</p>
				<p className="text-sm text-zinc-500 max-w-2xl mx-auto">
					Please read these terms carefully. By using our platform, you agree to
					be bound by them.
				</p>
			</div>

			{/* Introduction */}
			<div className="py-8 space-y-4">
				<h2 className="text-xl font-bold text-white">Introduction</h2>
				<p className="text-sm text-zinc-300 leading-relaxed">
					Welcome to Nu-vora | Elite Home. These Terms of Service govern
					your use of our platform, which includes three integrated services:
					the Global Market (digital asset marketplace), the SMM Panel (social
					media marketing services), and the Social Tenant (website builder and
					design services). By accessing or using any part of our platform, you
					agree to be bound by these terms. If you do not agree to these terms,
					please do not use our services.
				</p>
				<p className="text-sm text-zinc-300 leading-relaxed">
					Throughout this document, "we," "us," "our," and "platform" refer to
					Nuvora | Elite Home. "You" and "user" refer to any individual
					or entity using our services. "Seller" refers to users who list assets
					or services for sale. "Buyer" refers to users who purchase assets or
					services. "Service Provider" refers to users who provide SMM services
					through our panel.
				</p>
			</div>

			{/* Phase 1: Global Market Terms */}
			<div className="py-8 border-t border-white/5 space-y-6">
				<h2 className="text-xl font-bold text-white">
					Part 1: Global Market Terms
				</h2>

				{/* Section 1: Digital Asset Listing & Selling */}
				<div className="space-y-3">
					<h3 className="text-lg font-bold text-emerald-400">
						1. Digital Asset Listing & Selling
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Seller Eligibility & Verification
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						To list assets on our platform, you must first complete our identity
						verification process. This includes biometric verification through a
						15-second video recording where we confirm your identity and ensure
						you are a real person. This helps us maintain a trusted marketplace
						where buyers can purchase with confidence. You must be at least 18
						years old to sell on our platform. Once verified, you gain access to
						your storefront where you can manage your listings, track sales, and
						interact with buyers. Your verification status is ongoing — we may
						request re-verification if we detect unusual activity or changes to
						your account.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Prohibited Items & Restricted Categories
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We maintain a strict policy against illegal or harmful content. You
						may not list malware, phishing tools, stolen credentials, hacked
						accounts, or any content that violates third-party rights.
						Counterfeit goods, unauthorized reproductions, and fraudulent
						listings are also prohibited. We reserve the right to remove any
						listing that violates these rules and suspend accounts without prior
						notice. This protects our community from harmful actors and
						maintains the integrity of our marketplace. If you are unsure
						whether an asset is permitted, please contact our support team
						before listing.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Asset Description Accuracy
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						When you list an asset, you must provide accurate and truthful
						information. Your descriptions, images, and specifications must
						honestly represent what the buyer will receive. Misleading or
						exaggerated claims about your asset may result in your listing being
						removed and your account being suspended. Buyers rely on your
						descriptions to make informed purchasing decisions, and we take this
						responsibility seriously. We recommend providing detailed, clear
						descriptions that set proper expectations and reduce the likelihood
						of disputes.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Pricing Guidelines
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						All prices on our platform are listed in USD ($) by default. You
						have full control over the pricing of your assets, but we expect
						sellers to set fair and reasonable prices. Price manipulation,
						collusion, or artificially inflating prices is strictly prohibited.
						A 4% platform fee applies to all successful sales, which is
						automatically deducted when the buyer confirms delivery. This fee
						covers our services, including escrow protection, secure delivery,
						buyer protection, and platform maintenance. The remaining 96% of the
						sale price is credited to your wallet.
					</p>
				</div>

				{/* Section 2: Purchase & Transaction */}
				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-emerald-400">
						2. Purchase & Transaction
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Buyer Protection & Escrow Holding
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						When you make a purchase on our platform, your funds are held
						securely in escrow. This means the seller does not receive payment
						until you confirm that you have received the asset and it meets your
						expectations. You have up to 7 days to confirm receipt. If you do
						not confirm within this period, the funds are automatically released
						to the seller. This system protects both parties — buyers are
						assured that their money is safe until they have the asset, and
						sellers are assured that payment is guaranteed once the asset is
						delivered. The platform acts as a neutral intermediary throughout
						this process.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Payment Processing & Fees
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						All payments are processed through our secure wallet system. You can
						deposit funds using various methods and withdraw your earnings in
						multiple currencies. A 4% platform fee is applied to all successful
						sales, which is automatically deducted when the buyer confirms
						delivery. This fee is transparent and clearly displayed before you
						complete any purchase. There are no hidden fees, no listing charges,
						and no surprise costs. You receive exactly 96% of the sale price,
						which is credited to your wallet immediately upon delivery
						confirmation.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Order Cancellation & Refund Policy
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Buyers may cancel their purchase within 24 hours of placing the
						order. If you cancel within this window, your funds will be refunded
						to your wallet. After 24 hours, cancellations require the seller's
						approval. In the event of a dispute, we encourage buyers and sellers
						to resolve issues amicably first. If resolution is not possible, you
						can file a dispute through our support system, and our team will
						mediate the situation. Refunds are processed through the dispute
						resolution process and may take up to 7 business days to complete.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Dispute Resolution
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Our platform offers an internal dispute resolution system to help
						buyers and sellers resolve conflicts. You can file a dispute through
						our support system, and our team will investigate and mediate the
						issue. We aim to resolve disputes fairly and promptly, typically
						within 5-7 business days. If a dispute cannot be resolved
						internally, we may escalate to binding arbitration as specified in
						the General Terms. The platform's decision is final and binding, and
						we reserve the right to make judgments based on the evidence
						provided by both parties.
					</p>
				</div>

				{/* Section 3: Delivery & Fulfillment */}
				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-emerald-400">
						3. Delivery & Fulfillment
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Digital Asset Delivery Timeline
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Assets are delivered instantly to the buyer's locker upon successful
						purchase. Our automated delivery system ensures that you receive
						your asset within moments of completing your transaction. Sellers
						must ensure that their assets are properly uploaded and available
						for immediate delivery. If an asset fails to deliver due to a
						technical issue, the system will automatically process a refund.
						This guarantees that you are never left waiting for your purchase or
						dealing with delayed deliveries from sellers.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Seller Delivery Obligations
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Sellers are responsible for maintaining accurate and functional
						assets in their inventory. When you list an asset, you must ensure
						that it is properly uploaded and accessible for delivery. For
						one-time assets, the listing is marked as sold after a successful
						sale and cannot be purchased again. For reusable assets, the listing
						remains active, allowing you to sell the asset to multiple buyers.
						If a buyer reports that an asset is incorrect or non-functional, the
						seller must resolve the issue promptly or risk losing access to the
						platform.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Buyer Confirmation & Escrow Release
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Once you receive your asset in your locker, you are required to
						confirm receipt. This is an important step because it triggers the
						release of funds from escrow to the seller. By confirming receipt,
						you verify that the asset is as described and functioning correctly.
						You have 7 days to confirm receipt. If you don't confirm within this
						timeframe, the funds are automatically released to the seller, and
						the transaction is considered complete. If you have any issues with
						the asset, you should contact the seller or file a dispute before
						confirming receipt.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Automatic Release of Funds
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						If you do not confirm receipt within 7 days of the purchase, the
						funds are automatically released to the seller. This ensures that
						sellers are not left waiting indefinitely for payment. You will
						receive notifications leading up to the auto-release so that you are
						aware of the deadline. If you have a valid reason for not
						confirming, such as a dispute or technical issue, you can contact
						support to pause the auto-release timer. However, if you repeatedly
						fail to confirm receipt, we may restrict your ability to make future
						purchases on the platform.
					</p>
				</div>

				{/* Section 4: Intellectual Property Rights */}
				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-emerald-400">
						4. Intellectual Property Rights
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Buyer's Rights Upon Purchase
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						When you purchase an asset, you receive a non-exclusive license to
						use the asset as described. This means you can use the asset for
						your personal or business purposes, but you may not resell,
						redistribute, or share the asset with others. Some assets may have
						additional restrictions, such as limitations on commercial use or
						attribution requirements. These are clearly stated in the asset
						description. If you are unsure about the rights associated with a
						particular asset, you should contact the seller for clarification
						before making your purchase.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Seller's Warranty of Ownership
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						By listing an asset on our platform, you affirm that you have the
						full rights to sell it. You warrant that the asset does not infringe
						on any third-party intellectual property rights, and you indemnify
						the platform against any claims that may arise from the sale of the
						asset. This means you are legally responsible for ensuring that your
						assets are original, properly licensed, and free of any disputes. If
						a third party claims that your asset infringes their rights, you are
						responsible for resolving the matter and may be liable for any
						damages incurred by the platform.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Prohibited Resale or Redistribution
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Assets purchased on our platform are for personal or business use
						only. You may not resell, redistribute, or share the asset with
						others. This includes sharing access credentials, transferring
						files, or sublicensing the asset without explicit permission from
						the original seller. If we discover that you have resold or
						redistributed an asset without permission, your account may be
						suspended and you may be held liable for damages. This policy
						protects sellers and ensures that they receive fair compensation for
						their work.
					</p>
				</div>

				{/* Section 5: Reviews & Ratings */}
				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-emerald-400">
						5. Reviews & Ratings
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Authentic Review Requirements
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Reviews are an essential part of our marketplace, helping buyers
						make informed decisions. All reviews must be honest and based on
						your actual experience with the asset or seller. Only verified
						buyers can leave reviews, ensuring that feedback comes from genuine
						transactions. Your review should be constructive and provide
						meaningful information to other users. Be fair and objective in your
						assessment, and avoid leaving overly harsh or emotional comments
						that may be misleading.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Prohibited Review Manipulation
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We strictly prohibit any attempt to manipulate reviews or ratings.
						This includes offering incentives for positive reviews, posting fake
						or automated reviews, or engaging in review swapping. You may not
						request buyers to remove negative reviews, nor may you pressure
						buyers to leave positive feedback. Any attempt to game the review
						system will result in immediate account suspension, and all fake
						reviews will be removed. We take review integrity seriously and
						actively monitor for signs of manipulation.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Review Removal Conditions
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We reserve the right to remove reviews that violate our policies.
						This includes reviews containing inappropriate or offensive
						language, reviews that are proven to be fake or manipulated, and
						reviews left by unverified buyers. If you believe a review has been
						unfairly posted against you, you can contact our support team to
						request a review of the situation. We will investigate and take
						appropriate action, which may include removing the review if it is
						found to violate our guidelines.
					</p>
				</div>
			</div>

			{/* Phase 2: SMM Panel Terms */}
			<div className="py-8 border-t border-white/5 space-y-6">
				<h2 className="text-xl font-bold text-white">
					Part 2: SMM Panel Terms
				</h2>

				<div className="space-y-3">
					<h3 className="text-lg font-bold text-purple-400">
						1. Service Delivery
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Service Types Offered
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Our SMM Panel provides a range of social media marketing services.
						You can purchase followers, likes, views, comments, shares, and
						other engagement metrics for platforms including Instagram, TikTok,
						Twitter, YouTube, and more. We also offer account growth services
						and custom solutions for businesses looking to expand their social
						presence. Each service is clearly described with the expected
						results, allowing you to choose the best option for your needs.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Delivery Timeframes & Guarantees
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Delivery times vary by service. Followers typically arrive within 24
						to 72 hours, while likes and views often complete within 12 to 48
						hours. Comments and shares may take up to 48 hours. You can track
						the status of your order in real-time through the orders section. If
						your order is not delivered within the guaranteed timeframe, you are
						eligible for a full refund. We also provide live chat support to
						assist with any delivery questions or concerns you may have.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Quality Assurance & Drop Protection
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We are committed to providing high-quality services that meet your
						expectations. Our service providers are carefully vetted to ensure
						they deliver authentic engagement. Additionally, we offer drop
						protection for followers — if you lose followers within 30 days of
						delivery, we will automatically refill them at no cost. This ensures
						that your growth is stable and sustainable. Our quality assurance
						team monitors all deliveries to maintain the highest standards of
						service.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Refill & Replacement Policies
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						If you experience a drop in followers or engagement, you can request
						a refill within 30 days of the original delivery. Refill requests
						are processed within 24 to 48 hours. For orders that were never
						delivered or were delivered incorrectly, you can request a
						replacement. All refill and replacement requests must be submitted
						through the support system, and we will investigate and resolve the
						issue promptly.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-purple-400">
						2. Acceptable Use
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Prohibited Content/Accounts
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Our SMM services may not be used for adult, NSFW, or illegal
						content. We also prohibit the promotion of hate speech, harassment,
						bullying, misinformation, or any content that violates the terms of
						service of the social media platforms. If we discover that you are
						using our services to promote prohibited content, your order will be
						cancelled immediately and your account may be suspended. We actively
						monitor for compliance and encourage users to report any violations
						they encounter.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Service Limitations & Caps
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We impose daily limits on the number of orders you can place to
						ensure quality and prevent abuse. Each service has a maximum
						quantity per order, and you may need to wait for delivery completion
						before placing additional orders. Accounts must be at least 30 days
						old to qualify for certain services, and we may require activity on
						the account to ensure delivery is effective. These limitations help
						us maintain service quality and protect your account's integrity.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						No Bots, Spam, or Automation Violations
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						All our services comply with the terms of service of social media
						platforms. We do not use bots, spam, or automation that could result
						in your account being flagged or banned. Our services are designed
						to provide genuine engagement that enhances your social presence. If
						any third-party platform identifies our services as violations of
						their terms, we may pause or cancel affected orders and refund your
						purchase. We recommend you stay informed about each platform's terms
						to ensure continued compliance.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Compliance with Social Platform Terms
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						As a user of our SMM Panel, you are responsible for complying with
						the terms of service of the social media platforms you use. We are
						not liable for any actions taken against your account by third-party
						platforms. We recommend that you follow platform guidelines and
						avoid activities that could be flagged as suspicious. Our services
						are designed to support organic growth, and we encourage you to use
						them responsibly to protect your account and reputation.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-purple-400">
						3. Refund & Cancellation
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Refund Eligibility Conditions
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You are eligible for a full refund if your order is not delivered
						within the guaranteed timeframe. If your order is partially
						delivered, you may receive a partial refund based on the percentage
						of undelivered services. Refunds are processed within 5 to 7
						business days and credited to your platform wallet. To request a
						refund, you must provide evidence of the delivery issue, such as
						screenshots or order status logs. We will review the evidence and
						process your refund if valid.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Partial Refunds for Partial Delivery
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						If an order is partially delivered, you may receive a partial refund
						based on the proportion of undelivered services. For example, if you
						ordered 100 followers but only received 50, you would receive a 50%
						refund of the order value. Partial refunds are credited to your
						platform wallet and can be used for future purchases or withdrawn.
						We aim to process partial refunds fairly and transparently, and you
						can track the status of your refund request through the support
						system.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Cancellation Window
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Orders can be cancelled within 24 hours of placement. If you cancel
						within this window, your funds will be returned to your platform
						wallet in full. After 24 hours, cancellation may not be possible, as
						the order may be in process. If you need to cancel after 24 hours,
						you must contact support, and we will determine if cancellation is
						possible based on the service status. Processing fees may apply to
						cancellations requested after 24 hours.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Non-Refundable Circumstances
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Some situations do not qualify for refunds. Completed orders are
						non-refundable, as the service has been fully delivered. We also do
						not provide refunds for services that are delivered to closed or
						deactivated accounts, as we cannot control the status of your
						account. User errors, such as providing incorrect account
						information, are also non-refundable. Violation of our platform
						policies may result in loss of refund eligibility.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-purple-400">
						4. Account Safety
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Seller Responsibility for Account Safety
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						As a user of our SMM Panel, you are responsible for maintaining the
						security of your account. This includes using strong, unique
						passwords and enabling two-factor authentication. You should
						regularly review your account activity and monitor for any
						suspicious actions. If you suspect your account has been
						compromised, you must immediately contact our support team to secure
						it. You are fully responsible for all actions taken under your
						account, including orders placed and messages sent.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Recommendations for Account Security
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We strongly recommend the following security measures for your
						account: Use a strong, unique password with at least 8 characters,
						including numbers and symbols. Enable two-factor authentication
						(2FA) through an authenticator app to add an extra layer of
						security. Avoid sharing your password with others. Regularly update
						your password, especially if you suspect any security threats. These
						simple steps significantly reduce the risk of unauthorized access.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Liability for Account Actions
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You are fully responsible for all actions performed under your
						account. We are not liable for any losses or damages resulting from
						unauthorized access to your account. If we become aware of a
						security breach, we may temporarily suspend your account to protect
						your data. You must report any security incidents to us immediately.
						We will assist you in recovering your account and investigating the
						incident, but you bear the ultimate responsibility for safeguarding
						your login credentials.
					</p>
				</div>
			</div>

			{/* Phase 3: Social Tenant Terms */}
			<div className="py-8 border-t border-white/5 space-y-6">
				<h2 className="text-xl font-bold text-white">
					Part 3: Social Tenant Terms
				</h2>

				<div className="space-y-3">
					<h3 className="text-lg font-bold text-sky-400">1. Platform Usage</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Site Ownership & Usage Rights
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						When you create a website or link-in-bio page through our platform,
						you retain full ownership of your content. This includes text,
						images, logos, and any other materials you upload. We provide the
						hosting and delivery infrastructure to make your site accessible
						online. You grant us a non-exclusive license to display your content
						and make it available to your audience. You can export your data at
						any time, and if you choose to leave our platform, you may take your
						content with you.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Content Responsibility
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You are responsible for all content you publish on your website.
						This includes text, images, videos, and any other materials. Your
						content must not violate any third-party rights, including
						copyright, trademark, or privacy rights. We reserve the right to
						remove any content that violates our policies or applicable laws. If
						we receive a valid complaint about your content, we may take down
						the offending material and notify you. You agree to indemnify us
						against any claims arising from your content.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Prohibited Content
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You may not use our platform to publish illegal content, adult or
						NSFW material, or content that is harmful, defamatory, or
						discriminatory. We also prohibit content that promotes violence,
						hatred, or harassment. If we discover prohibited content on your
						site, we will remove it and may suspend or terminate your account.
						We encourage you to review our content guidelines before publishing
						to ensure your site is compliant and safe for all visitors.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Acceptable Use Policies
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We expect all users to conduct themselves professionally and
						respectfully on our platform. This includes treating other users and
						their content with respect. You may not scrape data from our
						platform or misuse our resources for unauthorized purposes. Any
						attempt to disrupt our services or compromise the integrity of our
						infrastructure will result in immediate account termination. Our
						platform is designed to be a safe and productive space for creators
						and businesses alike.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-sky-400">
						2. Templates & Customization
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Template Usage Rights
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Our templates are designed to help you create beautiful websites
						quickly and easily. When you use a template, you are granted a
						non-exclusive license to use it on your site. You may modify the
						template to suit your needs. However, you may not resell or
						redistribute templates without explicit permission. Attribution may
						be required for some templates, and you agree to comply with any
						licensing terms associated with the template you choose.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Customization Limitations
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You have extensive flexibility to customize templates to match your
						brand identity. However, some advanced features may require
						additional costs. Customization is limited by the structure of the
						template, and we encourage you to explore the available options to
						achieve your desired look. If you need assistance, our support team
						is available to help guide you through the customization process.
						You are responsible for the final appearance and functionality of
						your site.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Branding Guidelines
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						When creating your website, you should maintain brand consistency
						and present a professional image. Platform branding may be visible
						on certain pages, but premium plans allow you to remove or customize
						platform branding. Custom domains are also available for premium
						plans, enabling you to establish a fully branded online presence. We
						encourage you to review our branding guidelines to ensure your site
						aligns with your brand identity.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Link-in-Bio Storefront Policies
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Our platform allows you to create link-in-bio pages that serve as a
						central hub for your audience. You can include links to your social
						media, products, and other content. Storefront templates are
						available to showcase your products and services directly from your
						link-in-bio page. Payments are processed securely through our
						platform, ensuring a seamless shopping experience for your
						customers. You are responsible for maintaining accurate product
						information and fulfilling any orders placed through your
						storefront.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-sky-400">3. Design Services</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						AI-Generated Design Output Rights
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Our AI design services generate unique designs based on your input.
						When you use our AI tools, you own the final design output. This
						means you have full rights to use the design for your personal or
						business purposes. However, you may not resell or redistribute
						AI-generated designs as standalone products. The AI model remains
						the intellectual property of the platform, and you are granted a
						license to use the output, not the underlying technology.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Buyer Ownership of Final Designs
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						When you commission a design through our platform, you receive the
						final design with full usage rights. This includes all
						customizations and revisions that were requested during the process.
						You can use the design for your business, website, or marketing
						materials without additional licensing fees. The design is exclusive
						to you, and we will not share or reuse your custom design without
						your explicit permission.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Usage Restrictions
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						While you own the final design, there are some restrictions on its
						use. You may not sublicense or resell the AI-generated output. You
						may not claim ownership of the AI model itself or try to reverse
						engineer our technology. These restrictions protect our intellectual
						property and ensure that our AI services remain available to all
						users. If you have questions about what you can do with your design,
						please contact support.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Third-Party Attribution Requirements
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Some designs may incorporate third-party assets that require
						attribution. If your design includes such assets, you agree to
						provide the required credit. This may include crediting the AI tools
						used in the creation process. Attribution requirements are clearly
						stated in the design details, and we encourage you to comply to
						avoid any intellectual property disputes. Premium plans may allow
						you to remove attribution requirements.
					</p>
				</div>
			</div>

			{/* Phase 4: General Platform Terms */}
			<div className="py-8 border-t border-white/5 space-y-6">
				<h2 className="text-xl font-bold text-white">
					Part 4: General Platform Terms
				</h2>

				<div className="space-y-3">
					<h3 className="text-lg font-bold text-amber-400">1. User Accounts</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Account Registration Requirements
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						To create an account on our platform, you must provide accurate and
						complete information. You must be at least 18 years old to register.
						A valid email address is required for verification purposes. Sellers
						must complete additional biometric verification before they can list
						assets. We may ask for additional verification if we suspect any
						issues with your account. Providing false or misleading information
						is grounds for account termination.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Username and Password Security
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Your account security is your responsibility. You must use a strong
						password (at least 8 characters with a mix of numbers, symbols, and
						cases) and keep it confidential. We strongly recommend enabling
						two-factor authentication to protect your account. You are
						responsible for all actions taken under your account, including
						purchases, listings, and messages sent. If you suspect unauthorized
						access, contact support immediately.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Account Termination Conditions
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We may terminate your account for violating these terms, engaging in
						fraudulent or illegal activities, harassing other users, or
						attempting to manipulate the platform. We also reserve the right to
						terminate inactive accounts (12+ months of inactivity). You can
						request account termination at any time. Upon termination, access to
						your account is permanently revoked, and your data may be deleted as
						per our privacy policy.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400">
						2. Fees & Payments
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Platform Fee Structure
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						A 4% platform fee is applied to all successful sales across all
						phases. This fee is automatically deducted when the buyer confirms
						delivery or when funds are auto-released. There are no listing fees,
						no hidden charges, and no surprise costs. You receive 96% of the
						sale price, which is credited to your wallet. This fee supports
						platform development, escrow services, buyer and seller protection,
						and continuous improvement of our services.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Payout Processing Times
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Payouts are processed immediately after delivery confirmation and
						credited to your wallet. Withdrawal requests are processed within 3
						to 5 business days. The minimum withdrawal amount depends on the
						withdrawal method you choose. You can track your payout status in
						real-time through the wallet section. If you experience delays,
						contact support for assistance.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Withdrawal Rules
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Withdrawals are available in multiple currencies, and you can choose
						your preferred method. A minimum withdrawal amount applies, and we
						may charge withdrawal fees depending on the method you choose.
						Withdrawals are subject to verification and may take up to 5
						business days to process. We recommend reviewing the withdrawal
						rules before initiating a withdrawal to avoid any surprises.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Currency and Conversion Policies
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						The default currency on our platform is USD ($). You can deposit and
						withdraw in your preferred currency, and the platform handles
						currency conversion automatically. Exchange rates are updated
						regularly based on market rates. We are transparent about conversion
						rates, and you can view the rate before completing any transaction.
						If you have questions about currency conversions, contact support.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400">
						3. Privacy & Data Protection
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Data Collection and Storage
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We collect essential data to provide our services, including
						personal information, account credentials, payment details, and
						usage data. All data is encrypted at rest and in transit. We retain
						data for as long as necessary to provide our services and for fraud
						prevention. Users can request access to their data or request data
						deletion at any time. We are committed to protecting your privacy
						and complying with applicable laws.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						GDPR/CCPA Compliance
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We fully comply with the General Data Protection Regulation (GDPR)
						and the California Consumer Privacy Act (CCPA). This means you have
						the right to access your data, correct inaccurate data, and request
						data deletion. We have a Data Protection Officer to oversee
						compliance and handle data-related inquiries. Our privacy policy
						provides detailed information about how we collect, use, and protect
						your data.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Third-Party Data Sharing Policies
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We never sell your personal information to third parties. We share
						data only with essential service providers, such as payment
						processors and cloud hosting providers, who help us operate the
						platform. These providers are bound by strict confidentiality
						agreements and may only use your data to provide their services. You
						can opt-out of marketing data sharing at any time.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Cookie Usage and Preferences
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We use essential cookies to ensure the platform functions properly.
						We also use analytics cookies to improve our services. You can
						manage your cookie preferences in your browser settings. We do not
						use third-party advertising cookies or track you across other
						websites. Your privacy is our priority.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400">
						4. Prohibited Conduct
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Fraud and Misrepresentation
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You may not engage in fraud or misrepresentation on our platform.
						This includes listing fake assets, impersonating other users, making
						false claims about products or services, and manipulating
						transaction records. Attempting to deceive other users or the
						platform will result in immediate account termination and may be
						referred to law enforcement.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Platform Manipulation
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Any attempt to manipulate our platform is strictly prohibited. This
						includes fake reviews, rating inflation, artificial engagement, and
						gaming the system. We actively monitor for suspicious activity and
						will take action against any users who attempt to compromise the
						integrity of our platform. This includes permanent account
						suspension and removal of manipulated content.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Harassment and Abuse
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We have zero tolerance for harassment or abuse. This includes
						threatening other users, discriminatory behavior, stalking, and
						unwanted contact. All users must treat each other with respect.
						Anyone found harassing other users will have their account suspended
						and may be permanently banned from the platform.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Unauthorized Access Attempts
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You may not attempt to access our systems without authorization.
						This includes hacking, data scraping, exploiting vulnerabilities,
						and any other unauthorized access. If you discover a vulnerability,
						you must report it immediately to our security team. Attempting to
						breach our security or disrupt our services will result in immediate
						legal action.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400">
						5. Liability & Disclaimers
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Platform Warranties and Disclaimers
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Our platform is provided "as is" without any warranties. We do not
						guarantee that the platform will be error-free or uninterrupted. We
						are not liable for any damages arising from your use of our
						platform. By using our services, you assume all risks. We make no
						warranties about the quality, performance, or reliability of the
						platform.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Limitation of Liability
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Our liability is limited to the fees you have paid us. We are not
						liable for indirect, incidental, or consequential damages, including
						lost profits, data loss, or business interruption. If you are
						dissatisfied with our services, your sole remedy is to stop using
						the platform and request a refund of any fees paid. This limitation
						applies to the fullest extent permitted by law.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Indemnification Clauses
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You agree to indemnify and hold the platform harmless against any
						claims arising from your use of our services. This includes claims
						related to your content, your conduct, and your transactions. If a
						third party brings a claim against us due to your actions, you agree
						to cover our legal fees and any damages awarded against us. This
						indemnification survives termination of your account.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">Force Majeure</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We are not liable for delays or failures caused by events beyond our
						reasonable control. This includes natural disasters, war, pandemic,
						labor strikes, power outages, and failures of third-party services.
						If a force majeure event occurs, we will suspend your obligations
						under these terms until the event resolves. We will notify you of
						such events promptly.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400">
						6. Intellectual Property
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Platform IP Ownership
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						All intellectual property on our platform, including software,
						designs, logos, and content, is owned by the platform. You may not
						reproduce, distribute, or create derivative works from our
						intellectual property without explicit permission. This protects our
						brand and ensures that our services remain unique and valuable.
						Unauthorized use of our intellectual property may result in legal
						action.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						User Content License
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						By uploading content to our platform, you grant us a non-exclusive
						license to display and deliver that content. This license allows us
						to host your content and make it available to other users. You
						retain full ownership of your content, and you can request its
						removal at any time. This license terminates when you delete your
						account or remove the content from the platform.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Trademark and Copyright Infringement
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We respect intellectual property rights and respond to claims of
						infringement promptly. If you believe your copyright or trademark
						has been infringed on our platform, you can file a DMCA takedown
						request or trademark complaint. We will investigate and take
						appropriate action, including removing infringing content. Repeat
						infringers may be permanently banned from the platform.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400">7. Termination</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Suspension Conditions
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We may suspend your account if you violate these terms, engage in
						suspicious activity, or pose a risk to other users. Suspension is
						temporary and may be lifted if the issue is resolved. During
						suspension, you will not be able to access your account or make
						transactions. We will notify you of the suspension and the steps you
						need to take to restore your account.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Account Deletion Policy
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You can request account deletion at any time. Upon deletion, your
						personal data will be removed from our systems, except for data we
						are legally required to retain. This includes transaction history
						and security logs. Account deletion is permanent, and you may not be
						able to create a new account with the same email or username.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Effect of Termination on Assets/Purchases
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						If your account is terminated, any assets you purchased remain in
						your locker. However, you will lose access to your listings and any
						pending sales. Pending withdrawals may be held pending review.
						Escrow holdings will be processed according to our policies. If your
						account is terminated due to misconduct, you may lose access to your
						funds and assets.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Data Retention After Termination
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						After account termination, we retain essential data for legal
						compliance and fraud prevention. This includes transaction records,
						support tickets, and security logs. Personal data is retained for 30
						days after account deletion, after which it is purged. We may retain
						data indefinitely if required by law or regulatory requirements.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400">
						8. Dispute Resolution
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Arbitration Agreement
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Disputes that cannot be resolved internally will be settled through
						binding arbitration. The arbitration will be conducted by a single
						arbitrator, and the decision will be final and binding on both
						parties. Arbitration is less formal than court proceedings and is
						designed to resolve disputes efficiently. You can request a copy of
						the arbitration rules at any time.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">Governing Law</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						These terms are governed by the laws of the jurisdiction specified
						in the agreement. You agree to submit to the jurisdiction of the
						courts in that jurisdiction for any legal disputes. If you are an
						international user, you accept that our courts may have jurisdiction
						over any disputes arising from your use of our platform.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						User Complaint Procedure
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						To file a complaint, you must submit your issue through our support
						system. We will respond within 48 hours. If your complaint is not
						resolved to your satisfaction, you can escalate it to our senior
						support team. We aim to resolve all complaints fairly and
						efficiently. If you are still not satisfied, you may initiate
						arbitration as provided in these terms.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Class Action Waiver
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You agree to waive your right to participate in class action
						lawsuits against us. Any disputes will be resolved on an individual
						basis. This waiver applies to all users and is enforceable. If you
						are not willing to accept this waiver, you should not use our
						platform.
					</p>
				</div>
			</div>

			{/* Additional Policies */}
			<div className="py-8 border-t border-white/5 space-y-6">
				<h2 className="text-xl font-bold text-white">
					Part 5: Additional Policies
				</h2>

				<div className="space-y-3">
					<h3 className="text-lg font-bold text-rose-400">
						1. Acceptable Use Policy
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Behavior Standards
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We expect all users to maintain professional and respectful
						behavior. This includes honest communication, constructive feedback,
						and respectful interactions. Harassment, abuse, discrimination, and
						inappropriate behavior are strictly prohibited. If you encounter any
						violations, please report them to us immediately. We strive to
						maintain a safe and welcoming environment for all users.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Content Guidelines
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						All content you upload must be original and appropriate. You may not
						post content that is offensive, harmful, or violates intellectual
						property rights. Your content should be accurate and truthful. We
						reserve the right to remove any content that violates our guidelines
						or applicable laws. If you are unsure about content guidelines, we
						encourage you to review them before posting.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Reporting Mechanisms
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You can report issues through our support system. Reports are
						reviewed within 48 hours, and we take all reports seriously. We
						offer anonymous reporting for safety concerns. If you have an
						appeal, you can request a review of any decision made by our
						moderation team. We are committed to transparency and fairness in
						handling all reports.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-rose-400">
						2. Escrow & Money Protection
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Escrow Description and Timeline
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Escrow is a financial arrangement where funds are held in trust by
						our platform until specific conditions are met. When you make a
						purchase, the amount is deducted from your wallet and held in
						escrow. The funds remain in escrow until you confirm delivery. You
						have 7 days to confirm receipt. If you don't confirm within 7 days,
						the funds are automatically released to the seller. This timeline
						balances the needs of both buyers and sellers.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Hold Period Explanation
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						The hold period is designed to protect both parties. It gives you
						time to verify that the asset meets your expectations and provides
						the seller with assurance that payment is guaranteed. If you have a
						dispute, the hold period can be extended to allow for resolution.
						During the hold period, our team is available to mediate any issues
						you may encounter.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Release Conditions
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Escrow funds are released when you confirm receipt or when the
						auto-release time expires. If you confirm receipt, the funds are
						immediately transferred to the seller's wallet, minus the platform
						fee. If the auto-release time expires, the funds are automatically
						transferred to the seller's wallet. In both cases, you receive a
						notification confirming the release. Disputes can pause the release
						until resolved.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Auto-Release Timeframe
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Auto-release occurs 7 days (168 hours) after purchase if you have
						not confirmed receipt. You will receive reminder notifications
						before auto-release. If a dispute is active, auto-release is paused
						until the dispute is resolved. Auto-release ensures that sellers
						receive timely payment while giving you ample time to review your
						purchase.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-rose-400">
						3. Community Guidelines
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Conduct Expectations
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						We foster a supportive and respectful community. We expect all users
						to treat others with respect and provide constructive feedback. If
						you see inappropriate behavior, report it to our moderation team. We
						value diversity and inclusion and do not tolerate discrimination or
						harassment. Our community is built on trust and mutual respect.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Moderation Procedures
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						Our moderation team actively monitors the platform for violations.
						We use a combination of automated tools and human review to ensure
						compliance. If we take moderation action, we will notify you and
						explain the reason. You can appeal moderation decisions by
						contacting our support team. We aim to be transparent and fair in
						all moderation actions.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">Appeals Process</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						If you disagree with a moderation decision, you can appeal by
						submitting a request through our support system. Appeals are
						reviewed by a separate team within 7 days. We will provide a
						detailed explanation of our decision. If your appeal is successful,
						we will restore your content or access. This process ensures that
						all users have a fair opportunity to be heard.
					</p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-rose-400">
						4. Age Restrictions
					</h3>

					<h4 className="text-sm font-bold text-white mt-4">
						Minimum Age Requirements
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						You must be at least 18 years old to use our platform. Age
						verification is required for sellers, and we may request proof of
						age from any user. If we discover that a user is under 18, we will
						terminate their account and delete their data. This policy is
						strictly enforced to comply with legal requirements and protect
						minors.
					</p>

					<h4 className="text-sm font-bold text-white mt-4">
						Parental Consent Requirements
					</h4>
					<p className="text-sm text-zinc-300 leading-relaxed">
						For users under 18, parental consent is required. However, we
						strongly prefer that users be 18 or older. Parents who allow their
						minor children to use the platform are fully responsible for their
						actions. We comply with COPPA and other children's privacy laws. If
						you are a parent with concerns about your child's account, please
						contact us.
					</p>
				</div>
			</div>

			{/* Conclusion */}
			<div className="py-8 border-t border-white/5 space-y-4">
				<h2 className="text-xl font-bold text-white">Conclusion</h2>
				<p className="text-sm text-zinc-300 leading-relaxed">
					These Terms of Service are designed to protect you, the platform, and
					our community. By using Nu-vora | Elite Home, you agree to be
					bound by these terms. We are committed to providing a safe, secure,
					and trustworthy platform for all users. If you have any questions or
					concerns, please don't hesitate to contact our support team.
				</p>
				<p className="text-sm text-zinc-300 leading-relaxed">
					Thank you for being part of our community. Together, we are building a
					better digital marketplace for creators, businesses, and consumers
					alike.
				</p>
			</div>

			{/* Footer */}
			<div className="pt-6 border-t border-white/10 space-y-4">
				<div className="flex items-start gap-3 p-4 bg-zinc-900/30 rounded-xl border border-white/5">
					<input
						type="checkbox"
						id="terms-accept"
						checked={accepted}
						onChange={(e) => setAccepted(e.target.checked)}
						className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 flex-shrink-0"
					/>
					<label
						htmlFor="terms-accept"
						className="text-sm text-zinc-400 leading-relaxed"
					>
						I confirm that I have read and agree to the{" "}
						<span className="text-white font-medium">Terms of Service</span> for
						<span className="text-emerald-400 font-medium">
							{" "}
							Nu-vora | Elite Home
						</span>
						. I understand that a{" "}
						<span className="text-emerald-400 font-medium">
							4% platform fee
						</span>{" "}
						applies to all sales.
					</label>
				</div>

				<div className="flex gap-3">
					{onDecline && (
						<button
							onClick={onDecline}
							className="flex-1 border border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl h-12 text-sm font-bold transition-all"
						>
							Decline
						</button>
					)}
					{onAccept && (
						<button
							onClick={onAccept}
							disabled={!accepted}
							className={`flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-12 text-sm transition-all flex items-center justify-center gap-2 ${
								!accepted ? "opacity-40 cursor-not-allowed" : ""
							}`}
						>
							<CheckCircle2 className="h-5 w-5" />
							Accept & Continue
						</button>
					)}
				</div>

				<p className="text-xs text-center text-zinc-500">
					By accepting, you agree to our full Terms of Service and Privacy
					Policy.
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

export default TermsOfService;
