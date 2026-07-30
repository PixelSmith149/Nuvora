"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
}

export default function ProfileHeader() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(authError?.message || "User not authenticated.");
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_url, bio")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (isMounted) {
          setProfile(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load user profile.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 animate-pulse">
        <div className="h-14 w-14 rounded-full bg-zinc-900" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/4 rounded bg-zinc-900" />
          <div className="h-3 w-1/2 rounded bg-zinc-900" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">
        {error || "Profile could not be retrieved."}
      </div>
    );
  }

  const displayName = profile.display_name || profile.username || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-white">
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={`${displayName}'s avatar`}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <span className="text-xl font-bold uppercase text-zinc-500">
            {initial}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-white">{displayName}</h1>
        <p className="text-sm text-zinc-400">{profile.bio || "No bio set yet"}</p>
      </div>
    </div>
  );
}