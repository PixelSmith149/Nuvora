// components/PrivacyPolicy.tsx
"use client";

import { useTranslations } from "next-intl";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cookie,
  Database,
  ExternalLink,
  Eye,
  Globe,
  HeartHandshake,
  Info,
  Layers,
  Mail,
  Package,
  RefreshCw,
  Scale,
  Send,
  Shield,
  ShieldCheck,
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
  const t = useTranslations("PrivacyPolicy");
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
      title: t("introTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("whoWeAre")}</p>
          <p>{t("nuvoraEliteHomeIs")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("globalMarket")}</span>{" "}
                {t("digitalAssetMarketplaceFor")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("smmPanel")}</span>{" "}
                {t("SocialmediaMarketingServices")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("socialTenant")}</span>{" "}
                {t("websiteBuilderAndDesign")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("whatThisPolicyCovers")}</p>
          <p>{t("thisPrivacyPolicyExplains")}</p>
          <p className="font-medium text-zinc-100 pt-1">{t("scopeOfThisPolicy")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("allPlatformUsersBuyers")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("allPhasesGlobalMarket")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("allServicesListingPurchasing")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("allInteractionsWebMobile")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("yourAcceptance")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("byUsingOurPlatform")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("ifYouDisagreeWith")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("continuedUseAfterUpdates")}</span>
            </li>
          </ul>
          <div className="mt-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3.5 py-3">
            <p className="text-xs text-zinc-500">
              <span className="text-emerald-400/90">{t("LastUpdated")}</span>{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              <span className="text-emerald-400/90">{t("PrivacyTeam")}</span>{" "}
              {t("privacynuvoraapp")}
            </p>
          </div>
        </div>
      ),
    },

    // ─── 2. INFORMATION WE COLLECT ───────────────────────────────
    {
      id: "collect",
      icon: Database,
      title: t("collectTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("personalInformation")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("name")}</span>{" "}
                {t("fullNameDisplayNameusername")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("contact")}</span>{" "}
                {t("emailAddressPhonenumber")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("profile")}</span>{" "}
                {t("avatarBioStoredescription")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("social")}</span>{" "}
                {t("tiktokSnapchatAndotherSocial")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("accountAuthenticationData")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("credentials")}</span>{" "}
                {t("passwordHashedandSalted")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("authentication")}</span>{" "}
                {t("loginTokenssessionData")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("biometric")}</span>{" "}
                {t("15secondFacialrecognitionVideoSellers")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("verification")}</span>{" "}
                {t("identityverificationDocuments")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("paymentFinancialData")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("wallet")}</span>{" "}
                {t("balancesTransactionhistory")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("payments")}</span>{" "}
                {t("purchaseRecordsescrowHoldings")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("withdrawals")}</span>{" "}
                {t("payoutHistorywithdrawalMethods")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("fees")}</span>{" "}
                {t("platformFeesCollected")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("usageTechnicalData")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("device")}</span>{" "}
                {t("ipAddressDevicetypeBrowser")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("location")}</span>{" "}
                {t("geographicLocationcountryregion")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("activity")}</span>{" "}
                {t("pagesVisitedfeaturesUsed")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("performance")}</span>{" "}
                {t("loadingTimeserrorLogs")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("phasespecificData")}</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3">
              <p className="text-xs font-semibold tracking-wide text-emerald-400/90">
                {t("globalMarket")}
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-zinc-500">
                <li>{t("assetListingsAndDescriptions")}</li>
                <li>{t("salesAndPurchaseHistory")}</li>
                <li>{t("reviewsAndRatings")}</li>
                <li>{t("lockerContents")}</li>
              </ul>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3">
              <p className="text-xs font-semibold tracking-wide text-emerald-400/90">
                {t("smmPanel")}
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-zinc-500">
                <li>{t("socialMediaAccountDetails")}</li>
                <li>{t("serviceOrderHistory")}</li>
                <li>{t("engagementMetrics")}</li>
                <li>{t("accountGrowthData")}</li>
              </ul>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3">
              <p className="text-xs font-semibold tracking-wide text-emerald-400/90">
                {t("socialTenant")}
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-zinc-500">
                <li>{t("websiteContentAndDesigns")}</li>
                <li>{t("aiGenerationPrompts")}</li>
                <li>{t("templateCustomizations")}</li>
                <li>{t("storefrontData")}</li>
              </ul>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.04] px-3.5 py-3">
            <p className="text-xs font-medium text-emerald-400/90">
              {t("BiometricDataProtection")}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{t("yourBiometricVideoIs")}</p>
          </div>
        </div>
      ),
    },

    // ─── 3. HOW WE USE YOUR INFORMATION ──────────────────────────
    {
      id: "use",
      icon: Eye,
      title: t("useTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("platformFunctionality")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("processingPurchases")}</span>{" "}
                {t("orderspaymentsEscrowManagement")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("deliveringAssets")}</span>{" "}
                {t("lockerdeliveryAndManagement")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("accountManagement")}</span>{" "}
                {t("registrationLoginProfileUpdates")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("verification")}</span>{" "}
                {t("identityAndAgeverification")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("communication")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("notifications")}</span>{" "}
                {t("purchaseconfirmationsDeliveryUpdates")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("support")}</span>{" "}
                {t("respondingToinquiriesAndTickets")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("marketing")}</span>{" "}
                {t("promotionalmaterialsOptinRequired")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("updates")}</span>{" "}
                {t("platformannouncementsAndPolicyChanges")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("analyticsImprovement")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("platformOptimization")}</span>{" "}
                {t("performanceImprovements")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("userExperience")}</span>{" "}
                {t("featureenhancements")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("trendAnalysis")}</span>{" "}
                {t("understandinguserBehavior")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("testing")}</span>{" "}
                {t("abTestingAndexperiments")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("fraudPreventionSecurity")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("identityVerification")}</span>{" "}
                {t("preventingFakeAccounts")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("fraudDetection")}</span>{" "}
                {t("identifyingsuspiciousActivity")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("riskAssessment")}</span>{" "}
                {t("evaluatingtransactionRisk")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("compliance")}</span>{" "}
                {t("meetingLegalAndregulatoryRequirements")}
              </span>
            </li>
          </ul>
          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.04] px-3.5 py-3">
            <p className="text-xs font-medium text-emerald-400/90">
              {t("DataUsePrinciples")}
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-zinc-500">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />
                <span>{t("weOnlyUseData")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />
                <span>{t("weMinimizeDataCollection")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />
                <span>{t("weAnonymizeDataWhere")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />
                <span>{t("weNeverSellYour")}</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },

    // ─── 4. INFORMATION SHARING & DISCLOSURE ─────────────────────
    {
      id: "share",
      icon: Users,
      title: t("shareTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("thirdpartyServiceProviders")}</p>
          <p>{t("weShareDataWith")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("paymentProcessors")}</span>{" "}
                {t("stripepaypalCryptoGateways")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("cloudProviders")}</span>{" "}
                {t("supabasedatabaseAwsStorage")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("analytics")}</span>{" "}
                {t("googleAnalyticsforUsageInsights")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("support")}</span>{" "}
                {t("customerServicetools")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("legalRequirements")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("lawEnforcementRequestsWith")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("courtOrdersAndSubpoenas")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("regulatoryAuthorityRequirements")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("enforcementOfOurTerms")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("businessTransfers")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("saleMergerOrAcquisition")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("bankruptcyOrInsolvencyProceedings")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("assetTransfersToOther")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("usersNotifiedOfMaterial")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("withYourConsent")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("explicitConsentForAdditional")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("optinMarketingCommunications")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("thirdpartyIntegrationsYouEnable")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("youCanWithdrawConsent")}</span>
            </li>
          </ul>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3.5 py-3">
            <p className="text-xs font-medium text-zinc-200">{t("WhatWeDo")}</p>
            <ul className="mt-1.5 space-y-1 text-xs text-zinc-500">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                <span>{t("biometricVerificationVideos")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                <span>{t("walletPasswordsOrPayment")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                <span>{t("privateMessagesBetweenUsers")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                <span>{t("dataWithoutProperLegal")}</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },

    // ─── 5. DATA STORAGE & SECURITY ──────────────────────────────
    {
      id: "security",
      icon: Shield,
      title: t("securityTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("dataStorage")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("primaryDatabase")}</span>{" "}
                {t("supabasepostgresqlEncrypted")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("fileStorage")}</span>{" "}
                {t("supabaseStorageencrypted")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("backups")}</span>{" "}
                {t("automatedDailybackups")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("location")}</span>{" "}
                {t("dataStoredInsecureData")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("encryptionStandards")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("inTransit")}</span>{" "}
                {t("tls13EncryptionforAll")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("atRest")}</span>{" "}
                {t("aes256EncryptionforStoredData")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("passwords")}</span>{" "}
                {t("hashedAndSaltedwithBcrypt")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("biometric")}</span>{" "}
                {t("encryptedWithuserspecificKeys")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("securityMeasures")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("authentication")}</span>{" "}
                {t("jwtTokenswithShortExpiry")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("accessControl")}</span>{" "}
                {t("rolebasedaccessRbac")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("monitoring")}</span>{" "}
                {t("realtimeSecuritymonitoring")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("audits")}</span>{" "}
                {t("regularSecurityauditsAndPenetration")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("dataRetention")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("activeAccounts")}</span>{" "}
                {t("dataRetainedwhileAccountIs")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("inactiveAccounts")}</span>{" "}
                {t("30DaysafterInactivity")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("deletedAccounts")}</span>{" "}
                {t("dataDeletedwithin30Days")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("transactionHistory")}</span>{" "}
                {t("retainedforLegalCompliance")}
              </span>
            </li>
          </ul>
          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.04] px-3.5 py-3">
            <p className="text-xs font-medium text-emerald-400/90">
              {t("SecurityIncidentResponse")}
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-zinc-500">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />
                <span>{t("immediateContainmentProcedures")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />
                <span>{t("userNotificationWithin72")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />
                <span>{t("forensicInvestigationBySecurity")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/50" />
                <span>{t("remediationAndPreventionMeasures")}</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },

    // ─── 6. YOUR RIGHTS ──────────────────────────────────────────
    {
      id: "rights",
      icon: UserCheck,
      title: t("rightsTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("rightToAccess")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("viewAllPersonalData")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("requestACopyOf")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("accessYourTransactionHistory")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("viewYourProfileAnd")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("rightToCorrection")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("updateInaccurateOrIncomplete")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("changeProfileInformationAnytime")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("correctTransactionRecordsIf")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("updateContactInformation")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("rightToDeletionRight")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("requestPermanentDataDeletion")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("deletedDataRemovedWithin")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("someDataMayBe")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("secureDeletionMethodsUsed")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("rightToDataPortability")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("receiveDataInPortable")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("transferDataToAnother")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("exportTransactionHistory")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("exportAccountData")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("rightToRestrictProcessing")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("requestLimitedDataProcessing")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("optoutOfMarketingCommunications")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("restrictCertainDataUses")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("withdrawConsentAtAny")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("rightToObject")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("objectToAutomatedDecisionmaking")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("objectToDataProcessing")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("objectToDataSharing")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("objectToProfilingAnd")}</span>
            </li>
          </ul>
          <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-3.5 py-3">
              <Mail className="h-4 w-4 shrink-0 text-emerald-400/80" />
              <div>
                <p className="text-[11px] text-zinc-500">{t("submitRequestsTo")}</p>
                <p className="text-xs font-medium text-zinc-200">{t("privacynuvoraapp")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-3.5 py-3">
              <Clock className="h-4 w-4 shrink-0 text-emerald-400/80" />
              <div>
                <p className="text-[11px] text-zinc-500">{t("responseTime")}</p>
                <p className="text-xs font-medium text-zinc-200">{t("within30Days")}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ─── 7. COOKIES & TRACKING ──────────────────────────────────
    {
      id: "cookies",
      icon: Cookie,
      title: t("cookiesTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("whatAreCookies")}</p>
          <p>{t("cookiesAreSmallText")}</p>
          <p className="font-medium text-zinc-100 pt-1">{t("typesOfCookiesWe")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("essential")}</span>{" "}
                {t("loginSessionssecurityBasicFunctionality")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("functional")}</span>{" "}
                {t("preferenceslanguageRegion")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("analytics")}</span>{" "}
                {t("usagePatternsperformanceMetrics")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("marketing")}</span>{" "}
                {t("campaigneffectivenessOptinOnly")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("cookieManagement")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("changeCookieSettingsIn")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("deleteExistingCookiesAnytime")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("optoutOfNonessentialCookies")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("cookiePreferencesSavedLocally")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("thirdpartyCookies")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("analyticsProvidersGoogleAnalytics")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("paymentProcessorsStripePaypal")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("socialMediaIntegrations")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("cdnAndPerformanceProviders")}</span>
            </li>
          </ul>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3.5 py-3">
            <p className="text-xs text-zinc-500">
              <span className="font-medium text-zinc-200">{t("CookiePreferences")}</span>{" "}
              {t("youCanmanageCookieSettings")}
            </p>
          </div>
        </div>
      ),
    },

    // ─── 8. PHASE-SPECIFIC PRIVACY ──────────────────────────────
    {
      id: "phase-specific",
      icon: Layers,
      title: t("phaseSpecificTitle"),
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/25 p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-400/80" />
              <p className="font-medium text-zinc-100">{t("globalMarketPrivacy")}</p>
            </div>
            <ul className="space-y-1.5 text-xs">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("sellerData")}</span>{" "}
                  {t("listingdetailsSalesHistoryVerified")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("buyerData")}</span>{" "}
                  {t("purchasehistoryLockerContentsReviews")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("transactionData")}</span>{" "}
                  {t("escrowholdingsPaymentRecords")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("reviews")}</span>{" "}
                  {t("publicRatingsAndfeedback")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("dataSharing")}</span>{" "}
                  {t("sellerNamevisibleToBuyers")}
                </span>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/25 p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <Send className="h-4 w-4 text-emerald-400/80" />
              <p className="font-medium text-zinc-100">{t("smmPanelPrivacy")}</p>
            </div>
            <ul className="space-y-1.5 text-xs">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("serviceData")}</span>{" "}
                  {t("orderHistorydeliveryStatus")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("socialAccounts")}</span>{" "}
                  {t("platformnamesUsernamesMetrics")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("engagementData")}</span>{" "}
                  {t("likesviewsCommentsShares")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("dataSharing")}</span>{" "}
                  {t("serviceprovidersSeeOrderDetails")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("accountSafety")}</span>{" "}
                  {t("weNeverstoreSocialPasswords")}
                </span>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/25 p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-400/80" />
              <p className="font-medium text-zinc-100">{t("socialTenantPrivacy")}</p>
            </div>
            <ul className="space-y-1.5 text-xs">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("designData")}</span>{" "}
                  {t("aiPromptsgeneratedDesignsCustomizations")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("websiteContent")}</span>{" "}
                  {t("pagecontentImagesCopy")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("templateUsage")}</span>{" "}
                  {t("selectedtemplatesAndModifications")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("dataSharing")}</span>{" "}
                  {t("designsNotsharedWithThird")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/60" />
                <span>
                  <span className="text-zinc-300">{t("ownership")}</span>{" "}
                  {t("youOwnFinaldesignsAnd")}
                </span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.04] px-3.5 py-3">
            <p className="text-xs font-medium text-emerald-400/90">{t("CrossphaseData")}</p>
            <p className="mt-1 text-xs text-zinc-500">{t("dataAcrossPhasesMay")}</p>
          </div>
        </div>
      ),
    },

    // ─── 9. CHILDREN'S PRIVACY ──────────────────────────────────
    {
      id: "children",
      icon: Shield,
      title: t("childrenTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("ageRestriction")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("platformIsStrictlyFor")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("ageVerificationRequiredDuring")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("parentalConsentNotAccepted")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("weDoNotKnowingly")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("coppaCompliance")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("fullyCompliantWithChildrens")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("noTargetedAdvertisingTo")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("noCollectionOfChild")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("promptDeletionOfAny")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("minorDataProtection")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("ifWeDiscoverData")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("reportSuspectedMinorAccounts")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("additionalVerificationForAgesensitive")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("enhancedMonitoringForUnderage")}</span>
            </li>
          </ul>
          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.04] px-3.5 py-3">
            <p className="text-xs font-medium text-emerald-400/90">
              {t("ReportingMinorAccounts")}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {t("ifYouBelieveA")}{" "}
              <span className="font-medium text-zinc-300">{t("supportnuvoraapp")}</span>
            </p>
          </div>
        </div>
      ),
    },

    // ─── 10. INTERNATIONAL DATA TRANSFERS ──────────────────────
    {
      id: "transfers",
      icon: Globe,
      title: t("transfersTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("crossborderDataFlow")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("dataMayBeProcessed")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("dataCentersLocatedGlobally")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("allDataTransfersComply")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("standardContractualClausesIn")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("legalFrameworks")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("gdpr")}</span>{" "}
                {t("euGeneralDataprotectionRegulation")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("ccpa")}</span>{" "}
                {t("californiaConsumerprivacyActCompliance")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("ukGdpr")}</span>{" "}
                {t("ukDataProtectioncompliance")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("privacyShield")}</span>{" "}
                {t("euusDataprivacyFramework")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("dataLocalization")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("primaryDataStoredIn")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("backupsInGeographicallyDistributed")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("userDataMayBe")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("weRespectRegionalData")}</span>
            </li>
          </ul>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3.5 py-3">
            <p className="text-xs text-zinc-500">
              <span className="font-medium text-zinc-200">{t("DataProtectionOfficer")}</span>{" "}
              {t("ourDpoEnsuresCompliance")}{" "}
              <span className="text-emerald-400/90">{t("dponuvoraapp")}</span>
            </p>
          </div>
        </div>
      ),
    },

    // ─── 11. AUTOMATED DECISION-MAKING ──────────────────────────
    {
      id: "automated",
      icon: RefreshCw,
      title: t("automatedTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("automatedSystems")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("escrowAutorelease")}</span>{" "}
                {t("fundsautomaticallyReleasedAfter7")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("fraudDetection")}</span>{" "}
                {t("automatedsystemsFlagSuspiciousActivity")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("riskAssessment")}</span>{" "}
                {t("transactionriskScoringForSecurity")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("contentModeration")}</span>{" "}
                {t("aiassistedContentReview")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("userRightsRegardingAutomation")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("rightToContestAutomated")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("rightToHumanReview")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("rightToUnderstandHow")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("rightToOptoutOf")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("transparencyInAutomation")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("clearExplanationOfAutomated")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("regularAuditsOfAutomated")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("biasDetectionAndMitigation")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("humanOversightForCritical")}</span>
            </li>
          </ul>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3.5 py-3">
            <p className="text-xs text-zinc-500">
              <span className="font-medium text-zinc-200">{t("HumanReview")}</span>{" "}
              {t("automateddecisionsCanBeReviewed")}
            </p>
          </div>
        </div>
      ),
    },

    // ─── 12. THIRD-PARTY LINKS & SERVICES ──────────────────────
    {
      id: "third-party",
      icon: ExternalLink,
      title: t("thirdPartyTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("externalLinks")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("platformMayContainLinks")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("thirdpartySitesHaveTheir")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("weAreNotResponsible")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("useThirdpartyLinksAt")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("thirdpartyIntegrations")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("paymentProcessorsStripePaypal")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("socialMediaPlatformsTiktok")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("analyticsProvidersGoogleAnalytics")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("cloudServiceProvidersSupabase")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("integrationPrivacy")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("thirdpartyServicesHaveTheir")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("weOnlyShareNecessary")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("providersAreContractuallyBound")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("weReviewThirdpartySecurity")}</span>
            </li>
          </ul>
          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.04] px-3.5 py-3">
            <p className="text-xs font-medium text-emerald-400/90">
              {t("PrivacyOnExternal")}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{t("whenYouClickExternal")}</p>
          </div>
        </div>
      ),
    },

    // ─── 13. DATA BREACH NOTIFICATION ──────────────────────────
    {
      id: "breach",
      icon: AlertCircle,
      title: t("breachTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("ourCommitment")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("promptInvestigationOfAny")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("immediateContainmentMeasures")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("247SecurityMonitoring")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("regularSecurityAuditsAnd")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("notificationTimeline")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("affectedUsersNotifiedWithin")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("regulatoryAuthoritiesNotifiedAs")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("detailedBreachReportProvided")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("remediationPlanSharedWith")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("breachResponseTeam")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("dedicatedIncidentResponseTeam")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("externalSecurityExpertsEngagement")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("forensicInvestigationProcedures")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("continuousImprovementOfSecurity")}</span>
            </li>
          </ul>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3.5 py-3">
            <p className="text-xs text-zinc-500">
              <span className="font-medium text-zinc-200">{t("ReportSecurityConcerns")}</span>{" "}
              {t("ifYouDiscoverA")}{" "}
              <span className="text-emerald-400/90">{t("securitynuvoraapp")}</span>
            </p>
          </div>
        </div>
      ),
    },

    // ─── 14. POLICY UPDATES ─────────────────────────────────────
    {
      id: "updates",
      icon: RefreshCw,
      title: t("updatesTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("notificationOfUpdates")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("usersNotifiedOfSignificant")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("emailNotificationForMajor")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("inappNotificationOnLogin")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("policyClearlyMarkedWith")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("acceptanceOfUpdates")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("continuedUseImpliesAcceptance")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("usersCanReviewChanges")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("optionToDeclineUpdates")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("previousVersionsArchivedFor")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("changeLog")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("summaryOfSignificantChanges")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("previousPolicyVersionsAccessible")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("dateOfEachUpdate")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("reasonForChangesExplained")}</span>
            </li>
          </ul>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3.5 py-3">
            <p className="text-xs text-zinc-500">
              <span className="font-medium text-zinc-200">{t("CurrentVersion")}</span>{" "}
              v{new Date().getFullYear()}.1
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              <span className="font-medium text-zinc-200">{t("EffectiveDate")}</span>{" "}
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
      title: t("contactTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("dataProtectionOfficer")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("name")}</span>{" "}
                {t("dataProtectionOfficer")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("email")}</span>{" "}
                {t("dponuvoraapp")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("responseTime")}</span>{" "}
                {t("within48Hours")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("privacyTeam")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("email")}</span>{" "}
                {t("privacynuvoraapp")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("support")}</span>{" "}
                {t("supportnuvoraapp")}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>
                <span className="font-medium text-zinc-200">{t("responseTime")}</span>{" "}
                {t("within2448hours")}
              </span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("mailingAddress")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("nuvoraEliteHome")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("privacyDepartment")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("availableUponRequest")}</span>
            </li>
          </ul>
          <div className="mt-1 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3.5">
              <p className="text-xs font-semibold text-emerald-400/90">
                {t("PrivacyInquiries")}
              </p>
              <p className="mt-1 text-xs text-zinc-300">{t("privacynuvoraapp")}</p>
              <p className="mt-0.5 text-[11px] text-zinc-600">
                {t("forDatarelatedQuestions")}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/30 p-3.5">
              <p className="text-xs font-semibold text-emerald-400/90">
                {t("SecurityReports")}
              </p>
              <p className="mt-1 text-xs text-zinc-300">{t("securitynuvoraapp")}</p>
              <p className="mt-0.5 text-[11px] text-zinc-600">
                {t("forVulnerabilityReports")}
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
      title: t("complaintsTitle"),
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
          <p className="font-medium text-zinc-100">{t("internalComplaintProcess")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("submitComplaintViaSupport")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("acknowledgmentWithin48Hours")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("investigationCompletedWithin30")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("resolutionAndExplanationProvided")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("escalationProcess")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("unresolvedComplaintsEscalatedTo")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("dpoReviewWithin15")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("finalDecisionByPrivacy")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("appealProcessAvailable")}</span>
            </li>
          </ul>
          <p className="font-medium text-zinc-100 pt-1">{t("externalSupervisoryAuthorities")}</p>
          <ul className="space-y-1.5 pl-1">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("rightToComplainTo")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("contactInformationForAuthorities")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("crossborderComplaintHandling")}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
              <span>{t("resolutionThroughLegalChannels")}</span>
            </li>
          </ul>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3.5 py-3">
            <p className="text-xs text-zinc-500">
              <span className="font-medium text-zinc-200">{t("ComplaintTracking")}</span>{" "}
              {t("allcomplaintsAreTrackedAnd")}
            </p>
          </div>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
        <p className="mt-3 text-xs text-zinc-500">{t("loadingPrivacyPolicy")}</p>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full flex-col ${
        variant === "modal" ? "h-full max-h-[80vh] min-h-0" : ""
      }`}
    >
      {/* Header */}
       {/* ───────────────── Privacy Header ───────────────── */}
<header className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#090b0d] px-5 py-8 sm:px-8 sm:py-10">
  {/* Privacy / security ambient glow */}
  <div
    className="
      pointer-events-none
      absolute
      -right-24
      -top-24
      h-64
      w-64
      rounded-full
      bg-cyan-400/[0.045]
      blur-[90px]
    "
  />

  <div
    className="
      pointer-events-none
      absolute
      -bottom-24
      -left-20
      h-48
      w-48
      rounded-full
      bg-emerald-400/[0.025]
      blur-[75px]
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
      via-cyan-300/20
      to-transparent
    "
  />

  <div className="relative flex flex-col items-center text-center">
    {/* Privacy badge */}
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-cyan-400/[0.14]
        bg-cyan-400/[0.04]
        px-3.5
        py-1.5
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.20em]
        text-cyan-300/75
      "
    >
      <ShieldCheck
        className="h-3.5 w-3.5 text-cyan-400"
        strokeWidth={1.7}
      />

      <span>Privacy & Data Protection</span>
    </div>

    {/* Main title */}
    <h1
      className="
        mt-5
        text-3xl
        font-black
        tracking-[-0.05em]
        text-white
        sm:text-4xl
      "
    >
      {t("privacyPolicy")}
    </h1>

    {/* Platform identity */}
    <div className="mt-3 flex items-center gap-2">
      <span className="h-px w-5 bg-white/[0.08]" />

      <span
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.18em]
          text-zinc-600
        "
      >
        {t("nuvoraEliteHome")}
      </span>

      <span className="h-px w-5 bg-white/[0.08]" />
    </div>

    {/* Privacy statement */}
    <p
      className="
        mt-5
        max-w-xl
        text-sm
        leading-7
        text-zinc-400
      "
    >
      {t("yourPrivacyMattersReview")}
    </p>

    {/* Last updated */}
    <div
      className="
        mt-5
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-white/[0.06]
        bg-white/[0.02]
        px-3
        py-1.5
        text-[10px]
        font-medium
        text-zinc-600
      "
    >
      <span
        className="
          h-1.5
          w-1.5
          rounded-full
          bg-emerald-400/70
          shadow-[0_0_8px_rgba(52,211,153,0.35)]
        "
      />

      <span>{t("lastUpdated")}</span>

      <span className="text-zinc-700">•</span>

      <time dateTime={new Date().toISOString()}>
        {new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </time>
    </div>
  </div>

  {/* Bottom accent */}
  <div
    className="
      pointer-events-none
      absolute
      bottom-0
      left-1/2
      h-[2px]
      w-[32%]
      -translate-x-1/2
      rounded-full
      bg-gradient-to-r
      from-transparent
      via-cyan-400/40
      to-transparent
    "
  />
</header>
      {/* Sections – natural document flow so the page itself scrolls */}
      <div
        className={
          variant === "modal"
            ? "min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-5 [-webkit-overflow-scrolling:touch] [touch-action:pan-y]"
            : "py-5"
        }
      >
        <div className="space-y-2.5">
          {sections.map((section) => {
            const isExpanded = expandedSection === section.id;
            const Icon = section.icon;

            return (
              <div
                key={section.id}
               className={`
  group
  overflow-hidden
  rounded-[16px]
  border
  transition-all
  duration-300
  ${
    isExpanded
      ? "border-emerald-400/[0.12] bg-emerald-400/[0.025]"
      : "border-white/[0.06] bg-zinc-950/40 hover:border-white/[0.10]"
  }
`}
>
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="group flex w-full items-center gap-3 px-3.5 py-3.5 text-left transition-colors hover:bg-white/[0.03] sm:px-4"
                  aria-expanded={isExpanded}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isExpanded
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-zinc-800/60 text-zinc-500 group-hover:text-zinc-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-[13px] font-medium text-zinc-100 sm:text-sm">
                    {section.title}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                      isExpanded ? "text-emerald-400" : "text-zinc-600"
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-white/[0.05] px-3.5 pb-4 pt-3.5 sm:px-4">
                      {section.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Privacy at a Glance */}
        <div className="mt-5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-emerald-400/80" />
            <span className="text-xs font-semibold tracking-wide text-zinc-100">
              {t("privacyAtAGlance")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: t("Encrypted"), sub: t("allData") },
              { label: t("Control"), sub: t("yourRights") },
              { label: t("NoSelling"), sub: t("yourData") },
              { label: t("Secure"), sub: t("storage") },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/[0.05] bg-zinc-900/40 px-2.5 py-2.5 text-center"
              >
                <p className="text-xs font-semibold text-emerald-400/90">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-600">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───────────────── Privacy Acceptance Footer ───────────────── */}
<footer
  className="
    relative
    mt-8
    overflow-hidden
    rounded-[22px]
    border
    border-white/[0.08]
    bg-[#090b0d]
    p-5
    shadow-[0_12px_40px_rgba(0,0,0,0.20)]
    sm:p-6
  "
>
  {/* Ambient privacy glow */}
  <div
    className={`
      pointer-events-none
      absolute
      -right-20
      -top-20
      h-44
      w-44
      rounded-full
      blur-[70px]
      transition-all
      duration-500
      ${
        accepted
          ? "bg-emerald-400/[0.08]"
          : "bg-cyan-400/[0.025]"
      }
    `}
  />

  {/* Top reflection */}
  <div
    className="
      pointer-events-none
      absolute
      inset-x-10
      top-0
      h-px
      bg-gradient-to-r
      from-transparent
      via-white/[0.10]
      to-transparent
    "
  />

  <div className="relative">
    {/* Privacy acknowledgment */}
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
            ? "border-emerald-400/[0.18] bg-emerald-400/[0.035]"
            : "border-white/[0.07] bg-white/[0.018] hover:border-white/[0.12] hover:bg-white/[0.025]"
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

      {/* Acknowledgment copy */}
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
            ? "Privacy policy acknowledged"
            : "I confirm that I have read and understand"}
        </span>

        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {t("iConfirmThatI")}{" "}
          <span className="text-zinc-300">
            {t("privacyPolicy")}
          </span>{" "}
          {t("for")}{" "}
          <span className="text-zinc-300">
            {t("nuvoraEliteHome")}
          </span>
          .{" "}
          {t("IUnderstandHow")}
        </span>
      </span>

      {/* Confirmation indicator */}
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
          transition-all
          duration-300
          sm:flex
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
    <div className="mt-4 flex flex-col-reverse gap-2.5 sm:flex-row">
      {onDecline && (
        <button
          type="button"
          onClick={onDecline}
          className="
            h-11
            flex-1
            rounded-[14px]
            border
            border-white/[0.08]
            bg-transparent
            text-xs
            font-semibold
            text-zinc-500
            transition-all
            duration-300
            hover:border-white/[0.14]
            hover:bg-white/[0.025]
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
            flex
            h-11
            flex-1
            items-center
            justify-center
            gap-2
            overflow-hidden
            rounded-[14px]
            border
            text-xs
            font-semibold
            transition-all
            duration-300
            ${
              accepted
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/[0.14] hover:shadow-[0_10px_30px_rgba(16,185,129,0.08)] active:scale-[0.99]"
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
                via-white/[0.09]
                to-transparent
                transition-transform
                duration-700
                group-hover:translate-x-[400%]
              "
            />
          )}

          <span className="relative flex items-center gap-2">
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

    {/* Legal/support information */}
    <div className="mt-4 text-center">
      <p className="text-[10px] leading-relaxed text-zinc-600">
        {t("byAcceptingYouAgree")}
      </p>

      <p className="mt-1 text-[10px] text-zinc-600">
        {t("needHelp")}{" "}
        <a
          href="/support"
          className="
            font-medium
            text-emerald-500/80
            underline-offset-2
            transition-colors
            hover:text-emerald-400
            hover:underline
          "
        >
          {t("contactSupport")}
        </a>
      </p>
    </div>
  </div>

  {/* Bottom state accent */}
  <div
    className={`
      pointer-events-none
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
          ? "w-[55%] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
          : "w-[22%] bg-gradient-to-r from-transparent via-white/10 to-transparent"
      }
    `}
  />
</footer>
    </div>
  );
}

export default PrivacyPolicy;