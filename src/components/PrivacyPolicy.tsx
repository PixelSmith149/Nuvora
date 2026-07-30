// components/PrivacyPolicy.tsx
"use client";

import { useTranslations } from "next-intl";
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
      color: "emerald",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("whoWeAre")}</p>
          <p className="text-zinc-400 leading-relaxed">{t("nuvoraEliteHomeIs")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white font-medium">{t("globalMarket")}</span> {t("digitalAssetMarketplaceFor")}
            </li>
            <li>
              <span className="text-white font-medium">{t("smmPanel")}</span> {t("SocialmediaMarketingServices")}
            </li>
            <li>
              <span className="text-white font-medium">{t("socialTenant")}</span> {t("websiteBuilderAndDesign")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("whatThisPolicyCovers")}</p>
          <p className="text-zinc-400 leading-relaxed">{t("thisPrivacyPolicyExplains")}</p>
          <p className="font-semibold text-white mt-4">{t("scopeOfThisPolicy")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("allPlatformUsersBuyers")}</li>
            <li>{t("allPhasesGlobalMarket")}</li>
            <li>{t("allServicesListingPurchasing")}</li>
            <li>{t("allInteractionsWebMobile")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("yourAcceptance")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("byUsingOurPlatform")}</li>
            <li>{t("ifYouDisagreeWith")}</li>
            <li>{t("continuedUseAfterUpdates")}</li>
          </ul>
          <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5 mt-2">
            <p className="text-xs text-zinc-500">
              <span className="text-emerald-400">{t("LastUpdated")}</span>{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              <span className="text-emerald-400">{t("PrivacyTeam")}</span> {t("privacynuvoracom")}
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
      color: "sky",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("personalInformation")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("name")}</span> {t("fullNameDisplayNameusername")}
            </li>
            <li>
              <span className="text-white">{t("contact")}</span> {t("emailAddressPhonenumber")}
            </li>
            <li>
              <span className="text-white">{t("profile")}</span> {t("avatarBioStoredescription")}
            </li>
            <li>
              <span className="text-white">{t("social")}</span> {t("tiktokSnapchatAndotherSocial")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("accountAuthenticationData")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("credentials")}</span> {t("passwordHashedandSalted")}
            </li>
            <li>
              <span className="text-white">{t("authentication")}</span> {t("loginTokenssessionData")}
            </li>
            <li>
              <span className="text-white">{t("biometric")}</span> {t("15secondFacialrecognitionVideoSellers")}
            </li>
            <li>
              <span className="text-white">{t("verification")}</span> {t("identityverificationDocuments")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("paymentFinancialData")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("wallet")}</span> {t("balancesTransactionhistory")}
            </li>
            <li>
              <span className="text-white">{t("payments")}</span> {t("purchaseRecordsescrowHoldings")}
            </li>
            <li>
              <span className="text-white">{t("withdrawals")}</span> {t("payoutHistorywithdrawalMethods")}
            </li>
            <li>
              <span className="text-white">{t("fees")}</span> {t("platformFeesCollected")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("usageTechnicalData")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("device")}</span> {t("ipAddressDevicetypeBrowser")}
            </li>
            <li>
              <span className="text-white">{t("location")}</span> {t("geographicLocationcountryregion")}
            </li>
            <li>
              <span className="text-white">{t("activity")}</span> {t("pagesVisitedfeaturesUsed")}
            </li>
            <li>
              <span className="text-white">{t("performance")}</span> {t("loadingTimeserrorLogs")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("phasespecificData")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
              <p className="text-xs font-bold text-emerald-400">{t("globalMarket")}</p>
              <ul className="text-[10px] text-zinc-400 space-y-1 mt-1 list-disc list-inside">
                <li>{t("assetListingsAndDescriptions")}</li>
                <li>{t("salesAndPurchaseHistory")}</li>
                <li>{t("reviewsAndRatings")}</li>
                <li>{t("lockerContents")}</li>
              </ul>
            </div>
            <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
              <p className="text-xs font-bold text-purple-400">{t("smmPanel")}</p>
              <ul className="text-[10px] text-zinc-400 space-y-1 mt-1 list-disc list-inside">
                <li>{t("socialMediaAccountDetails")}</li>
                <li>{t("serviceOrderHistory")}</li>
                <li>{t("engagementMetrics")}</li>
                <li>{t("accountGrowthData")}</li>
              </ul>
            </div>
            <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
              <p className="text-xs font-bold text-sky-400">{t("socialTenant")}</p>
              <ul className="text-[10px] text-zinc-400 space-y-1 mt-1 list-disc list-inside">
                <li>{t("websiteContentAndDesigns")}</li>
                <li>{t("aiGenerationPrompts")}</li>
                <li>{t("templateCustomizations")}</li>
                <li>{t("storefrontData")}</li>
              </ul>
            </div>
          </div>
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
            <p className="text-xs text-amber-400 font-medium">{t("BiometricDataProtection")}</p>
            <p className="text-xs text-zinc-400 mt-1">{t("yourBiometricVideoIs")}</p>
          </div>
        </div>
      ),
    },

    // ─── 3. HOW WE USE YOUR INFORMATION ──────────────────────────
    {
      id: "use",
      icon: Eye,
      title: t("useTitle"),
      color: "purple",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("platformFunctionality")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("processingPurchases")}</span> {t("orderspaymentsEscrowManagement")}
            </li>
            <li>
              <span className="text-white">{t("deliveringAssets")}</span> {t("lockerdeliveryAndManagement")}
            </li>
            <li>
              <span className="text-white">{t("accountManagement")}</span> {t("registrationLoginProfileUpdates")}
            </li>
            <li>
              <span className="text-white">{t("verification")}</span> {t("identityAndAgeverification")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("communication")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("notifications")}</span> {t("purchaseconfirmationsDeliveryUpdates")}
            </li>
            <li>
              <span className="text-white">{t("support")}</span> {t("respondingToinquiriesAndTickets")}
            </li>
            <li>
              <span className="text-white">{t("marketing")}</span> {t("promotionalmaterialsOptinRequired")}
            </li>
            <li>
              <span className="text-white">{t("updates")}</span> {t("platformannouncementsAndPolicyChanges")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("analyticsImprovement")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("platformOptimization")}</span> {t("performanceImprovements")}
            </li>
            <li>
              <span className="text-white">{t("userExperience")}</span> {t("featureenhancements")}
            </li>
            <li>
              <span className="text-white">{t("trendAnalysis")}</span> {t("understandinguserBehavior")}
            </li>
            <li>
              <span className="text-white">{t("testing")}</span> {t("abTestingAndexperiments")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("fraudPreventionSecurity")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("identityVerification")}</span> {t("preventingFakeAccounts")}
            </li>
            <li>
              <span className="text-white">{t("fraudDetection")}</span> {t("identifyingsuspiciousActivity")}
            </li>
            <li>
              <span className="text-white">{t("riskAssessment")}</span> {t("evaluatingtransactionRisk")}
            </li>
            <li>
              <span className="text-white">{t("compliance")}</span> {t("meetingLegalAndregulatoryRequirements")}
            </li>
          </ul>
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
            <p className="text-xs text-emerald-400 font-medium">{t("DataUsePrinciples")}</p>
            <ul className="text-xs text-zinc-400 mt-1 space-y-1 list-disc list-inside">
              <li>{t("weOnlyUseData")}</li>
              <li>{t("weMinimizeDataCollection")}</li>
              <li>{t("weAnonymizeDataWhere")}</li>
              <li>{t("weNeverSellYour")}</li>
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
      color: "amber",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("thirdpartyServiceProviders")}</p>
          <p className="text-zinc-400 leading-relaxed">{t("weShareDataWith")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("paymentProcessors")}</span> {t("stripepaypalCryptoGateways")}
            </li>
            <li>
              <span className="text-white">{t("cloudProviders")}</span> {t("supabasedatabaseAwsStorage")}
            </li>
            <li>
              <span className="text-white">{t("analytics")}</span> {t("googleAnalyticsforUsageInsights")}
            </li>
            <li>
              <span className="text-white">{t("support")}</span> {t("customerServicetools")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("legalRequirements")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("lawEnforcementRequestsWith")}</li>
            <li>{t("courtOrdersAndSubpoenas")}</li>
            <li>{t("regulatoryAuthorityRequirements")}</li>
            <li>{t("enforcementOfOurTerms")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("businessTransfers")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("saleMergerOrAcquisition")}</li>
            <li>{t("bankruptcyOrInsolvencyProceedings")}</li>
            <li>{t("assetTransfersToOther")}</li>
            <li>{t("usersNotifiedOfMaterial")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("withYourConsent")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("explicitConsentForAdditional")}</li>
            <li>{t("optinMarketingCommunications")}</li>
            <li>{t("thirdpartyIntegrationsYouEnable")}</li>
            <li>{t("youCanWithdrawConsent")}</li>
          </ul>
          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
            <p className="text-xs text-red-400 font-medium">{t("WhatWeDo")}</p>
            <ul className="text-xs text-zinc-400 mt-1 space-y-1 list-disc list-inside">
              <li>{t("biometricVerificationVideos")}</li>
              <li>{t("walletPasswordsOrPayment")}</li>
              <li>{t("privateMessagesBetweenUsers")}</li>
              <li>{t("dataWithoutProperLegal")}</li>
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
      color: "emerald",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("dataStorage")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("primaryDatabase")}</span> {t("supabasepostgresqlEncrypted")}
            </li>
            <li>
              <span className="text-white">{t("fileStorage")}</span> {t("supabaseStorageencrypted")}
            </li>
            <li>
              <span className="text-white">{t("backups")}</span> {t("automatedDailybackups")}
            </li>
            <li>
              <span className="text-white">{t("location")}</span> {t("dataStoredInsecureData")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("encryptionStandards")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("inTransit")}</span> {t("tls13EncryptionforAll")}
            </li>
            <li>
              <span className="text-white">{t("atRest")}</span> {t("aes256EncryptionforStoredData")}
            </li>
            <li>
              <span className="text-white">{t("passwords")}</span> {t("hashedAndSaltedwithBcrypt")}
            </li>
            <li>
              <span className="text-white">{t("biometric")}</span> {t("encryptedWithuserspecificKeys")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("securityMeasures")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("authentication")}</span> {t("jwtTokenswithShortExpiry")}
            </li>
            <li>
              <span className="text-white">{t("accessControl")}</span> {t("rolebasedaccessRbac")}
            </li>
            <li>
              <span className="text-white">{t("monitoring")}</span> {t("realtimeSecuritymonitoring")}
            </li>
            <li>
              <span className="text-white">{t("audits")}</span> {t("regularSecurityauditsAndPenetration")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("dataRetention")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("activeAccounts")}</span> {t("dataRetainedwhileAccountIs")}
            </li>
            <li>
              <span className="text-white">{t("inactiveAccounts")}</span> {t("30DaysafterInactivity")}
            </li>
            <li>
              <span className="text-white">{t("deletedAccounts")}</span> {t("dataDeletedwithin30Days")}
            </li>
            <li>
              <span className="text-white">{t("transactionHistory")}</span> {t("retainedforLegalCompliance")}
            </li>
          </ul>
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
            <p className="text-xs text-emerald-400 font-medium">{t("SecurityIncidentResponse")}</p>
            <ul className="text-xs text-zinc-400 mt-1 space-y-1 list-disc list-inside">
              <li>{t("immediateContainmentProcedures")}</li>
              <li>{t("userNotificationWithin72")}</li>
              <li>{t("forensicInvestigationBySecurity")}</li>
              <li>{t("remediationAndPreventionMeasures")}</li>
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
      color: "purple",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("rightToAccess")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("viewAllPersonalData")}</li>
            <li>{t("requestACopyOf")}</li>
            <li>{t("accessYourTransactionHistory")}</li>
            <li>{t("viewYourProfileAnd")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("rightToCorrection")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("updateInaccurateOrIncomplete")}</li>
            <li>{t("changeProfileInformationAnytime")}</li>
            <li>{t("correctTransactionRecordsIf")}</li>
            <li>{t("updateContactInformation")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("rightToDeletionRight")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("requestPermanentDataDeletion")}</li>
            <li>{t("deletedDataRemovedWithin")}</li>
            <li>{t("someDataMayBe")}</li>
            <li>{t("secureDeletionMethodsUsed")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("rightToDataPortability")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("receiveDataInPortable")}</li>
            <li>{t("transferDataToAnother")}</li>
            <li>{t("exportTransactionHistory")}</li>
            <li>{t("exportAccountData")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("rightToRestrictProcessing")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("requestLimitedDataProcessing")}</li>
            <li>{t("optoutOfMarketingCommunications")}</li>
            <li>{t("restrictCertainDataUses")}</li>
            <li>{t("withdrawConsentAtAny")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("rightToObject")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("objectToAutomatedDecisionmaking")}</li>
            <li>{t("objectToDataProcessing")}</li>
            <li>{t("objectToDataSharing")}</li>
            <li>{t("objectToProfilingAnd")}</li>
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5 text-center">
              <Mail className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-zinc-400">{t("submitRequestsTo")}</p>
              <p className="text-xs text-white font-medium">{t("privacynuvoracom")}</p>
            </div>
            <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5 text-center">
              <Clock className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-zinc-400">{t("responseTime")}</p>
              <p className="text-xs text-white font-medium">{t("within30Days")}</p>
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
      color: "amber",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("whatAreCookies")}</p>
          <p className="text-zinc-400 leading-relaxed">{t("cookiesAreSmallText")}</p>
          <p className="font-semibold text-white mt-4">{t("typesOfCookiesWe")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("essential")}</span> {t("loginSessionssecurityBasicFunctionality")}
            </li>
            <li>
              <span className="text-white">{t("functional")}</span> {t("preferenceslanguageRegion")}
            </li>
            <li>
              <span className="text-white">{t("analytics")}</span> {t("usagePatternsperformanceMetrics")}
            </li>
            <li>
              <span className="text-white">{t("marketing")}</span> {t("campaigneffectivenessOptinOnly")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("cookieManagement")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("changeCookieSettingsIn")}</li>
            <li>{t("deleteExistingCookiesAnytime")}</li>
            <li>{t("optoutOfNonessentialCookies")}</li>
            <li>{t("cookiePreferencesSavedLocally")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("thirdpartyCookies")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("analyticsProvidersGoogleAnalytics")}</li>
            <li>{t("paymentProcessorsStripePaypal")}</li>
            <li>{t("socialMediaIntegrations")}</li>
            <li>{t("cdnAndPerformanceProviders")}</li>
          </ul>
          <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
            <p className="text-xs text-zinc-400">
              <span className="text-white">{t("CookiePreferences")}</span> {t("youCanmanageCookieSettings")}
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
      color: "sky",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-emerald-400" />
              <p className="font-semibold text-white">{t("globalMarketPrivacy")}</p>
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2 text-xs">
              <li>
                <span className="text-white">{t("sellerData")}</span> {t("listingdetailsSalesHistoryVerified")}
              </li>
              <li>
                <span className="text-white">{t("buyerData")}</span> {t("purchasehistoryLockerContentsReviews")}
              </li>
              <li>
                <span className="text-white">{t("transactionData")}</span> {t("escrowholdingsPaymentRecords")}
              </li>
              <li>
                <span className="text-white">{t("reviews")}</span> {t("publicRatingsAndfeedback")}
              </li>
              <li>
                <span className="text-white">{t("dataSharing")}</span> {t("sellerNamevisibleToBuyers")}
              </li>
            </ul>
          </div>
          <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Send className="h-4 w-4 text-purple-400" />
              <p className="font-semibold text-white">{t("smmPanelPrivacy")}</p>
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2 text-xs">
              <li>
                <span className="text-white">{t("serviceData")}</span> {t("orderHistorydeliveryStatus")}
              </li>
              <li>
                <span className="text-white">{t("socialAccounts")}</span> {t("platformnamesUsernamesMetrics")}
              </li>
              <li>
                <span className="text-white">{t("engagementData")}</span> {t("likesviewsCommentsShares")}
              </li>
              <li>
                <span className="text-white">{t("dataSharing")}</span> {t("serviceprovidersSeeOrderDetails")}
              </li>
              <li>
                <span className="text-white">{t("accountSafety")}</span> {t("weNeverstoreSocialPasswords")}
              </li>
            </ul>
          </div>
          <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-sky-400" />
              <p className="font-semibold text-white">{t("socialTenantPrivacy")}</p>
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2 text-xs">
              <li>
                <span className="text-white">{t("designData")}</span> {t("aiPromptsgeneratedDesignsCustomizations")}
              </li>
              <li>
                <span className="text-white">{t("websiteContent")}</span> {t("pagecontentImagesCopy")}
              </li>
              <li>
                <span className="text-white">{t("templateUsage")}</span> {t("selectedtemplatesAndModifications")}
              </li>
              <li>
                <span className="text-white">{t("dataSharing")}</span> {t("designsNotsharedWithThird")}
              </li>
              <li>
                <span className="text-white">{t("ownership")}</span> {t("youOwnFinaldesignsAnd")}
              </li>
            </ul>
          </div>
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
            <p className="text-xs text-amber-400 font-medium">{t("CrossphaseData")}</p>
            <p className="text-xs text-zinc-400 mt-1">{t("dataAcrossPhasesMay")}</p>
          </div>
        </div>
      ),
    },

    // ─── 9. CHILDREN'S PRIVACY ──────────────────────────────────
    {
      id: "children",
      icon: Shield,
      title: t("childrenTitle"),
      color: "rose",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("ageRestriction")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("platformIsStrictlyFor")}</li>
            <li>{t("ageVerificationRequiredDuring")}</li>
            <li>{t("parentalConsentNotAccepted")}</li>
            <li>{t("weDoNotKnowingly")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("coppaCompliance")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("fullyCompliantWithChildrens")}</li>
            <li>{t("noTargetedAdvertisingTo")}</li>
            <li>{t("noCollectionOfChild")}</li>
            <li>{t("promptDeletionOfAny")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("minorDataProtection")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("ifWeDiscoverData")}</li>
            <li>{t("reportSuspectedMinorAccounts")}</li>
            <li>{t("additionalVerificationForAgesensitive")}</li>
            <li>{t("enhancedMonitoringForUnderage")}</li>
          </ul>
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
            <p className="text-xs text-amber-400 font-medium">{t("ReportingMinorAccounts")}</p>
            <p className="text-xs text-zinc-400 mt-1">
              {t("ifYouBelieveA")}{" "}
              <span className="text-white font-medium">{t("supportnuvoracom")}</span>
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
      color: "emerald",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("crossborderDataFlow")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("dataMayBeProcessed")}</li>
            <li>{t("dataCentersLocatedGlobally")}</li>
            <li>{t("allDataTransfersComply")}</li>
            <li>{t("standardContractualClausesIn")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("legalFrameworks")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("gdpr")}</span> {t("euGeneralDataprotectionRegulation")}
            </li>
            <li>
              <span className="text-white">{t("ccpa")}</span> {t("californiaConsumerprivacyActCompliance")}
            </li>
            <li>
              <span className="text-white">{t("ukGdpr")}</span> {t("ukDataProtectioncompliance")}
            </li>
            <li>
              <span className="text-white">{t("privacyShield")}</span> {t("euusDataprivacyFramework")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("dataLocalization")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("primaryDataStoredIn")}</li>
            <li>{t("backupsInGeographicallyDistributed")}</li>
            <li>{t("userDataMayBe")}</li>
            <li>{t("weRespectRegionalData")}</li>
          </ul>
          <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
            <p className="text-xs text-zinc-400">
              <span className="text-white">{t("DataProtectionOfficer")}</span> {t("ourDpoEnsuresCompliance")}{" "}
              <span className="text-emerald-400">{t("dponuvoracom")}</span>
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
      color: "purple",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("automatedSystems")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("escrowAutorelease")}</span> {t("fundsautomaticallyReleasedAfter7")}
            </li>
            <li>
              <span className="text-white">{t("fraudDetection")}</span> {t("automatedsystemsFlagSuspiciousActivity")}
            </li>
            <li>
              <span className="text-white">{t("riskAssessment")}</span> {t("transactionriskScoringForSecurity")}
            </li>
            <li>
              <span className="text-white">{t("contentModeration")}</span> {t("aiassistedContentReview")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("userRightsRegardingAutomation")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("rightToContestAutomated")}</li>
            <li>{t("rightToHumanReview")}</li>
            <li>{t("rightToUnderstandHow")}</li>
            <li>{t("rightToOptoutOf")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("transparencyInAutomation")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("clearExplanationOfAutomated")}</li>
            <li>{t("regularAuditsOfAutomated")}</li>
            <li>{t("biasDetectionAndMitigation")}</li>
            <li>{t("humanOversightForCritical")}</li>
          </ul>
          <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
            <p className="text-xs text-zinc-400">
              <span className="text-white">{t("HumanReview")}</span> {t("automateddecisionsCanBeReviewed")}
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
      color: "amber",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("externalLinks")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("platformMayContainLinks")}</li>
            <li>{t("thirdpartySitesHaveTheir")}</li>
            <li>{t("weAreNotResponsible")}</li>
            <li>{t("useThirdpartyLinksAt")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("thirdpartyIntegrations")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("paymentProcessorsStripePaypal")}</li>
            <li>{t("socialMediaPlatformsTiktok")}</li>
            <li>{t("analyticsProvidersGoogleAnalytics")}</li>
            <li>{t("cloudServiceProvidersSupabase")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("integrationPrivacy")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("thirdpartyServicesHaveTheir")}</li>
            <li>{t("weOnlyShareNecessary")}</li>
            <li>{t("providersAreContractuallyBound")}</li>
            <li>{t("weReviewThirdpartySecurity")}</li>
          </ul>
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
            <p className="text-xs text-amber-400 font-medium">{t("PrivacyOnExternal")}</p>
            <p className="text-xs text-zinc-400 mt-1">{t("whenYouClickExternal")}</p>
          </div>
        </div>
      ),
    },

    // ─── 13. DATA BREACH NOTIFICATION ──────────────────────────
    {
      id: "breach",
      icon: AlertCircle,
      title: t("breachTitle"),
      color: "rose",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("ourCommitment")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("promptInvestigationOfAny")}</li>
            <li>{t("immediateContainmentMeasures")}</li>
            <li>{t("247SecurityMonitoring")}</li>
            <li>{t("regularSecurityAuditsAnd")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("notificationTimeline")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("affectedUsersNotifiedWithin")}</li>
            <li>{t("regulatoryAuthoritiesNotifiedAs")}</li>
            <li>{t("detailedBreachReportProvided")}</li>
            <li>{t("remediationPlanSharedWith")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("breachResponseTeam")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("dedicatedIncidentResponseTeam")}</li>
            <li>{t("externalSecurityExpertsEngagement")}</li>
            <li>{t("forensicInvestigationProcedures")}</li>
            <li>{t("continuousImprovementOfSecurity")}</li>
          </ul>
          <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
            <p className="text-xs text-zinc-400">
              <span className="text-white">{t("ReportSecurityConcerns")}</span> {t("ifYouDiscoverA")}{" "}
              <span className="text-emerald-400">{t("securitynuvoracom")}</span>
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
      color: "emerald",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("notificationOfUpdates")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("usersNotifiedOfSignificant")}</li>
            <li>{t("emailNotificationForMajor")}</li>
            <li>{t("inappNotificationOnLogin")}</li>
            <li>{t("policyClearlyMarkedWith")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("acceptanceOfUpdates")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("continuedUseImpliesAcceptance")}</li>
            <li>{t("usersCanReviewChanges")}</li>
            <li>{t("optionToDeclineUpdates")}</li>
            <li>{t("previousVersionsArchivedFor")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("changeLog")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("summaryOfSignificantChanges")}</li>
            <li>{t("previousPolicyVersionsAccessible")}</li>
            <li>{t("dateOfEachUpdate")}</li>
            <li>{t("reasonForChangesExplained")}</li>
          </ul>
          <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
            <p className="text-xs text-zinc-400">
              <span className="text-white">{t("CurrentVersion")}</span> v{new Date().getFullYear()}.1
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              <span className="text-white">{t("EffectiveDate")}</span>{" "}
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
      color: "purple",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("dataProtectionOfficer")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("name")}</span> {t("dataProtectionOfficer")}
            </li>
            <li>
              <span className="text-white">{t("email")}</span> {t("dponuvoracom")}
            </li>
            <li>
              <span className="text-white">{t("responseTime")}</span> {t("within48Hours")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("privacyTeam")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>
              <span className="text-white">{t("email")}</span> {t("privacynuvoracom")}
            </li>
            <li>
              <span className="text-white">{t("support")}</span> {t("supportnuvoracom")}
            </li>
            <li>
              <span className="text-white">{t("responseTime")}</span> {t("within2448hours")}
            </li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("mailingAddress")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("nuvoraEliteHome")}</li>
            <li>{t("privacyDepartment")}</li>
            <li>{t("availableUponRequest")}</li>
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
              <p className="text-xs font-bold text-emerald-400">{t("PrivacyInquiries")}</p>
              <p className="text-xs text-zinc-400 mt-1">{t("privacynuvoracom")}</p>
              <p className="text-[10px] text-zinc-500">{t("forDatarelatedQuestions")}</p>
            </div>
            <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
              <p className="text-xs font-bold text-emerald-400">{t("SecurityReports")}</p>
              <p className="text-xs text-zinc-400 mt-1">{t("securitynuvoracom")}</p>
              <p className="text-[10px] text-zinc-500">{t("forVulnerabilityReports")}</p>
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
      color: "amber",
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-semibold text-white">{t("internalComplaintProcess")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("submitComplaintViaSupport")}</li>
            <li>{t("acknowledgmentWithin48Hours")}</li>
            <li>{t("investigationCompletedWithin30")}</li>
            <li>{t("resolutionAndExplanationProvided")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("escalationProcess")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("unresolvedComplaintsEscalatedTo")}</li>
            <li>{t("dpoReviewWithin15")}</li>
            <li>{t("finalDecisionByPrivacy")}</li>
            <li>{t("appealProcessAvailable")}</li>
          </ul>
          <p className="font-semibold text-white mt-4">{t("externalSupervisoryAuthorities")}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
            <li>{t("rightToComplainTo")}</li>
            <li>{t("contactInformationForAuthorities")}</li>
            <li>{t("crossborderComplaintHandling")}</li>
            <li>{t("resolutionThroughLegalChannels")}</li>
          </ul>
          <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
            <p className="text-xs text-zinc-400">
              <span className="text-white">{t("ComplaintTracking")}</span> {t("allcomplaintsAreTrackedAnd")}
            </p>
          </div>
        </div>
      ),
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { border: string; bg: string; text: string }> = {
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
        <p className="text-xs text-zinc-500 mt-3">{t("loadingPrivacyPolicy")}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${variant === "modal" ? "max-h-[80vh]" : ""}`}>
      {/* Header */}
      <div className="text-center space-y-2 pb-4 border-b border-white/5">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">{t("privacyPolicy")}</h2>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {t("nuvoraEliteHome")}
          </span>
        </div>
        <p className="text-xs text-zinc-400">{t("yourPrivacyMattersReview")}</p>
        <p className="text-[10px] text-zinc-500">
          {t("lastUpdated")}{" "}
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
                <span className="text-sm font-bold text-white flex-1">{section.title}</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                )}
              </button>
              {isExpanded && <div className="px-4 pb-4 pt-3 border-t border-white/5">{section.content}</div>}
            </div>
          );
        })}

        {/* Quick Summary Box */}
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <HeartHandshake className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">{t("privacyAtAGlance")}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-zinc-900/50 rounded-lg text-center">
              <p className="text-emerald-400 font-bold">{t("Encrypted")}</p>
              <p className="text-zinc-500">{t("allData")}</p>
            </div>
            <div className="p-2 bg-zinc-900/50 rounded-lg text-center">
              <p className="text-emerald-400 font-bold">{t("Control")}</p>
              <p className="text-zinc-500">{t("yourRights")}</p>
            </div>
            <div className="p-2 bg-zinc-900/50 rounded-lg text-center">
              <p className="text-emerald-400 font-bold">{t("NoSelling")}</p>
              <p className="text-zinc-500">{t("yourData")}</p>
            </div>
            <div className="p-2 bg-zinc-900/50 rounded-lg text-center">
              <p className="text-emerald-400 font-bold">{t("Secure")}</p>
              <p className="text-zinc-500">{t("storage")}</p>
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
          <label htmlFor="privacy-accept" className="text-xs text-zinc-400 leading-relaxed">
            {t("iConfirmThatI")}{" "}
            <span className="text-white font-medium">{t("privacyPolicy")}</span> {t("for")}{" "}
            <span className="text-emerald-400 font-medium">{t("nuvoraEliteHome")}</span>{" "}
            {t("IUnderstandHow")}
          </label>
        </div>

        <div className="flex gap-3">
          {onDecline && (
            <button
              onClick={onDecline}
              className="flex-1 border border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl h-11 text-xs font-bold transition-all"
            >
              {t("decline")}
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
              <CheckCircle2 className="h-4 w-4" /> {t("acceptContinue")}
            </button>
          )}
        </div>

        <p className="text-[10px] text-center text-zinc-600">
          {t("byAcceptingYouAgree")}
          <br />
          {t("needHelp")}{" "}
          <a href="/support" className="text-emerald-400 hover:underline">
            {t("contactSupport")}
          </a>
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;