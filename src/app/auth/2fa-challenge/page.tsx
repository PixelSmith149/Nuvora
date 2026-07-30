"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { TwoFactorChallengeModal } from "@/components/auth/TwoFactorChallengeModal"; // adjust path

export default function TwoFactorChallengePage() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function handleSuccess() {
    router.push("/account");
    router.refresh();
  }

  async function handleCancel() {
    // Sign out so the user cannot stay partially authenticated
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      {/* The modal is always open on this page */}
      <TwoFactorChallengeModal
        isOpen={true}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}