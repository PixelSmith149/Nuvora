"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, Lock, LogIn, Mail, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
	const router = useRouter();

	const supabase = createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		setLoading(false);

		if (error) {
			setError(error.message);
			return;
		}

		router.push("/account");
		router.refresh();
	}

	async function handleGoogleLogin() {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});

		if (error) {
			setError(error.message);
		}
	}

	return (
		<div className="relative mx-auto max-w-md">
			{/* Background glow */}
			<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />

			<div className="relative rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-8 shadow-2xl">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600">
						<Rocket className="h-8 w-8 text-white" />
					</div>

					<h1 className="text-3xl font-bold text-white">Prime Boostage</h1>
					<p className="text-sm text-purple-400 font-medium">Elite Platform</p>
					<p className="mt-3 text-zinc-400">Welcome back to the ecosystem</p>
				</div>

				{/* Login Form */}
				<form onSubmit={handleLogin} className="space-y-4">
					{/* Email Field */}
					<div className="relative">
						<Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
						<input
							type="email"
							placeholder="Email address"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 pl-11 pr-4 text-white outline-none transition focus:border-cyan-500"
							required
						/>
					</div>

					{/* Password Field */}
					<div className="relative">
						<Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 pl-11 pr-12 text-white outline-none transition focus:border-purple-500"
							required
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

					{error && <p className="text-red-500 text-sm">{error}</p>}

					{/* Login Button */}
					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 py-3 font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50"
					>
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>

				{/* Divider */}
				<div className="flex items-center gap-4 my-6">
					<div className="h-px flex-1 bg-zinc-800" />
					<span className="text-xs text-zinc-500">OR</span>
					<div className="h-px flex-1 bg-zinc-800" />
				</div>

				{/* Google Login */}
				<button
					onClick={handleGoogleLogin}
					className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 text-white transition hover:bg-zinc-800"
				>
					<LogIn className="h-5 w-5" />
					Continue with Google
				</button>

				{/* Signup Link */}
				<div className="text-center text-sm mt-6">
					<p className="text-zinc-400">Don’t have an account?</p>
					<button
						onClick={() => router.push("/signup")}
						className="text-blue-600 font-medium hover:text-blue-500 transition"
					>
						Create account
					</button>
				</div>
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
