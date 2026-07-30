'use client';

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  User, 
  Mail, 
  AtSign, 
  UserCircle, 
  FileText, 
  Image as ImageIcon, 
  Camera, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface ProfileData {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
}

export default function EditProfilePanel() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialProfileRef = useRef<ProfileData | null>(null);

  // ─── State ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ─── Form Fields ──────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ─── Load Profile ──────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("User not authenticated");

        if (isMounted) setEmail(user.email || "");

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("username, display_name, bio, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (data && isMounted) {
          const loaded: ProfileData = {
            username: data.username || "",
            display_name: data.display_name || "",
            bio: data.bio || "",
            avatar_url: data.avatar_url || "",
          };

          initialProfileRef.current = loaded;
          setUsername(loaded.username);
          setDisplayName(loaded.display_name);
          setBio(loaded.bio);
          setAvatarUrl(loaded.avatar_url);
          setAvatarPreview(loaded.avatar_url || null);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Helper: Validate URL Protocol ────────────────────────────────
  const isValidHttpUrl = (urlStr: string) => {
    if (!urlStr) return true;
    try {
      const url = new URL(urlStr);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  // ─── Avatar Upload Validation ──────────────────────────────────────
  const handleAvatarFile = (file: File) => {
    // 🛑 REMOVED 'image/svg+xml' TO PREVENT STORED XSS VULNERABILITIES
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image (JPEG, PNG, GIF, or WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Sanitize extension
      const fileExt = avatarFile.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "png";
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      setAvatarUrl(publicUrl);
      setAvatarPreview(publicUrl);
      setAvatarFile(null);

      await saveProfile(publicUrl);

      setSuccess("Avatar uploaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ─── Save Profile ──────────────────────────────────────────────────
  const saveProfile = async (avatarUrlOverride?: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Input Validation
      const cleanUsername = username.trim();
      if (!cleanUsername) {
        setError("Username is required");
        setSaving(false);
        return;
      }

      const targetAvatarUrl = avatarUrlOverride !== undefined ? avatarUrlOverride : avatarUrl;

      if (targetAvatarUrl && !isValidHttpUrl(targetAvatarUrl)) {
        setError("Avatar URL must begin with http:// or https://");
        setSaving(false);
        return;
      }

      const updateData = {
        id: user.id,
        username: cleanUsername,
        display_name: displayName.trim() || null,
        bio: bio.trim().slice(0, 500) || null, // Guard length cap
        avatar_url: targetAvatarUrl.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(updateData);

      if (updateError) throw updateError;

      // Update baseline reference
      initialProfileRef.current = {
        username: cleanUsername,
        display_name: displayName.trim(),
        bio: bio.trim().slice(0, 500),
        avatar_url: targetAvatarUrl,
      };

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // ─── Reset Handler ────────────────────────────────────────────────
  const handleReset = () => {
    const initial = initialProfileRef.current;
    if (initial) {
      setUsername(initial.username);
      setDisplayName(initial.display_name);
      setBio(initial.bio);
      setAvatarUrl(initial.avatar_url);
      setAvatarPreview(initial.avatar_url || null);
    } else {
      setUsername("");
      setDisplayName("");
      setBio("");
      setAvatarUrl("");
      setAvatarPreview(null);
    }
    setAvatarFile(null);
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl border border-zinc-800 bg-zinc-950/50 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <p className="text-sm text-zinc-500">Update your personal information</p>
        </div>
        <div className="flex items-center gap-2">
          {success && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {success}
            </span>
          )}
          {error && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </span>
          )}
        </div>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-6 p-4 bg-black/30 rounded-xl border border-zinc-800/50">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <UserCircle className="h-12 w-12" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors disabled:opacity-50"
            title="Upload avatar"
            type="button"
          >
            {uploadingAvatar ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : (
              <Camera className="h-3.5 w-3.5 text-zinc-400" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarFile(file);
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>
        <div className="min-w-0 flex-1">
  <p className="text-sm font-medium text-white">Profile Photo</p>
  <p className="text-xs text-zinc-500">
    JPG, PNG, GIF, WEBP (max 5MB)
  </p>

  {avatarFile && (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="min-w-0 flex-1 truncate text-xs text-zinc-400">
        {avatarFile.name}
      </span>

      <button
        onClick={handleAvatarUpload}
        disabled={uploadingAvatar}
        type="button"
        className="shrink-0 rounded px-2 py-0.5 text-xs bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
      >
        {uploadingAvatar ? "Uploading..." : "Upload"}
      </button>

      <button
        onClick={() => {
          setAvatarFile(null);
          setAvatarPreview(avatarUrl || null);
        }}
        type="button"
        className="shrink-0 rounded bg-zinc-700 px-2 py-0.5 text-xs text-white transition-colors hover:bg-zinc-600"
      >
        Cancel
      </button>
    </div>
  )}
</div>
      </div>

      {/* Form Section */}
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-black/30 border border-zinc-800/50">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Mail className="h-3.5 w-3.5" />
            Email
          </div>
          <p className="text-sm text-white">{email || "Not set"}</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500 flex items-center gap-2">
            <AtSign className="h-3.5 w-3.5" />
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-3 rounded-lg bg-black/30 border border-zinc-800/50 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/30 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500 flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            Display Name
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display Name"
            className="w-full p-3 rounded-lg bg-black/30 border border-zinc-800/50 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/30 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            maxLength={500}
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full p-3 rounded-lg bg-black/30 border border-zinc-800/50 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/30 transition-colors resize-none"
          />
          <p className="text-xs text-zinc-500 text-right">{bio.length}/500</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500 flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5" />
            Avatar URL
          </label>
          <div className="flex gap-2">
            <input
              value={avatarUrl}
              onChange={(e) => {
                const val = e.target.value;
                setAvatarUrl(val);
                setAvatarPreview(isValidHttpUrl(val) ? val : null);
              }}
              placeholder="https://example.com/avatar.jpg"
              className="flex-1 p-3 rounded-lg bg-black/30 border border-zinc-800/50 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
            <button
              onClick={() => {
                setAvatarUrl("");
                setAvatarPreview(null);
                setAvatarFile(null);
              }}
              type="button"
              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
        <button
          onClick={() => saveProfile()}
          disabled={saving}
          type="button"
          className="flex-1 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
        <button
          onClick={handleReset}
          type="button"
          className="px-6 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="text-xs text-zinc-600 text-center pt-2">
        Your profile information is private and only visible to you.
      </div>
    </div>
  );
}