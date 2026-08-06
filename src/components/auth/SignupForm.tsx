"use client";

import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, LogIn, Mail, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";

type Mode = "signup" | "login";
type Step = "credentials" | "verify_otp";

export default function SignupForm() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signup");
  const [step, setStep] = useState<Step>("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Resend Cooldown Timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setStep("credentials");
    setOtp("");
    setError("");
    setMessage("");
  };

  // Restrict OTP input to numbers only
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 6) setOtp(value);
  };

  // =========================
  // EMAIL AUTH / SIGNUP INIT
  // =========================
  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const cleanEmail = email.trim();

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        setStep("verify_otp");
        setCooldown(60); // Start 60s cooldown
        setMessage("A 6-digit verification code has been sent to your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        router.push("/account");
        router.refresh();
      }
    } catch (err: any) {
      if (err.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "An unexpected authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // VERIFY OTP CODE
  // =========================
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
        email: email.trim(),
        token: otp.trim(),
        type: "signup",
      });

      if (error) throw error;

      if (data?.session) {
        setMessage("Account verified! Redirecting...");
        router.push("/account");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // RESEND OTP CODE
  // =========================
  async function handleResendCode() {
    if (cooldown > 0 || loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) throw error;

      setCooldown(60); // Reset timer
      setMessage("A new verification code has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // GOOGLE AUTH
  // =========================
  async function signInWithGoogle() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to initialize Google authentication.");
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-md">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />

      <div className="relative rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600">
            <Rocket className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white">Nu-vora</h1>
          <p className="text-sm text-purple-400 font-medium">Elite Platform</p>
          <p className="mt-3 text-zinc-400">
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
          /* Verification Code Form */
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
                onClick={() => setStep("credentials")}
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

        {/* Feedback Messages */}
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