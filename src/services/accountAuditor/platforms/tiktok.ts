import type { Page } from "playwright";
import type { AuthGroup, Outcome, PlatformHelpers } from "../types";

export async function loginTikTok(
  page: Page,
  authGroup: AuthGroup,
  auditId: string,
  helpers: PlatformHelpers
): Promise<Outcome> {
  const { updateAudit, sendToast, captureScreenshot, extractPageMessage, sleep } = helpers;

  await sendToast("🎵 TikTok Flow", "Starting TikTok login...");

  // Correct current paths
  const entryUrls = [
    "https://www.tiktok.com/login/phone-or-email",
    "https://www.tiktok.com/login/phone-or-email/email",
    "https://www.tiktok.com/login",
  ];

  let pageReady = false;
  for (const url of entryUrls) {
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 40000,
      });
      await sleep(3000);

      // Look for email/username option or input
      const hasEmailOption = await page
        .locator('text=/Email|email|Use phone.*email|Log in with email/i')
        .first()
        .isVisible({ timeout: 4000 })
        .catch(() => false);

      const hasInput = await page
        .locator('input[type="text"], input[name="username"], input[placeholder*="Email"]')
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (hasEmailOption || hasInput) {
        pageReady = true;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!pageReady) {
    await sendToast("❌ Login Failed", "Could not load TikTok login page.", "destructive");
    await updateAudit({
      status: "FAILED_UNKNOWN",
      error_message: "Failed to reach TikTok login form.",
    });
    return "UNKNOWN";
  }

  // Click "Use phone / email / username" or "Log in with email" if present
  const switchSelectors = [
    'text=/Use phone.*email.*username/i',
    'text=/Log in with email/i',
    'text=/Email or username/i',
    'a[href*="email"]',
    'div[role="link"]:has-text("Email")',
  ];

  for (const sel of switchSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2500 }).catch(() => false)) {
        await el.click();
        await sleep(2000);
        break;
      }
    } catch {}
  }

  // Fill username / email
  const usernameSelectors = [
    'input[name="username"]',
    'input[placeholder*="Email"]',
    'input[placeholder*="email"]',
    'input[placeholder*="Username"]',
    'input[autocomplete="username"]',
    'input[type="text"]',
  ];

  let usernameFilled = false;
  for (const sel of usernameSelectors) {
    try {
      const input = page.locator(sel).first();
      if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
        await input.click({ clickCount: 3 });
        await input.fill(authGroup.u);
        usernameFilled = true;
        break;
      }
    } catch {}
  }

  if (!usernameFilled) {
    await sendToast("❌ Login Failed", "Could not find TikTok username/email field.", "destructive");
    await updateAudit({
      status: "FAILED_UNKNOWN",
      error_message: "Could not find TikTok username field.",
    });
    return "UNKNOWN";
  }

  await sleep(800);

  // Password field (sometimes appears after clicking Continue/Next)
  let passwordVisible = await page
    .locator('input[type="password"]')
    .first()
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (!passwordVisible) {
    // Click Next / Continue
    const nextSelectors = [
      'button:has-text("Next")',
      'button:has-text("Continue")',
      'button[type="submit"]',
    ];
    for (const sel of nextSelectors) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await btn.click();
          await sleep(2500);
          break;
        }
      } catch {}
    }
  }

  // Fill password
  const passwordSelectors = [
    'input[type="password"]',
    'input[placeholder*="Password"]',
    'input[autocomplete="current-password"]',
  ];

  let passwordFilled = false;
  for (const sel of passwordSelectors) {
    try {
      const input = page.locator(sel).first();
      if (await input.isVisible({ timeout: 4000 }).catch(() => false)) {
        await input.fill(authGroup.p);
        passwordFilled = true;
        break;
      }
    } catch {}
  }

  if (!passwordFilled) {
    await sendToast("❌ Login Failed", "Could not find TikTok password field.", "destructive");
    await updateAudit({
      status: "FAILED_UNKNOWN",
      error_message: "Could not find TikTok password field.",
    });
    return "UNKNOWN";
  }

  await sleep(600);
  await sendToast("🔑 Submitting Credentials", "Submitting TikTok login...");

  // Submit
  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Log in")',
    'button:has-text("Log In")',
    'button:has-text("Continue")',
  ];

  for (const sel of submitSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 2500 }).catch(() => false)) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {}),
          btn.click(),
        ]);
        break;
      }
    } catch {}
  }

  await sleep(4500);
  await page.waitForLoadState("networkidle").catch(() => {});

  // 2FA check
  const codeVisible = await page
    .locator(
      'input[autocomplete="one-time-code"], input[placeholder*="code" i], input[inputmode="numeric"], input[maxlength="6"]'
    )
    .first()
    .isVisible({ timeout: 4000 })
    .catch(() => false);

  if (codeVisible) {
    await sendToast("🔐 2FA Required", "TikTok is requesting a verification code...");
    const screenshot = await captureScreenshot("2fa-requested");
    await updateAudit({
      status: "NEEDS_VERIFICATION_CODE",
      screenshot_url: screenshot,
    });
    return "NEEDS_VERIFICATION_CODE";
  }

  // Success check
  const successSelectors = [
    '[data-e2e="profile-icon"]',
    '[data-e2e="nav-profile"]',
    'div[data-e2e="user-avatar"]',
    'text=/For You|Following|Profile|Friends/i',
    'a[href*="/profile"]',
  ];

  for (const sel of successSelectors) {
    if (await page.locator(sel).first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await sendToast("✅ Login Successful", "TikTok login confirmed!", "success");
      return "SUCCESS";
    }
  }

  // Fallback: if we left the login page
  if (!page.url().includes("/login")) {
    await sendToast("✅ Login Successful", "TikTok login appears successful!", "success");
    return "SUCCESS";
  }

  const msg = await extractPageMessage();
  if (msg) {
    await sendToast("❌ Login Failed", msg, "destructive");
    await updateAudit({
      status: "FAILED_BAD_CREDENTIALS",
      error_message: msg,
    });
    return "BAD_CREDS";
  }

  await sendToast("⚠️ Unknown State", "Could not determine TikTok login result.", "default");
  await updateAudit({
    status: "FAILED_UNKNOWN",
    error_message: "Could not determine TikTok login state.",
  });
  return "UNKNOWN";
}