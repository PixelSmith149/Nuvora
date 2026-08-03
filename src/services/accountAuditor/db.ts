import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "playwright";

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("❌ [ENVIRONMENT FAILURE] Supabase env vars missing");
    return null;
  }
  return createClient(url, key);
}

export async function updateAudit(
  supabase: SupabaseClient,
  auditId: string,
  fields: Record<string, unknown>
): Promise<boolean> {
  try {
    const { error } = await (supabase.from("asset_audits") as any)
      .update(fields)
      .eq("id", auditId);

    if (error) {
      console.error(`❌ [DB UPDATE FAILED] audit=${auditId}`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`❌ [DB UPDATE EXCEPTION] audit=${auditId}`, e);
    return false;
  }
}

export async function sendToastLog(
  supabase: SupabaseClient,
  auditId: string,
  title: string,
  description: string,
  variant: "default" | "destructive" | "success" = "default"
) {
  try {
    await updateAudit(supabase, auditId, {
      last_toast: {
        timestamp: new Date().toISOString(),
        title,
        description,
        variant,
      },
    });
  } catch (e) {
    console.warn("⚠️ [TOAST LOG FAILED]", e);
  }
}

export async function captureScreenshot(
  supabase: SupabaseClient,
  page: Page,
  auditId: string,
  phase: string
): Promise<string | null> {
  try {
    const buffer = await page.screenshot({ type: "png", fullPage: false });
    const fileName = `${auditId}/${phase}-${Date.now()}.png`;

    const { error } = await supabase.storage
      .from("audit-screenshots")
      .upload(fileName, buffer, { contentType: "image/png", upsert: false });

    if (error) {
      console.error(`📸 [SCREENSHOT] Upload failed: ${error.message}`);
      return null;
    }

    const { data } = supabase.storage
      .from("audit-screenshots")
      .getPublicUrl(fileName);

    return data?.publicUrl || null;
  } catch (e: any) {
    console.error(`📸 [SCREENSHOT] Capture failed:`, e?.message || e);
    return null;
  }
}

export async function extractPageMessage(page: Page): Promise<string | null> {
  try {
    return await page.evaluate(() => {
      const toastSelectors = [
        '[class*="toast"]',
        '[class*="Toast"]',
        '[role="alert"]',
        '[class*="error-message"]',
        '[class*="alert"]',
        ".toast",
        ".error",
        ".alert",
      ];

      for (const sel of toastSelectors) {
        const el = document.querySelector(sel);
        if (el?.textContent && el.textContent.trim().length > 2) {
          return el.textContent.trim();
        }
      }

      const errorPatterns = [
        "incorrect",
        "wrong password",
        "invalid",
        "try again",
        "could not find",
        "doesn't match",
        "does not match",
        "not found",
        "failed",
        "too many",
        "rate limit",
        "blocked",
        "suspicious",
      ];

      const allText = document.body?.innerText || "";
      const lines = allText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      for (const line of lines) {
        const lower = line.toLowerCase();
        for (const pattern of errorPatterns) {
          if (lower.includes(pattern) && line.length < 200) {
            return line;
          }
        }
      }
      return null;
    });
  } catch {
    return null;
  }
}