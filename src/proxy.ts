// src/proxy.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = request.nextUrl.clone();
  
  // ─── Referral Tracking Cookie ─────────────────────────────────
const refParam = url.searchParams.get("ref");
const typeParam = url.searchParams.get("type") || "publish";

if (refParam) {
  const payload = JSON.stringify({
    code: refParam.trim().toUpperCase(),
    type: typeParam,
  });

  response.cookies.set("nu_referral", payload, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });
}

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = url.pathname;
  const hostname = request.headers.get("host") || "";

  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  // ─── Platform domain ────────────────────────────────────────
  const platformDomain =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "nu-vora.app";
  const isLocalhost =
    hostname.includes("localhost") || hostname.includes("127.0.0.1");

  // ─── 1. Custom Domain Detection ─────────────────────────────
  if (platformDomain) {
    const isCustomDomain =
      !hostname.includes(platformDomain) && !isLocalhost;

    if (isCustomDomain) {
      const { data: site } = await supabase
        .from("user_sites")
        .select("html_code, site_slug, site_name, status, blueprint")
        .eq("blueprint->>custom_domain", hostname)
        .eq("status", "published")
        .single();

      if (site && site.html_code) {
        const forwardedProto = request.headers.get("x-forwarded-proto");
        const isHttps =
          forwardedProto?.startsWith("https") ||
          request.headers.get("x-forwarded-ssl") === "on";

        if (!isHttps && !isLocalhost) {
          const httpsUrl = new URL(request.url);
          httpsUrl.protocol = "https:";
          httpsUrl.port = "443";
          return NextResponse.redirect(httpsUrl, 301);
        }

        return new NextResponse(site.html_code, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "X-Served-By": "NuVora | Elite Platform",
            "X-Site-Id": site.site_slug || "unknown",
            "Cache-Control":
              "public, max-age=3600, stale-while-revalidate=86400",
            "Strict-Transport-Security":
              "max-age=31536000; includeSubDomains; preload",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
          },
        });
      }
    }
  }

  // ─── 2. Subdomain Detection (*.nu-vora.app) ─────────────────
  const isSubdomain =
    !isLocalhost &&
    hostname.endsWith(`.${platformDomain}`) &&
    hostname !== platformDomain &&
    hostname !== `www.${platformDomain}`;

  const isLocalSubdomain =
    isLocalhost &&
    (hostname.endsWith(".localhost") || hostname.includes(".localhost:"));

  if (isSubdomain || isLocalSubdomain) {
    let slug = "";

    if (isSubdomain) {
      slug = hostname.replace(`.${platformDomain}`, "").split(".")[0];
    } else {
      slug = hostname.split(".")[0];
    }

    if (slug === "tech") {
      const rewriteUrl = request.nextUrl.clone();

      if (pathname === "/" || pathname === "") {
        rewriteUrl.pathname = "/core-tech";
      } else {
        rewriteUrl.pathname = `/core-tech${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
      }

      return NextResponse.rewrite(rewriteUrl);
    }

    if (slug && slug !== "www" && slug !== "app" && slug !== "tech") {
      const { data: site } = await supabase
        .from("user_sites")
        .select("html_code, site_slug, site_name, status")
        .eq("site_slug", slug)
        .eq("status", "published")
        .single();

      if (site?.html_code) {
        const forwardedProto = request.headers.get("x-forwarded-proto");
        const isHttps =
          forwardedProto?.startsWith("https") ||
          request.headers.get("x-forwarded-ssl") === "on";

        if (!isHttps && !isLocalhost) {
          const httpsUrl = new URL(request.url);
          httpsUrl.protocol = "https:";
          httpsUrl.port = "443";
          return NextResponse.redirect(httpsUrl, 301);
        }

        return new NextResponse(site.html_code, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "X-Served-By": "NuVora | Elite Platform",
            "X-Site-Slug": site.site_slug || "unknown",
            "Cache-Control":
              "public, max-age=3600, stale-while-revalidate=86400",
            "Strict-Transport-Security":
              "max-age=31536000; includeSubDomains; preload",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
          },
        });
      }
    }
  }

  // ─── Regular middleware logic ───────────────────────────────
  const pathSegments = pathname.split("/").filter(Boolean);

  const isTechRoute =
    pathSegments[0] === "tech" ||
    pathSegments[0] === "core-tech" ||
    pathSegments.includes("tech") ||
    pathSegments.includes("core-tech");

  const extractedSlug = isTechRoute
    ? pathSegments[1] || "default"
    : pathSegments[0] || "default";

  const isGoingToAdmin = pathSegments.includes("admin-dashboard");

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/privacy-policy") ||
    pathname.startsWith("/terms-of-service") ||
    pathname.startsWith("/m/global-market") ||
    pathname.startsWith("/marketing-terms-of-service") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/st/domain/verify") ||
    pathname.startsWith("/api/st/domain/instructions") ||
    pathname.startsWith("/s/services") ||
    pathname.startsWith("/s/[siteId]") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/api/cron");

  if (!user && !isPublicRoute) {
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isGoingToAdmin) {
    const adminHandshakeCookie = request.cookies.get(
      "admin_portal_handshake_token",
    );
    const allowedEmailsEnv = process.env.ALLOWED_ADMIN_EMAILS || "";
    const adminWhiteList = allowedEmailsEnv
      .split(",")
      .map((email) => email.trim().toLowerCase());
    const userEmailNormalized = user.email?.toLowerCase() || "";

    const isNextDataFetch =
      request.headers.get("x-next-js-data") === "1" ||
      request.headers.get("rsc") === "1" ||
      pathname.includes("/_next/data");

    if (
      !adminWhiteList.includes(userEmailNormalized) ||
      !adminHandshakeCookie?.value
    ) {
      if (isNextDataFetch) {
        return new NextResponse(
          JSON.stringify({
            error: "Checkpoint handshake signature verification missing.",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      response.cookies.delete("admin_portal_handshake_token");

      const redirectPath = isTechRoute
        ? `/${pathSegments[0]}/${extractedSlug}`
        : `/${extractedSlug}`;

      url.pathname = redirectPath;
      url.searchParams.set("status", "handshake_failed_reauth_required");
      return NextResponse.redirect(url);
    }
  }

  const appLocked = request.cookies.get("app_locked")?.value === "1";
  const isLockExempt =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/account/2fa");

  if (user && appLocked && !isPublicRoute && !isLockExempt) {
    url.pathname = "/auth/passkey-challenge";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};