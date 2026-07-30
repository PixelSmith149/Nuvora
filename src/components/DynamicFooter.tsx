import Link from "next/link";
import type React from "react";
import { Sparkles } from "lucide-react";

interface FooterLink {
  href: string;
  label: string;
}

const footerLinks: FooterLink[] = [
  { href: "/blog", label: "Blogs" },
  { href: "/support", label: "Support" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms-of-service", label: "Terms" },
];

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-32 overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">

        {/* Brand */}
        <div className="flex flex-col items-center">

          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <Sparkles className="h-6 w-6 text-emerald-400" />
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Nu-vora
          </h2>

          <p className="mt-3 max-w-lg text-center text-sm leading-7 text-zinc-500">
            Build beautiful websites, create storefronts, connect with customers,
            and grow your digital presence from one unified platform.
          </p>

        </div>

        {/* Navigation */}
        <nav
          aria-label="Footer Navigation"
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="
                rounded-full
                border
                border-white/5
                bg-white/[0.02]
                px-5
                py-2.5
                text-sm
                text-zinc-400
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-emerald-500/20
                hover:bg-emerald-500/10
                hover:text-white
              "
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-auto mt-16 h-px max-w-xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center gap-2">

          <span className="text-xs uppercase tracking-[0.35em] text-zinc-600">
            Crafted with precision
          </span>

          <p className="text-center text-sm text-zinc-500">
            Designed for creators, businesses and modern digital experiences.
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;