// src/lib/referral/process-completions.ts
import { createClient } from "@/lib/supabase/server";
import { completeReferralAction } from "./referral.service";
import { checkBoostCompletion, checkBuildCompletion, checkPublishCompletion } from "./completion-check";
import { ReferralType } from "./referral.types";

// ─── Process all pending referrals for a user ──────────────────────
export async function processPendingReferrals(refereeId: string) {
  const supabase = await createClient();

  // ─── Get all pending referrals for this user ──────────────────────
  const { data: pendingReferrals, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referee_id', refereeId)
    .eq('status', 'pending');

  if (error || !pendingReferrals || pendingReferrals.length === 0) {
    return { processed: 0, completed: [] };
  }

  // ─── Check completions ─────────────────────────────────────────────
  const [boostCompleted, buildCompleted, publishCompleted] = await Promise.all([
  checkBoostCompletion(refereeId),
  checkBuildCompletion(refereeId),
  checkPublishCompletion(refereeId),
]);
  
 

  const completions = {
    boost: boostCompleted,
    build: buildCompleted,
    publish: publishCompleted,
  };

  const results = [];

  // ─── Process each pending referral ────────────────────────────────
  for (const referral of pendingReferrals) {
    const type = referral.type as ReferralType;
    const isCompleted = completions[type];

    if (isCompleted) {
      try {
        const result = await completeReferralAction(refereeId, type);
        if (result.bonusCredited) {
          results.push({
            referralId: referral.id,
            type: type,
            bonusCredited: true,
          });
        }
      } catch (error) {
        console.error(`Failed to process ${type} referral:`, error);
        results.push({
          referralId: referral.id,
          type: type,
          bonusCredited: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  return {
    processed: results.length,
    completed: results,
  };
}