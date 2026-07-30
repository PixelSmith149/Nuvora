// app/api/account/webauthn/login/complete/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loginChallengeStore } from '../begin/route';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { credentialId, clientDataJSON, authenticatorData, signature, userHandle } = body;

    if (!credentialId || !clientDataJSON || !authenticatorData || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ─── Verify challenge ──────────────────────────────────────────────
    let parsedClientData: any;
    try {
      const clientDataString = Buffer.from(clientDataJSON, 'base64').toString('utf-8');
      parsedClientData = JSON.parse(clientDataString);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid clientDataJSON format' },
        { status: 400 }
      );
    }

    // ─── Find the challenge in store ──────────────────────────────────
    let foundChallenge = null;
    let foundUserId = null;
    for (const [key, value] of loginChallengeStore.entries()) {
      if (value.challenge === parsedClientData.challenge) {
        foundChallenge = value;
        foundUserId = key;
        break;
      }
    }

    if (!foundChallenge) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      );
    }

    if (foundChallenge.expiresAt < Date.now()) {
      loginChallengeStore.delete(foundUserId!);
      return NextResponse.json(
        { error: 'Login session expired. Please try again.' },
        { status: 400 }
      );
    }

    // ─── Verify credential exists ──────────────────────────────────────
    const { data: passkey, error: passkeyError } = await supabase
      .from('passkeys')
      .select('*')
      .eq('credential_id', credentialId)
      .single();

    if (passkeyError || !passkey) {
      return NextResponse.json(
        { error: 'Passkey not found' },
        { status: 404 }
      );
    }

    // ─── Update last_used timestamp ────────────────────────────────────
    await supabase
      .from('passkeys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', passkey.id);

    // ─── Clean up challenge ─────────────────────────────────────────────
    loginChallengeStore.delete(foundUserId!);

    // ─── Return user info for session ──────────────────────────────────
    const { data: user } = await supabase
      .from('profiles')
      .select('id, email, username, display_name')
      .eq('id', passkey.user_id)
      .single();

    return NextResponse.json({
      success: true,
      user,
      message: 'Passkey login successful',
    });
  } catch (error: any) {
    console.error('WebAuthn login complete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete passkey login' },
      { status: 500 }
    );
  }
}