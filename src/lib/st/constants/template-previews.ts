// lib/st/constants/template-previews.ts

// ─── SVG Preview Generators ──────────────────────────────────────

export function generateTemplatePreview(templateId: string): string {
	// Generate a beautiful SVG preview for each template
	const previews: Record<string, string> = {
		minimal: generateMinimalPreview(),
		"dark-luxe": generateDarkLuxePreview(),
		glass: generateGlassPreview(),
		gradient: generateGradientPreview(),
		bold: generateBoldPreview(),
		elegant: generateElegantPreview(),
		neon: generateNeonPreview(),
		nature: generateNaturePreview(),
		professional: generateProfessionalPreview(),
		playful: generatePlayfulPreview(),
	};

	return previews[templateId] || previews.minimal;
}

// ─── Preview Generators ──────────────────────────────────────────

function generateMinimalPreview(): string {
	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <rect width="300" height="400" fill="#ffffff"/>
      <circle cx="150" cy="100" r="40" fill="#e5e7eb" stroke="#10b981" stroke-width="2"/>
      <rect x="100" y="160" width="100" height="12" rx="6" fill="#111827"/>
      <rect x="120" y="180" width="60" height="8" rx="4" fill="#6b7280"/>
      <rect x="40" y="220" width="220" height="44" rx="22" fill="#f3f4f6" stroke="#e5e7eb"/>
      <rect x="40" y="280" width="220" height="44" rx="22" fill="#f3f4f6" stroke="#e5e7eb"/>
      <rect x="40" y="340" width="220" height="44" rx="22" fill="#10b981" opacity="0.2"/>
      <text x="150" y="398" text-anchor="middle" font-size="8" fill="#9ca3af">Built with ❤️ on Nu-vora</text>
    </svg>
  `;
}

function generateDarkLuxePreview(): string {
	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <defs>
        <linearGradient id="darkLuxeBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#111827"/>
          <stop offset="100%" stop-color="#000000"/>
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#darkLuxeBg)"/>
      <circle cx="150" cy="100" r="40" fill="#1f2937" stroke="#f59e0b" stroke-width="2"/>
      <rect x="100" y="160" width="100" height="12" rx="6" fill="#ffffff"/>
      <rect x="120" y="180" width="60" height="8" rx="4" fill="#9ca3af"/>
      <rect x="40" y="220" width="220" height="44" rx="22" fill="#1f2937" stroke="#f59e0b" stroke-width="1"/>
      <rect x="40" y="280" width="220" height="44" rx="22" fill="#1f2937" stroke="#f59e0b" stroke-width="1"/>
      <rect x="40" y="340" width="220" height="44" rx="22" fill="#f59e0b" opacity="0.3"/>
      <text x="150" y="398" text-anchor="middle" font-size="8" fill="#6b7280">Built with ❤️ on Nu-vora</text>
    </svg>
  `;
}

function generateGlassPreview(): string {
	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <defs>
        <linearGradient id="glassBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e0f2fe" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#f3e8ff" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#fce7f3" stop-opacity="0.3"/>
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#glassBg)"/>
      <rect x="20" y="20" width="260" height="360" rx="16" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)"/>
      <circle cx="150" cy="90" r="35" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <rect x="110" y="140" width="80" height="10" rx="5" fill="rgba(255,255,255,0.8)"/>
      <rect x="125" y="158" width="50" height="7" rx="3.5" fill="rgba(255,255,255,0.4)"/>
      <rect x="50" y="190" width="200" height="40" rx="20" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.1)"/>
      <rect x="50" y="245" width="200" height="40" rx="20" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.1)"/>
      <rect x="50" y="300" width="200" height="40" rx="20" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.1)"/>
      <text x="150" y="368" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.3)">Built with ❤️ on Nu-vora</text>
    </svg>
  `;
}

function generateGradientPreview(): string {
	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <defs>
        <linearGradient id="gradientBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ec4899"/>
          <stop offset="50%" stop-color="#8b5cf6"/>
          <stop offset="100%" stop-color="#6366f1"/>
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#gradientBg)"/>
      <circle cx="150" cy="100" r="40" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      <rect x="100" y="160" width="100" height="12" rx="6" fill="#ffffff"/>
      <rect x="120" y="180" width="60" height="8" rx="4" fill="rgba(255,255,255,0.6)"/>
      <rect x="40" y="220" width="220" height="44" rx="22" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)"/>
      <rect x="40" y="280" width="220" height="44" rx="22" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)"/>
      <rect x="40" y="340" width="220" height="44" rx="22" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.4)"/>
      <text x="150" y="398" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.4)">Built with ❤️ on Nu-vora</text>
    </svg>
  `;
}

function generateBoldPreview(): string {
	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <rect width="300" height="400" fill="#000000"/>
      <rect x="20" y="20" width="40" height="40" rx="8" fill="#10b981" opacity="0.2"/>
      <circle cx="150" cy="100" r="40" fill="#1a1a1a" stroke="#10b981" stroke-width="4"/>
      <rect x="90" y="160" width="120" height="14" rx="7" fill="#ffffff"/>
      <rect x="115" y="182" width="70" height="8" rx="4" fill="#6b7280"/>
      <rect x="40" y="220" width="220" height="48" rx="24" fill="#10b981"/>
      <rect x="40" y="280" width="220" height="48" rx="24" fill="#1a1a1a" stroke="#10b981" stroke-width="2"/>
      <rect x="40" y="340" width="220" height="48" rx="24" fill="#1a1a1a" stroke="#10b981" stroke-width="2"/>
      <text x="150" y="398" text-anchor="middle" font-size="8" fill="#3f3f46">Built with ❤️ on Nu-vora</text>
    </svg>
  `;
}

function generateElegantPreview(): string {
	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <defs>
        <linearGradient id="elegantBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff1f2"/>
          <stop offset="100%" stop-color="#fef3c7"/>
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#elegantBg)"/>
      <circle cx="150" cy="100" r="40" fill="#ffffff" stroke="#f43f5e" stroke-width="2"/>
      <rect x="95" y="160" width="110" height="12" rx="6" fill="#881337"/>
      <rect x="120" y="180" width="60" height="8" rx="4" fill="#9ca3af"/>
      <rect x="40" y="220" width="220" height="44" rx="22" fill="#ffffff" stroke="#fce7f3"/>
      <rect x="40" y="280" width="220" height="44" rx="22" fill="#ffffff" stroke="#fce7f3"/>
      <rect x="40" y="340" width="220" height="44" rx="22" fill="#f43f5e" opacity="0.1" stroke="#f43f5e" stroke-width="1"/>
      <text x="150" y="398" text-anchor="middle" font-size="8" fill="#9ca3af">Built with ❤️ on Nu-vora</text>
    </svg>
  `;
}

function generateNeonPreview(): string {
	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <rect width="300" height="400" fill="#000000"/>
      <rect x="20" y="20" width="260" height="360" rx="12" fill="#0a0a0a" stroke="#06b6d4" stroke-width="1"/>
      <circle cx="150" cy="90" r="35" fill="none" stroke="#06b6d4" stroke-width="2"/>
      <circle cx="150" cy="90" r="30" fill="#0a0a0a" stroke="#06b6d4" stroke-width="1" opacity="0.5"/>
      <rect x="110" y="140" width="80" height="10" rx="5" fill="#06b6d4"/>
      <rect x="125" y="158" width="50" height="6" rx="3" fill="#22d3ee"/>
      <rect x="40" y="190" width="220" height="40" rx="20" fill="none" stroke="#06b6d4" stroke-width="1.5"/>
      <rect x="40" y="245" width="220" height="40" rx="20" fill="none" stroke="#8b5cf6" stroke-width="1.5"/>
      <rect x="40" y="300" width="220" height="40" rx="20" fill="none" stroke="#ec4899" stroke-width="1.5"/>
      <text x="150" y="368" text-anchor="middle" font-size="8" fill="#3f3f46">Built with ❤️ on Nu-vora</text>
    </svg>
  `;
}

function generateNaturePreview(): string {
	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <defs>
        <linearGradient id="natureBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ecfdf5"/>
          <stop offset="100%" stop-color="#fef3c7"/>
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#natureBg)"/>
      <circle cx="150" cy="100" r="40" fill="#ffffff" stroke="#059669" stroke-width="2"/>
      <rect x="95" y="160" width="110" height="12" rx="6" fill="#064e3b"/>
      <rect x="120" y="180" width="60" height="8" rx="4" fill="#6b7280"/>
      <rect x="40" y="220" width="220" height="48" rx="24" fill="#ffffff" stroke="#a7f3d0"/>
      <rect x="40" y="280" width="220" height="48" rx="24" fill="#ffffff" stroke="#a7f3d0"/>
      <rect x="40" y="340" width="220" height="48" rx="24" fill="#059669" opacity="0.1" stroke="#059669" stroke-width="1"/>
      <text x="150" y="398" text-anchor="middle" font-size="8" fill="#9ca3af">Built with ❤️ on Nu-vora</text>
    </svg>
  `;
}

function generateProfessionalPreview(): string {
	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <rect width="300" height="400" fill="#f8fafc"/>
      <rect x="20" y="20" width="40" height="40" rx="8" fill="#2563eb" opacity="0.1"/>
      <circle cx="150" cy="100" r="40" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
      <rect x="95" y="160" width="110" height="12" rx="6" fill="#0f172a"/>
      <rect x="120" y="180" width="60" height="8" rx="4" fill="#64748b"/>
      <rect x="40" y="220" width="220" height="44" rx="22" fill="#2563eb"/>
      <rect x="40" y="280" width="220" height="44" rx="22" fill="#ffffff" stroke="#e2e8f0"/>
      <rect x="40" y="340" width="220" height="44" rx="22" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="150" y="398" text-anchor="middle" font-size="8" fill="#94a3b8">Built with ❤️ on Nu-vora</text>
    </svg>
  `;
}

function generatePlayfulPreview(): string {
	return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <defs>
        <linearGradient id="playfulBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef9c3"/>
          <stop offset="50%" stop-color="#fce7f3"/>
          <stop offset="100%" stop-color="#dbeafe"/>
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#playfulBg)"/>
      <circle cx="150" cy="100" r="40" fill="#ffffff" stroke="#f59e0b" stroke-width="3"/>
      <rect x="95" y="160" width="110" height="14" rx="7" fill="#1f2937"/>
      <rect x="120" y="182" width="60" height="8" rx="4" fill="#6b7280"/>
      <rect x="40" y="220" width="220" height="48" rx="24" fill="#fcd34d"/>
      <rect x="40" y="280" width="220" height="48" rx="24" fill="#f472b6"/>
      <rect x="40" y="340" width="220" height="48" rx="24" fill="#60a5fa"/>
      <text x="150" y="398" text-anchor="middle" font-size="8" fill="#9ca3af">Built with ❤️ on Nu-vora</text>
    </svg>
  `;
}
