// lib/services/email.service.ts

import { Resend } from "resend";

// ─── Initialize Resend ────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Types ────────────────────────────────────────────────────────
export interface EmailOptions {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
	from?: string;
	replyTo?: string;
	cc?: string | string[];
	bcc?: string | string[];
	attachments?: {
		filename: string;
		content?: string | Buffer;
		path?: string;
	}[];
}

export interface EmailResponse {
	success: boolean;
	id?: string;
	error?: string;
}

// ─── Default "From" Address ──────────────────────────────────────
const DEFAULT_FROM =
	process.env.RESEND_FROM_EMAIL || "noreply@nu-vora.com";

// ─── Main Email Sending Function ────────────────────────────────
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
	try {
		const {
			to,
			subject,
			html,
			text,
			from = DEFAULT_FROM,
			replyTo,
			cc,
			bcc,
			attachments,
		} = options;

		// ─── Validation ──────────────────────────────────────────────
		if (!to || (Array.isArray(to) && to.length === 0)) {
			return { success: false, error: "Recipient email is required" };
		}

		if (!subject) {
			return { success: false, error: "Email subject is required" };
		}

		if (!html && !text) {
			return {
				success: false,
				error: "Email content (html or text) is required",
			};
		}

		// ─── Send Email ──────────────────────────────────────────────
		const { data, error } = await resend.emails.send({
			from,
			to: Array.isArray(to) ? to : [to],
			subject,
			html,
			text: text || undefined,
			replyTo: replyTo ? [replyTo] : undefined,
			cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
			bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
			attachments: attachments?.map((att) => ({
				filename: att.filename,
				content: att.content,
				path: att.path,
			})),
		});

		if (error) {
			console.error("Resend email error:", error);
			return { success: false, error: error.message };
		}

		return { success: true, id: data?.id };
	} catch (error: any) {
		console.error("Email service error:", error);
		return { success: false, error: error.message || "Failed to send email" };
	}
}

// ─── Template: Contact Form Submission (Site Owner) ─────────────
export function buildSiteOwnerContactEmail(params: {
	siteName: string;
	visitorName: string;
	visitorEmail: string;
	subject: string;
	message: string;
	siteId?: string;
}): EmailOptions {
	const { siteName, visitorName, visitorEmail, subject, message, siteId } =
		params;

	const siteUrl = siteId
		? `https://nu-vora.com/st/settings/${siteId}`
		: "#";

	return {
		to: "", // Will be filled by caller
		subject: `📩 New Contact Form Message from ${visitorName} (${siteName})`,
		html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .message-box { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; }
          .footer { margin-top: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 16px; }
          .label { font-weight: 600; color: #111827; }
          .button { display: inline-block; background: #10b981; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📩 New Contact Form Submission</h1>
            <p style="margin: 4px 0 0; opacity: 0.8;">${siteName}</p>
          </div>
          <div class="content">
            <p><strong>From:</strong> ${visitorName}</p>
            <p><strong>Email:</strong> <a href="mailto:${visitorEmail}">${visitorEmail}</a></p>
            <p><strong>Subject:</strong> ${subject || "No subject"}</p>
            <p><strong>Message:</strong></p>
            <div class="message-box">
              ${message.replace(/\n/g, "<br>")}
            </div>
            <p style="margin-top: 16px;">
              <a href="mailto:${visitorEmail}" class="button">Reply to ${visitorName}</a>
            </p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
              💡 <a href="${siteUrl}">View all messages</a> in your dashboard.
            </p>
          </div>
          <div class="footer">
            <p>This message came from your website: <strong>${siteName}</strong></p>
            <p>Nu-vora | Elite Home — <a href="https://nu-vora.com">nu-vora.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `
      New Contact Form Submission

      From: ${visitorName}
      Email: ${visitorEmail}
      Subject: ${subject || "No subject"}

      Message:
      ${message}

      ---
      This message came from your website: ${siteName}
      Nu-vora | Elite Home
    `,
	};
}

// ─── Template: Visitor Confirmation Email ──────────────────────
export function buildVisitorConfirmationEmail(params: {
	siteName: string;
	visitorName: string;
	message: string;
}): EmailOptions {
	const { siteName, visitorName, message } = params;

	return {
		to: "", // Will be filled by caller
		subject: `✅ We've received your message from ${siteName}`,
		html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .message-box { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; }
          .footer { margin-top: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ We've Received Your Message</h1>
            <p style="margin: 4px 0 0; opacity: 0.8;">${siteName}</p>
          </div>
          <div class="content">
            <p>Hi <strong>${visitorName}</strong>,</p>
            <p>Thank you for reaching out to <strong>${siteName}</strong>. We've received your message and will get back to you shortly.</p>
            <p><strong>Your message:</strong></p>
            <div class="message-box">
              ${message.replace(/\n/g, "<br>")}
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
              💡 This is an automated confirmation. Please don't reply to this email.
            </p>
          </div>
          <div class="footer">
            <p>Nu-vora | Elite Home — <a href="https://nu-vora.com">nu-vora.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `
      We've Received Your Message

      Hi ${visitorName},

      Thank you for reaching out to ${siteName}. We've received your message and will get back to you shortly.

      Your message:
      ${message}

      ---
      This is an automated confirmation. Please don't reply to this email.
      Nu-vora | Elite Home
    `,
	};
}

// ─── Template: Welcome Email (New User) ────────────────────────
export function buildWelcomeEmail(params: {
	username: string;
	displayName?: string;
}): EmailOptions {
	const { username, displayName } = params;
	const name = displayName || username;

	return {
		to: "", // Will be filled by caller
		subject: "🎉 Welcome to Nu-vora | Elite Home!",
		html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
          .footer { margin-top: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 Welcome, ${name}!</h1>
          </div>
          <div class="content">
            <p>Welcome to <strong>Nu-vora | Elite Home</strong>! 🚀</p>
            <p>You're now part of a premium digital ecosystem where you can:</p>
            <ul>
              <li>🌍 Build stunning websites with AI</li>
              <li>📱 Grow your brand with social media tools</li>
              <li>🛍️ Sell products and services</li>
              <li>💰 Manage your wallet and payments</li>
            </ul>
            <p style="text-align: center; margin-top: 24px;">
              <a href="https://nu-vora.com/st" class="cta-button">Start Building Now →</a>
            </p>
          </div>
          <div class="footer">
            <p>Nu-vora | Elite Home — <a href="https://nu-vora.com">nu-vora.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `
      Welcome, ${name}!

      Welcome to Nu-vora | Elite Home! 🚀

      You're now part of a premium digital ecosystem where you can:
      - Build stunning websites with AI
      - Grow your brand with social media tools
      - Sell products and services
      - Manage your wallet and payments

      Get started: https://nu-vora.com/st
    `,
	};
}

// ─── Template: Build Confirmation Email ────────────────────────
export function buildBuildConfirmationEmail(params: {
	username: string;
	siteName: string;
	siteSlug: string;
}): EmailOptions {
	const { username, siteName, siteSlug } = params;

	return {
		to: "", // Will be filled by caller
		subject: `🚀 Your website "${siteName}" is live!`,
		html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
          .footer { margin-top: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🚀 Your Website is Live!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            <p>Your website <strong>"${siteName}"</strong> has been successfully built and published! 🎉</p>
            <p style="text-align: center; margin-top: 16px;">
              <a href="https://nu-vora.com/s/${siteSlug}" class="cta-button">View Your Website →</a>
            </p>
            <p style="font-size: 14px; color: #6b7280;">
              💡 You can edit your website anytime from your dashboard.
            </p>
            <p style="font-size: 14px; color: #6b7280;">
              🔗 Share your link: <strong>nu-vora.com/s/${siteSlug}</strong>
            </p>
          </div>
          <div class="footer">
            <p>Nu-vora | Elite Home — <a href="https://nu-vora.com">nu-vora.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `
      Your Website is Live!

      Hi ${username},

      Your website "${siteName}" has been successfully built and published! 🎉

      View it: https://nu-vora.com/s/${siteSlug}

      Share your link: nu-vora.com/s/${siteSlug}

      You can edit your website anytime from your dashboard.
    `,
	};
}

// ─── Template: Session Expiring Soon ────────────────────────────
export function buildSessionExpiringEmail(params: {
	username: string;
	siteName: string;
	siteId: string;
	expiresInHours: number;
}): EmailOptions {
	const { username, siteName, siteId, expiresInHours } = params;

	return {
		to: "", // Will be filled by caller
		subject: `⏰ Your session for "${siteName}" is expiring soon`,
		html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
          .footer { margin-top: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⏰ Session Expiring Soon</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            <p>Your editing session for <strong>"${siteName}"</strong> will expire in <strong>${expiresInHours} hours</strong>.</p>
            <p>During an active session, you can make unlimited free edits to your website using our AI assistant.</p>
            <p>After the session expires, you'll need to start a new build to use the AI editor again.</p>
            <p style="text-align: center; margin-top: 16px;">
              <a href="https://nu-vora.com/st/builder/${siteId}" class="cta-button">Continue Editing →</a>
            </p>
          </div>
          <div class="footer">
            <p>Nu-vora | Elite Home — <a href="https://nu-vora.com">nu-vora.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `
      Session Expiring Soon

      Hi ${username},

      Your editing session for "${siteName}" will expire in ${expiresInHours} hours.

      During an active session, you can make unlimited free edits to your website using our AI assistant.

      Continue editing: https://nu-vora.com/st/builder/${siteId}
    `,
	};
}
