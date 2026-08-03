import type { Page } from "playwright";
import type { Outcome } from "./types";

export async function detectOutcome(
  page: Page,
  loginUrl: string,
  pageMessage: string | null
): Promise<Outcome> {
  try {
    const currentUrl = page.url();

    // Facebook 2FA / checkpoint
    if (
      currentUrl.includes("facebook.com") ||
      currentUrl.includes("web.facebook.com")
    ) {
      const is2FAPage =
        currentUrl.includes("/two_step_verification/") ||
        currentUrl.includes("/two_factor/") ||
        currentUrl.includes("two_step_verification") ||
        currentUrl.includes("checkpoint") ||
        currentUrl.includes("login/confirm");

      if (is2FAPage) {
        return "NEEDS_VERIFICATION_CODE";
      }

      // Check for home elements
      const homeElements = [
        "text=Home",
        "text=Watch",
        "text=Marketplace",
        '[aria-label="Home"]',
        'div[role="navigation"]',
      ];

      for (const sel of homeElements) {
        if (
          await page
            .locator(sel)
            .first()
            .isVisible({ timeout: 2500 })
            .catch(() => false)
        ) {
          return "SUCCESS";
        }
      }
    }

    // Generic OTP / 2FA inputs
    const codeInputSelectors = [
      'input[autocomplete="one-time-code"]',
      'input[placeholder*="code" i]',
      'input[placeholder*="Code" i]',
      'input[type="text"][maxlength="6"]',
      'input[inputmode="numeric"]',
    ];

    for (const sel of codeInputSelectors) {
      if (
        await page
          .locator(sel)
          .first()
          .isVisible({ timeout: 1500 })
          .catch(() => false)
      ) {
        return "NEEDS_VERIFICATION_CODE";
      }
    }

    // Passkey / biometric text
    const passkeyVisible = await page
      .locator(
        "text=/passkey|face scan|fingerprint|screen lock|confirm it.s you|saved passkey/i"
      )
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (passkeyVisible) return "NEEDS_VERIFICATION_CODE";

    // Still on login page?
    const emailVisible = await page
      .locator('input[type="email"], input[name="email"], input[name="username"]')
      .first()
      .isVisible({ timeout: 1500 })
      .catch(() => false);

    const passwordVisible = await page
      .locator('input[type="password"]')
      .first()
      .isVisible({ timeout: 1500 })
      .catch(() => false);

    const isOnLoginPage =
      currentUrl.includes("/login") ||
      currentUrl.includes("/signin") ||
      currentUrl.includes("/accounts") ||
      (emailVisible && passwordVisible);

    if (isOnLoginPage) {
      if (pageMessage) {
        const lower = pageMessage.toLowerCase();
        const badPatterns = [
          "incorrect",
          "wrong",
          "invalid",
          "try again",
          "could not find",
          "doesn't match",
          "does not match",
          "not found",
          "failed",
          "too many",
          "blocked",
          "suspicious",
        ];
        for (const p of badPatterns) {
          if (lower.includes(p)) return "BAD_CREDS";
        }
      }
      return "UNKNOWN";
    }

    // Profile indicators
    const profileSelectors = [
      '[data-testid="primaryColumn"]',
      '[data-testid="UserProfile"]',
      'div[role="main"]',
      ".profile",
      '[aria-label*="profile" i]',
      "text=/Profile|Dashboard|Home|Feed/i",
    ];

    for (const sel of profileSelectors) {
      if (
        await page
          .locator(sel)
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        return "SUCCESS";
      }
    }

    return "SUCCESS";
  } catch (error) {
    console.warn("⚠️ State detection failed:", error);
    return "BAD_CREDS";
  }
}

export async function clickTryAnotherWay(page: Page): Promise<boolean> {
  try {
    const result = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        'button, a, div[role="button"], span[role="button"]'
      );
      for (const el of elements) {
        const text = el.textContent?.toLowerCase() || "";
        if (
          text.includes("try another way") ||
          text.includes("another way") ||
          text.includes("use another method")
        ) {
          (el as HTMLElement).click();
          return true;
        }
      }
      return false;
    });

    if (result) {
      await new Promise((r) => setTimeout(r, 3000));
      return true;
    }

    const selectors = [
      'text="Try another way"',
      "text=Try another way",
      'button:has-text("Try another way")',
      'span:has-text("Try another way")',
      'a:has-text("Try another way")',
    ];

    for (const sel of selectors) {
      try {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
          await el.click({ force: true });
          await new Promise((r) => setTimeout(r, 3000));
          return true;
        }
      } catch {}
    }
    return false;
  } catch {
    return false;
  }
}