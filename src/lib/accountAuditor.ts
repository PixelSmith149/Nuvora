// services/accountAuditor.ts

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { chromium, type LaunchOptions } from "playwright";

// ============================================================
// TYPES
// ============================================================

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
	facebookUsername?: string; // ✅ NEW: For Facebook username verification
}

interface VerificationParams {
	auditId: string;
	config: PlatformConfig;
	authGroup: AuthGroup;
}

type Outcome = "SUCCESS" | "BAD_CREDS" | "NEEDS_VERIFICATION_CODE" | "UNKNOWN";

// ============================================================
// HELPERS
// ============================================================

type SupabaseClient = ReturnType<typeof createClient>;

function getSupabaseAdmin(): SupabaseClient | null {
	const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key =
		process.env.SUPABASE_SERVICE_ROLE_KEY ||
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !key) {
		console.error("❌ [ENVIRONMENT FAILURE] Supabase env vars missing", {
			urlExist: !!url,
			keyExist: !!key,
		});
		return null;
	}
	return createClient(url, key);
}

async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	baseDelay: number = 1000,
): Promise<T> {
	let lastError: Error;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			console.warn(
				`⚠️ Attempt ${attempt}/${maxRetries} failed:`,
				lastError.message,
			);

			if (attempt === maxRetries) break;

			const delay = baseDelay * 2 ** (attempt - 1);
			await sleep(delay);
		}
	}

	throw lastError!;
}

async function updateAudit(
	supabase: SupabaseClient,
	auditId: string,
	fields: Record<string, unknown>,
) {
	try {
		console.log(
			`📝 [DB UPDATE] Updating audit ${auditId} with:`,
			JSON.stringify(fields, null, 2),
		);

		// ✅ REMOVED .select() - it was causing the update to fail
		 const { error } = await (supabase
  .from("asset_audits") as any)
  .update(fields)
  .eq("id", auditId);

		if (error) {
			console.error(`❌ [DB UPDATE FAILED] audit=${auditId}`, error.message);
			console.error(
				"❌ [DB UPDATE] Full error:",
				JSON.stringify(error, null, 2),
			);
			return null;
		}

		console.log(
			`✅ [DB UPDATE] Success for audit ${auditId}. Updated fields:`,
			Object.keys(fields).join(", "),
		);
		return { success: true };
	} catch (e) {
		console.error(`❌ [DB UPDATE EXCEPTION] audit=${auditId}`, e);
		return null;
	}
}

// ─── Toast Logging Helper ────────────────────────────────
async function sendToastLog(
	supabase: SupabaseClient,
	auditId: string,
	title: string,
	description: string,
	variant: "default" | "destructive" | "success" = "default",
) {
	try {
		const newLog = {
			timestamp: new Date().toISOString(),
			title,
			description,
			variant,
		};

		// ✅ FIX: Use updateAudit directly
		const result = await updateAudit(supabase, auditId, {
			last_toast: newLog,
		});

		if (result) {
			console.log(`💬 [TOAST] ${title}: ${description}`);
		} else {
			console.error(`❌ [TOAST] Failed to save toast: ${title}`);
		}
	} catch (e) {
		console.warn("⚠️ [TOAST LOG FAILED]", e);
	}
}
// ─── Encryption Helper ────────────────────────────────────
function encryptPassword(password: string): string {
	const key = process.env.ENCRYPTION_KEY;
	if (!key) {
		console.warn("⚠️ ENCRYPTION_KEY not set, storing password in plain text!");
		return password;
	}

	try {
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(
			"aes-256-gcm",
			Buffer.from(key, "hex"),
			iv,
		);
		let encrypted = cipher.update(password, "utf8", "hex");
		encrypted += cipher.final("hex");
		const authTag = cipher.getAuthTag().toString("hex");
		return `${iv.toString("hex")}:${authTag}:${encrypted}`;
	} catch (e) {
		console.error("Encryption failed:", e);
		return password;
	}
}

function decryptPassword(encryptedData: string): string {
	const key = process.env.ENCRYPTION_KEY;
	if (!key || !encryptedData.includes(":")) {
		return encryptedData;
	}

	try {
		const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
		const iv = Buffer.from(ivHex, "hex");
		const authTag = Buffer.from(authTagHex, "hex");
		const decipher = crypto.createDecipheriv(
			"aes-256-gcm",
			Buffer.from(key, "hex"),
			iv,
		);
		decipher.setAuthTag(authTag);
		let decrypted = decipher.update(encrypted, "hex", "utf8");
		decrypted += decipher.final("utf8");
		return decrypted;
	} catch (e) {
		console.error("Decryption failed:", e);
		return encryptedData;
	}
}

// ─── Screenshot capture + upload ─────────────────────────
async function captureScreenshot(
	supabase: SupabaseClient,
	page: import("playwright").Page,
	auditId: string,
	phase: string,
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

		const { data: urlData } = supabase.storage
			.from("audit-screenshots")
			.getPublicUrl(fileName);

		const publicUrl = urlData?.publicUrl || null;
		if (publicUrl) {
			console.log(`📸 [SCREENSHOT] Captured ${phase}: ${publicUrl}`);
		}
		return publicUrl;
	} catch (e: unknown) {
		console.error(
			`📸 [SCREENSHOT] Capture failed:`,
			e instanceof Error ? e.message : String(e),
		);
		return null;
	}
}

// ─── Extract the actual message the platform displays ────
async function extractPageMessage(
	page: import("playwright").Page,
): Promise<string | null> {
	try {
		const message = await page.evaluate(() => {
			function getAllTextNodes(root: Node): string[] {
				const results: string[] = [];
				const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
					acceptNode: (node) => {
						const text = node.textContent?.trim() || "";
						if (text.length > 2 && !text.match(/^[\s\n\r]+$/)) {
							return NodeFilter.FILTER_ACCEPT;
						}
						return NodeFilter.FILTER_REJECT;
					},
				});
				let node: Node | null;
				while ((node = walker.nextNode())) {
					results.push(node.textContent?.trim() || "");
				}
				return results;
			}

			const toastSelectors = [
				'[class*="toast"]',
				'[class*="Toast"]',
				'[role="alert"]',
				'[class*="error-message"]',
				'[class*="ErrorMessage"]',
				'[class*="alert"]',
				'[data-testid="alert"]',
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

			const shadowRoots = document.querySelectorAll("*");
			for (const el of shadowRoots) {
				if (el.shadowRoot) {
					const textNodes = getAllTextNodes(el.shadowRoot);
					for (const text of textNodes) {
						if (text.length > 2) {
							const lower = text.toLowerCase();
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
								"error",
								"too many",
								"rate limit",
								"blocked",
								"suspicious",
							];
							for (const pattern of errorPatterns) {
								if (lower.includes(pattern) && text.length < 200) {
									return text;
								}
							}
						}
					}
				}
			}

			const inputs = Array.from(document.querySelectorAll("input"));
			for (const input of inputs) {
				const validationMsg = (input as HTMLInputElement).validationMessage;
				if (validationMsg && validationMsg.trim().length > 2) {
					return validationMsg.trim();
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
				"error",
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

		if (message) {
			console.log(`💬 [PAGE MESSAGE] Platform says: "${message}"`);
		} else {
			console.log(`💬 [PAGE MESSAGE] No error/toast message detected on page.`);
		}
		return message;
	} catch (e: unknown) {
		console.warn(
			`💬 [PAGE MESSAGE] Extraction failed:`,
			e instanceof Error ? e.message : String(e),
		);
		return null;
	}
}

// ─── Click "Try another way" helper ──────────────────────
async function clickTryAnotherWay(
	page: import("playwright").Page,
): Promise<boolean> {
	try {
		// Strategy 1: JavaScript click
		const result = await page.evaluate(() => {
			const elements = document.querySelectorAll(
				'button, a, div[role="button"], span[role="button"]',
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

			const ariaElements = document.querySelectorAll("[aria-label]");
			for (const el of ariaElements) {
				const label = el.getAttribute("aria-label")?.toLowerCase() || "";
				if (
					label.includes("try another way") ||
					label.includes("another way")
				) {
					(el as HTMLElement).click();
					return true;
				}
			}

			return false;
		});

		if (result) {
			console.log('✅ [WORKER LOG] "Try another way" clicked via JavaScript');
			await sleep(3000);
			return true;
		}

		// Strategy 2: Playwright selectors
		const selectors = [
			'text="Try another way"',
			"text=Try another way",
			'button:has-text("Try another way")',
			'span:has-text("Try another way")',
			'a:has-text("Try another way")',
			'[role="button"]:has-text("Try another way")',
			'div[role="button"]:has-text("Try another way")',
			'div[aria-label*="Try another way"]',
			'button span:has-text("Try another way")',
			'//span[text()="Try another way"]/parent::button',
			'//button[contains(., "Try another way")]',
		];

		for (const sel of selectors) {
			try {
				const element = page.locator(sel).first();
				if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
					await element.click({ force: true });
					console.log(`✅ [WORKER LOG] "Try another way" clicked via: ${sel}`);
					await sleep(3000);
					return true;
				}
			} catch (e) {
				// Continue
			}
		}

		return false;
	} catch (e) {
		console.error('❌ [WORKER LOG] Error clicking "Try another way":', e);
		return false;
	}
}

// ============================================================
// SCRAPING PHASE
// ============================================================

async function proceedToScraping(
	supabase: SupabaseClient,
	page: import("playwright").Page,
	auditId: string,
	config: PlatformConfig,
	screenshotUrl: string | null,
) {
	await updateAudit(supabase, auditId, { status: "SCRAPING_DATA" });
	await sendToastLog(
		supabase,
		auditId,
		"📊 Scraping Profile",
		"Extracting follower count, bio, and verification status...",
	);

	await page.waitForLoadState("networkidle").catch(() => {});
	await sleep(1500);

	let followersCount = null;
	let bio = "";
	let isVerified = false;
	const likesCount = null;

	try {
		if (config.followers_extractor_js) {
			followersCount = await page.evaluate(
				new Function(config.followers_extractor_js) as () => number,
			);
		}

		bio = await page
			.evaluate(() => {
				const selectors = [
					'div[data-testid="UserDescription"]',
					".bio",
					'[class*="bio"]',
					'div[data-testid="UserBio"]',
				];
				for (const sel of selectors) {
					const el = document.querySelector(sel);
					if (el?.textContent) return el.textContent.trim();
				}
				return "";
			})
			.catch(() => "");

		isVerified = await page
			.locator('svg[data-testid="icon-verified"], .verified-badge')
			.isVisible()
			.catch(() => false);
	} catch (e: unknown) {
		console.warn(
			"⚠️ [WORKER LOG] Metadata extraction had issues:",
			e instanceof Error ? e.message : String(e),
		);
	}

	const profileScreenshot = await captureScreenshot(
		supabase,
		page,
		auditId,
		"profile-scraped",
	);

	await updateAudit(supabase, auditId, {
		status: "VERIFIED",
		follower_count: followersCount || 0,
		raw_meta_payload: {
			followers_count: followersCount ?? null,
			likes_count: likesCount ?? null,
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
		"success",
	);

	console.log(`✅ [WORKER LOG] Asset verified. Followers: ${followersCount}`);
}

// ============================================================
// STATE DETECTION
// ============================================================

async function detectOutcome(
	page: import("playwright").Page,
	loginUrl: string,
	pageMessage: string | null,
): Promise<Outcome> {
	try {
		const currentUrl = page.url();
		console.log(`📍 Current URL: ${currentUrl}`);

		if (pageMessage) {
			console.log(`💬 [DETECT] Platform message evidence: "${pageMessage}"`);
		}

		// ─── CHECK FOR FACEBOOK 2FA/PASSKEY SPECIFICALLY ───
		if (
			currentUrl.includes("facebook.com") ||
			currentUrl.includes("web.facebook.com")
		) {
			const is2FAPage =
				currentUrl.includes("/two_step_verification/") ||
				currentUrl.includes("/two_factor/") ||
				currentUrl.includes("two_step_verification") ||
				currentUrl.includes("checkpoint");

			if (is2FAPage) {
				console.log("🔐 [DETECT] Facebook 2FA/Passkey page detected");

				const passkeyPrompt = await page
					.locator(
						"text=/face scan|fingerprint|screen lock|passkey|confirm it.s you/i",
					)
					.isVisible({ timeout: 3000 })
					.catch(() => false);

				if (passkeyPrompt) {
					console.log(
						"🔐 [DETECT] Facebook Passkey/WebAuthn prompt → NEEDS_VERIFICATION_CODE",
					);
					return "NEEDS_VERIFICATION_CODE";
				}

				const tryAnotherWay = await page
					.locator("text=/Try another way|Use another method|Get a code via/i")
					.isVisible({ timeout: 3000 })
					.catch(() => false);

				if (tryAnotherWay) {
					console.log(
						'🔐 [DETECT] Facebook 2FA with "Try another way" → NEEDS_VERIFICATION_CODE',
					);
					return "NEEDS_VERIFICATION_CODE";
				}

				const codeInput = await page
					.locator(
						'input[autocomplete="one-time-code"], input[placeholder*="code" i]',
					)
					.isVisible({ timeout: 3000 })
					.catch(() => false);

				if (codeInput) {
					console.log(
						"🔐 [DETECT] Facebook 2FA code input visible → NEEDS_VERIFICATION_CODE",
					);
					return "NEEDS_VERIFICATION_CODE";
				}

				console.log(
					"🔐 [DETECT] Facebook 2FA page detected (generic) → NEEDS_VERIFICATION_CODE",
				);
				return "NEEDS_VERIFICATION_CODE";
			}
		}

		// ─── CHECK FOR VERIFICATION CODE INPUT ───
		const codeInputSelectors = [
			'input[autocomplete="one-time-code"]',
			'input[placeholder*="code" i]',
			'input[placeholder*="Code" i]',
			'input[type="text"][maxlength="6"]',
			'input[inputmode="numeric"]',
			'input[autocomplete="off"][type="text"]',
		];

		let dynamicCodeBox = false;
		for (const sel of codeInputSelectors) {
			if (
				await page
					.locator(sel)
					.first()
					.isVisible({ timeout: 2000 })
					.catch(() => false)
			) {
				dynamicCodeBox = true;
				break;
			}
		}

		const mfaUrlStructure =
			currentUrl.includes("/challenge") ||
			currentUrl.includes("/verify") ||
			currentUrl.includes("two-factor") ||
			currentUrl.includes("checkpoint") ||
			currentUrl.includes("2fa") ||
			currentUrl.includes("two_step");

		if (dynamicCodeBox || mfaUrlStructure) {
			console.log(
				"🔐 [DETECT] Security challenge structure pattern identified → NEEDS_VERIFICATION_CODE",
			);
			return "NEEDS_VERIFICATION_CODE";
		}

		// ─── CHECK FOR PASSKEY SPECIFIC TEXT ───
		const passkeyText = await page
			.locator(
				"text=/passkey|face scan|fingerprint|screen lock|confirm it.s you|saved passkey/i",
			)
			.isVisible({ timeout: 3000 })
			.catch(() => false);

		if (passkeyText) {
			console.log(
				"🔐 [DETECT] Passkey/WebAuthn prompt detected → NEEDS_VERIFICATION_CODE",
			);
			return "NEEDS_VERIFICATION_CODE";
		}

		// ─── CHECK IF ON LOGIN PAGE ───
		const emailInputVisible = await page
			.locator('input[type="email"]')
			.first()
			.isVisible({ timeout: 2000 })
			.catch(() => false);
		const passwordInputVisible = await page
			.locator('input[type="password"]')
			.first()
			.isVisible({ timeout: 2000 })
			.catch(() => false);

		// Special Facebook handling - check for home page
		if (
			currentUrl.includes("facebook.com") ||
			currentUrl.includes("web.facebook.com")
		) {
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
						.isVisible({ timeout: 3000 })
						.catch(() => false)
				) {
					console.log("✅ [DETECT] Facebook home page detected → SUCCESS");
					return "SUCCESS";
				}
			}

			if (
				currentUrl.includes("facebook.com") &&
				!currentUrl.includes("/home")
			) {
				console.log(
					"🔐 [DETECT] Facebook page without home elements, checking for 2FA...",
				);
				return "NEEDS_VERIFICATION_CODE";
			}
		}

		const isOnLoginPage =
			currentUrl.includes("/login") ||
			currentUrl.includes("/signin") ||
			currentUrl.includes("/challenge") ||
			currentUrl.includes("/account") ||
			currentUrl.includes("accounts.google.com") ||
			(currentUrl.includes("facebook.com") &&
				(emailInputVisible || passwordInputVisible));

		if (isOnLoginPage) {
			const inlineVerification = await page
				.locator(
					'input[autocomplete="one-time-code"], input[placeholder*="code" i]',
				)
				.isVisible({ timeout: 3000 })
				.catch(() => false);

			if (inlineVerification) {
				console.log(
					"🔐 [DETECT] Verification code input field visible → NEEDS_VERIFICATION_CODE",
				);
				return "NEEDS_VERIFICATION_CODE";
			}

			if (pageMessage) {
				const lowerMsg = pageMessage.toLowerCase();
				const credErrorPatterns = [
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
					"rate limit",
					"blocked",
					"suspicious",
				];

				for (const pattern of credErrorPatterns) {
					if (lowerMsg.includes(pattern)) {
						console.log(
							`🚫 [DETECT] Page message contains "${pattern}" → BAD_CREDS`,
						);
						return "BAD_CREDS";
					}
				}
			}

			try {
				const errorText = await page
					.locator(
						"text=/incorrect|wrong password|invalid login|try again|could not find account|doesn.t match|invalid email|invalid username/i",
					)
					.isVisible({ timeout: 5000 })
					.catch(() => false);

				if (errorText) {
					console.log(
						"🚫 [DETECT] Error text visible on login page → BAD_CREDS",
					);
					return "BAD_CREDS";
				}
			} catch (e) {
				// Ignore
			}

			console.log(
				"⚠️ [DETECT] Login page still visible but no credential evidence. Returning UNKNOWN.",
			);
			return "UNKNOWN";
		}

		// ─── OFF THE LOGIN PAGE - CHECK FOR SUCCESS ───
		try {
			const verificationPrompt = await page
				.locator(
					"text=/verification code|confirm code|enter code|sent to your email|one-time code|otp|2fa|two-factor|passkey|face scan|fingerprint|screen lock/i",
				)
				.isVisible({ timeout: 5000 })
				.catch(() => false);

			if (verificationPrompt) {
				console.log(
					"🔐 [DETECT] Verification prompt on post-login page → NEEDS_VERIFICATION_CODE",
				);
				return "NEEDS_VERIFICATION_CODE";
			}
		} catch (e) {
			// Ignore
		}

		const profileIndicators = [
			'[data-testid="primaryColumn"]',
			'[data-testid="UserProfile"]',
			'div[role="main"]',
			".profile",
			'[aria-label*="profile"]',
			"text=/Profile|Dashboard|Home/i",
		];

		for (const sel of profileIndicators) {
			if (
				await page
					.locator(sel)
					.first()
					.isVisible({ timeout: 3000 })
					.catch(() => false)
			) {
				console.log("✅ [DETECT] Profile content visible → SUCCESS");
				return "SUCCESS";
			}
		}

		console.log("✅ [DETECT] Off login page, no verification prompt → SUCCESS");
		return "SUCCESS";
	} catch (error) {
		console.warn("⚠️ State detection failed, defaulting to BAD_CREDS:", error);
		return "BAD_CREDS";
	}
}

// ============================================================
// MAIN ENGINE
// ============================================================

export async function runAssetVerificationEngine({
	auditId,
	config,
	authGroup,
}: VerificationParams) {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;

	// ─── Verify the audit row exists before doing any work ───
	const { data: existingRow, error: fetchError } = (await supabase
		.from("asset_audits")
		.select("id, status")
		.eq("id", auditId)
		.maybeSingle()) as unknown as {
		data: { id: string; status: string } | null;
		error: unknown;
	};

	if (fetchError || !existingRow) {
		console.error(
			`❌ [WORKER] Audit row not found in DB — aborting before browser launch. audit=${auditId}`,
		);
		console.error("❌ [WORKER] Fetch error:", fetchError);
		return;
	}

	// ✅ FIX: Force status update to AUTHENTICATING - MUST SUCCEED

	const updateResult = await updateAudit(supabase, auditId, {
		status: "AUTHENTICATING",
		updated_at: new Date().toISOString(),
	});

	if (!updateResult) {
		console.error(
			`❌ [WORKER] CRITICAL: Failed to update status to AUTHENTICATING. Aborting.`,
		);
		return;
	}
	console.log(`📝 [WORKER] Attempting to set status to AUTHENTICATING...`);
	console.log(`✅ [WORKER] Status successfully updated to AUTHENTICATING`);

	console.log(
		`✅ [WORKER] Audit row confirmed in DB. Current status: ${existingRow.status}`,
	);
	await sendToastLog(
		supabase,
		auditId,
		"🚀 Worker Started",
		`Starting verification for audit: ${auditId}`,
	);
	await sendToastLog(
		supabase,
		auditId,
		"🔐 Authenticating",
		`Navigating to ${config.id} login page...`,
	);

	// ─── Browser launch ──────────────────────────────────────
	const browserPath = process.env.PLAYWRIGHT_BROWSERS_PATH;

	const launchOptions: LaunchOptions = {
		headless: true,
		args: [
			"--disable-blink-features=AutomationControlled",
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-infobars",
			"--ignore-certificate-errors",
		],
	};

	if (process.env.PLAYWRIGHT_CUSTOM_EXECUTABLE_PATH) {
		launchOptions.executablePath =
			process.env.PLAYWRIGHT_CUSTOM_EXECUTABLE_PATH;
	} else if (browserPath) {
		launchOptions.executablePath = `${browserPath}/chrome-linux/headless_shell`;
	}

	const browser = await chromium.launch(launchOptions);

	const context = await browser.newContext({
		userAgent:
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
		viewport: { width: 1280, height: 800 },
		locale: "en-US",
		timezoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
	});

	const page = await context.newPage();

	await page.addInitScript(() => {
		Object.defineProperty(navigator, "webdriver", { get: () => undefined });
		Object.defineProperty(navigator, "languages", {
			get: () => ["en-US", "en"],
		});
		Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
		(window as any).chrome = { runtime: {} };
	});

	console.log(`🤖 [WORKER LOG] Starting verification for audit: [${auditId}]`);

	try {
		await updateAudit(supabase, auditId, { status: "AUTHENTICATING" });
		await sendToastLog(
			supabase,
			auditId,
			"🔐 Authenticating",
			`Navigating to ${config.id} login page...`,
		);

		console.log(`🌍 [WORKER LOG] Navigating to: ${config.login_url}`);
		await page.goto(config.login_url, {
			waitUntil: "domcontentloaded",
			timeout: 45000,
		});

		await page.waitForLoadState("networkidle").catch(() => {});
		await sleep(1200);
		let formSubmitted = false;

		// ─── PLATFORM-SPECIFIC FLOWS ───────────────────────────

		// ─── X/Twitter Flow ─────────────────────────────────────
		if (config.login_url.includes("x.com")) {
			console.log(`🐦 [WORKER LOG] X/Twitter specialized flow...`);
			await sendToastLog(
				supabase,
				auditId,
				"🐦 Twitter Flow",
				"Using specialized Twitter login flow...",
			);

			await retryWithBackoff(
				async () => {
					await page.waitForSelector('input[autocomplete="username"]', {
						timeout: 15000,
					});
					await page.fill('input[autocomplete="username"]', authGroup.u);
				},
				3,
				1000,
			);
			await page.click('text="Next"');

			const challenge = page.locator(
				'input[data-testid="ocfEnterTextTextInput"]',
			);
			if (await challenge.isVisible({ timeout: 5000 }).catch(() => false)) {
				const label = await challenge.evaluate((el) => {
					return el.parentElement?.textContent ?? "";
				});

				if (label.includes("email")) {
					await challenge.fill(authGroup.u);
				}
				await page.click('text="Next"');
			}

			await retryWithBackoff(
				async () => {
					await page.waitForSelector('input[name="password"]', {
						state: "visible",
						timeout: 15000,
					});
					await page.fill('input[name="password"]', authGroup.p);
				},
				3,
				1000,
			);
			await Promise.all([
				page
					.waitForNavigation({ waitUntil: "domcontentloaded" })
					.catch(() => {}),
				page.click('text="Log in"'),
			]);
			formSubmitted = true;
		}

		// ─── Google Flow ────────────────────────────────────────
		else if (config.login_url.includes("accounts.google.com")) {
			console.log(`🔴 [WORKER LOG] Google specialized flow...`);
			await sendToastLog(
				supabase,
				auditId,
				"🔴 Google Flow",
				"Using specialized Google login flow...",
			);

			await retryWithBackoff(
				async () => {
					await page.waitForSelector('input[type="email"]', { timeout: 15000 });
					await page.fill('input[type="email"]', authGroup.u);
				},
				3,
				1000,
			);
			await page.click("#identifierNext");

			await sleep(2500);

			if (
				await page
					.locator("text=/Verify|Recovery|Try another way|Choose an account/i")
					.isVisible()
					.catch(() => false)
			) {
				await sendToastLog(
					supabase,
					auditId,
					"🔐 2FA Required",
					"Google is requesting verification...",
				);
				return "NEEDS_VERIFICATION_CODE";
			}

			await retryWithBackoff(
				async () => {
					await page.waitForSelector('input[type="password"]', {
						state: "visible",
						timeout: 15000,
					});
					await page.fill('input[type="password"]', authGroup.p);
				},
				3,
				1000,
			);
			await Promise.all([
				page
					.waitForNavigation({ waitUntil: "domcontentloaded" })
					.catch(() => {}),
				page.click("#passwordNext"),
			]);
			formSubmitted = true;
		}

		// ─── Facebook Flow (REPLACE the entire Facebook section) ───
		else if (config.login_url.includes("facebook.com")) {
			console.log(`📘 [WORKER LOG] Facebook specialized flow...`);
			await sendToastLog(
				supabase,
				auditId,
				"📘 Facebook Flow",
				"Using specialized Facebook login flow...",
			);
			await sleep(3000);

			// ─── STEP 1: Wait for page to fully load ───
			await page.waitForLoadState("networkidle").catch(() => {});
			await sleep(2000);

			// ─── STEP 2: Try multiple strategies to find the email field ───
			console.log("🔍 [WORKER LOG] Looking for Facebook login fields...");

			let emailFieldFound = false;
			let passwordFieldFound = false;

			// Strategy 1: Look for the email/phone input
			const emailSelectors = [
				'input[type="text"][placeholder*="Email"]',
				'input[type="text"][placeholder*="Phone"]',
				'input[type="text"][placeholder*="email"]',
				'input[type="email"]',
				'input[name="email"]',
				"input#email",
				'input[autocomplete="username"]',
				'input[autocomplete="email"]',
				'input[placeholder*="Email or phone"]',
				'input[placeholder*="email or phone"]',
				'input[aria-label*="Email"]',
				'input[aria-label*="Phone"]',
				'input[data-testid="email-input"]',
				// Fallback: any visible text input on the login page
				'form[action*="login"] input[type="text"]',
				'#login_form input[type="text"]',
			];

			for (const sel of emailSelectors) {
				try {
					const input = page.locator(sel).first();
					if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
						console.log(`✅ [WORKER LOG] Found email field using: ${sel}`);
						await input.fill(authGroup.u);
						emailFieldFound = true;
						break;
					}
				} catch (e) {
					// Continue to next selector
				}
			}

			if (!emailFieldFound) {
				console.warn(
					'⚠️ [WORKER LOG] Could not find email field, trying to click "Log in" first...',
				);
				// Sometimes Facebook shows a "Log in" button first that reveals the form
				try {
					const loginBtn = page.locator('text="Log in"').first();
					if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
						await loginBtn.click();
						await sleep(2000);
						// Try again
						for (const sel of emailSelectors) {
							try {
								const input = page.locator(sel).first();
								if (
									await input.isVisible({ timeout: 2000 }).catch(() => false)
								) {
									console.log(
										`✅ [WORKER LOG] Found email field after clicking login: ${sel}`,
									);
									await input.fill(authGroup.u);
									emailFieldFound = true;
									break;
								}
							} catch (e) {}
						}
					}
				} catch (e) {}
			}

			if (!emailFieldFound) {
				console.error("❌ [WORKER LOG] Could not find email field at all");
				await sendToastLog(
					supabase,
					auditId,
					"❌ Login Failed",
					"Could not find the email/username field on Facebook login page.",
					"destructive",
				);
				await updateAudit(supabase, auditId, {
					status: "FAILED_UNKNOWN",
					error_message:
						"Could not find the email/username field on Facebook login page.",
				});
				return;
			}

			await sleep(1000);

			// ─── STEP 3: Find the password field ───
			const passwordSelectors = [
				'input[type="password"]',
				'input[placeholder*="Password"]',
				'input[name="pass"]',
				"input#pass",
				'input[autocomplete="current-password"]',
				'input[aria-label*="Password"]',
				'input[data-testid="password-input"]',
				'form[action*="login"] input[type="password"]',
				'#login_form input[type="password"]',
			];

			for (const sel of passwordSelectors) {
				try {
					const input = page.locator(sel).first();
					if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
						console.log(`✅ [WORKER LOG] Found password field using: ${sel}`);
						await input.fill(authGroup.p);
						passwordFieldFound = true;
						break;
					}
				} catch (e) {
					// Continue
				}
			}

			if (!passwordFieldFound) {
				console.error("❌ [WORKER LOG] Could not find password field");
				await sendToastLog(
					supabase,
					auditId,
					"❌ Login Failed",
					"Could not find the password field on Facebook login page.",
					"destructive",
				);
				await updateAudit(supabase, auditId, {
					status: "FAILED_UNKNOWN",
					error_message:
						"Could not find the password field on Facebook login page.",
				});
				return;
			}

			await sleep(1000);

			// ─── STEP 4: Click Login ───
			console.log("🔑 [WORKER LOG] Credentials filled, clicking login...");
			await sendToastLog(
				supabase,
				auditId,
				"🔑 Submitting Credentials",
				"Filling credentials and submitting login form...",
			);

			const submitSelectors = [
				'button[type="submit"]',
				'button[name="login"]',
				'button[data-testid="royal_login_button"]',
				"#loginbutton",
				'button:has-text("Log in")',
				'button:has-text("Log In")',
				'input[type="submit"]',
				'form[action*="login"] button[type="submit"]',
			];

			let loginClicked = false;
			for (const sel of submitSelectors) {
				try {
					const button = page.locator(sel).first();
					if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
						console.log(`☝️ [WORKER LOG] Clicking login button via: ${sel}`);
						await Promise.all([
							page
								.waitForNavigation({ waitUntil: "networkidle", timeout: 30000 })
								.catch(() => {}),
							button.click(),
						]);
						loginClicked = true;
						break;
					}
				} catch (e) {
					// Continue
				}
			}

			if (!loginClicked) {
				console.warn("⚠️ [WORKER LOG] No login button found, pressing Enter...");
				await page.keyboard.press("Enter");
				await sleep(3000);
			}

			// ─── STEP 5: Wait for navigation / 2FA ───
			await sleep(5000);
			await page.waitForLoadState("networkidle").catch(() => {});

			const currentUrl = page.url();
			console.log(`📍 [WORKER LOG] After login URL: ${currentUrl}`);

			// ─── STEP 6: Check if we're on a 2FA page ───
			const is2FAPage =
				currentUrl.includes("/two_step_verification/") ||
				currentUrl.includes("/two_factor/") ||
				currentUrl.includes("two_step_verification") ||
				currentUrl.includes("checkpoint") ||
				currentUrl.includes("login/confirm");

			if (is2FAPage) {
				console.log("🔐 [WORKER LOG] Facebook 2FA/Passkey page detected");
				await sendToastLog(
					supabase,
					auditId,
					"🔐 2FA Required",
					"Facebook is requesting two-factor authentication...",
				);

				// Try to click "Try another way"
				const clicked = await clickTryAnotherWay(page);
				if (clicked) {
					await sendToastLog(
						supabase,
						auditId,
						"✅ Try Another Way Clicked",
						'Successfully clicked "Try another way". Please enter your verification code.',
					);
				}

				// Take screenshot
				const twoFaScreenshot = await captureScreenshot(
					supabase,
					page,
					auditId,
					"2fa-requested",
				);

				await updateAudit(supabase, auditId, {
					status: "NEEDS_VERIFICATION_CODE",
					screenshot_url: twoFaScreenshot || null,
					error_message: null,
				});

				// Let main 2FA handler take over
				formSubmitted = true;
				// Don't return - let the main flow handle 2FA
			} else {
				// ─── STEP 7: Check if login was successful and verify username ───
				console.log("🔍 [WORKER LOG] Checking if login was successful...");

				// Check if we're on the Facebook home page
				const isLoggedIn = await page
					.locator("text=/Home|Watch|Marketplace|Profile|News Feed/i")
					.isVisible({ timeout: 5000 })
					.catch(() => false);

				if (isLoggedIn) {
					console.log(
						"✅ [WORKER LOG] Facebook login successful (on home page)",
					);
					await sendToastLog(
						supabase,
						auditId,
						"✅ Login Successful",
						"Facebook login confirmed!",
						"success",
					);

					// Verify username if provided
					if (authGroup.facebookUsername) {
						await sendToastLog(
							supabase,
							auditId,
							"👤 Username Check",
							`Verifying Facebook username: ${authGroup.facebookUsername}`,
						);

						// Navigate to profile
						try {
							// Click on profile picture or name
							const profileClickSelectors = [
								'a[aria-label*="Profile"]',
								'a[href*="/profile.php"]',
								'a[href*="/me"]',
								'div[role="button"][aria-label*="profile"]',
								'[data-testid="profile_link"]',
								'img[alt*="profile" i]',
							];

							let profileClicked = false;
							for (const sel of profileClickSelectors) {
								try {
									const el = page.locator(sel).first();
									if (
										await el.isVisible({ timeout: 3000 }).catch(() => false)
									) {
										await el.click();
										profileClicked = true;
										await sleep(3000);
										break;
									}
								} catch (e) {}
							}

							if (!profileClicked) {
								// Fallback: go to /me
								await page
									.goto("https://www.facebook.com/me", {
										waitUntil: "networkidle",
									})
									.catch(() => {});
								await sleep(3000);
							}

							// Scrape the username
							const scrapedUsername = await page.evaluate(() => {
								const selectors = [
									'div[data-testid="profile_name"]',
									'h1[data-testid="profile_name"]',
									'span[data-testid="profile_name"]',
									'div[role="main"] h1',
									'span[class*="profile"] span',
									'div[class*="profile"] span',
								];

								for (const sel of selectors) {
									const el = document.querySelector(sel);
									if (el?.textContent) {
										const text = el.textContent.trim();
										if (text.length > 0 && text.length < 50) {
											return text;
										}
									}
								}

								// Try URL
								const url = window.location.href;
								const match = url.match(/facebook\.com\/([^/?]+)/);
								if (match && match[1] && !match[1].includes("home")) {
									return match[1];
								}

								return null;
							});

							console.log(
								`👤 [WORKER LOG] Scraped Facebook username: "${scrapedUsername}"`,
							);
							console.log(
								`👤 [WORKER LOG] Expected Facebook username: "${authGroup.facebookUsername}"`,
							);

							if (scrapedUsername) {
								const expected = authGroup.facebookUsername
									.toLowerCase()
									.trim();
								const actual = scrapedUsername.toLowerCase().trim();

								if (expected === actual) {
									console.log(
										"✅ [WORKER LOG] Facebook username match confirmed!",
									);
									await sendToastLog(
										supabase,
										auditId,
										"✅ Username Verified",
										`Successfully verified Facebook username: ${scrapedUsername}`,
										"success",
									);
								} else {
									console.log(
										`❌ [WORKER LOG] Facebook username mismatch. Expected: ${expected}, Actual: ${actual}`,
									);
									await sendToastLog(
										supabase,
										auditId,
										"❌ Username Mismatch",
										`Expected "${expected}" but found "${actual}". The account might not exist or you entered the wrong username.`,
										"destructive",
									);
									await updateAudit(supabase, auditId, {
										status: "FAILED_BAD_CREDENTIALS",
										error_message: `Username mismatch. Expected "${expected}" but got "${actual}".`,
									});
									return;
								}
							} else {
								console.log(
									"⚠️ [WORKER LOG] Could not scrape username from profile",
								);
								await sendToastLog(
									supabase,
									auditId,
									"⚠️ Username Not Found",
									"Could not scrape username from profile page.",
									"default",
								);
							}
						} catch (e) {
							console.warn("⚠️ [WORKER LOG] Username verification failed:", e);
						}
					}

					// Proceed to scraping
					await proceedToScraping(supabase, page, auditId, config, null);
					return;
				} else {
					// ─── STEP 8: Check for error messages ───
					const errorMsg = await extractPageMessage(page);
					if (errorMsg) {
						console.log(`💬 [WORKER LOG] Error message: ${errorMsg}`);
						await sendToastLog(
							supabase,
							auditId,
							"❌ Login Failed",
							errorMsg,
							"destructive",
						);
						await updateAudit(supabase, auditId, {
							status: "FAILED_BAD_CREDENTIALS",
							error_message: errorMsg,
						});
						return;
					}

					// ─── STEP 9: Unknown state ───
					console.log("⚠️ [WORKER LOG] Unknown Facebook login state");
					await sendToastLog(
						supabase,
						auditId,
						"⚠️ Unknown State",
						"Could not determine Facebook login state. Please check the screenshot.",
						"default",
					);
					await updateAudit(supabase, auditId, {
						status: "FAILED_UNKNOWN",
						error_message:
							"Could not determine login state. The page may have changed.",
					});
					return;
				}
			}

			// Mark as submitted
			formSubmitted = true;
		}

		// ─── TikTok Flow ────────────────────────────────────────
		else if (config.login_url.includes("tiktok.com")) {
			console.log(`🎵 [WORKER LOG] TikTok specialized flow...`);
			await sendToastLog(
				supabase,
				auditId,
				"🎵 TikTok Flow",
				"Using specialized TikTok login flow...",
			);

			await sleep(4000);

			const channelSelector =
				"text=/Use phone.*email.*username|Log in with email|Email or username/i";
			await page
				.waitForSelector(channelSelector, { timeout: 8000 })
				.catch(() => {});
			await page.click(channelSelector).catch(() => {});
			await sleep(2500);

			const usernameSelectors = [
				'input[name="username"]',
				'input[autocomplete="username"]',
				'input[placeholder*="Email"]',
				'input[placeholder*="Username"]',
				'input[type="text"]',
			];

			let usernameFilled = false;
			for (const sel of usernameSelectors) {
				try {
					await page.waitForSelector(sel, { timeout: 6000 });
					await page.locator(sel).first().fill(authGroup.u);
					usernameFilled = true;
					console.log(`✅ Filled username using: ${sel}`);
					break;
				} catch {}
			}
			if (!usernameFilled) {
				console.warn("⚠️ Could not find TikTok username input");
			}

			await sleep(1000);

			const passwordVisible = await page
				.locator('input[type="password"]')
				.first()
				.isVisible()
				.catch(() => false);

			if (passwordVisible) {
				console.log(
					`✅ Password field already visible on same page — filling both then submitting once.`,
				);
				await page.fill('input[type="password"]', authGroup.p);
				console.log(`✅ Filled password using: input[type="password"]`);
				await sleep(800);

				try {
					await page
						.click('button:has-text("Log in"), button[type="submit"]')
						.catch(() => {});
					formSubmitted = true;
				} catch (err) {
					console.error("Submit failed", err);
				}
			} else {
				console.log(
					`➡️ Password field not visible — clicking Next to proceed to password step.`,
				);
				await page
					.click(
						'button:has-text("Next"), button:has-text("Log in"), button[type="submit"]',
					)
					.catch(() => {});
				await sleep(3000);

				const passwordSelectors = [
					'input[type="password"]',
					'input[autocomplete="current-password"]',
					'input[placeholder*="Password"]',
				];

				let passwordFilled = false;
				for (const sel of passwordSelectors) {
					try {
						await retryWithBackoff(
							async () => {
								await page.waitForSelector(sel, { timeout: 8000 });
								await page.fill(sel, authGroup.p);
							},
							3,
							1000,
						);
						passwordFilled = true;
						console.log(`✅ Filled password using: ${sel}`);
						break;
					} catch {}
				}
				if (!passwordFilled) {
					console.warn("⚠️ Could not find TikTok password field");
				}

				await sleep(1500);
				try {
					await Promise.all([
						page
							.waitForNavigation({ waitUntil: "domcontentloaded" })
							.catch(() => {}),
						page.click('button:has-text("Log in"), button[type="submit"]'),
					]);
					formSubmitted = true;
				} catch (err) {
					console.error("Submit failed", err);
				}
			}
		}

		// ─── GENERIC SELECTOR PATH ─────────────────────────────
		else {
			console.log(
				`🔍 [WORKER LOG] Generic selectors for platform: ${config.id}`,
			);
			await sendToastLog(
				supabase,
				auditId,
				"🔍 Generic Flow",
				`Using generic selectors for ${config.id}...`,
			);

			await retryWithBackoff(
				async () => {
					await page.waitForSelector(config.username_selector, {
						state: "visible",
						timeout: 5000,
					});
					await page.fill(config.username_selector, authGroup.u);
				},
				3,
				1000,
			);
			await sleep(800);
			await page.fill(config.password_selector, authGroup.p);
			await sleep(800);
			try {
				await Promise.all([
					page
						.waitForNavigation({ waitUntil: "domcontentloaded" })
						.catch(() => {}),
					page.click(config.submit_selector).catch(() => {}),
				]);
				formSubmitted = true;
			} catch (err) {
				console.error("Submit failed", err);
			}
		}

		// Safety: only fire submit_selector if no platform-specific flow already submitted
		if (!formSubmitted) {
			console.log(`🔑 [WORKER LOG] Fallback submit via config selector...`);
			await page.click(config.submit_selector).catch(() => {});
		}

		// Wait for the platform to process the login
		await sleep(3500);

		// ─── Screenshot + message extraction ────────────────────
		const screenshotUrl = await captureScreenshot(
			supabase,
			page,
			auditId,
			"post-login",
		);
		const pageMessage = await extractPageMessage(page);

		// ─── STATE DETECTION ──────────────────────────────────
		console.log(`🔎 [WORKER LOG] Analyzing page state after login attempt...`);
		const outcome = await detectOutcome(page, config.login_url, pageMessage);
		console.log(`🎯 [WORKER LOG] Outcome: [${outcome}]`);

		// Store the screenshot URL regardless of outcome
		if (screenshotUrl) {
			await updateAudit(supabase, auditId, { screenshot_url: screenshotUrl });
		}

		if (outcome === "BAD_CREDS") {
			await sendToastLog(
				supabase,
				auditId,
				"❌ Invalid Credentials",
				pageMessage ||
					"Incorrect credentials. The platform rejected the login attempt.",
				"destructive",
			);
			await updateAudit(supabase, auditId, {
				status: "FAILED_BAD_CREDENTIALS",
				error_message:
					pageMessage ||
					"Incorrect credentials. The platform rejected the login attempt.",
			});
			return;
		}

		// ─── 2FA / VERIFICATION CODE HANDLING ─────────────────
		if (outcome === "NEEDS_VERIFICATION_CODE") {
			console.log(
				"⏳ [WORKER LOG] Platform requested verification code. Waiting for user input...",
			);
			await sendToastLog(
				supabase,
				auditId,
				"⏳ Waiting for 2FA",
				"Please enter your verification code in the UI below...",
			);

			// Take a screenshot of the 2FA page
			const twoFaScreenshot = await captureScreenshot(
				supabase,
				page,
				auditId,
				"2fa-requested",
			);

			await updateAudit(supabase, auditId, {
				status: "NEEDS_VERIFICATION_CODE",
				screenshot_url: twoFaScreenshot || screenshotUrl,
				error_message: null,
			});

			// ─── Wait for user to enter 2FA code ───
			let code: string | null = null;
			let attempts = 0;
			const maxAttempts = 60;

			while (attempts < maxAttempts) {
				attempts++;
				console.log(
					`⏳ [WORKER LOG] Waiting for 2FA code... (${attempts}/${maxAttempts})`,
				);

				const { data } = (await supabase
					.from("asset_audits")
					.select("two_fa_code")
					.eq("id", auditId)
					.single()) as unknown as {
					data: { two_fa_code: string | null } | null;
					error: unknown;
				};

				const row = data as { two_fa_code: string | null } | null;
				if (row?.two_fa_code?.trim()) {
					code = row.two_fa_code.trim();
					break;
				}

				// Check if we've been redirected (logged in via another method)
				const currentUrlNow = page.url();
				if (
					!currentUrlNow.includes("two_step") &&
					!currentUrlNow.includes("two_factor") &&
					!currentUrlNow.includes("checkpoint")
				) {
					console.log("🔀 [WORKER LOG] Page changed, checking if logged in...");

					const loggedIn = await page
						.locator("text=/Home|Watch|Marketplace|Profile/i")
						.isVisible({ timeout: 2000 })
						.catch(() => false);

					if (loggedIn) {
						console.log("✅ [WORKER LOG] User appears to be logged in!");
						await sendToastLog(
							supabase,
							auditId,
							"✅ Login Confirmed",
							"User successfully logged in via another method.",
							"success",
						);
						await proceedToScraping(
							supabase,
							page,
							auditId,
							config,
							screenshotUrl,
						);
						return;
					}
				}

				await sleep(5000);
			}

			if (!code) {
				console.log("⏰ [WORKER LOG] 2FA code not provided in time");
				await sendToastLog(
					supabase,
					auditId,
					"⏰ Timeout",
					"Verification code not provided in time.",
					"destructive",
				);
				await updateAudit(supabase, auditId, {
					status: "FAILED_TIMEOUT",
					error_message: "Verification code not provided in time by user.",
				});
				return;
			}

			console.log(`🔑 [WORKER LOG] Verification code received: ${code}`);
			await sendToastLog(
				supabase,
				auditId,
				"🔑 Code Received",
				"Verification code received. Submitting...",
			);

			// Enter the code
			const codeInputSelectors = [
				'input[autocomplete="one-time-code"]',
				'input[placeholder*="code" i]',
				'input[placeholder*="Code" i]',
				'input[type="text"][maxlength="6"]',
				'input[inputmode="numeric"]',
				'input[autocomplete="off"][type="text"]',
				'input[name="twofactor_code"]',
				"input#code",
				'input[data-testid="two-factor-code-input"]',
			];

			let codeEntered = false;
			for (const sel of codeInputSelectors) {
				try {
					const input = page.locator(sel).first();
					if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
						console.log(`🔑 [WORKER LOG] Filling code into: ${sel}`);
						await input.fill(code);
						codeEntered = true;
						break;
					}
				} catch (e) {}
			}

			if (!codeEntered) {
				console.error("❌ [WORKER LOG] Could not find code input field");
				await sendToastLog(
					supabase,
					auditId,
					"❌ Code Input Not Found",
					"Could not locate the 2FA code input field.",
					"destructive",
				);
				await updateAudit(supabase, auditId, {
					status: "FAILED_TIMEOUT",
					error_message: "Could not locate 2FA code input field.",
				});
				return;
			}

			await sleep(1000);

			// Submit the code
			const submitSelectors = [
				'button[type="submit"]',
				'button:has-text("Submit")',
				'button:has-text("Continue")',
				'button:has-text("Next")',
				'button:has-text("Verify")',
				'button:has-text("Confirm")',
				'button:has-text("Send")',
				'button[data-testid="two-factor-confirm-button"]',
			];

			let codeSubmitted = false;
			for (const sel of submitSelectors) {
				try {
					const button = page.locator(sel).first();
					if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
						console.log(`🔄 [WORKER LOG] Submitting code via: ${sel}`);
						await Promise.all([
							page
								.waitForNavigation({ waitUntil: "domcontentloaded" })
								.catch(() => {}),
							button.click(),
						]);
						codeSubmitted = true;
						break;
					}
				} catch (e) {}
			}

			if (!codeSubmitted) {
				console.warn(
					"⚠️ [WORKER LOG] Could not find submit button, trying Enter key...",
				);
				await page.keyboard.press("Enter").catch(() => {});
			}

			await sleep(5000);

			// Clear the code from DB
			await updateAudit(supabase, auditId, { two_fa_code: null });

			// ─── Facebook profile navigation (if needed) ───
			if (config.login_url.includes("facebook.com")) {
				console.log(
					`👤 [WORKER LOG] Navigating to user profile for scraping...`,
				);
				try {
					await page.waitForLoadState("networkidle").catch(() => {});

					const profileSelectors = [
						'div[role="button"][aria-label*="profile"]',
						'[aria-label*="Profile"]',
						'[data-testid="profile_link"]',
						'a[href*="/profile.php"]',
						'a[href*="/me"]',
						'svg[aria-label="Profile"]',
					];

					for (const sel of profileSelectors) {
						if (
							await page
								.locator(sel)
								.first()
								.isVisible({ timeout: 3000 })
								.catch(() => false)
						) {
							await page.click(sel).catch(() => {});
							break;
						}
					}

					if (!(await page.url().includes("/me"))) {
						await page
							.goto("https://www.facebook.com/me", {
								waitUntil: "domcontentloaded",
								timeout: 10000,
							})
							.catch(() => {});
					}

					await page.waitForLoadState("networkidle").catch(() => {});
					await sleep(2000);
				} catch (e) {
					console.warn("⚠️ Facebook profile navigation failed:", e);
				}
			}

			// ─── Check post-2FA outcome ───
			const post2faScreenshot = await captureScreenshot(
				supabase,
				page,
				auditId,
				"post-2fa",
			);
			const post2faMessage = await extractPageMessage(page);
			const post2faOutcome = await detectOutcome(
				page,
				config.login_url,
				post2faMessage,
			);

			console.log(`🎯 [WORKER LOG] Post-2FA outcome: [${post2faOutcome}]`);

			if (post2faScreenshot) {
				await updateAudit(supabase, auditId, {
					screenshot_url: post2faScreenshot,
				});
			}

			if (post2faOutcome === "BAD_CREDS") {
				await sendToastLog(
					supabase,
					auditId,
					"❌ Code Rejected",
					post2faMessage || "The verification code was rejected.",
					"destructive",
				);
				await updateAudit(supabase, auditId, {
					status: "FAILED_BAD_CREDENTIALS",
					error_message:
						post2faMessage || "The verification code was rejected.",
				});
				return;
			}

			if (post2faOutcome !== "SUCCESS") {
				await sendToastLog(
					supabase,
					auditId,
					"❌ Login Failed",
					post2faMessage || "Could not confirm login after verification code.",
					"destructive",
				);
				await updateAudit(supabase, auditId, {
					status: "FAILED_TIMEOUT",
					error_message:
						post2faMessage ||
						"Could not confirm login after verification code.",
				});
				return;
			}

			await proceedToScraping(
				supabase,
				page,
				auditId,
				config,
				post2faScreenshot,
			);
			return;
		}

		// ─── SUCCESS PATH ──────────────────────────────────────
		if (outcome === "SUCCESS") {
			await proceedToScraping(supabase, page, auditId, config, screenshotUrl);
		} else {
			await sendToastLog(
				supabase,
				auditId,
				"❌ Unknown State",
				pageMessage || "Unable to determine login status.",
				"destructive",
			);
			await updateAudit(supabase, auditId, {
				status: "FAILED_UNKNOWN",
				error_message: pageMessage || "Unable to determine login status.",
			});
			return;
		}
	} catch (error: any) {
		console.error("🚨 [WORKER CRITICAL CRASH]", error.message);
		await sendToastLog(
			supabase,
			auditId,
			"🚨 Worker Crash",
			error.message || "Critical error in verification worker.",
			"destructive",
		);
		try {
			const crashScreenshot = await captureScreenshot(
				supabase,
				page,
				auditId,
				"crash",
			);
			if (crashScreenshot) {
				await updateAudit(supabase, auditId, {
					screenshot_url: crashScreenshot,
				});
			}
		} catch {}
		await updateAudit(supabase, auditId, {
			status: "FAILED_TIMEOUT",
			error_message: error.message,
		});
	} finally {
		console.log("🔌 Worker closed.");
		await browser?.close();
	}
}
