import type { Page } from "playwright";
import type { AuthGroup, Outcome, PlatformHelpers } from "../types";

export async function loginFacebook(
  page: Page,
  authGroup: AuthGroup,
  auditId: string,
  helpers: PlatformHelpers
): Promise<Outcome> {
  const {
    updateAudit,
    sendToast,
    captureScreenshot,
    extractPageMessage,
    sleep,
    clickTryAnotherWay,
  } = helpers;

  await sendToast("📘 Facebook Flow", "Starting Facebook login...");

  // Prefer desktop web login (more stable for automation)
  const loginUrls = [
    "https://web.facebook.com/login",
    "https://www.facebook.com/login",
    "https://m.facebook.com/login",
  ];

  let loaded = false;
  for (const url of loginUrls) {
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      });
      await page.waitForLoadState("networkidle").catch(() => {});
      await sleep(2500);

      // Check if login form is present
      const hasForm = await page
        .locator('input[name="email"], input[type="text"][placeholder*="Email"], input#email')
        .first()
        .isVisible({ timeout: 4000 })
        .catch(() => false);

      if (hasForm) {
        loaded = true;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!loaded) {
    await sendToast("❌ Login Failed", "Could not load Facebook login page.", "destructive");
    await updateAudit({
      status: "FAILED_UNKNOWN",
      error_message: "Failed to load any Facebook login page.",
    });
    return "UNKNOWN";
  }

  // ─── Fill email / phone ──────────────────────────────────────
  const emailSelectors = [
    'input[name="email"]',
    'input#email',
    'input[type="text"][placeholder*="Email"]',
    'input[type="text"][placeholder*="Phone"]',
    'input[type="email"]',
    'input[autocomplete="username"]',
    'input[autocomplete="email"]',
    'input[aria-label*="Email"]',
    'input[aria-label*="Phone"]',
    'form[action*="login"] input[type="text"]',
  ];

  let emailFilled = false;
  for (const sel of emailSelectors) {
    try {
      const input = page.locator(sel).first();
      if (await input.isVisible({ timeout: 2500 }).catch(() => false)) {
        await input.click({ clickCount: 3 });
        await input.fill(authGroup.u);
        emailFilled = true;
        break;
      }
    } catch {}
  }

  if (!emailFilled) {
    await sendToast("❌ Login Failed", "Could not find Facebook email/phone field.", "destructive");
    await updateAudit({
      status: "FAILED_UNKNOWN",
      error_message: "Could not find email/phone field on Facebook.",
    });
    return "UNKNOWN";
  }

  await sleep(700);

  // ─── Fill password ───────────────────────────────────────────
  const passwordSelectors = [
    'input[name="pass"]',
    'input#pass',
    'input[type="password"]',
    'input[autocomplete="current-password"]',
    'input[aria-label*="Password"]',
  ];

  let passwordFilled = false;
  for (const sel of passwordSelectors) {
    try {
      const input = page.locator(sel).first();
      if (await input.isVisible({ timeout: 2500 }).catch(() => false)) {
        await input.fill(authGroup.p);
        passwordFilled = true;
        break;
      }
    } catch {}
  }

  if (!passwordFilled) {
    await sendToast("❌ Login Failed", "Could not find Facebook password field.", "destructive");
    await updateAudit({
      status: "FAILED_UNKNOWN",
      error_message: "Could not find password field on Facebook.",
    });
    return "UNKNOWN";
  }

  await sleep(600);
  await sendToast("🔑 Submitting Credentials", "Submitting Facebook login...");

  // ─── Click Login ─────────────────────────────────────────────
  const submitSelectors = [
    'button[name="login"]',
    'button[type="submit"]',
    'button[data-testid="royal_login_button"]',
    "#loginbutton",
    'button:has-text("Log in")',
    'button:has-text("Log In")',
    'input[type="submit"]',
  ];

  let clicked = false;
  for (const sel of submitSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 2500 }).catch(() => false)) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle", timeout: 35000 }).catch(() => {}),
          btn.click(),
        ]);
        clicked = true;
        break;
      }
    } catch {}
  }

  if (!clicked) {
    await page.keyboard.press("Enter");
  }

  await sleep(5000);
  await page.waitForLoadState("networkidle").catch(() => {});

  const currentUrl = page.url();

  // ─── 2FA / Checkpoint detection ──────────────────────────────
  const is2FA =
    currentUrl.includes("/two_step_verification/") ||
    currentUrl.includes("/two_factor/") ||
    currentUrl.includes("checkpoint") ||
    currentUrl.includes("login/confirm") ||
    currentUrl.includes("two_step") ||
    currentUrl.includes("recover") ||
    (await page.locator('input[autocomplete="one-time-code"], input[name="approvals_code"]').isVisible().catch(() => false));

  if (is2FA) {
    await sendToast("🔐 2FA / Checkpoint Required", "Facebook is requesting verification...");

    // Try "Try another way" / "Get a code"
    await clickTryAnotherWay();
    await sleep(2000);

    const screenshot = await captureScreenshot("2fa-requested");
    await updateAudit({
      status: "NEEDS_VERIFICATION_CODE",
      screenshot_url: screenshot,
      error_message: null,
    });
    return "NEEDS_VERIFICATION_CODE";
  }

  // ─── Success check ───────────────────────────────────────────
  const successIndicators = [
    "text=Home",
    "text=Watch",
    "text=Marketplace",
    "text=Friends",
    '[aria-label="Home"]',
    'div[role="navigation"]',
    'a[href="/"]',
  ];

  let isLoggedIn = false;
  for (const sel of successIndicators) {
    if (await page.locator(sel).first().isVisible({ timeout: 3000 }).catch(() => false)) {
      isLoggedIn = true;
      break;
    }
  }

  // Extra check: redirect to facebook.com/me or home
  if (
    currentUrl.includes("facebook.com") &&
    !currentUrl.includes("login") &&
    !currentUrl.includes("checkpoint")
  ) {
    isLoggedIn = true;
  }

  if (isLoggedIn) {
    await sendToast("✅ Login Successful", "Facebook login confirmed!", "success");

    // Optional username verification
    if (authGroup.facebookUsername) {
      await sendToast("👤 Username Check", `Verifying: ${authGroup.facebookUsername}`);

      try {
        await page.goto("https://www.facebook.com/me", {
          waitUntil: "networkidle",
          timeout: 15000,
        }).catch(() => {});
        await sleep(3000);

        const scraped = await page.evaluate(() => {
          const h1 = document.querySelector('h1');
          if (h1?.textContent?.trim()) return h1.textContent.trim();

          const match = window.location.href.match(/facebook\.com\/([^/?#]+)/);
          if (match?.[1] && !["home", "me", "profile.php"].includes(match[1])) {
            return match[1];
          }
          return null;
        });

        if (scraped) {
          const expected = authGroup.facebookUsername.toLowerCase().trim();
          const actual = scraped.toLowerCase().trim();
          if (expected !== actual && !actual.includes(expected) && !expected.includes(actual)) {
            await sendToast("❌ Username Mismatch", `Expected "${expected}" but found "${actual}"`, "destructive");
            await updateAudit({
              status: "FAILED_BAD_CREDENTIALS",
              error_message: `Username mismatch. Expected "${expected}" but got "${actual}".`,
            });
            return "BAD_CREDS";
          }
          await sendToast("✅ Username Verified", `Matched: ${scraped}`, "success");
        }
      } catch (e) {
        console.warn("Facebook username verification failed:", e);
      }
    }

    return "SUCCESS";
  }

  // ─── Error handling ──────────────────────────────────────────
  const msg = await extractPageMessage();
  if (msg) {
    await sendToast("❌ Login Failed", msg, "destructive");
    await updateAudit({
      status: "FAILED_BAD_CREDENTIALS",
      error_message: msg,
    });
    return "BAD_CREDS";
  }

  await sendToast("⚠️ Unknown State", "Could not determine Facebook login result.", "default");
  await updateAudit({
    status: "FAILED_UNKNOWN",
    error_message: "Could not determine login state after Facebook attempt.",
  });
  return "UNKNOWN";
}