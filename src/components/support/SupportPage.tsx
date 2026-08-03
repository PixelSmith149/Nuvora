"use client";

import { useRouter } from "next/navigation";
import { SupportFlow } from "./SupportFlow";

/**
 * Main Support page orchestrator.
 * - Guided conversation flow
 * - Seamless router navigation to dedicated full-page Live Chat
 */
export function SupportPage() {
  const router = useRouter();

  const handleOpenLiveChat = (initialMessage?: string) => {
    if (initialMessage) {
      // Pass initial complaint via URL search params if coming from SupportFlow wizard
      const query = new URLSearchParams({ msg: initialMessage }).toString();
      router.push(`/support/chat?${query}`);
    } else {
      router.push("/support/chat");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <SupportFlow onOpenLiveChat={handleOpenLiveChat} />
      </div>
    </div>
  );
}

export default SupportPage;