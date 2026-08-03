import type { Page } from "playwright";
import { launchBrowser } from "./browser";
import {
  captureScreenshot,
  extractPageMessage,
  getSupabaseAdmin,
  sendToastLog,
  updateAudit,
} from "./db";
import { clickTryAnotherWay, detectOutcome } from "./detection";
import { loginFacebook } from "./platforms/facebook";
import { loginInstagram } from "./platforms/instagram";
import { loginTikTok } from "./platforms/tiktok";
import type { PlatformHelpers, VerificationParams } from "./types";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function proceedToScraping(
  supabase: any,
  page: Page,
  auditId: string,
  config: VerificationParams["config"],
  screenshotUrl: string | null
) {
  await updateAudit(supabase, auditId, { status: "SCRAPING_DATA" });
  await sendToastLog(
    supabase,
    auditId,
    "📊 Scraping Profile",
    "Extracting follower count, bio, and verification status..."
  );

  await page.waitForLoadState("networkidle").catch(() => {});
  await sleep(1500);

  let followersCount: number | null = null;
  let bio = "";
  let isVerified = false;

  try {
    if (config.followers_extractor_js) {
      followersCount = await page.evaluate(
        new Function(config.followers_extractor_js) as () => number
      );
    }

    bio = await page
      .evaluate(() => {
        const selectors = [
          'div[data-testid="UserDescription"]',
          ".bio",
          '[class*="bio"]',
          'header section span',
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el?.textContent) return el.textContent.trim();
        }
        return "";
      })
      .catch(() => "");

    isVerified = await page
      .locator('svg[aria-label="Verified"], [data-testid="icon-verified"], .verified-badge')
      .isVisible()
      .catch(() => false);
  } catch (e) {
    console.warn("Metadata extraction issue:", e);
  }

  const profileScreenshot = await captureScreenshot(
    supabase,
    page,
    auditId,
    "profile-scraped"
  );

  await updateAudit(supabase, auditId, {
    status: "VERIFIED",
    follower_count: followersCount || 0,
    raw_meta_payload: {
      followers_count: followersCount,
      account_bio: bio,
      is_verified: isVerified,
      verified_at: new Date().toISOString(),
    },
    screenshot_url: profileScreenshot || screenshotUrl,
  });

  await sendToastLog(
    supabase,
    auditId,
    "✅ Verification Complete",
    `Successfully verified account with ${followersCount || 0} followers!`,
    "success"
  );
}

export async function runAssetVerificationEngine({
  auditId,
  config,
  authGroup,
}: VerificationParams) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  // Verify row exists
  const { data: existingRow, error: fetchError } = await supabase
    .from("asset_audits")
    .select("id, status")
    .eq("id", auditId)
    .maybeSingle();

  if (fetchError || !existingRow) {
    console.error(`❌ Audit row not found: ${auditId}`);
    return;
  }

  const ok = await updateAudit(supabase, auditId, {
    status: "AUTHENTICATING",
    updated_at: new Date().toISOString(),
  });

  if (!ok) {
    console.error("❌ Failed to set AUTHENTICATING status");
    return;
  }

  await sendToastLog(supabase, auditId, "🚀 Worker Started", `Starting verification for ${config.id}`);

  const { browser, page } = await launchBrowser();

  // Helpers bound to this run
  const helpers: PlatformHelpers = {
    updateAudit: (fields) => updateAudit(supabase, auditId, fields),
    sendToast: (title, description, variant) =>
      sendToastLog(supabase, auditId, title, description, variant),
    captureScreenshot: (phase) => captureScreenshot(supabase, page, auditId, phase),
    extractPageMessage: () => extractPageMessage(page),
    sleep ,
    clickTryAnotherWay: () => clickTryAnotherWay(page),
  };

  try {
    let outcome: Awaited<ReturnType<typeof loginFacebook>>;

    // Route to correct platform
    if (config.id === "facebook" || config.login_url.includes("facebook.com")) {
      outcome = await loginFacebook(page, authGroup, auditId, helpers);
    } else if (config.id === "tiktok" || config.login_url.includes("tiktok.com")) {
      outcome = await loginTikTok(page, authGroup, auditId, helpers);
    } else if (config.id === "instagram" || config.login_url.includes("instagram.com")) {
      outcome = await loginInstagram(page, authGroup, auditId, helpers);
    } else {
      await helpers.sendToast("❌ Unsupported Platform", `Platform ${config.id} is not supported yet.`, "destructive");
      await helpers.updateAudit({
        status: "FAILED_UNKNOWN",
        error_message: `Unsupported platform: ${config.id}`,
      });
      return;
    }

    // ─── Handle 2FA ─────────────────────────────────────────────
    if (outcome === "NEEDS_VERIFICATION_CODE") {
      await helpers.sendToast(
        "⏳ Waiting for 2FA",
        "Please enter the verification code in the UI. The worker is listening..."
      );

      let code: string | null = null;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes

      while (attempts < maxAttempts) {
        attempts++;
        const { data } = await supabase
          .from("asset_audits")
          .select("two_fa_code")
          .eq("id", auditId)
          .single();

        if (data?.two_fa_code?.trim()) {
          code = data.two_fa_code.trim();
          break;
        }

        // Check if user somehow logged in another way
        const stillOnChallenge = page.url().includes("two_step") ||
          page.url().includes("two_factor") ||
          page.url().includes("checkpoint") ||
          page.url().includes("challenge");

        if (!stillOnChallenge) {
          const loggedIn = await page
            .locator("text=/Home|Profile|Feed|For You|Following/i")
            .first()
            .isVisible({ timeout: 2000 })
            .catch(() => false);

          if (loggedIn) {
            await helpers.sendToast("✅ Login Confirmed", "Logged in via another method.", "success");
            await proceedToScraping(supabase, page, auditId, config, null);
            return;
          }
        }

        await sleep(5000);
      }

      if (!code) {
        await helpers.sendToast("⏰ Timeout", "Verification code not provided in time.", "destructive");
        await helpers.updateAudit({
          status: "FAILED_TIMEOUT",
          error_message: "Verification code not provided in time by user.",
        });
        return;
      }

      await helpers.sendToast("🔑 Code Received", "Submitting verification code...");

      // Fill code
      const codeSelectors = [
        'input[autocomplete="one-time-code"]',
        'input[name="verificationCode"]',
        'input[placeholder*="code" i]',
        'input[aria-label*="Security code"]',
        'input[inputmode="numeric"]',
        'input[type="text"][maxlength="6"]',
      ];

      let filled = false;
      for (const sel of codeSelectors) {
        try {
          const input = page.locator(sel).first();
          if (await input.isVisible({ timeout: 2500 }).catch(() => false)) {
            await input.fill(code);
            filled = true;
            break;
          }
        } catch {}
      }

      if (!filled) {
        await helpers.sendToast("❌ Code Input Not Found", "Could not locate 2FA input field.", "destructive");
        await helpers.updateAudit({
          status: "FAILED_TIMEOUT",
          error_message: "Could not locate 2FA code input field.",
        });
        return;
      }

      await sleep(800);

      // Submit
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Continue")',
        'button:has-text("Next")',
        'button:has-text("Verify")',
        'button:has-text("Confirm")',
      ];

      for (const sel of submitSelectors) {
        try {
          const btn = page.locator(sel).first();
          if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await Promise.all([
              page.waitForNavigation({ waitUntil: "domcontentloaded" }).catch(() => {}),
              btn.click(),
            ]);
            break;
          }
        } catch {}
      }

      await sleep(4000);
      await updateAudit(supabase, auditId, { two_fa_code: null });

      // Final outcome after 2FA
      const postMsg = await extractPageMessage(page);
      const postOutcome = await detectOutcome(page, config.login_url, postMsg);

      if (postOutcome === "SUCCESS") {
        await proceedToScraping(supabase, page, auditId, config, null);
      } else if (postOutcome === "BAD_CREDS") {
        await helpers.sendToast("❌ Code Rejected", postMsg || "Verification code was rejected.", "destructive");
        await helpers.updateAudit({
          status: "FAILED_BAD_CREDENTIALS",
          error_message: postMsg || "The verification code was rejected.",
        });
      } else {
        await helpers.sendToast("❌ Login Failed", postMsg || "Could not confirm login after code.", "destructive");
        await helpers.updateAudit({
          status: "FAILED_TIMEOUT",
          error_message: postMsg || "Could not confirm login after verification code.",
        });
      }
      return;
    }

    // ─── Success path ───────────────────────────────────────────
    if (outcome === "SUCCESS") {
      await proceedToScraping(supabase, page, auditId, config, null);
    }
  } catch (error: any) {
    console.error("🚨 Worker critical crash:", error.message);
    await sendToastLog(
      supabase,
      auditId,
      "🚨 Worker Crash",
      error.message || "Critical error in verification worker.",
      "destructive"
    );
    await updateAudit(supabase, auditId, {
      status: "FAILED_TIMEOUT",
      error_message: error.message,
    });
  } finally {
    console.log("🔌 Worker closed.");
    await browser.close().catch(() => {});
  }
}