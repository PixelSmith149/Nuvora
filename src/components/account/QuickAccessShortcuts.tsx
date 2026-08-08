'use client';

import Link from 'next/link';
import {
  MessageCircle,
  LayoutTemplate,
  Link as LinkIcon,
  ShoppingBag,
  Store,
  LayoutDashboard,
  Globe,
  ArrowUpRight,
} from 'lucide-react';

interface Shortcut {
  label: string;
  href: string;
  icon: React.ElementType;

  accent: {
    color: string;
    glow: string;
    iconBg: string;
    iconColor: string;
    border: string;
  };
}

const QUICK_ACCESS_SHORTCUTS: Shortcut[] = [
  {
    label: 'Build Your Web',
    href: '/st',
    icon: LayoutDashboard,
    accent: {
      color: 'bg-blue-400',
      glow: 'bg-blue-500/[0.10]',
      iconBg: 'bg-blue-500/[0.09]',
      iconColor: 'text-blue-300',
      border: 'border-blue-400/20',
    },
  },

  {
    label: 'My Orders',
    href: '/s/orders',
    icon: ShoppingBag,
    accent: {
      color: 'bg-amber-400',
      glow: 'bg-amber-500/[0.10]',
      iconBg: 'bg-amber-500/[0.09]',
      iconColor: 'text-amber-300',
      border: 'border-amber-400/20',
    },
  },

  {
    label: 'Link in Bio',
    href: '/st/link-in-bio',
    icon: LinkIcon,
    accent: {
      color: 'bg-violet-400',
      glow: 'bg-violet-500/[0.10]',
      iconBg: 'bg-violet-500/[0.09]',
      iconColor: 'text-violet-300',
      border: 'border-violet-400/20',
    },
  },

  {
    label: 'Templates',
    href: '/social-tenant/t-a/templates',
    icon: LayoutTemplate,
    accent: {
      color: 'bg-rose-400',
      glow: 'bg-rose-500/[0.10]',
      iconBg: 'bg-rose-500/[0.09]',
      iconColor: 'text-rose-300',
      border: 'border-rose-400/20',
    },
  },

  {
    label: 'Public Gallery',
    href: '/social-tenant/t-a/public',
    icon: Globe,
    accent: {
      color: 'bg-cyan-400',
      glow: 'bg-cyan-500/[0.10]',
      iconBg: 'bg-cyan-500/[0.09]',
      iconColor: 'text-cyan-300',
      border: 'border-cyan-400/20',
    },
  },

  {
    label: 'Market Messages',
    href: '/m/[username]/chat',
    icon: MessageCircle,
    accent: {
      color: 'bg-emerald-400',
      glow: 'bg-emerald-500/[0.10]',
      iconBg: 'bg-emerald-500/[0.09]',
      iconColor: 'text-emerald-300',
      border: 'border-emerald-400/20',
    },
  },

  {
    label: 'Global Market',
    href: '/m/global-market',
    icon: Store,
    accent: {
      color: 'bg-indigo-400',
      glow: 'bg-indigo-500/[0.10]',
      iconBg: 'bg-indigo-500/[0.09]',
      iconColor: 'text-indigo-300',
      border: 'border-indigo-400/20',
    },
  },
];

interface QuickAccessShortcutsProps {
  username?: string;
}

export default function QuickAccessShortcuts({
  username,
}: QuickAccessShortcutsProps) {
  if (!username) return null;

  const shortcuts = QUICK_ACCESS_SHORTCUTS.map((shortcut) => ({
    ...shortcut,
    href: shortcut.href.includes('[username]')
      ? shortcut.href.replace('[username]', username)
      : shortcut.href,
  }));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {shortcuts.map((shortcut) => {
        const Icon = shortcut.icon;
        const { accent } = shortcut;

        return (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className={`
              group
              relative
              isolate
              min-h-[158px]
              overflow-hidden
              rounded-[22px]
              border
              ${accent.border}
              bg-[#090b0d]
              p-4
              shadow-[0_8px_30px_rgba(0,0,0,0.18)]
              transition-all
              duration-300
              ease-out

              hover:-translate-y-[3px]
              hover:border-white/[0.14]
              hover:bg-[#0c0f12]
              hover:shadow-[0_20px_45px_rgba(0,0,0,0.35)]

              active:translate-y-0
              active:scale-[0.985]
            `}
          >
            {/* ─────────────────────────────────────
                PRIMARY AMBIENT LIGHT
            ───────────────────────────────────── */}

            <div
              className={`
                pointer-events-none
                absolute
                -right-10
                -top-12
                h-32
                w-32
                rounded-full
                ${accent.glow}
                blur-[45px]
                transition-all
                duration-500
                group-hover:scale-150
                group-hover:opacity-100
              `}
            />

            {/* Secondary atmospheric light */}

            <div
              className={`
                pointer-events-none
                absolute
                -bottom-16
                -left-12
                h-28
                w-28
                rounded-full
                ${accent.glow}
                opacity-60
                blur-[40px]
                transition-all
                duration-500
                group-hover:scale-125
              `}
            />

            {/* ─────────────────────────────────────
                PREMIUM TOP REFLECTION
            ───────────────────────────────────── */}

            <div
              className={`
                pointer-events-none
                absolute
                inset-x-5
                top-0
                h-px
                ${accent.color}
                opacity-30
                blur-[1px]
                transition-all
                duration-500
                group-hover:opacity-80
              `}
            />

            {/* ─────────────────────────────────────
                CONTENT
            ───────────────────────────────────── */}

            <div className="relative flex h-full min-h-[126px] flex-col">
              {/* Icon / Arrow */}

              <div className="flex items-start justify-between">
                <div
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-[14px]
                    border
                    ${accent.border}
                    ${accent.iconBg}
                    ${accent.iconColor}
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                    transition-all
                    duration-300

                    group-hover:scale-[1.04]
                  `}
                >
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.7}
                  />
                </div>

                <div
                  className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/[0.07]
                    bg-white/[0.025]
                    text-zinc-600
                    opacity-70
                    transition-all
                    duration-300

                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                    group-hover:border-white/[0.12]
                    group-hover:text-zinc-300
                  `}
                >
                  <ArrowUpRight
                    className="h-[15px] w-[15px]"
                    strokeWidth={1.8}
                  />
                </div>
              </div>

              {/* Text */}

              <div className="mt-auto pt-7">
                <p
                  className="
                    text-[13px]
                    font-semibold
                    tracking-[-0.015em]
                    text-zinc-200
                    transition-colors
                    duration-300
                    group-hover:text-white
                  "
                >
                  {shortcut.label}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full
                      ${accent.color}
                      opacity-70
                      shadow-[0_0_8px_currentColor]
                      transition-all
                      duration-300
                      group-hover:scale-125
                      group-hover:opacity-100
                    `}
                  />

                  <span
                    className="
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-zinc-600
                      transition-colors
                      duration-300
                      group-hover:text-zinc-400
                    "
                  >
                    Explore
                  </span>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────
                BOTTOM ACCENT
            ───────────────────────────────────── */}

            <div
              className={`
                pointer-events-none
                absolute
                bottom-0
                left-1/2
                h-[2px]
                w-[55%]
                -translate-x-1/2
                ${accent.color}
                opacity-45
                blur-[0.5px]
                transition-all
                duration-500
                group-hover:w-[80%]
                group-hover:opacity-100
              `}
            />

            {/* Bottom glow */}

            <div
              className={`
                pointer-events-none
                absolute
                bottom-0
                left-1/2
                h-10
                w-[60%]
                -translate-x-1/2
                ${accent.glow}
                opacity-40
                blur-2xl
                transition-all
                duration-500
                group-hover:w-[85%]
                group-hover:opacity-100
              `}
            />
          </Link>
        );
      })}
    </div>
  );
}