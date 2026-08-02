"use client";

import Link from "next/link";
import React from "react";
import CyberPrankAnimation from "@/components/CyberPrankAnimation";
import DynamicFooter from "@/components/DynamicFooter";
import { Bell } from "lucide-react";
import { useNotificationContext } from "@/components/NotificationProvider";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { useTranslations } from "next-intl";

export default function primeboosterLanding() {
  const t = useTranslations("Landing");
  const { userId } = useAppSession();
  const { unreadCount } = useNotificationContext();

  return (
    <div className="min-h-screen bg-black text-white relative luxury-gradient">
      {/* Animated Glowing Background */}
      <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,rgba(234,179,8,0.08)_0%,transparent_50%)] animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(at_20%_70%,rgba(234,179,8,0.06)_0%,transparent_60%)] animate-pulse delay-700"></div>
      <div className="absolute inset-0 bg-[radial-gradient(at_80%_60%,rgba(234,179,8,0.05)_0%,transparent_55%)] animate-pulse delay-1000"></div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl text-amber-400 drop-shadow-md">
              <i className="fa-solid fa-rocket"></i>
            </div>
            <h1 className="heading-font text-2xl font-bold tracking-tighter">
              NuVora
            </h1>
          </div>

          <div className="flex items-center">
            <Link
              href={userId ? "/account" : "/login"}
              className="px-6 py-2.5 border border-amber-400/50 hover:border-amber-400 text-amber-400 hover:text-white font-medium rounded-full text-sm tracking-wider transition-all active:scale-95"
            >
              {userId ? t("account") : t("login")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-30 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Centered Hero */}
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tighter heading-font">
        
              {t("heroTitle")}
              <br />
            </h1>
          </div>

          {/* Notification Bell */}
          {userId && (
            <div className="absolute top-1/2 right-4 sm:right-6 -translate-y-1/2 z-[9999]">
              <Link
                href="/notification"
                aria-label="View notifications"
                className="group relative inline-block animate-[float_3.5s_ease-in-out_infinite]"
              >
                {/* Glow */}
                <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-xl group-hover:bg-amber-400/30 transition-all duration-300" />

                {/* Glass Card */}
                <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-amber-400/25 bg-zinc-950/85 backdrop-blur-xl shadow-[0_0_40px_rgba(251,191,36,0.12)] transition-all duration-300 group-hover:scale-105 sm:group-hover:scale-110 group-hover:border-amber-400/60">
                  <Bell className="h-6 w-6 text-zinc-300 group-hover:text-amber-400 transition-colors" />
                </div>

                {/* Live Pulse Badge */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 animate-ping opacity-60" />
                    <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 border-2 border-zinc-950 text-[10px] font-bold text-black">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Entry Panels - Upgraded Luxury Cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
          {/* Services - SMM Panel */}
          <Link href="/s/services" className="group">
            <div className="card-hover h-full rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/80 hover:border-amber-400/30 transition-all duration-500 backdrop-blur-xl">
              <div className="h-80 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center relative ">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#eab30815_0%,transparent_70%)]"></div>
                <i className="fa-solid fa-chart-line text-[160px] text-amber-400/10 group-hover:scale-110 transition-transform duration-700"></i>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl">📈🚀</div>
                </div>
              </div>
              <div className="p-10">
                <h3 className="heading-font text-4xl font-semibold mb-4 text-white">
                  {t("servicesTitle")}
                </h3>
                <p className="text-gray-400 text-[17px] leading-relaxed">
                  {t("servicesDesc")}
                </p>
                <div className="mt-8 inline-flex items-center text-amber-400 font-medium group-hover:gap-3 transition-all">
                  {t("servicesBtn")}
                  <span className="ml-2 text-xl transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </div>
          </Link>
          
          {/* Global Market */}
          <Link href="/m/global-market" className="group">
            <div className="card-hover h-full rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/80 hover:border-amber-400/30 transition-all duration-500 backdrop-blur-xl">
              <div className="h-80 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#eab30815_0%,transparent_70%)]"></div>
                <i className="fa-solid fa-globe text-[160px] text-amber-400/10 group-hover:scale-110 transition-transform duration-700"></i>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl">🌍🛒</div>
                </div>
              </div>
              <div className="p-10">
                <h3 className="heading-font text-4xl font-semibold mb-4 text-white">
                  {t("marketTitle")}
                </h3>
                <p className="text-gray-400 text-[17px] leading-relaxed">
                  {t("marketDesc")}
                </p>
                <div className="mt-8 inline-flex items-center text-amber-400 font-medium group-hover:gap-3 transition-all">
                  {t("marketBtn")}
                  <span className="ml-2 text-xl transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Tenant Web */}
          <Link href="/social-tenant" className="group">
            <div className="card-hover h-full rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/80 hover:border-amber-400/30 transition-all duration-500 backdrop-blur-xl">
              <div className="h-80 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#eab30815_0%,transparent_70%)]"></div>
                <i className="fa-solid fa-link text-[160px] text-amber-400/10 group-hover:scale-110 transition-transform duration-700"></i>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl">🔗📱</div>
                </div>
              </div>
              <div className="p-10">
                <h3 className="heading-font text-4xl font-semibold mb-4 text-white">
                  {t("tenantTitle")}
                </h3>
                <p className="text-gray-400 text-[17px] leading-relaxed">
                  {t("tenantDesc")}
                </p>
                <div className="mt-8 inline-flex items-center text-amber-400 font-medium group-hover:gap-3 transition-all">
                  {t("tenantBtn")}
                  <span className="ml-2 text-xl transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <DynamicFooter />
        </div>
      </footer>
    </div>
  );
}
