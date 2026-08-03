import type { Page } from "playwright";

export interface PlatformConfig {
  id: string;
  login_url: string;
  username_selector: string;
  password_selector: string;
  submit_selector: string;
  followers_extractor_js?: string | null;
}

export interface AuthGroup {
  u: string;
  p: string;
  facebookUsername?: string;
}

export interface VerificationParams {
  auditId: string;
  config: PlatformConfig;
  authGroup: AuthGroup;
}

export type Outcome =
  | "SUCCESS"
  | "BAD_CREDS"
  | "NEEDS_VERIFICATION_CODE"
  | "UNKNOWN";

export type AuditStatus =
  | "AUTHENTICATING"
  | "SCRAPING_DATA"
  | "VERIFIED"
  | "NEEDS_VERIFICATION_CODE"
  | "FAILED_BAD_CREDENTIALS"
  | "FAILED_TIMEOUT"
  | "FAILED_UNKNOWN";

export interface PlatformHandler {
  login: (
    page: Page,
    authGroup: AuthGroup,
    auditId: string,
    helpers: PlatformHelpers
  ) => Promise<Outcome>;
}

export interface PlatformHelpers {
  updateAudit: (fields: Record<string, unknown>) => Promise<boolean>;
  sendToast: (
    title: string,
    description: string,
    variant?: "default" | "destructive" | "success"
  ) => Promise<void>;
  captureScreenshot: (phase: string) => Promise<string | null>;
  extractPageMessage: () => Promise<string | null>;
  sleep: (ms: number) => Promise<void>;
  clickTryAnotherWay: () => Promise<boolean>;
}