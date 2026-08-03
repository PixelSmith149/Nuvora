import type { Page } from "playwright";
import type { AuthGroup, Outcome, PlatformHelpers } from "../types";

export async function loginInstagram(
  page: Page,
  authGroup: AuthGroup,
  auditId: string,
  helpers: PlatformHelpers
): Promise<Outcome> {
  const { updateAudit, sendToast, captureScreenshot, extractPageMessage, sleep } = helpers;

  await sendToast("📸 Instagram Flow", "Starting Instagram login...");

  // Desktop login (more reliable for automation than mobile)
  const loginUrls = [
    "https://www.instagram.com/accounts/login/",
    "https://www.instagram.com/accounts/login/?source=auth_switcher",
    "https://www.instagram.com/accounts/login/?next=%2F",
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

      const hasForm = await page
        .locator('input[name="username"], input[aria-label*="username" i], input[aria-label*="Phone number"]')
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
    await sendToast("❌ Login Failed", "Could not load Instagram login page.", "destructive");
    await updateAudit({
      status: "FAILED_UNKNOWN",
      error_message: "Failed to load Instagram login form.",
    });
    return "UNKNOWN";
  }

  // Username
  const usernameSelectors = [
    'input[name="username"]',
    'input[aria-label="Phone number, username, or email"]',
    'input[aria-label*="username" i]',
    'input[aria-label*="Phone number"]',
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
    await sendToast("❌ Login Failed", "Could not find Instagram username field.", "destructive");
    await updateAudit({
      status: "FAILED_UNKNOWN",
      error_message: "Could not find Instagram username field.",
    });
    return "UNKNOWN";
  }

  await sleep(600);

  // Password
  const passwordSelectors = [
    'input[name="password"]',
    'input[aria-label="Password"]',
    'input[type="password"]',
  ];

  let passwordFilled = false;
  for (const sel of passwordSelectors) {
    try {
      const input = page.locator(sel).first();
      if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
        await input.fill(authGroup.p);
        passwordFilled = true;
        break;
      }
    } catch {}
  }

  if (!passwordFilled) {
    await sendToast("❌ Login Failed", "Could not find Instagram password field.", "destructive");
    await updateAudit({
      status: "FAILED_UNKNOWN",
      error_message: "Could not find Instagram password field.",
    });
    return "UNKNOWN";
  }

  await sleep(500);
  await sendToast("🔑 Submitting Credentials", "Submitting Instagram login...");

  // Submit
  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Log in")',
    'button:has-text("Log In")',
    'div[role="button"]:has-text("Log in")',
  ];

  let clicked = false;
  for (const sel of submitSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 2500 }).catch(() => false)) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle", timeout: 30000 }).catch(() => {}),
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

  // 2FA / Challenge detection
  const codeVisible = await page
    .locator(
      'input[name="verificationCode"], input[aria-label*="Security code"], input[autocomplete="one-time-code"], input[placeholder*="code" i], input[name="email"], input[name="tel"]'
    )
    .first()
    .isVisible({ timeout: 4000 })
    .catch(() => false);

  const challengeText = await page
    .locator("text=/Enter the code|Security code|Confirm it's you|We sent a code/i")
    .first()
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (codeVisible || challengeText) {
    await sendToast("🔐 2FA / Challenge Required", "Instagram is requesting verification...");
    const screenshot = await captureScreenshot("2fa-requested");
    await updateAudit({
      status: "NEEDS_VERIFICATION_CODE",
      screenshot_url: screenshot,
    });
    return "NEEDS_VERIFICATION_CODE";
  }

  // Dismiss "Save login info" / "Turn on notifications"
  const dismissSelectors = [
    'button:has-text("Not Now")',
    'button:has-text("Not now")',
    'text="Not Now"',
    'button:has-text("Save Info")', // sometimes we just continue
  ];

  for (const sel of dismissSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 2500 }).catch(() => false)) {
        await btn.click();
        await sleep(1500);
      }
    } catch {}
  }

  // Success indicators
  const successSelectors = [
    'svg[aria-label="Home"]',
    'a[href="/"]',
    'nav[role="navigation"]',
    'text=/Home|Search|Explore|Reels|Messages|Profile/i',
    'img[alt*="profile picture" i]',
    'a[href*="/direct/inbox"]',
  ];

  for (const sel of successSelectors) {
    if (await page.locator(sel).first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await sendToast("✅ Login Successful", "Instagram login confirmed!", "success");
      return "SUCCESS";
    }
  }

  // Fallback: left the login page
  if (!page.url().includes("/accounts/login")) {
    await sendToast("✅ Login Successful", "Instagram login appears successful!", "success");
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

  await sendToast("⚠️ Unknown State", "Could not determine Instagram login result.", "default");
  await updateAudit({
    status: "FAILED_UNKNOWN",
    error_message: "Could not determine Instagram login state.",
  });
  return "UNKNOWN";
}