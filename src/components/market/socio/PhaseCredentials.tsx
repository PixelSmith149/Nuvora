"use client";

import { Eye, EyeOff, Layers, Radio, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/lib/supabase/client";

interface PlatformConfig {
  id: string;
  login_url: string;
  username_selector: string;
  password_selector: string;
  submit_selector: string;
}

interface PhaseCredentialsProps {
  userId: string;
  auditId: string;
  onStarted: (audit: any) => void;
  showToast: (props: any) => void;
}

function extractRawHandle(input: string): string {
  let clean = input.trim();
  const isEmail = clean.includes("@") && clean.includes(".") && !clean.includes("/");
  if (isEmail) return clean;

  if (clean.includes("/") || clean.includes("?")) {
    try {
      const url = clean.startsWith("http") ? clean : `https://${clean}`;
      const parsed = new URL(url);
      const segments = parsed.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1] || "";
      if (last) clean = last;
    } catch {
      const match = clean.match(/(?:@|\/)?([a-zA-Z0-9_.]+)(?:\?|$)/);
      if (match?.[1]) clean = match[1];
    }
  }

  clean = clean.replace(/^@/, "").split("?")[0].trim();
  return clean.length >= 2 ? clean : input;
}

export function PhaseCredentials({
  userId,
  auditId,
  onStarted,
  showToast,
}: PhaseCredentialsProps) {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [facebookUsername, setFacebookUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFacebook =
    selectedPlatformId === "facebook" ||
    selectedPlatformId === "facebook_com" ||
    selectedPlatformId.includes("facebook");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("platform_configurations")
        .select("id, login_url, username_selector, password_selector, submit_selector")
        .in("id", ["facebook", "tiktok", "instagram", "facebook_com"])
        .order("id");

      if (error) {
        setError(`Failed to load platforms: ${error.message}`);
        return;
      }

      if (data?.length) {
        setPlatforms(data);
        setSelectedPlatformId(data[0].id);
      }
    }
    load();
  }, []);

  const start = async () => {
    if (!username || !password || !selectedPlatformId) {
      showToast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill username, password and select a platform.",
      });
      return;
    }

    if (isFacebook && !facebookUsername.trim()) {
      showToast({
        variant: "destructive",
        title: "Validation Error",
        description: "Facebook requires your profile username for verification.",
      });
      return;
    }

    setLoading(true);
    setError(null);

    const cleanUsername = extractRawHandle(username);
    const cleanFacebookUsername = isFacebook
      ? extractRawHandle(facebookUsername)
      : "";

    if (cleanUsername.length < 2) {
      setLoading(false);
      showToast({
        variant: "destructive",
        title: "Invalid Handle",
        description: "Could not extract a valid username/handle.",
      });
      return;
    }

    try {
      // Upsert audit row
      const { data, error: dbError } = await supabase
        .from("asset_audits")
        .upsert(
          {
            id: auditId,
            user_id: userId,
            platform_name: selectedPlatformId,
            target_username: cleanUsername,
            account_password: password,
            status: "PENDING",
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);

      onStarted(data);

      // Call API
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("Session expired. Please re-login.");

      const res = await fetch("/api/market-place/verify-socio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          auditId,
          platformId: selectedPlatformId,
          username: cleanUsername,
          password,
          facebookUsername: cleanFacebookUsername,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Worker failed to start");
      }

      showToast({
        title: "🚀 Engine Started",
        description: `Connecting to ${selectedPlatformId.replace(/_/g, " ").toUpperCase()}...`,
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      showToast({
        variant: "destructive",
        title: "Start Failed",
        description: err.message,
      });
    }
  };

  return (
    <div className="w-full bg-zinc-950/80 border border-white/5 rounded-2xl p-6 space-y-5">
      <div className="space-y-1">
        <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
          <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
          Initialize Verified Asset Stream
        </h3>
        <p className="text-xs text-zinc-500">
          Provide account credentials. The system will launch a secure Playwright worker.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-3 w-3" /> Platform
        </Label>
        <select
          value={selectedPlatformId}
          onChange={(e) => setSelectedPlatformId(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl h-10 px-3 text-xs text-zinc-200 font-bold focus:outline-none appearance-none cursor-pointer"
        >
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id.replace(/_/g, " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {isFacebook && (
        <div className="space-y-1.5">
          <Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
            Facebook Profile Username <span className="text-amber-400">required</span>
          </Label>
          <Input
            placeholder="e.g. john.doe (from facebook.com/username)"
            value={facebookUsername}
            onChange={(e) => setFacebookUsername(e.target.value)}
            className="bg-zinc-900 border-zinc-800 h-10 text-xs text-white"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
          Email / Username / Handle
        </Label>
        <Input
          placeholder="username or email@domain.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-zinc-900 border-zinc-800 h-10 text-xs text-white"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
          Password
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-900 border-zinc-800 h-10 text-xs text-white pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        onClick={start}
        disabled={loading || !username || !password || !selectedPlatformId}
        className="w-full bg-white hover:bg-zinc-200 text-black font-black text-xs h-10 rounded-xl disabled:opacity-30"
      >
        {loading ? "Starting Worker..." : "Connect Account Engine"}
      </Button>
    </div>
  );
}