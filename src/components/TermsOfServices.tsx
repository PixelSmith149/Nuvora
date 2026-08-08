// components/TermsOfService.tsx

"use client";
import { useTranslations } from "next-intl";
import { CheckCircle2, ShieldCheck, Check } from "lucide-react";
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
}: TermsOfServiceProps) {
  const t = useTranslations("TermsOfService");
  const [accepted, setAccepted] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 mt-3">{t("loadingTerms")}</p>
      </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-black text-white">
  {/* ───────────────── Terms Header ───────────────── */}
  <header className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#090b0d] px-5 py-8 sm:px-8 sm:py-10">
    {/* Ambient security glow */}
    <div
      className="
        pointer-events-none
        absolute
        left-1/2
        top-[-120px]
        h-64
        w-64
        -translate-x-1/2
        rounded-full
        bg-emerald-400/[0.055]
        blur-[90px]
      "
    />

    {/* Top reflection */}
    <div
      className="
        pointer-events-none
        absolute
        inset-x-12
        top-0
        h-px
        bg-gradient-to-r
        from-transparent
        via-emerald-300/20
        to-transparent
      "
    />

    <div className="relative flex flex-col items-center text-center">
      {/* Document badge */}
      <div
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-emerald-400/[0.15]
          bg-emerald-400/[0.045]
          px-3.5
          py-1.5
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.20em]
          text-emerald-300/80
        "
      >
        <ShieldCheck
          className="h-3.5 w-3.5 text-emerald-400"
          strokeWidth={1.8}
        />

        <span>Verified Seller,User Agreement</span>
      </div>

      {/* Title */}
      <h1
        className="
          mt-5
          text-3xl
          font-black
          tracking-[-0.045em]
          text-white
          sm:text-4xl
        "
      >
        {t("termsOfService")}
      </h1>

      {/* Updated metadata */}
      <div
        className="
          mt-4
          flex
          items-center
          gap-2
          text-xs
          text-zinc-500
        "
      >
        <span
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-emerald-400
            shadow-[0_0_10px_rgba(52,211,153,0.45)]
          "
        />

        <span>
          {t("nuvoraEliteHomeLastUpdated")}
        </span>

        <span className="text-zinc-700">•</span>

        <time dateTime={new Date().toISOString()}>
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </time>
      </div>

      {/* Intro */}
      <p
        className="
          mt-5
          max-w-2xl
          text-sm
          leading-7
          text-zinc-400
        "
      >
        {t("pleaseReadTheseTermsCarefully")}
      </p>
    </div>

    {/* Bottom accent */}
    <div
      className="
        pointer-events-none
        absolute
        bottom-0
        left-1/2
        h-[2px]
        w-[35%]
        -translate-x-1/2
        rounded-full
        bg-gradient-to-r
        from-transparent
        via-emerald-400/50
        to-transparent
      "
    />
  </header>

      {/* Introduction */}
      <div className="py-8 space-y-4">
        <h2 className="text-xl font-bold text-white">{t("introduction")}</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {t("welcomeToNuvoraEliteHome")}
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {t("throughoutThisDocumentWeUs")}
        </p>
      </div>

      {/* Phase 1: Global Market Terms */}
      <div className="py-8 border-t border-white/5 space-y-6">
        <h2 className="text-xl font-bold text-white">
          {t("part1GlobalMarketTerms")}
        </h2>

        {/* Section 1: Digital Asset Listing & Selling */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-emerald-400">
            {t("1DigitalAssetListingSelling")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("sellerEligibilityVerification")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("toListAssetsOnOur")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("prohibitedItemsRestrictedCategories")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weMaintainAStrictPolicy")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("assetDescriptionAccuracy")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("whenYouListAnAsset")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("pricingGuidelines")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("allPricesOnOurPlatform")}
          </p>
        </div>

        {/* Section 2: Purchase & Transaction */}
        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-emerald-400">
            {t("2PurchaseTransaction")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("buyerProtectionEscrowHolding")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("whenYouMakeAPurchase")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("paymentProcessingFees")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("allPaymentsAreProcessedThrough")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("orderCancellationRefundPolicy")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("buyersMayCancelTheirPurchase")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("disputeResolution")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ourPlatformOffersAnInternal")}
          </p>
        </div>

        {/* Section 3: Delivery & Fulfillment */}
        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-emerald-400">
            {t("3DeliveryFulfillment")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("digitalAssetDeliveryTimeline")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("assetsAreDeliveredInstantlyTo")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("sellerDeliveryObligations")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("sellersAreResponsibleForMaintaining")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("buyerConfirmationEscrowRelease")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("onceYouReceiveYourAsset")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("automaticReleaseOfFunds")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ifYouDoNotConfirm")}
          </p>
        </div>

        {/* Section 4: Intellectual Property Rights */}
        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-emerald-400">
            {t("4IntellectualPropertyRights")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("buyersRightsUponPurchase")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("whenYouPurchaseAnAsset")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("sellersWarrantyOfOwnership")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("byListingAnAssetOn")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("prohibitedResaleOrRedistribution")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("assetsPurchasedOnOurPlatform")}
          </p>
        </div>

        {/* Section 5: Reviews & Ratings */}
        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-emerald-400">
            {t("5ReviewsRatings")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("authenticReviewRequirements")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("reviewsAreAnEssentialPart")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("prohibitedReviewManipulation")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weStrictlyProhibitAnyAttempt")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("reviewRemovalConditions")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weReserveTheRightTo")}
          </p>
        </div>
      </div>

      {/* Phase 2: SMM Panel Terms */}
      <div className="py-8 border-t border-white/5 space-y-6">
        <h2 className="text-xl font-bold text-white">
          {t("part2SmmPanelTerms")}
        </h2>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-purple-400">
            {t("1ServiceDelivery")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("serviceTypesOffered")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ourSmmPanelProvidesA")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("deliveryTimeframesGuarantees")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("deliveryTimesVaryByService")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("qualityAssuranceDropProtection")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weAreCommittedToProviding")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("refillReplacementPolicies")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ifYouExperienceADrop")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-purple-400">
            {t("2AcceptableUse")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("prohibitedContentaccounts")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ourSmmServicesMayNot")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("serviceLimitationsCaps")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weImposeDailyLimitsOn")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("noBotsSpamOrAutomation")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("allOurServicesComplyWith")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("complianceWithSocialPlatformTerms")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("asAUserOfOur")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-purple-400">
            {t("3RefundCancellation")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("refundEligibilityConditions")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youAreEligibleForA")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("partialRefundsForPartialDelivery")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ifAnOrderIsPartially")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("cancellationWindow")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ordersCanBeCancelledWithin")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("nonrefundableCircumstances")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("someSituationsDoNotQualify")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-purple-400">
            {t("4AccountSafety")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("sellerResponsibilityForAccountSafety")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("asAUserOfOur_1")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("recommendationsForAccountSecurity")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weStronglyRecommendTheFollowing")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("liabilityForAccountActions")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youAreFullyResponsibleFor")}
          </p>
        </div>
      </div>

      {/* Phase 3: Social Tenant Terms */}
      <div className="py-8 border-t border-white/5 space-y-6">
        <h2 className="text-xl font-bold text-white">
          {t("part3SocialTenantTerms")}
        </h2>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-sky-400">{t("1PlatformUsage")}</h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("siteOwnershipUsageRights")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("whenYouCreateAWebsite")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("contentResponsibility")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youAreResponsibleForAll")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("prohibitedContent")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youMayNotUseOur")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("acceptableUsePolicies")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weExpectAllUsersTo")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-sky-400">
            {t("2TemplatesCustomization")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("templateUsageRights")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ourTemplatesAreDesignedTo")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("customizationLimitations")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youHaveExtensiveFlexibilityTo")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("brandingGuidelines")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("whenCreatingYourWebsiteYou")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("linkinbioStorefrontPolicies")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ourPlatformAllowsYouTo")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-sky-400">{t("3DesignServices")}</h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("aigeneratedDesignOutputRights")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ourAiDesignServicesGenerate")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("buyerOwnershipOfFinalDesigns")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("whenYouCommissionADesign")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("usageRestrictions")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("whileYouOwnTheFinal")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("thirdpartyAttributionRequirements")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("someDesignsMayIncorporateThirdparty")}
          </p>
        </div>
      </div>

      {/* Phase 4: General Platform Terms */}
      <div className="py-8 border-t border-white/5 space-y-6">
        <h2 className="text-xl font-bold text-white">
          {t("part4GeneralPlatformTerms")}
        </h2>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-amber-400">{t("1UserAccounts")}</h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("accountRegistrationRequirements")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("toCreateAnAccountOn")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("usernameAndPasswordSecurity")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("yourAccountSecurityIsYour")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("accountTerminationConditions")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weMayTerminateYourAccount")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-amber-400">
            {t("2FeesPayments")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("platformFeeStructure")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("a4PlatformFeeIs")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("payoutProcessingTimes")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("payoutsAreProcessedImmediatelyAfter")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("withdrawalRules")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("withdrawalsAreAvailableInMultiple")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("currencyAndConversionPolicies")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("theDefaultCurrencyOnOur")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-amber-400">
            {t("3PrivacyDataProtection")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("dataCollectionAndStorage")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weCollectEssentialDataTo")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("gdprccpaCompliance")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weFullyComplyWithThe")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("thirdpartyDataSharingPolicies")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weNeverSellYourPersonal")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("cookieUsageAndPreferences")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weUseEssentialCookiesTo")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-amber-400">
            {t("4ProhibitedConduct")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("fraudAndMisrepresentation")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youMayNotEngageIn")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("platformManipulation")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("anyAttemptToManipulateOur")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("harassmentAndAbuse")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weHaveZeroToleranceFor")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("unauthorizedAccessAttempts")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youMayNotAttemptTo")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-amber-400">
            {t("5LiabilityDisclaimers")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("platformWarrantiesAndDisclaimers")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ourPlatformIsProvidedAs")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("limitationOfLiability")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ourLiabilityIsLimitedTo")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("indemnificationClauses")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youAgreeToIndemnifyAnd")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">{t("forceMajeure")}</h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weAreNotLiableFor")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-amber-400">
            {t("6IntellectualProperty")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("platformIpOwnership")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("allIntellectualPropertyOnOur")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("userContentLicense")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("byUploadingContentToOur")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("trademarkAndCopyrightInfringement")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weRespectIntellectualPropertyRights")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-amber-400">{t("7Termination")}</h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("suspensionConditions")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weMaySuspendYourAccount")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("accountDeletionPolicy")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youCanRequestAccountDeletion")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("effectOfTerminationOnAssetspurchases")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ifYourAccountIsTerminated")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("dataRetentionAfterTermination")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("afterAccountTerminationWeRetain")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-amber-400">
            {t("8DisputeResolution")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("arbitrationAgreement")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("disputesThatCannotBeResolved")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">{t("governingLaw")}</h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("theseTermsAreGovernedBy")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("userComplaintProcedure")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("toFileAComplaintYou")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("classActionWaiver")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youAgreeToWaiveYour")}
          </p>
        </div>
      </div>

      {/* Additional Policies */}
      <div className="py-8 border-t border-white/5 space-y-6">
        <h2 className="text-xl font-bold text-white">
          {t("part5AdditionalPolicies")}
        </h2>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-rose-400">
            {t("1AcceptableUsePolicy")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("behaviorStandards")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weExpectAllUsersTo_1")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("contentGuidelines")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("allContentYouUploadMust")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("reportingMechanisms")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youCanReportIssuesThrough")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-rose-400">
            {t("2EscrowMoneyProtection")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("escrowDescriptionAndTimeline")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("escrowIsAFinancialArrangement")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("holdPeriodExplanation")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("theHoldPeriodIsDesigned")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("releaseConditions")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("escrowFundsAreReleasedWhen")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("autoreleaseTimeframe")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("autoreleaseOccurs7Days168")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-rose-400">
            {t("3CommunityGuidelines")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("conductExpectations")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("weFosterASupportiveAnd")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("moderationProcedures")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ourModerationTeamActivelyMonitors")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">{t("appealsProcess")}</h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("ifYouDisagreeWithA")}
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-bold text-rose-400">
            {t("4AgeRestrictions")}
          </h3>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("minimumAgeRequirements")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("youMustBeAtLeast")}
          </p>

          <h4 className="text-sm font-bold text-white mt-4">
            {t("parentalConsentRequirements")}
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {t("forUsersUnder18Parental")}
          </p>
        </div>
      </div>

      {/* Conclusion */}
      <div className="py-8 border-t border-white/5 space-y-4">
        <h2 className="text-xl font-bold text-white">{t("conclusion")}</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {t("theseTermsOfServiceAre")}
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {t("thankYouForBeingPart")}
        </p>
      </div>

      {/* ───────────────── Terms Footer ───────────────── */}
<div
  className="
    relative
    mt-8
    overflow-hidden
    rounded-[22px]
    border
    border-white/[0.08]
    bg-white/[0.025]
    p-5
    shadow-[0_12px_40px_rgba(0,0,0,0.20)]
  "
>
  {/* Ambient acceptance glow */}
  <div
    className={`
      pointer-events-none
      absolute
      -right-20
      -top-20
      h-40
      w-40
      rounded-full
      blur-[65px]
      transition-all
      duration-500
      ${
        accepted
          ? "bg-emerald-400/[0.09]"
          : "bg-white/[0.025]"
      }
    `}
  />

  <div className="relative">
    {/* Acceptance control */}
    <button
      type="button"
      role="switch"
      aria-checked={accepted}
      onClick={() => setAccepted((value) => !value)}
      className={`
        group
        flex
        w-full
        items-center
        gap-4
        rounded-[16px]
        border
        px-4
        py-3.5
        text-left
        transition-all
        duration-300
        ${
          accepted
            ? "border-emerald-400/[0.20] bg-emerald-400/[0.045]"
            : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.035]"
        }
      `}
    >
      {/* Toggle */}
      <span
        className={`
          relative
          h-7
          w-12
          shrink-0
          rounded-full
          border
          p-[3px]
          transition-all
          duration-300
          ${
            accepted
              ? "border-emerald-400/30 bg-emerald-400/20"
              : "border-white/10 bg-zinc-900"
          }
        `}
      >
        <span
          className={`
            block
            h-[18px]
            w-[18px]
            rounded-full
            shadow-[0_2px_8px_rgba(0,0,0,0.35)]
            transition-all
            duration-300
            ${
              accepted
                ? "translate-x-5 bg-emerald-400"
                : "translate-x-0 bg-zinc-500"
            }
          `}
        />

        {/* Toggle shine */}
        {accepted && (
          <span
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-full
              bg-gradient-to-r
              from-transparent
              via-white/[0.12]
              to-transparent
            "
          />
        )}
      </span>

      {/* Confirmation text */}
      <span className="min-w-0 flex-1">
        <span
          className={`
            block
            text-sm
            font-semibold
            transition-colors
            duration-300
            ${
              accepted
                ? "text-emerald-100"
                : "text-zinc-200"
            }
          `}
        >
          {accepted
            ? "Terms accepted"
            : "I confirm that I have read and agree"}
        </span>

        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {t("iConfirmThatIHave")}{" "}
          <span className="text-zinc-300">
            {t("termsOfService")}
          </span>{" "}
          {t("for")}{" "}
          <span className="text-zinc-300">
            {t("nuvoraEliteHome")}
          </span>
          .{" "}
          {t("IUnderstandThatA")}{" "}
          <span className="text-zinc-300">
            {t("4PlatformFee")}
          </span>{" "}
          {t("appliesToAllSales")}.
        </span>
      </span>

      {/* Status icon */}
      <span
        className={`
          hidden
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          sm:flex
          transition-all
          duration-300
          ${
            accepted
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
              : "border-white/[0.06] bg-white/[0.02] text-zinc-700"
          }
        `}
      >
        <Check
          className="h-4 w-4"
          strokeWidth={2}
        />
      </span>
    </button>

    {/* Actions */}
    <div className="mt-4 flex gap-3">
      {onDecline && (
        <button
          type="button"
          onClick={onDecline}
          className="
            h-12
            flex-1
            rounded-[14px]
            border
            border-white/[0.08]
            bg-transparent
            text-sm
            font-semibold
            text-zinc-500
            transition-all
            duration-300
            hover:border-white/[0.14]
            hover:bg-white/[0.035]
            hover:text-zinc-200
            active:scale-[0.99]
          "
        >
          {t("decline")}
        </button>
      )}

      {onAccept && (
        <button
          type="button"
          onClick={onAccept}
          disabled={!accepted}
          className={`
            group
            relative
            h-12
            flex-1
            overflow-hidden
            rounded-[14px]
            border
            text-sm
            font-semibold
            transition-all
            duration-300
            ${
              accepted
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/[0.14] hover:shadow-[0_10px_30px_rgba(16,185,129,0.10)] active:scale-[0.99]"
                : "cursor-not-allowed border-white/[0.06] bg-white/[0.025] text-zinc-600"
            }
          `}
        >
          {accepted && (
            <span
              className="
                pointer-events-none
                absolute
                inset-y-0
                -left-[100%]
                w-1/2
                skew-x-[-20deg]
                bg-gradient-to-r
                from-transparent
                via-white/[0.10]
                to-transparent
                transition-transform
                duration-700
                group-hover:translate-x-[400%]
              "
            />
          )}

          <span className="relative flex items-center justify-center gap-2">
            {accepted && (
              <CheckCircle2
                className="h-4 w-4 text-emerald-400"
                strokeWidth={1.8}
              />
            )}

            {t("acceptContinue")}
          </span>
        </button>
      )}
    </div>

    {/* Legal/support note */}
    <div className="mt-4 text-center">
      <p className="text-[11px] leading-5 text-zinc-600">
        {t("byAcceptingYouAgreeTo")}
      </p>

      <p className="mt-1 text-[11px] text-zinc-600">
        {t("needHelp")}{" "}
        <a
          href="/support"
          className="
            font-medium
            text-emerald-500/80
            transition-colors
            hover:text-emerald-400
            hover:underline
            underline-offset-2
          "
        >
          {t("contactSupport")}
        </a>
      </p>
    </div>
  </div>

  {/* Bottom confirmation accent */}
  <div
    className={`
      absolute
      bottom-0
      left-1/2
      h-[2px]
      -translate-x-1/2
      rounded-full
      transition-all
      duration-500
      ${
        accepted
          ? "w-[65%] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
          : "w-[25%] bg-gradient-to-r from-transparent via-white/10 to-transparent"
      }
    `}
  />
</div>
    </div>
  );
}

export default TermsOfService;