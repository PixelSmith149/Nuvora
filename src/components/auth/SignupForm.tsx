// src/components/auth/SignupForm.tsx
"use client";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  Tag,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";

type Mode = "signup" | "login";
type Step = "credentials" | "verify_otp";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("signup");
  const [step, setStep] = useState<Step>("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Single-type referral state
  const [referralCode, setReferralCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Resend cooldown
  const [cooldown, setCooldown] = useState(0);

  // Initialize and sync referral code from URL search params & localStorage
  useEffect(() => {
    const urlRef = searchParams.get("ref");
    const storedRef = localStorage.getItem("pending_referral_code");

    if (urlRef) {
      const cleanUrlRef = urlRef.trim().toUpperCase();
      setReferralCode(cleanUrlRef);
      localStorage.setItem("pending_referral_code", cleanUrlRef);
    } else if (storedRef) {
      setReferralCode(storedRef.trim().toUpperCase());
    }
  }, [searchParams]);

  // Listen to auth state (session)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        router.push("/account");
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setStep("credentials");
    setOtp("");
    setError("");
    setMessage("");
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) setOtp(value);
  };

  // Helper to trigger backend referral tracking and credit the referrer after authentication
  // Helper to trigger backend referral tracking
async function executeReferralTracking() {
  const activeRef =
    referralCode.trim().toUpperCase() ||
    localStorage.getItem("pending_referral_code") ||
    "";

  if (!activeRef) return;

  try {
    const res = await fetch("/api/referral/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referralCode: activeRef,
        type: "publish", // default type for signup
      }),
    });

    if (res.ok) {
      localStorage.removeItem("pending_referral_code");
      // Also clear the cookie version if present
      document.cookie = "nu_referral=; path=/; max-age=0";
    } else {
      const data = await res.json();
      console.error("Referral tracking notice:", data.error);
    }
  } catch (err) {
    console.error("Failed to track referral:", err);
  }
}

  // =========================================================
  // EMAIL AUTH / SIGNUP
  // =========================================================
  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        // Persist active referral code to localStorage during OTP pending state
        if (referralCode.trim()) {
          localStorage.setItem(
            "pending_referral_code",
            referralCode.trim().toUpperCase()
          );
        }

        // Already registered + confirmed
        if (data.user?.email_confirmed_at) {
          setError("This email is already registered. Please log in instead.");
          setMode("login");
          return;
        }

        // Move to OTP step
        setStep("verify_otp");
        setCooldown(60);
        setMessage("A 6-digit verification code has been sent to your email.");
      } else {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        setMessage("Login successful! Redirecting...");
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected authentication error occurred.";

      if (msg.includes("Invalid login credentials")) {
        setError("Invalid email or password.");
      } else if (
        msg.includes("User already registered") ||
        msg.includes("already been registered")
      ) {
        setError("This email is already registered. Please log in.");
        setMode("login");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // VERIFY OTP
  // =========================================================
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: "signup",
      });

      if (error) throw error;

      if (data?.session) {
        // Process single-type referral reward/credit upon verified account creation
        await executeReferralTracking();

        setMessage("Account verified! Redirecting...");
        router.push("/account");
        router.refresh();
      } else {
        setError(
          "Verification succeeded but no session was created. Please try logging in."
        );
      }
    } catch (err: any) {
      setError(
        err?.message ||
          "Invalid or expired verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // RESEND OTP
  // =========================================================
  async function handleResendCode() {
    if (cooldown > 0 || loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      });

      if (error) throw error;

      setCooldown(60);
      setMessage("A new verification code has been sent to your email.");
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // GOOGLE AUTH
  // =========================================================
  async function signInWithGoogle() {
  setLoading(true);
  setError("");
  setMessage("");

  const activeRef = referralCode.trim().toUpperCase();
  if (activeRef) {
    localStorage.setItem("pending_referral_code", activeRef);
    // Also set the cookie for the callback
    document.cookie = `nu_referral=${JSON.stringify({
      code: activeRef,
      type: "publish",
    })}; path=/; max-age=2592000; SameSite=Lax`;
  }

  try {
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    if (activeRef) {
      callbackUrl.searchParams.set("ref", activeRef);
      callbackUrl.searchParams.set("type", "publish");
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) throw error;
  } catch (err: any) {
    setError(err?.message || "Failed to initialize Google authentication.");
    setLoading(false);
  }
}
  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="relative mx-auto max-w-md">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />

      <div className="relative rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-8 shadow-2xl">
        {/* Header */}
<div className="text-center mb-8">
  {/* Premium Logo with gradient ring */}
  <div className="mx-auto mb-6 flex items-center justify-center">
  <div className="relative flex h-25 w-25 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
    {/* Subtle ambient glow */}
    <div className="absolute -inset-4 -z-10 rounded-3xl bg-emerald-500/10 blur-2xl" />

    <img
      src="/favicon.ico"
      alt="Nu-vora"
      className="h-22 w-22 object-contain"
    />
  </div>
</div>

  <h1 className="text-3xl font-bold text-white tracking-tight">Nu-vora</h1>
  <p className="text-sm text-purple-400 font-medium mt-1">Elite Platform</p>
  <p className="mt-3 text-zinc-400 text-sm">
    {step === "verify_otp"
      ? `Enter the code sent to ${email}`
      : mode === "signup"
        ? "Create your account to get started"
        : "Access the ecosystem and manage your presence"}
  </p>
</div>

        {step === "credentials" ? (
          <>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              <LogIn className="h-5 w-5" />
              Continue with Google
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-xs text-zinc-500">OR</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 pl-11 pr-4 text-white outline-none transition focus:border-cyan-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 pl-11 pr-12 text-white outline-none transition focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Referral Code Field (Auto-populated from localStorage or URL) */}
              {mode === "signup" && (
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Referral Code (Optional)"
                    value={referralCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setReferralCode(val);
                      if (val) {
                        localStorage.setItem("pending_referral_code", val);
                      } else {
                        localStorage.removeItem("pending_referral_code");
                      }
                    }}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 pl-11 pr-4 text-white outline-none transition focus:border-cyan-500 font-mono text-sm uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 py-3 font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50"
              >
                {loading
                  ? mode === "signup"
                    ? "Sending code..."
                    : "Logging in..."
                  : mode === "signup"
                    ? "Create Account"
                    : "Login"}
              </button>
            </form>

            <div className="text-center text-sm mt-6">
              {mode === "signup" ? (
                <p className="text-zinc-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("login")}
                    className="text-blue-600 font-medium hover:text-blue-500 transition"
                  >
                    Login
                  </button>
                </p>
              ) : (
                <p className="text-zinc-400">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("signup")}
                    className="text-blue-600 font-medium hover:text-blue-500 transition"
                  >
                    Create account
                  </button>
                </p>
              )}
            </div>
          </>
        ) : (
          /* OTP Verification Step */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={handleOtpChange}
                autoFocus
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 pl-11 pr-4 text-white outline-none tracking-widest font-mono text-center text-lg transition focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 py-3 font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Complete Signup"}
            </button>

            <div className="flex items-center justify-between text-xs mt-4 px-1">
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
                className="flex items-center gap-1 text-zinc-400 hover:text-white transition"
              >
                <ArrowLeft className="h-3 w-3" /> Change Email
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading || cooldown > 0}
                className="text-cyan-400 font-medium hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
              </button>
            </div>
          </form>
        )}

        {/* Feedback */}
        {message && (
          <p className="text-green-500 text-sm text-center mt-4">{message}</p>
        )}
        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-zinc-500">
          Trusted by creators, agencies and brands
        </p>
        <p className="mt-1 text-sm text-zinc-300">
          Secure authentication powered by Nu-vora
        </p>
      </div>
    </div>
  );
}