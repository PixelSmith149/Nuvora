"use client";

import { useState } from "react";
import { LiveChat } from "./LiveChat";
import { SupportFlow } from "./SupportFlow";

/**
 * Main Support page orchestrator.
 * - Guided conversation flow
 * - Temporary real-time live chat
 * - Liquid grids inside child components
 */
export function SupportPage() {
  const [showLiveChat, setShowLiveChat] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <SupportFlow onOpenLiveChat={() => setShowLiveChat(true)} />

        {showLiveChat && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md sm:max-w-lg">
              <LiveChat onClose={() => setShowLiveChat(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupportPage;