// components/TermsOfService.tsx

"use client";import { useTranslations } from "next-intl";

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
  isLoading = false
}: TermsOfServiceProps) {const t = useTranslations("TermsOfService");
  const [accepted, setAccepted] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
				<div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
				<p className="text-xs text-zinc-500 mt-3">{t("loadingTerms")}</p>
			</div>);

  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-black text-white">
			{/* Header */}
			<div className="text-center space-y-3 pb-8 border-b border-white/10">
				<div className="flex items-center justify-center gap-3">
					<ShieldCheck className="h-8 w-8 text-emerald-400" />
					<h1 className="text-2xl font-bold text-white">{t("termsOfService")}</h1>
				</div>
				<p className="text-sm text-zinc-400 max-w-2xl mx-auto"> {t("nuvoraEliteHomeLastUpdated")}
          {" "}
					{new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
          })}
				</p>
				<p className="text-sm text-zinc-500 max-w-2xl mx-auto"> {t("pleaseReadTheseTermsCarefully")} 


        </p>
			</div>

			{/* Introduction */}
			<div className="py-8 space-y-4">
				<h2 className="text-xl font-bold text-white">{t("introduction")}</h2>
				<p className="text-sm text-zinc-300 leading-relaxed"> {t("welcomeToNuvoraEliteHome")} 







        </p>
				<p className="text-sm text-zinc-300 leading-relaxed"> {t("throughoutThisDocumentWeUs")} 






        </p>
			</div>

			{/* Phase 1: Global Market Terms */}
			<div className="py-8 border-t border-white/5 space-y-6">
				<h2 className="text-xl font-bold text-white"> {t("part1GlobalMarketTerms")} 

        </h2>

				{/* Section 1: Digital Asset Listing & Selling */}
				<div className="space-y-3">
					<h3 className="text-lg font-bold text-emerald-400"> {t("1DigitalAssetListingSelling")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("sellerEligibilityVerification")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("toListAssetsOnOur")} 










          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("prohibitedItemsRestrictedCategories")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weMaintainAStrictPolicy")} 










          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("assetDescriptionAccuracy")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("whenYouListAnAsset")} 









          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("pricingGuidelines")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("allPricesOnOurPlatform")} 









          </p>
				</div>

				{/* Section 2: Purchase & Transaction */}
				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-emerald-400"> {t("2PurchaseTransaction")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("buyerProtectionEscrowHolding")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("whenYouMakeAPurchase")} 










          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("paymentProcessingFees")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("allPaymentsAreProcessedThrough")} 









          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("orderCancellationRefundPolicy")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("buyersMayCancelTheirPurchase")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("disputeResolution")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ourPlatformOffersAnInternal")} 









          </p>
				</div>

				{/* Section 3: Delivery & Fulfillment */}
				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-emerald-400"> {t("3DeliveryFulfillment")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("digitalAssetDeliveryTimeline")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("assetsAreDeliveredInstantlyTo")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("sellerDeliveryObligations")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("sellersAreResponsibleForMaintaining")} 









          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("buyerConfirmationEscrowRelease")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("onceYouReceiveYourAsset")} 









          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("automaticReleaseOfFunds")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ifYouDoNotConfirm")} 









          </p>
				</div>

				{/* Section 4: Intellectual Property Rights */}
				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-emerald-400"> {t("4IntellectualPropertyRights")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("buyersRightsUponPurchase")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("whenYouPurchaseAnAsset")} 









          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("sellersWarrantyOfOwnership")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("byListingAnAssetOn")} 









          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("prohibitedResaleOrRedistribution")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("assetsPurchasedOnOurPlatform")} 









          </p>
				</div>

				{/* Section 5: Reviews & Ratings */}
				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-emerald-400"> {t("5ReviewsRatings")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("authenticReviewRequirements")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("reviewsAreAnEssentialPart")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("prohibitedReviewManipulation")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weStrictlyProhibitAnyAttempt")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("reviewRemovalConditions")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weReserveTheRightTo")} 








          </p>
				</div>
			</div>

			{/* Phase 2: SMM Panel Terms */}
			<div className="py-8 border-t border-white/5 space-y-6">
				<h2 className="text-xl font-bold text-white"> {t("part2SmmPanelTerms")} 

        </h2>

				<div className="space-y-3">
					<h3 className="text-lg font-bold text-purple-400"> {t("1ServiceDelivery")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("serviceTypesOffered")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ourSmmPanelProvidesA")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("deliveryTimeframesGuarantees")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("deliveryTimesVaryByService")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("qualityAssuranceDropProtection")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weAreCommittedToProviding")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("refillReplacementPolicies")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ifYouExperienceADrop")} 







          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-purple-400"> {t("2AcceptableUse")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("prohibitedContentaccounts")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ourSmmServicesMayNot")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("serviceLimitationsCaps")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weImposeDailyLimitsOn")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("noBotsSpamOrAutomation")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("allOurServicesComplyWith")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("complianceWithSocialPlatformTerms")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("asAUserOfOur")} 







          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-purple-400"> {t("3RefundCancellation")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("refundEligibilityConditions")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youAreEligibleForA")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("partialRefundsForPartialDelivery")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ifAnOrderIsPartially")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("cancellationWindow")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ordersCanBeCancelledWithin")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("nonrefundableCircumstances")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("someSituationsDoNotQualify")} 







          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-purple-400"> {t("4AccountSafety")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("sellerResponsibilityForAccountSafety")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("asAUserOfOur_1")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("recommendationsForAccountSecurity")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weStronglyRecommendTheFollowing")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("liabilityForAccountActions")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youAreFullyResponsibleFor")} 








          </p>
				</div>
			</div>

			{/* Phase 3: Social Tenant Terms */}
			<div className="py-8 border-t border-white/5 space-y-6">
				<h2 className="text-xl font-bold text-white"> {t("part3SocialTenantTerms")} 

        </h2>

				<div className="space-y-3">
					<h3 className="text-lg font-bold text-sky-400">{t("1PlatformUsage")}</h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("siteOwnershipUsageRights")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("whenYouCreateAWebsite")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("contentResponsibility")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youAreResponsibleForAll")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("prohibitedContent")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youMayNotUseOur")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("acceptableUsePolicies")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weExpectAllUsersTo")} 








          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-sky-400"> {t("2TemplatesCustomization")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("templateUsageRights")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ourTemplatesAreDesignedTo")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("customizationLimitations")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youHaveExtensiveFlexibilityTo")} 








          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("brandingGuidelines")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("whenCreatingYourWebsiteYou")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("linkinbioStorefrontPolicies")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ourPlatformAllowsYouTo")} 









          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-sky-400">{t("3DesignServices")}</h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("aigeneratedDesignOutputRights")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ourAiDesignServicesGenerate")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("buyerOwnershipOfFinalDesigns")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("whenYouCommissionADesign")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("usageRestrictions")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("whileYouOwnTheFinal")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("thirdpartyAttributionRequirements")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("someDesignsMayIncorporateThirdparty")} 







          </p>
				</div>
			</div>

			{/* Phase 4: General Platform Terms */}
			<div className="py-8 border-t border-white/5 space-y-6">
				<h2 className="text-xl font-bold text-white"> {t("part4GeneralPlatformTerms")} 

        </h2>

				<div className="space-y-3">
					<h3 className="text-lg font-bold text-amber-400">{t("1UserAccounts")}</h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("accountRegistrationRequirements")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("toCreateAnAccountOn")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("usernameAndPasswordSecurity")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("yourAccountSecurityIsYour")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("accountTerminationConditions")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weMayTerminateYourAccount")} 







          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400"> {t("2FeesPayments")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("platformFeeStructure")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("a4PlatformFeeIs")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("payoutProcessingTimes")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("payoutsAreProcessedImmediatelyAfter")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("withdrawalRules")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("withdrawalsAreAvailableInMultiple")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("currencyAndConversionPolicies")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("theDefaultCurrencyOnOur")} 






          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400"> {t("3PrivacyDataProtection")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("dataCollectionAndStorage")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weCollectEssentialDataTo")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("gdprccpaCompliance")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weFullyComplyWithThe")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("thirdpartyDataSharingPolicies")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weNeverSellYourPersonal")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("cookieUsageAndPreferences")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weUseEssentialCookiesTo")} 





          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400"> {t("4ProhibitedConduct")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("fraudAndMisrepresentation")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youMayNotEngageIn")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("platformManipulation")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("anyAttemptToManipulateOur")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("harassmentAndAbuse")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weHaveZeroToleranceFor")} 





          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("unauthorizedAccessAttempts")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youMayNotAttemptTo")} 






          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400"> {t("5LiabilityDisclaimers")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("platformWarrantiesAndDisclaimers")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ourPlatformIsProvidedAs")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("limitationOfLiability")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ourLiabilityIsLimitedTo")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("indemnificationClauses")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youAgreeToIndemnifyAnd")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4">{t("forceMajeure")}</h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weAreNotLiableFor")} 






          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400"> {t("6IntellectualProperty")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("platformIpOwnership")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("allIntellectualPropertyOnOur")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("userContentLicense")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("byUploadingContentToOur")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("trademarkAndCopyrightInfringement")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weRespectIntellectualPropertyRights")} 






          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400">{t("7Termination")}</h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("suspensionConditions")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weMaySuspendYourAccount")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("accountDeletionPolicy")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youCanRequestAccountDeletion")} 





          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("effectOfTerminationOnAssetspurchases")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ifYourAccountIsTerminated")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("dataRetentionAfterTermination")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("afterAccountTerminationWeRetain")} 





          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-amber-400"> {t("8DisputeResolution")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("arbitrationAgreement")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("disputesThatCannotBeResolved")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4">{t("governingLaw")}</h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("theseTermsAreGovernedBy")} 





          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("userComplaintProcedure")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("toFileAComplaintYou")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("classActionWaiver")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youAgreeToWaiveYour")} 





          </p>
				</div>
			</div>

			{/* Additional Policies */}
			<div className="py-8 border-t border-white/5 space-y-6">
				<h2 className="text-xl font-bold text-white"> {t("part5AdditionalPolicies")} 

        </h2>

				<div className="space-y-3">
					<h3 className="text-lg font-bold text-rose-400"> {t("1AcceptableUsePolicy")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("behaviorStandards")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weExpectAllUsersTo_1")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("contentGuidelines")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("allContentYouUploadMust")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("reportingMechanisms")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youCanReportIssuesThrough")} 






          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-rose-400"> {t("2EscrowMoneyProtection")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("escrowDescriptionAndTimeline")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("escrowIsAFinancialArrangement")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("holdPeriodExplanation")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("theHoldPeriodIsDesigned")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("releaseConditions")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("escrowFundsAreReleasedWhen")} 







          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("autoreleaseTimeframe")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("autoreleaseOccurs7Days168")} 






          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-rose-400"> {t("3CommunityGuidelines")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("conductExpectations")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("weFosterASupportiveAnd")} 





          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("moderationProcedures")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ourModerationTeamActivelyMonitors")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4">{t("appealsProcess")}</h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("ifYouDisagreeWithA")} 






          </p>
				</div>

				<div className="space-y-3 mt-8">
					<h3 className="text-lg font-bold text-rose-400"> {t("4AgeRestrictions")} 

          </h3>

					<h4 className="text-sm font-bold text-white mt-4"> {t("minimumAgeRequirements")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("youMustBeAtLeast")} 






          </p>

					<h4 className="text-sm font-bold text-white mt-4"> {t("parentalConsentRequirements")} 

          </h4>
					<p className="text-sm text-zinc-300 leading-relaxed"> {t("forUsersUnder18Parental")} 






          </p>
				</div>
			</div>

			{/* Conclusion */}
			<div className="py-8 border-t border-white/5 space-y-4">
				<h2 className="text-xl font-bold text-white">{t("conclusion")}</h2>
				<p className="text-sm text-zinc-300 leading-relaxed"> {t("theseTermsOfServiceAre")} 





        </p>
				<p className="text-sm text-zinc-300 leading-relaxed"> {t("thankYouForBeingPart")} 



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
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 flex-shrink-0" />
          
					<label
            htmlFor="terms-accept"
            className="text-sm text-zinc-400 leading-relaxed"> {t("iConfirmThatIHave")}

            {" "}
						<span className="text-white font-medium">{t("termsOfService")}</span> {t("for")} 
            <span className="text-emerald-400 font-medium">
							{" "} {t("nuvoraEliteHome")} 

            </span> {t("IUnderstandThatA")}
            {" "}
						<span className="text-emerald-400 font-medium"> {t("4PlatformFee")} 

            </span>{" "} {t("appliesToAllSales")} 

          </label>
				</div>

				<div className="flex gap-3">
					{onDecline &&
          <button
            onClick={onDecline}
            className="flex-1 border border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl h-12 text-sm font-bold transition-all"> {t("decline")} 


          </button>
          }
					{onAccept &&
          <button
            onClick={onAccept}
            disabled={!accepted}
            className={`flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-12 text-sm transition-all flex items-center justify-center gap-2 ${
            !accepted ? "opacity-40 cursor-not-allowed" : ""}`
            }>
            
							<CheckCircle2 className="h-5 w-5" /> {t("acceptContinue")} 

          </button>
          }
				</div>

				<p className="text-xs text-center text-zinc-500"> {t("byAcceptingYouAgreeTo")} 


          <br /> {t("needHelp")}
          {" "}
					<a href="/support" className="text-emerald-400 hover:underline"> {t("contactSupport")} 

          </a>
				</p>
			</div>
		</div>);

}

export default TermsOfService;