// public/global-script.js

/**
 * Prime Boostage | Elite Home - Global Site Script
 * This script is injected into every generated website for interactivity
 */

(() => {
	// ─── Configuration ──────────────────────────────────────────
	const CONFIG = {
		PLATFORM_NAME: "Prime Boostage",
		PLATFORM_URL: "https://primeboostage.com",
		CONTACT_API: "/api/st/contact",
		ATTRACTION_ENABLED: true,
	};

	// ─── DOM Ready Check ────────────────────────────────────────
	function domReady() {
		return new Promise((resolve) => {
			if (document.readyState === "loading") {
				document.addEventListener("DOMContentLoaded", resolve);
			} else {
				resolve();
			}
		});
	}

	// ─── Initialize Platform Features ───────────────────────────
	async function initPlatform() {
		await domReady();

		// 1. Add platform attribution
		addAttribution();

		// 2. Handle contact forms
		setupContactForms();

		// 3. Track page views
		trackPageView();

		// 4. Initialize interactive elements
		initInteractions();

		// 5. Setup smooth scrolling
		setupSmoothScroll();

		console.log(`🚀 ${CONFIG.PLATFORM_NAME} | Elite Home — Site initialized`);
	}

	// ─── Add Attribution ────────────────────────────────────────
	function addAttribution() {
		if (!CONFIG.ATTRACTION_ENABLED) return;

		// Check if attribution already exists
		if (document.querySelector(".prime-boostage-attribution")) return;

		const footer = document.querySelector("footer");
		if (footer) {
			const attribution = document.createElement("div");
			attribution.className = "prime-boostage-attribution";
			attribution.style.cssText = `
        text-align: center;
        padding: 12px 16px;
        font-size: 12px;
        color: #71717a;
        border-top: 1px solid rgba(255,255,255,0.05);
        margin-top: 20px;
      `;
			attribution.innerHTML = `
        Built with ❤️ on 
        <a href="${CONFIG.PLATFORM_URL}" 
           target="_blank" 
           rel="noopener noreferrer" 
           style="color: #10b981; text-decoration: none; font-weight: 500;">
          ${CONFIG.PLATFORM_NAME}
        </a>
      `;
			footer.appendChild(attribution);
		}
	}

	// ─── Setup Contact Forms ────────────────────────────────────
	function setupContactForms() {
		const forms = document.querySelectorAll('form[data-form="contact"]');

		forms.forEach((form) => {
			// Remove existing listener to prevent duplicates
			form.removeEventListener("submit", handleContactSubmit);
			form.addEventListener("submit", handleContactSubmit);
		});
	}

	async function handleContactSubmit(e) {
		e.preventDefault();
		const form = e.target;
		const submitBtn = form.querySelector('button[type="submit"]');
		const originalText = submitBtn?.textContent || "Submit";

		try {
			// Show loading state
			if (submitBtn) {
				submitBtn.textContent = "Sending...";
				submitBtn.disabled = true;
			}

			const formData = new FormData(form);
			const data = Object.fromEntries(formData.entries());

			const response = await fetch(CONFIG.CONTACT_API, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (response.ok) {
				showToast("✅ Message sent successfully!", "success");
				form.reset();
			} else {
				showToast(`❌ ${result.error || "Failed to send message"}`, "error");
			}
		} catch (error) {
			console.error("Contact form error:", error);
			showToast("❌ Failed to send message. Please try again.", "error");
		} finally {
			if (submitBtn) {
				submitBtn.textContent = originalText;
				submitBtn.disabled = false;
			}
		}
	}

	// ─── Track Page Views ──────────────────────────────────────
	function trackPageView() {
		// Simple page view tracking
		if (typeof window !== "undefined" && window.location) {
			const data = {
				page: window.location.pathname,
				referrer: document.referrer,
				timestamp: new Date().toISOString(),
			};

			// Send to analytics (if configured)
			// This is a placeholder - you can integrate with Google Analytics or your own analytics

			// Check for Google Analytics
			if (typeof gtag !== "undefined") {
				gtag("event", "page_view", {
					page_title: document.title,
					page_location: window.location.href,
				});
			}
		}
	}

	// ─── Initialize Interactive Elements ───────────────────────
	function initInteractions() {
		// Smooth scroll for anchor links
		document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
			anchor.addEventListener("click", function (e) {
				const target = document.querySelector(this.getAttribute("href"));
				if (target) {
					e.preventDefault();
					target.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			});
		});

		// Mobile menu toggle (if present)
		const menuToggle = document.querySelector("[data-menu-toggle]");
		const menuNav = document.querySelector("[data-menu-nav]");
		if (menuToggle && menuNav) {
			menuToggle.addEventListener("click", () => {
				const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
				menuToggle.setAttribute("aria-expanded", !isExpanded);
				menuNav.classList.toggle("open");
			});
		}

		// Lazy load images
		document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
			if ("loading" in HTMLImageElement.prototype) {
				img.loading = "lazy";
			}
		});
	}

	// ─── Setup Smooth Scrolling ─────────────────────────────────
	function setupSmoothScroll() {
		// Enable smooth scrolling for all anchor links
		document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
			anchor.addEventListener("click", function (e) {
				const targetId = this.getAttribute("href");
				if (targetId === "#") return;

				const target = document.querySelector(targetId);
				if (target) {
					e.preventDefault();
					target.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			});
		});
	}

	// ─── Toast Notification System ─────────────────────────────
	function showToast(message, type = "info") {
		const existing = document.querySelector(".prime-boostage-toast");
		if (existing) existing.remove();

		const toast = document.createElement("div");
		toast.className = "prime-boostage-toast";

		const colors = {
			success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
			error: "bg-red-500/10 border-red-500/20 text-red-400",
			info: "bg-sky-500/10 border-sky-500/20 text-sky-400",
		};

		toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      z-index: 9999;
      max-width: 90%;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      border: 1px solid;
      transition: all 0.3s ease;
      animation: slideUp 0.3s ease;
      ${colors[type] || colors.info}
    `;

		toast.textContent = message;

		// Add animation keyframes
		const style = document.createElement("style");
		style.textContent = `
      @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
      }
    `;
		document.head.appendChild(style);

		document.body.appendChild(toast);

		// Auto-remove after 4 seconds
		setTimeout(() => {
			toast.style.animation = "fadeOut 0.3s ease forwards";
			setTimeout(() => {
				toast.remove();
				style.remove();
			}, 300);
		}, 4000);
	}

	// ─── Expose Public API ──────────────────────────────────────
	window.PrimeBoostage = {
		CONFIG,
		showToast,
		trackPageView,
		initPlatform,
	};

	// ─── Initialize on DOM Ready ──────────────────────────────
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initPlatform);
	} else {
		initPlatform();
	}

	console.log(`✅ ${CONFIG.PLATFORM_NAME} | Elite Home — Global script loaded`);
})();
