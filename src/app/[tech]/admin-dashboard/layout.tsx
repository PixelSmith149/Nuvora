"use client";

import {
  Activity,
  Bell,
  ChevronDown,
  Layers,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  TrendingUp,
  Wallet,
  X,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound, usePathname, useRouter } from "next/navigation";
import { use, useState } from "react";
import { cn, initials } from "@/lib/utils";

// Fallback states
const dummyUser = { name: "Admin Operator", email: "root@elite-platforms.com" };
const theme = "dark";
const toggleTheme = () => {};

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tech: string }>;
}

export default function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { tech } = use(params);
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const SECRET_ADMIN_TOKEN =
    process.env.NEXT_PUBLIC_ADMIN_CAMOUFLAGE_TOKEN || "core-tech";

  if (tech !== SECRET_ADMIN_TOKEN) {
    return notFound();
  }

  // ────────────────────────────────────────────────
  // Clean paths that work on both:
  // - nu-vora.app/core-tech/...
  // - tech.nu-vora.app/...
  // ────────────────────────────────────────────────
  const navItems = [
    {
      to: `/admin-dashboard/provider-services`,
      label: "provider-services",
      icon: TrendingUp,
    },
    {
      to: `/admin-dashboard/orders`,
      label: "Order Ledger",
      icon: Layers,
    },
    {
      to: `/admin-dashboard/provider-analytics`,
      label: "Profit Analysis",
      icon: Wallet,
    },
    {
      to: `/admin-dashboard/providers`,
      label: "Providers",
      icon: Bell,
    },
    {
      to: `/admin-dashboard/services-catalog`,
      label: "Services Catalog",
      icon: Activity,
    },
    {
      to: `/admin-dashboard/usage-analytics`,
      label: "Usage analytics",
      icon: Activity,
    },
    {
      to: `/admin-dashboard/revenue-analytics`,
      label: "Revenue",
      icon: Wallet,
    },
    {
      to: `/admin-dashboard/providers-button`,
      label: "Import Button",
      icon: Activity,
    },
    {
      to: `/admin-dashboard/services-importer`,
      label: "services importer",
      icon: Activity,
    },
    {
      to: `/admin-dashboard/support`,
      label: "Live Support",
      icon: HelpCircle,
    },
  ];

  const handleSignOut = async () => {
    // Go back to the login page (relative)
    router.push(`/`);
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-200 antialiased selection:bg-red-500/20">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-white/[0.06] bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-zinc-200 lg:flex sticky top-0 h-screen">
        <SidebarContent
          navItems={navItems}
          pathname={pathname}
          onNavigate={() => {}}
          name={dummyUser.name}
          email={dummyUser.email}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-white/[0.08] bg-gradient-to-b from-zinc-950 to-black text-zinc-200 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex h-16 items-center justify-between px-5 border-b border-white/[0.04]">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl border border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SidebarContent
              navItems={navItems}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              name={dummyUser.name}
              email={dummyUser.email}
              onSignOut={handleSignOut}
              hideHeader
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-md px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-zinc-400 hover:text-white p-2 border border-white/[0.06] rounded-xl bg-white/[0.02]"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="lg:hidden">
              <Logo />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center text-zinc-400 hover:text-white border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition-all duration-200"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300"
              >
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-zinc-700 via-zinc-800 to-black text-zinc-200 text-[10px] font-bold flex items-center justify-center border border-white/[0.08]">
                  {initials(dummyUser.name)}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-zinc-300 tracking-wide uppercase">
                  {dummyUser.name.split(" ")[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-500" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-white/[0.08] bg-zinc-950 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent p-4 mb-1">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400 tracking-wider uppercase mb-2">
                        <ShieldCheck className="h-2.5 w-2.5" /> ROOT OVERRIDE
                      </div>
                      <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wide truncate">
                        {dummyUser.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono truncate mt-0.5">
                        {dummyUser.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        router.push(`/admin-dashboard/settings`);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] text-left transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]">
                        <Settings className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-zinc-200">
                          Terminal Options
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Configure global defaults
                        </span>
                      </div>
                    </button>

                    <div className="h-px bg-white/[0.06] my-1" />

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/5 text-left transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/10 bg-red-500/[0.02]">
                        <LogOut className="h-3.5 w-3.5 text-red-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-zinc-200">
                          Disconnect Session
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Close core access panel
                        </span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-950 to-black p-6 lg:p-8">
          <div className="max-w-6xl w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

/* ====================================
   BRANDING
==================================== */
function Logo() {
  return (
    <Link href="/admin-dashboard/provider-services" className="group block w-full">
      <div className="flex w-full items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 backdrop-blur-xl transition-all duration-300 group-hover:border-white/[0.12] group-hover:bg-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute -left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-black font-mono tracking-[0.15em] text-white uppercase pl-2">
              PRIME
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-red-400">
              ELITE
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ====================================
   SIDEBAR CONTENT
==================================== */
function SidebarContent({
  navItems,
  pathname,
  onNavigate,
  name,
  email,
  onSignOut,
  hideHeader,
}: any) {
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {!hideHeader && <Logo />}

        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

          <div className="flex items-center gap-2.5">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
                ELITE PROFILES LIVE
              </p>
              <p className="text-[9px] text-zinc-500 font-mono">
                Wholesale SMM Pipes Connected
              </p>
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
            Automated pricing margins are monitoring live wholesale catalogs.
            Retail updates sync instantly across target endpoints.
          </p>

          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          <Link
            href="/admin-dashboard/orders"
            onClick={onNavigate}
            className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] font-medium text-zinc-400 transition-all hover:border-red-500/20 hover:bg-white/[0.04] hover:text-white group"
          >
            <span>Monitor Live Orders</span>
            <Activity className="h-3.5 w-3.5 text-red-400 transform group-hover:scale-110 transition-transform" />
          </Link>
        </div>

        <nav className="space-y-1">
          {navItems.map((item: any) => {
            const active =
              pathname === item.to || pathname.startsWith(item.to + "/");

            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center overflow-hidden rounded-xl transition-all duration-300",
                  active
                    ? "bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    : "hover:bg-white/[0.03]",
                )}
              >
                {active && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.05] via-transparent to-transparent" />
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                  </>
                )}

                <div className="relative flex w-full items-center gap-3.5 px-4 py-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 border border-transparent",
                      active
                        ? "bg-red-500/10 text-red-400 border-red-500/10"
                        : "bg-white/[0.02] text-zinc-500 group-hover:text-white group-hover:bg-white/[0.04]",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>

                  <span
                    className={cn(
                      "text-xs font-semibold transition-colors uppercase tracking-wider",
                      active
                        ? "text-white"
                        : "text-zinc-400 group-hover:text-white",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-[10px] text-zinc-400 font-mono">
            {initials(name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs font-bold text-white uppercase tracking-wide">
                {name.split(" ")[0]}
              </p>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
            <p className="truncate text-[10px] font-mono text-zinc-600 mt-0.5">
              {email}
            </p>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="p-2 rounded-xl border border-white/[0.06] text-zinc-500 transition-colors hover:text-red-400 hover:border-red-500/10 hover:bg-red-500/[0.02]"
          title="Terminate Workspace Session"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}