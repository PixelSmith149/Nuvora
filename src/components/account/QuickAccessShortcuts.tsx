'use client';

import Link from 'next/link';
import { 
  MessageCircle, 
  LayoutTemplate, 
  Link as LinkIcon, 
  ShoppingBag, 
  Store, 
  LayoutDashboard, 
  Globe 
} from 'lucide-react';

interface Shortcut {
  label: string;
  href: string;
  icon: React.ElementType;
}

const QUICK_ACCESS_SHORTCUTS: Shortcut[] = [
  {
    label: 'Dashboard',
    href: '/st',
    icon: LayoutDashboard,
  },
  {
    label: 'My Orders',
    href: '/s/orders',
    icon: ShoppingBag,
  },
  {
    label: 'Link in Bio',
    href: '/st/link-in-bio',
    icon: LinkIcon,
  },
  {
    label: 'Templates',
    href: '/social-tenant/t-a/templates',
    icon: LayoutTemplate,
  },
  {
    label: 'Public Gallery',
    href: '/social-tenant/t-a/public',
    icon: Globe,
  },
  {
    label: 'Market messages',
    href: '/m/[username]/chat',
    icon: MessageCircle,
  },
  {
    label: 'Global Market',
    href: '/m/global-market',
    icon: Store,
  },
];

interface QuickAccessShortcutsProps {
  username?: string;
}

export default function QuickAccessShortcuts({ username }: QuickAccessShortcutsProps) {
  // ─── Skip rendering if username is missing ──────────────────────────
  // This prevents the dynamic href error
  if (!username) {
    return null;
  }

  const shortcuts = QUICK_ACCESS_SHORTCUTS.map((shortcut) => {
    if (shortcut.href.includes('[username]')) {
      return {
        ...shortcut,
        href: shortcut.href.replace('[username]', username),
      };
    }
    return shortcut;
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {shortcuts.map((shortcut) => {
        const Icon = shortcut.icon;

        return (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-white/5
              bg-gradient-to-b
              from-zinc-900/90
              to-black/90
              p-4
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-emerald-500/25
              hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]
              active:scale-[0.98]
            "
          >
            {/* Background Glow */}
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -top-12 right-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-white/5 blur-2xl" />
            </div>

            <div className="relative flex flex-col gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/5
                  bg-white/[0.03]
                  text-zinc-300
                  transition-all
                  duration-300
                  group-hover:border-emerald-400/20
                  group-hover:bg-emerald-500/10
                  group-hover:text-emerald-400
                "
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold tracking-tight text-zinc-100">
                  {shortcut.label}
                </p>

                <p className="text-xs text-zinc-500 transition-colors group-hover:text-zinc-400">
                  Open
                </p>
              </div>
            </div>

            <div
              className="
                absolute
                bottom-0
                left-0
                h-[2px]
                w-0
                bg-gradient-to-r
                from-emerald-400
                via-emerald-500
                to-cyan-400
                transition-all
                duration-500
                group-hover:w-full
              "
            />
          </Link>
        );
      })}
    </div>
  );
}