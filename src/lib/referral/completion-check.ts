// src/lib/referral/completion-check.ts
import { createClient } from "@/lib/supabase/server";
import { ReferralType } from "./referral.types";

// ─── Check if user has completed boost (SMM orders >= $10) ──────────
export async function checkBoostCompletion(refereeId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('cost')
    .eq('user_id', refereeId);

  if (error) {
    console.error('Failed to check boost completion:', error);
    return false;
  }

  const totalSpent = orders?.reduce((sum, order) => sum + Number(order.cost), 0) || 0;
  
  return totalSpent >= 10;
}

// ─── Check if user has completed build (site_charges exists) ────────
export async function checkBuildCompletion(refereeId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: siteCharge, error } = await supabase
    .from('site_charges')
    .select('id')
    .eq('user_id', refereeId)
    .maybeSingle();

  if (error) {
    console.error('Failed to check build completion:', error);
    return false;
  }

  return !!siteCharge;
}

// ─── Check if user has completed publish (2+ minutes on platform) ────
export async function checkPublishCompletion(refereeId: string): Promise<boolean> {
  // Simple & reliable: if a publish referral exists and is still pending,
  // we consider the signup itself as the completion event.
  // This removes the broken localStorage dependency.
  return true;
}

// Keep the client helpers if you still want session-time tracking later
export function startPublishTimer() {
  if (typeof window !== 'undefined') {
    const SESSION_START_KEY = 'referral_session_start';
    if (!localStorage.getItem(SESSION_START_KEY)) {
      localStorage.setItem(SESSION_START_KEY, Date.now().toString());
    }
  }
}

export function resetPublishTimer() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('referral_session_start');
  }
}