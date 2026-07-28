// app/api/st/contact/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/services/email.service";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { name, email, message, subject, siteId } = body;

		// ─── 1. Validation ─────────────────────────────────────
		if (!name || !email || !message) {
			return NextResponse.json(
				{ error: "Name, email, and message are required" },
				{ status: 400 },
			);
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Invalid email address" },
				{ status: 400 },
			);
		}

		const supabase = await createClient();

		// ─── 2. Get Site Owner ─────────────────────────────────
		let siteOwnerEmail: string | null = null;
		let siteName: string | null = null;

		if (siteId) {
			const { data: site } = await supabase
				.from("user_sites")
				.select("user_id, site_name")
				.eq("id", siteId)
				.single();

			if (site) {
				siteName = site.site_name;

				// Get the site owner's email
				const { data: profile } = await supabase
					.from("profiles")
					.select("email")
					.eq("id", site.user_id)
					.single();

				if (profile) {
					siteOwnerEmail = profile.email;
				}
			}
		}

		// ─── 3. Save to Database ──────────────────────────────
		const { data: submission, error: dbError } = await supabase
			.from("contact_submissions")
			.insert({
				site_id: siteId || null,
				site_name: siteName || null,
				visitor_name: name,
				visitor_email: email,
				subject: subject || "New Contact Form Message",
				message: message,
				status: "new",
				created_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (dbError) {
			console.error("Failed to save contact submission:", dbError);
			// Continue anyway — don't fail the request
		}

		// ─── 4. Send Email Notification to Site Owner ──────────
		if (siteOwnerEmail) {
			try {
				await sendEmail({
					to: siteOwnerEmail,
					from: "noreply@primeboostage.com",
					subject: `📩 New Contact Form Message from ${name} (${siteName || "Your Website"})`,
					html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || "No subject"}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f5f5f5; padding: 16px; border-radius: 8px;">
              ${message.replace(/\n/g, "<br>")}
            </p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This message came from your website: ${siteName || "Prime Boostage Site"}
            </p>
            <p style="color: #666; font-size: 12px;">
              View all submissions: <a href="https://primeboostage.com/dashboard/messages">
                primeboostage.com/dashboard/messages
              </a>
            </p>
          `,
					text: `
            New Contact Form Submission

            From: ${name}
            Email: ${email}
            Subject: ${subject || "No subject"}

            Message:
            ${message}

            This message came from your website: ${siteName || "Prime Boostage Site"}
          `,
				});
			} catch (emailError) {
				console.error("Failed to send email notification:", emailError);
				// Continue anyway — don't fail the request
			}
		}

		// ─── 5. Send Confirmation to Visitor ──────────────────
		try {
			await sendEmail({
				to: email,
				from: "noreply@primeboostage.com",
				subject: `✅ We've received your message from ${siteName || "Prime Boostage"}`,
				html: `
          <h2>Thank you for reaching out! 🙏</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you shortly.</p>
          <p><strong>Your message:</strong></p>
          <p style="background: #f5f5f5; padding: 16px; border-radius: 8px;">
            ${message.replace(/\n/g, "<br>")}
          </p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated confirmation from ${siteName || "Prime Boostage"}.
          </p>
        `,
				text: `
          Thank you for reaching out!

          Hi ${name},

          We've received your message and will get back to you shortly.

          Your message:
          ${message}

          This is an automated confirmation from ${siteName || "Prime Boostage"}.
        `,
			});
		} catch (emailError) {
			console.error("Failed to send visitor confirmation:", emailError);
			// Don't fail the request — visitor already submitted
		}

		return NextResponse.json({
			success: true,
			message: "Your message has been sent. We'll get back to you soon!",
			submission_id: submission?.id || null,
		});
	} catch (error: any) {
		console.error("Contact form error:", error);
		return NextResponse.json(
			{ error: "Failed to send message. Please try again." },
			{ status: 500 },
		);
	}
}
