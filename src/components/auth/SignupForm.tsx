"use client";

import { Eye, EyeOff, Lock, LogIn, Mail, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import supabase from "@/lib/supabase/client";

type Mode = "signup" | "login";

export default function SignupForm() {
	const router = useRouter();

	const [mode, setMode] = useState<Mode>("signup");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	// =========================
	// EMAIL AUTH
	// =========================
	async function handleEmailAuth(e: React.FormEvent) {
		e.preventDefault();

		setLoading(true);
		setError("");
		setMessage("");

		try {
			if (mode === "signup") {
				const { error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						emailRedirectTo: `${window.location.origin}/auth/callback`,
					},
				});

				if (error) throw error;

				setMessage(
					"Check your email inbox to verify your account before logging in.",
				);
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});

				if (error) throw error;

				router.push("/account");
				router.refresh();
			}
		} catch (err: any) {
			setError(err.message);
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
			setError(err.message);
			setLoading(false);
		}
	}

	return (
		<div className="relative mx-auto max-w-md">
			{/* Background Glow */}
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
						{mode === "signup"
							? "Create your account to get started"
							: "Access the ecosystem and manage your presence"}
					</p>
				</div>

				{/* Google Button */}
				<button
					onClick={signInWithGoogle}
					disabled={loading}
					className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 text-white transition hover:bg-zinc-800"
				>
					<LogIn className="h-5 w-5" />
					Continue with Google
				</button>

				{/* Divider */}
				<div className="flex items-center gap-4 my-6">
					<div className="h-px flex-1 bg-zinc-800" />
					<span className="text-xs text-zinc-500">OR</span>
					<div className="h-px flex-1 bg-zinc-800" />
				</div>

				{/* Email Form */}
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
								? "Creating account..."
								: "Logging in..."
							: mode === "signup"
								? "Create Account"
								: "Login"}
					</button>
				</form>

				{/* Mode Switch */}
				<div className="text-center text-sm mt-6">
					{mode === "signup" ? (
						<p className="text-zinc-400">
							Already have an account?{" "}
							<button
								onClick={() => setMode("login")}
								className="text-blue-600 font-medium hover:text-blue-500 transition"
							>
								Login
							</button>
						</p>
					) : (
						<p className="text-zinc-400">
							Don’t have an account?{" "}
							<button
								onClick={() => setMode("signup")}
								className="text-blue-600 font-medium hover:text-blue-500 transition"
							>
								Create account
							</button>
						</p>
					)}
				</div>

				{/* Feedback Messages */}
				{message && (
					<p className="text-green-500 text-sm text-center mt-4">{message}</p>
				)}
				{error && (
					<p className="text-red-500 text-sm text-center mt-4">{error}</p>
				)}
			</div>

			{/* Footer */}
			<div className="mt-8 text-center">
				<p className="text-xs text-zinc-500">
					Trusted by creators, agencies and brands
				</p>
				<p className="mt-1 text-sm text-zinc-300">
					Secure authentication powered by max-min
				</p>
			</div>
		</div>
	);
}
